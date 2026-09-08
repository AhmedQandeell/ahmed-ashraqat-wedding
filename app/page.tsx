"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type MouseEvent } from "react";

export default function Home() {
  const router = useRouter();
  const [opening, setOpening] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [closedReady, setClosedReady] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const started = useRef(false);
  const openImage = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    // Start loading the next route immediately. This must not wait for the large
    // envelope images to decode, otherwise the route transition feels delayed.
    router.prefetch("/invitation");

    // Warm the open-envelope image only after the critical first paint has had
    // a chance to happen. The closed envelope remains the network priority.
    idleTimer.current = setTimeout(() => {
      void openImage.current?.decode().catch(() => undefined);
    }, 220);

    return () => {
      if (timer.current) clearTimeout(timer.current);
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
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

    // The invitation route is already prefetched, so navigate as soon as the
    // visual opening completes instead of holding on a faded envelope.
    timer.current = setTimeout(() => router.push("/invitation"), reduce ? 80 : 1180);
  }

  const smoothSceneStyle = {
    animation: "none",
    transform: opening && !reducedMotion
      ? "translate3d(0,-14px,0) scale(1.025)"
      : "translate3d(0,0,0) scale(1)",
    opacity: opening && !reducedMotion ? 0 : 1,
    transition: reducedMotion
      ? "none"
      : opening
        ? "transform 850ms cubic-bezier(.22,.61,.36,1), opacity 180ms ease 950ms"
        : "none",
    willChange: opening ? "transform, opacity" : "auto",
  } as const;

  const openStateStyle = {
    animation: "none",
    opacity: opening ? 1 : 0,
    transform: opening ? "translate3d(0,-2px,0) scale(1.002)" : "translate3d(0,0,0) scale(1)",
    transition: reducedMotion ? "none" : "opacity 360ms ease 40ms, transform 650ms ease 40ms",
    willChange: opening ? "transform, opacity" : "auto",
  } as const;

  const closedStateStyle = {
    animation: "none",
    opacity: closedReady && !opening ? 1 : 0,
    transform: "translate3d(0,0,0)",
    transition: reducedMotion ? "none" : "opacity 260ms ease",
    willChange: opening ? "opacity" : "auto",
  } as const;

  return (
    <main className={`envelope-page${opening ? " is-opening" : ""}${reducedMotion ? " reduce-opening" : ""}`}>
      <div className="eyebrow">TO OUR DEAREST FAMILY & FRIENDS</div>
      <h1>A beautiful beginning.</h1>
      <p className="intro">And it wouldn’t be the same without you.</p>
      <Link
        className="envelope-link"
        href="/invitation"
        onClick={openEnvelope}
        onPointerEnter={() => router.prefetch("/invitation")}
        onTouchStart={() => router.prefetch("/invitation")}
        aria-label={opening ? "Opening your wedding invitation" : "Open Ahmed and Ashraqat’s wedding invitation"}
        aria-disabled={opening}
      >
        <span className={`envelope-scene${closedReady ? " envelope-ready" : ""}`} style={smoothSceneStyle}>
          <img
            ref={openImage}
            className="envelope-open-state"
            style={openStateStyle}
            src="/envelope-open.png"
            alt=""
            aria-hidden="true"
            width="1536"
            height="1024"
            loading="eager"
            decoding="async"
            fetchPriority="low"
          />
          <img
            className="envelope-closed-state"
            style={closedStateStyle}
            src="/envelope.png"
            alt="The back of an ivory envelope, sealed with a gold A&Q monogram"
            width="1536"
            height="1024"
            loading="eager"
            decoding="async"
            fetchPriority="high"
            onLoad={() => setClosedReady(true)}
          />
        </span>
        <span className="open-label" aria-live="polite">
          {opening ? "OPENING YOUR INVITATION…" : <>OPEN YOUR INVITATION <span aria-hidden="true">↗</span></>}
        </span>
      </Link>
    </main>
  );
}
