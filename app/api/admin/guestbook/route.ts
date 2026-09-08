import { guestDb } from "@/db/guestbook";
import {
  clearGuestbookAdminCookie,
  createGuestbookAdminCookie,
  hasGuestbookAdminSession,
  isGuestbookAdminConfigured,
  verifyGuestbookAdminPassword,
} from "@/lib/guestbook-admin";

export const dynamic = "force-dynamic";

const json = (data: unknown, status = 200, headers?: HeadersInit) =>
  Response.json(data, {
    status,
    headers: { "Cache-Control": "no-store", ...(headers ?? {}) },
  });

function validOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  return origin === new URL(request.url).origin;
}

function validId(value: unknown): value is string {
  return typeof value === "string" && /^[0-9a-f-]{36}$/i.test(value);
}

async function ensureModerationTable() {
  const db = guestDb();
  await db
    .prepare(
      "CREATE TABLE IF NOT EXISTS guestbook_moderation (wish_id TEXT PRIMARY KEY NOT NULL, hidden INTEGER NOT NULL DEFAULT 1, hidden_at INTEGER NOT NULL)",
    )
    .run();
  return db;
}

export async function GET(request: Request) {
  if (!(await hasGuestbookAdminSession(request))) return json({ authenticated: false }, 401);

  try {
    const db = await ensureModerationTable();
    const rows = await db
      .prepare(
        `SELECT w.id, w.name, w.message, w.created_at,
          CASE WHEN m.wish_id IS NULL THEN 0 ELSE 1 END AS hidden
         FROM wishes w
         LEFT JOIN guestbook_moderation m ON m.wish_id = w.id AND m.hidden = 1
         ORDER BY w.created_at DESC, w.id DESC
         LIMIT 500`,
      )
      .all();

    return json({ authenticated: true, entries: rows.results });
  } catch (error) {
    console.error("Guestbook admin read failed", error);
    return json({ error: "Could not load guestbook moderation." }, 503);
  }
}

export async function POST(request: Request) {
  if (!validOrigin(request)) return json({ error: "Invalid request origin." }, 403);

  let payload: { action?: string; password?: string };
  try {
    payload = (await request.json()) as { action?: string; password?: string };
  } catch {
    return json({ error: "Invalid request." }, 400);
  }

  if (payload.action === "logout") {
    return json(
      { ok: true },
      200,
      { "Set-Cookie": clearGuestbookAdminCookie() },
    );
  }

  if (payload.action !== "login") return json({ error: "Unknown action." }, 400);
  if (!isGuestbookAdminConfigured()) {
    return json({ error: "Guestbook admin access is not configured yet." }, 503);
  }

  const password = typeof payload.password === "string" ? payload.password : "";
  if (!(await verifyGuestbookAdminPassword(password))) {
    return json({ error: "Incorrect password." }, 401);
  }

  return json(
    { ok: true },
    200,
    { "Set-Cookie": await createGuestbookAdminCookie() },
  );
}

export async function PATCH(request: Request) {
  if (!validOrigin(request)) return json({ error: "Invalid request origin." }, 403);
  if (!(await hasGuestbookAdminSession(request))) return json({ error: "Unauthorized." }, 401);

  let payload: { id?: unknown; hidden?: unknown };
  try {
    payload = (await request.json()) as { id?: unknown; hidden?: unknown };
  } catch {
    return json({ error: "Invalid request." }, 400);
  }

  if (!validId(payload.id) || typeof payload.hidden !== "boolean") {
    return json({ error: "Invalid moderation request." }, 400);
  }

  try {
    const db = await ensureModerationTable();
    if (payload.hidden) {
      await db
        .prepare(
          `INSERT INTO guestbook_moderation (wish_id, hidden, hidden_at)
           VALUES (?, 1, ?)
           ON CONFLICT(wish_id) DO UPDATE SET hidden = 1, hidden_at = excluded.hidden_at`,
        )
        .bind(payload.id, Date.now())
        .run();
    } else {
      await db.prepare("DELETE FROM guestbook_moderation WHERE wish_id = ?").bind(payload.id).run();
    }

    return json({ ok: true, hidden: payload.hidden });
  } catch (error) {
    console.error("Guestbook moderation update failed", error);
    return json({ error: "Could not update this wish." }, 503);
  }
}

export async function DELETE(request: Request) {
  if (!validOrigin(request)) return json({ error: "Invalid request origin." }, 403);
  if (!(await hasGuestbookAdminSession(request))) return json({ error: "Unauthorized." }, 401);

  let payload: { id?: unknown };
  try {
    payload = (await request.json()) as { id?: unknown };
  } catch {
    return json({ error: "Invalid request." }, 400);
  }

  if (!validId(payload.id)) return json({ error: "Invalid wish id." }, 400);

  try {
    const db = await ensureModerationTable();
    const result = await db.prepare("DELETE FROM wishes WHERE id = ?").bind(payload.id).run();
    await db.prepare("DELETE FROM guestbook_moderation WHERE wish_id = ?").bind(payload.id).run();
    return json({ ok: true, deleted: Boolean(result.meta.changes) });
  } catch (error) {
    console.error("Guestbook permanent delete failed", error);
    return json({ error: "Could not permanently delete this wish." }, 503);
  }
}
