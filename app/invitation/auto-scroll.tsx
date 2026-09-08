"use client";

import { useEffect } from "react";

const START_DELAY_MS = 1800;
const SCROLL_SPEED_PX_PER_SECOND = 22;

export default function AutoScroll() {
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduceMotion.matches) return;

    const root = document.documentElement;
    const originalScrollBehavior = root.style.scrollBehavior;

    let stopped = false;
    let frame = 0;
    let startTimer: ReturnType<typeof setTimeout> | null = null;
    let lastTime = 0;
    let scrollPosition = window.scrollY;
    let autoScrollStarted = false;

    const restoreScrollBehavior = () => {
      if (autoScrollStarted) root.style.scrollBehavior = originalScrollBehavior;
    };

    const stop = () => {
      if (stopped) return;
      stopped = true;
      if (startTimer) clearTimeout(startTimer);
      if (frame) cancelAnimationFrame(frame);
      restoreScrollBehavior();
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
      const documentBottom = Math.max(0, root.scrollHeight - window.innerHeight);
      const guestbookTop = guestbook
        ? guestbook.getBoundingClientRect().top + window.scrollY
        : documentBottom;
      const guestbookStop = Math.max(
        0,
        guestbookTop - Math.min(window.innerHeight * 0.18, 120),
      );
      const stopAt = Math.min(guestbookStop, documentBottom);

      if (scrollPosition >= stopAt - 1) {
        window.scrollTo(0, stopAt);
        stop();
        return;
      }

      scrollPosition += (SCROLL_SPEED_PX_PER_SECOND * elapsed) / 1000;
      window.scrollTo(0, Math.min(scrollPosition, stopAt));
      frame = requestAnimationFrame(step);
    };

    const interactionOptions: AddEventListenerOptions = { passive: true };
    window.addEventListener("wheel", stop, interactionOptions);
    window.addEventListener("touchstart", stop, interactionOptions);
    window.addEventListener("pointerdown", stop, interactionOptions);
    window.addEventListener("keydown", onKeyDown);

    startTimer = setTimeout(() => {
      if (!stopped && document.visibilityState === "visible") {
        autoScrollStarted = true;
        root.style.scrollBehavior = "auto";
        scrollPosition = window.scrollY;
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
