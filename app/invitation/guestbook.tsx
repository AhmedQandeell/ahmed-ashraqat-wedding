"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

type Entry = {
  id: string;
  name: string;
  message: string;
  created_at: number;
};

export default function Guestbook() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [more, setMore] = useState(false);
  const requestId = useRef("");

  async function load(cursor?: string) {
    setLoadError(false);
    try {
      const response = await fetch(
        "/api/guestbook" + (cursor ? "?before=" + encodeURIComponent(cursor) : ""),
      );
      if (!response.ok) throw Error();
      const data = await response.json();
      setEntries((current) => (cursor ? [...current, ...data.entries] : data.entries));
      setMore(data.more);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;

    const honeypot = new FormData(event.currentTarget).get("website");
    setBusy(true);
    setNotice("");
    if (!requestId.current) requestId.current = crypto.randomUUID();

    try {
      const response = await fetch("/api/guestbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: requestId.current,
          name,
          message,
          website: honeypot,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw Error(data.error || "We couldn’t save your message. Please try again.");
      }

      setName("");
      setMessage("");
      requestId.current = "";
      setNotice(
        data.emailPending
          ? "Thank you! Your message is in the guestbook. The email notification is awaiting delivery."
          : "Thank you for your lovely wishes. Your message has been added.",
      );
      await load();
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "Please try again. Your message has not been cleared.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <figure
        aria-label="A moment from our story"
        style={{
          width: "calc(100% - 20px)",
          maxWidth: 810,
          margin: "76px auto 0",
          padding: 9,
          border: "1px solid rgba(155,131,93,.68)",
          background: "#FAF7F0",
          boxShadow: "0 24px 70px rgba(74,59,39,.075)",
        }}
      >
        <div
          style={{
            position: "relative",
            overflow: "hidden",
            border: "1px solid rgba(205,190,159,.62)",
            background: "#E8E0D3",
          }}
        >
          <img
            src="/take-my-hand.jpg"
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
            style={{
              display: "block",
              width: "100%",
              height: "auto",
              filter: "sepia(.07) saturate(.84) contrast(.97) brightness(.98)",
            }}
          />
          <span
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              background:
                "linear-gradient(180deg, rgba(250,247,240,.035), rgba(75,62,47,.04))",
              boxShadow: "inset 0 0 0 1px rgba(250,247,240,.18)",
            }}
          />
        </div>
      </figure>

      <section id="guestbook" className="guestbook">
        <header>
          <p className="eyebrow">WORDS WE’LL TREASURE</p>
          <h2>Leave a little love.</h2>
          <p>
            A wish, a memory, a few heartfelt words.
            <br />
            We would love to hear from you.
          </p>
        </header>

        <div className="guestbook-grid">
          <form onSubmit={submit}>
            <label htmlFor="guest-name">Your name</label>
            <Input
              id="guest-name"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                requestId.current = "";
              }}
              maxLength={80}
              required
              autoComplete="name"
              placeholder="Full name"
            />

            <label htmlFor="guest-message">Your message to the couple</label>
            <Textarea
              id="guest-message"
              value={message}
              onChange={(event) => {
                setMessage(event.target.value);
                requestId.current = "";
              }}
              minLength={3}
              maxLength={1500}
              required
              rows={5}
              placeholder="Wishing you a lifetime of…"
            />

            <div className="honeypot" aria-hidden="true">
              <label htmlFor="website">Leave this empty</label>
              <input id="website" name="website" tabIndex={-1} autoComplete="off" />
            </div>

            <p className="privacy">
              Your name and message will be visible to all guests. A copy is sent to the groom via FormSubmit.
            </p>
            <Button className="submit-button" type="submit" disabled={busy}>
              {busy ? "SENDING YOUR WISHES…" : "SEND YOUR WISHES"}
            </Button>
            <p className="form-status" role="status" aria-live="polite">
              {notice}
            </p>
          </form>

          <div className="messages" aria-live="polite">
            {loading ? (
              <p>Opening the guestbook…</p>
            ) : loadError ? (
              <div>
                <p>The guestbook couldn’t be loaded.</p>
                <Button variant="outline" onClick={() => load()}>
                  Try again
                </Button>
              </div>
            ) : entries.length === 0 ? (
              <div className="empty-book">
                <span aria-hidden="true">“</span>
                <h3>The first words are yours.</h3>
                <p>
                  Be the first to leave a wish
                  <br />
                  for Ahmed & Ashrqat.
                </p>
              </div>
            ) : (
              entries.map((entry) => (
                <article className="wish" key={entry.id}>
                  <p dir="auto">{entry.message}</p>
                  <div>
                    <strong dir="auto">{entry.name}</strong>
                    <time dateTime={new Date(entry.created_at).toISOString()}>
                      {new Date(entry.created_at).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        timeZone: "Africa/Cairo",
                      })}
                    </time>
                  </div>
                </article>
              ))
            )}

            {more && !loadError && (
              <Button variant="outline" onClick={() => load(entries[entries.length - 1]?.id)}>
                Read more wishes
              </Button>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
