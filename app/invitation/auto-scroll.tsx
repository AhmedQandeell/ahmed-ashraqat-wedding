"use client";

import { useEffect } from "react";

const START_DELAY_MS = 1800;
const SCROLL_SPEED_PX_PER_SECOND = 18;

export default function AutoScroll() {
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduceMotion.matches) return;

    let stopped = false;
    let frame = 0;
    let startTimer: ReturnType<typeof setTimeout> | null = null;
    let lastTime = 0;

    const stop = () => {
      if (stopped) return;
      stopped = true;
      if (startTimer) clearTimeout(startTimer);
      if (frame) cancelAnimationFrame(frame);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "].includes(event.key)) {
        stop();
      }
    };

    const step = (time: number) => {
      if (stopped) return;

      if (!lastTime) lastTime = time;
      const elapsed = Math.min(time - lastTime, 50);
      lastTime = time;

      const guestbook = document.getElementById("guestbook");
      const documentBottom = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      const guestbookStop = guestbook
        ? Math.max(0, guestbook.offsetTop - Math.min(window.innerHeight * 0.18, 120))
        : documentBottom;
      const stopAt = Math.min(guestbookStop, documentBottom);

      if (window.scrollY >= stopAt - 1) {
        stop();
        return;
      }

      const distance = (SCROLL_SPEED_PX_PER_SECOND * elapsed) / 1000;
      window.scrollTo(0, Math.min(window.scrollY + distance, stopAt));
      frame = requestAnimationFrame(step);
    };

    const interactionOptions: AddEventListenerOptions = { passive: true };
    window.addEventListener("wheel", stop, interactionOptions);
    window.addEventListener("touchstart", stop, interactionOptions);
    window.addEventListener("pointerdown", stop, interactionOptions);
    window.addEventListener("keydown", onKeyDown);

    startTimer = setTimeout(() => {
      if (!stopped && document.visibilityState === "visible") {
        frame = requestAnimationFrame(step);
      }
    }, START_DELAY_MS);

    return () => {
      stop();
      window.removeEventListener("wheel", stop);
      window.removeEventListener("touchstart", stop);
      window.removeEventListener("pointerdown", stop);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return null;
}
