"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type MouseEvent } from "react";

export default function Home() {
  const router = useRouter();
  const [opening, setOpening] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const started = useRef(false);

  useEffect(() => {
    router.prefetch("/invitation");
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [router]);

  function openEnvelope(event: MouseEvent<HTMLAnchorElement>) {
    // Preserve normal browser behavior for opening the invitation in another tab.
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    if (started.current) return;
    started.current = true;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReducedMotion(reduce);
    setOpening(true);
    timer.current = setTimeout(() => router.push("/invitation"), reduce ? 160 : 1900);
  }

  return (
    <main className={`envelope-page${opening ? " is-opening" : ""}${reducedMotion ? " reduce-opening" : ""}`}>
      <div className="eyebrow">TO OUR DEAREST FAMILY & FRIENDS</div>
      <h1>A beautiful beginning.</h1>
      <p className="intro">And it wouldn’t be the same without you.</p>
      <Link className="envelope-link" href="/invitation" onClick={openEnvelope}
        aria-label={opening ? "Opening your wedding invitation" : "Open Ahmed and Ashraqat’s wedding invitation"}
        aria-disabled={opening}>
        <span className="envelope-scene">
          <img className="envelope-open-state" src="/envelope-open.png" alt="" aria-hidden="true" width="1536" height="1024" />
          <img className="envelope-closed-state" src="/envelope.png" alt="The back of an ivory envelope, sealed with a gold A&Q monogram" width="1536" height="1024" />
          <span className="envelope-flap" aria-hidden="true"><img src="/envelope.png" alt="" width="1536" height="1024" /></span>
        </span>
        <span className="open-label" aria-live="polite">{opening ? "OPENING YOUR INVITATION…" : <>OPEN YOUR INVITATION <span aria-hidden="true">↗</span></>}</span>
      </Link>
      <p className="cover-names">Ahmed & Ashraqat</p>
      <p className="eyebrow date-small">09 OCTOBER 2026</p>
    </main>
  );
}
