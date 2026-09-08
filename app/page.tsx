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
  const openImage = useRef<HTMLImageElement | null>(null);
  const closedImage = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function prepareEnvelope() {
      // Decode both large envelope images before interaction so the browser does
      // not have to decode/rasterize them during the opening animation.
      await Promise.all([
        openImage.current?.decode().catch(() => undefined),
        closedImage.current?.decode().catch(() => undefined),
      ]);
      if (!cancelled) router.prefetch("/invitation");
    }

    void prepareEnvelope();
    return () => {
      cancelled = true;
      if (timer.current) clearTimeout(timer.current);
    };
  }, [router]);

  async function openEnvelope(event: MouseEvent<HTMLAnchorElement>) {
    // Preserve normal browser behavior for opening the invitation in another tab.
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    if (started.current) return;
    started.current = true;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReducedMotion(reduce);

    if (!reduce) {
      // A second decode check is effectively free when already decoded and protects
      // fast clicks on slow devices. Two RAFs give the compositor a frame to promote
      // the prepared layers before transforms begin.
      await Promise.all([
        openImage.current?.decode().catch(() => undefined),
        closedImage.current?.decode().catch(() => undefined),
      ]);
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      );
    }

    setOpening(true);
    timer.current = setTimeout(() => router.push("/invitation"), reduce ? 160 : 1680);
  }

  const smoothSceneStyle = {
    animation: "none",
    transform: opening && !reducedMotion
      ? "translate3d(0,-18px,0) scale(1.035)"
      : "translate3d(0,0,0) scale(1)",
    opacity: opening && !reducedMotion ? 0 : 1,
    transition: reducedMotion
      ? "none"
      : opening
        ? "transform 1.2s cubic-bezier(.22,.61,.36,1) 120ms, opacity 280ms ease 1.34s"
        : "none",
    willChange: "transform, opacity",
  } as const;

  const openStateStyle = {
    animation: "none",
    opacity: opening ? 1 : 0,
    transform: opening ? "translate3d(0,-2px,0) scale(1.003)" : "translate3d(0,0,0) scale(1)",
    transition: reducedMotion ? "none" : "opacity 520ms ease 100ms, transform 800ms ease 100ms",
    willChange: "transform, opacity",
  } as const;

  const closedStateStyle = {
    animation: "none",
    opacity: opening ? 0 : 1,
    transform: "translate3d(0,0,0)",
    transition: reducedMotion ? "none" : "opacity 430ms ease 70ms",
    willChange: "opacity",
  } as const;

  return (
    <main className={`envelope-page${opening ? " is-opening" : ""}${reducedMotion ? " reduce-opening" : ""}`}>
      <div className="eyebrow">TO OUR DEAREST FAMILY & FRIENDS</div>
      <h1>A beautiful beginning.</h1>
      <p className="intro">And it wouldn’t be the same without you.</p>
      <Link className="envelope-link" href="/invitation" onClick={openEnvelope}
        aria-label={opening ? "Opening your wedding invitation" : "Open Ahmed and Ashraqat’s wedding invitation"}
        aria-disabled={opening}>
        <span className="envelope-scene" style={smoothSceneStyle}>
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
            fetchPriority="high"
          />
          <img
            ref={closedImage}
            className="envelope-closed-state"
            style={closedStateStyle}
            src="/envelope.png"
            alt="The back of an ivory envelope, sealed with a gold A&Q monogram"
            width="1536"
            height="1024"
            loading="eager"
            decoding="async"
            fetchPriority="high"
          />
        </span>
        <span className="open-label" aria-live="polite">{opening ? "OPENING YOUR INVITATION…" : <>OPEN YOUR INVITATION <span aria-hidden="true">↗</span></>}</span>
      </Link>
    </main>
  );
}
