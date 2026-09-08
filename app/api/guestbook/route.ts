import { guestDb } from "@/db/guestbook";

export const dynamic = "force-dynamic";

const json = (data: unknown, status = 200) =>
  Response.json(data, { status, headers: { "Cache-Control": "no-store" } });

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
  try {
    const db = await ensureModerationTable();
    const before = new URL(request.url).searchParams.get("before");
    let rows;

    if (before) {
      rows = await db
        .prepare(
          `SELECT w.id, w.name, w.message, w.created_at
           FROM wishes w
           WHERE NOT EXISTS (
             SELECT 1 FROM guestbook_moderation m
             WHERE m.wish_id = w.id AND m.hidden = 1
           )
           AND (w.created_at, w.id) < (
             SELECT created_at, id FROM wishes WHERE id = ?
           )
           ORDER BY w.created_at DESC, w.id DESC
           LIMIT 21`,
        )
        .bind(before)
        .all();
    } else {
      rows = await db
        .prepare(
          `SELECT w.id, w.name, w.message, w.created_at
           FROM wishes w
           WHERE NOT EXISTS (
             SELECT 1 FROM guestbook_moderation m
             WHERE m.wish_id = w.id AND m.hidden = 1
           )
           ORDER BY w.created_at DESC, w.id DESC
           LIMIT 21`,
        )
        .all();
    }

    return json({ entries: rows.results.slice(0, 20), more: rows.results.length > 20 });
  } catch (error) {
    console.error("Guestbook read failed", error);
    return json({ error: "The guestbook is temporarily unavailable." }, 503);
  }
}

async function forwardEmail(name: string, message: string, id: string, url: string) {
  try {
    const response = await fetch("https://formsubmit.co/ajax/ahmed.qandeel96@gmail.com", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        name,
        message,
        reference: id,
        _subject: "Q&A Wedding — A new guestbook message",
        _template: "table",
        _url: new URL("/invitation", url).href,
      }),
      signal: AbortSignal.timeout(12000),
    });
    const data = (await response.json()) as { success?: boolean | string };
    return response.ok && (data.success === true || data.success === "true");
  } catch {
    console.error("Guestbook email forwarding unavailable");
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const origin = request.headers.get("origin");
    if (origin && origin !== new URL(request.url).origin) {
      return json({ error: "Please submit from the invitation page." }, 403);
    }

    const raw = await request.text();
    if (raw.length > 12000) return json({ error: "Your message is too long." }, 400);

    let payload;
    try {
      payload = JSON.parse(raw);
    } catch {
      return json({ error: "Please check your message." }, 400);
    }

    if (
      typeof payload.name !== "string" ||
      typeof payload.message !== "string" ||
      typeof payload.id !== "string"
    ) {
      return json({ error: "Please include your name and message." }, 400);
    }

    const name = payload.name.trim();
    const message = payload.message.trim();
    if (
      name.length < 1 ||
      name.length > 80 ||
      message.length < 3 ||
      message.length > 1500 ||
      !/^[0-9a-f-]{36}$/i.test(payload.id) ||
      payload.website
    ) {
      return json({ error: "Please enter a name and a message of 3–1,500 characters." }, 400);
    }

    const db = guestDb();
    const existing = await db
      .prepare("SELECT id,email_status FROM wishes WHERE id=?")
      .bind(payload.id)
      .first();
    if (existing) {
      return json({ ok: true, emailPending: existing.email_status !== "accepted" });
    }

    const ip = request.headers.get("cf-connecting-ip") || "unknown";
    const hash = Array.from(
      new Uint8Array(
        await crypto.subtle.digest(
          "SHA-256",
          new TextEncoder().encode(ip + new Date().toISOString().slice(0, 10)),
        ),
      ),
    )
      .map((value) => value.toString(16).padStart(2, "0"))
      .join("");

    const now = Date.now();
    const result = await db
      .prepare(
        "INSERT INTO wishes (id,name,message,created_at,email_status,ip_hash) SELECT ?,?,?,?,'pending',? WHERE NOT EXISTS (SELECT 1 FROM wishes WHERE ip_hash=? AND created_at>?) ON CONFLICT(id) DO NOTHING",
      )
      .bind(payload.id, name, message, now, hash, hash, now - 30000)
      .run();

    if (!result.meta.changes) {
      return json({ error: "Please wait 30 seconds before leaving another message." }, 429);
    }

    const accepted = await forwardEmail(name, message, payload.id, request.url);
    if (accepted) {
      try {
        await db
          .prepare("UPDATE wishes SET email_status='accepted' WHERE id=?")
          .bind(payload.id)
          .run();
      } catch {
        console.error("Email status update failed");
      }
    }

    return json({ ok: true, emailPending: !accepted }, 201);
  } catch (error) {
    console.error("Guestbook save failed", error);
    return json(
      { error: "We couldn’t save your message. Please try again; your words are still here." },
      503,
    );
  }
}
