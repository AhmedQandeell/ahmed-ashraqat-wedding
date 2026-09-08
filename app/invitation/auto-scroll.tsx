"use client";

import { useEffect } from "react";

const START_DELAY_MS = 1800;
const SCROLL_SPEED_PX_PER_SECOND = 60;

export default function AutoScroll() {
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduceMotion.matches) return;

    const root = document.documentElement;
    const originalScrollBehavior = root.style.scrollBehavior;

    let stopped = false;
    let frame = 0;
    let startTimer: ReturnType<typeof setTimeout> | null = null;
    let startTime = 0;
    let startPosition = window.scrollY;
    let lastRenderedPosition = Math.round(window.scrollY);
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

    const getStopAt = () => {
      const guestbook = document.getElementById("guestbook");
      const documentBottom = Math.max(0, root.scrollHeight - window.innerHeight);
      const guestbookTop = guestbook
        ? guestbook.getBoundingClientRect().top + window.scrollY
        : documentBottom;
      const guestbookStop = Math.max(
        0,
        guestbookTop - Math.min(window.innerHeight * 0.18, 120),
      );
      return Math.min(guestbookStop, documentBottom);
    };

    const step = (time: number) => {
      if (stopped) return;

      if (!startTime) startTime = time;

      const stopAt = getStopAt();
      const elapsedSeconds = (time - startTime) / 1000;
      const desiredPosition = Math.min(
        startPosition + SCROLL_SPEED_PX_PER_SECOND * elapsedSeconds,
        stopAt,
      );
      const nextPosition = Math.round(desiredPosition);

      if (nextPosition !== lastRenderedPosition) {
        lastRenderedPosition = nextPosition;
        window.scrollTo(0, nextPosition);
      }

      if (nextPosition >= stopAt - 1) {
        stop();
        return;
      }

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
        startPosition = window.scrollY;
        lastRenderedPosition = Math.round(startPosition);
        startTime = 0;
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
