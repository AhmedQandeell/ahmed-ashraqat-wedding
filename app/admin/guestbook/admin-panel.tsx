"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

type Wish = {
  id: string;
  name: string;
  message: string;
  created_at: number;
  hidden: number | boolean;
};

const palette = {
  background: "#f3f0e8",
  paper: "#faf7f0",
  ink: "#3c342c",
  muted: "#746858",
  gold: "#9b835d",
  border: "rgba(155,131,93,.45)",
};

export default function GuestbookAdminPanel() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [entries, setEntries] = useState<Wish[]>([]);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const loadEntries = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/guestbook", { cache: "no-store" });
      if (response.status === 401) {
        setAuthenticated(false);
        setEntries([]);
        return;
      }
      const data = (await response.json()) as { entries?: Wish[]; error?: string };
      if (!response.ok) throw new Error(data.error || "Could not load guestbook.");
      setEntries(data.entries ?? []);
      setAuthenticated(true);
      setError("");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load guestbook.");
      setAuthenticated(false);
    }
  }, []);

  useEffect(() => {
    void loadEntries();
  }, [loadEntries]);

  const counts = useMemo(() => {
    const hidden = entries.filter((entry) => Boolean(Number(entry.hidden))).length;
    return { hidden, visible: entries.length - hidden };
  }, [entries]);

  async function login(event: FormEvent) {
    event.preventDefault();
    if (!password) return;
    setBusy("login");
    setError("");
    try {
      const response = await fetch("/api/admin/guestbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", password }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error || "Could not sign in.");
      setPassword("");
      await loadEntries();
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Could not sign in.");
    } finally {
      setBusy(null);
    }
  }

  async function logout() {
    setBusy("logout");
    try {
      await fetch("/api/admin/guestbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "logout" }),
      });
    } finally {
      setEntries([]);
      setAuthenticated(false);
      setBusy(null);
    }
  }

  async function setHidden(entry: Wish, hidden: boolean) {
    setBusy(entry.id);
    setError("");
    try {
      const response = await fetch("/api/admin/guestbook", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: entry.id, hidden }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error || "Could not update wish.");
      setEntries((current) =>
        current.map((item) => (item.id === entry.id ? { ...item, hidden: hidden ? 1 : 0 } : item)),
      );
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Could not update wish.");
    } finally {
      setBusy(null);
    }
  }

  async function deleteWish(entry: Wish) {
    const confirmed = window.confirm(
      `Permanently delete the wish from ${entry.name}? This cannot be undone.`,
    );
    if (!confirmed) return;

    setBusy(entry.id);
    setError("");
    try {
      const response = await fetch("/api/admin/guestbook", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: entry.id }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error || "Could not delete wish.");
      setEntries((current) => current.filter((item) => item.id !== entry.id));
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Could not delete wish.");
    } finally {
      setBusy(null);
    }
  }

  if (authenticated === null) {
    return (
      <main style={shellStyle}>
        <section style={panelStyle}>
          <p style={eyebrowStyle}>PRIVATE ADMIN</p>
          <h1 style={titleStyle}>Loading guestbook…</h1>
        </section>
      </main>
    );
  }

  if (!authenticated) {
    return (
      <main style={shellStyle}>
        <section style={{ ...panelStyle, maxWidth: 520 }}>
          <p style={eyebrowStyle}>PRIVATE ADMIN</p>
          <h1 style={titleStyle}>Guestbook moderation</h1>
          <p style={descriptionStyle}>
            Sign in to hide, restore, or permanently delete guestbook wishes.
          </p>
          <form onSubmit={login} style={{ marginTop: 30 }}>
            <label style={labelStyle} htmlFor="admin-password">ADMIN PASSWORD</label>
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              style={inputStyle}
              placeholder="Enter your password"
            />
            <button type="submit" disabled={busy === "login"} style={primaryButtonStyle}>
              {busy === "login" ? "SIGNING IN…" : "SIGN IN"}
            </button>
          </form>
          {error ? <p style={errorStyle}>{error}</p> : null}
        </section>
      </main>
    );
  }

  return (
    <main style={shellStyle}>
      <section style={{ ...panelStyle, maxWidth: 980 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
          <div>
            <p style={eyebrowStyle}>PRIVATE ADMIN</p>
            <h1 style={titleStyle}>Guestbook moderation</h1>
            <p style={descriptionStyle}>{counts.visible} visible · {counts.hidden} hidden</p>
          </div>
          <button type="button" onClick={logout} disabled={busy === "logout"} style={secondaryButtonStyle}>
            SIGN OUT
          </button>
        </div>

        {error ? <p style={errorStyle}>{error}</p> : null}

        <div style={{ display: "grid", gap: 16, marginTop: 34 }}>
          {entries.length === 0 ? (
            <div style={wishCardStyle}>
              <p style={{ margin: 0, color: palette.muted }}>No guestbook wishes yet.</p>
            </div>
          ) : (
            entries.map((entry) => {
              const hidden = Boolean(Number(entry.hidden));
              const working = busy === entry.id;
              return (
                <article
                  key={entry.id}
                  style={{
                    ...wishCardStyle,
                    opacity: hidden ? 0.62 : 1,
                    borderStyle: hidden ? "dashed" : "solid",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 18, alignItems: "flex-start", flexWrap: "wrap" }}>
                    <div style={{ minWidth: 0, flex: "1 1 420px" }}>
                      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                        <strong style={{ color: palette.ink, fontFamily: "Georgia, serif", fontSize: 18 }}>{entry.name}</strong>
                        {hidden ? <span style={hiddenBadgeStyle}>HIDDEN</span> : null}
                      </div>
                      <p style={{ margin: "10px 0 8px", color: palette.ink, lineHeight: 1.75, whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{entry.message}</p>
                      <time style={{ color: palette.muted, fontSize: 11, letterSpacing: ".04em" }}>
                        {new Date(entry.created_at).toLocaleString()}
                      </time>
                    </div>
                    <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
                      <button
                        type="button"
                        disabled={working}
                        onClick={() => setHidden(entry, !hidden)}
                        style={secondaryButtonStyle}
                      >
                        {hidden ? "UNHIDE" : "HIDE"}
                      </button>
                      <button
                        type="button"
                        disabled={working}
                        onClick={() => deleteWish(entry)}
                        style={dangerButtonStyle}
                      >
                        DELETE
                      </button>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </section>
    </main>
  );
}

const shellStyle = {
  minHeight: "100vh",
  padding: "clamp(24px, 5vw, 64px) 16px",
  background: palette.background,
  color: palette.ink,
  fontFamily: "Arial, sans-serif",
} as const;

const panelStyle = {
  width: "100%",
  margin: "0 auto",
  padding: "clamp(26px, 5vw, 52px)",
  border: `1px solid ${palette.border}`,
  background: palette.paper,
  boxShadow: "0 24px 70px rgba(74,59,39,.08)",
} as const;

const eyebrowStyle = {
  margin: "0 0 9px",
  color: palette.gold,
  fontSize: 9,
  letterSpacing: ".28em",
} as const;

const titleStyle = {
  margin: 0,
  color: palette.ink,
  fontFamily: "Georgia, serif",
  fontSize: "clamp(30px, 5vw, 44px)",
  fontWeight: 400,
} as const;

const descriptionStyle = {
  margin: "13px 0 0",
  color: palette.muted,
  lineHeight: 1.7,
} as const;

const labelStyle = {
  display: "block",
  marginBottom: 8,
  color: palette.muted,
  fontSize: 9,
  letterSpacing: ".18em",
} as const;

const inputStyle = {
  width: "100%",
  marginBottom: 18,
  border: `1px solid ${palette.border}`,
  borderRadius: 0,
  padding: "14px 15px",
  background: "#fffdf8",
  color: palette.ink,
  fontSize: 15,
  outline: "none",
} as const;

const primaryButtonStyle = {
  minHeight: 46,
  border: `1px solid ${palette.gold}`,
  padding: "12px 22px",
  background: palette.ink,
  color: "#fffaf1",
  fontSize: 9.5,
  letterSpacing: ".2em",
  cursor: "pointer",
} as const;

const secondaryButtonStyle = {
  minHeight: 38,
  border: `1px solid ${palette.border}`,
  padding: "9px 14px",
  background: "transparent",
  color: palette.ink,
  fontSize: 8.5,
  letterSpacing: ".16em",
  cursor: "pointer",
} as const;

const dangerButtonStyle = {
  ...secondaryButtonStyle,
  border: "1px solid rgba(126,54,45,.45)",
  color: "#7e362d",
} as const;

const wishCardStyle = {
  padding: "20px 22px",
  border: `1px solid ${palette.border}`,
  background: "rgba(255,253,248,.72)",
} as const;

const hiddenBadgeStyle = {
  border: `1px solid ${palette.border}`,
  padding: "3px 7px",
  color: palette.gold,
  fontSize: 8,
  letterSpacing: ".14em",
} as const;

const errorStyle = {
  margin: "18px 0 0",
  color: "#7e362d",
  fontSize: 13,
  lineHeight: 1.6,
} as const;
