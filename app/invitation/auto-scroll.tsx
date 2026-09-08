"use client";

import { useEffect } from "react";

const START_DELAY_MS = 1800;
const SCROLL_SPEED_PX_PER_SECOND = 38;

export default function AutoScroll() {
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduceMotion.matches || window.scrollY > 2) return;

    const root = document.documentElement;
    const track = document.querySelector<HTMLElement>("[data-auto-scroll-track]");
    if (!track) return;

    const originalScrollBehavior = root.style.scrollBehavior;
    let stopped = false;
    let started = false;
    let frame = 0;
    let startTimer: ReturnType<typeof setTimeout> | null = null;
    let startTime = 0;
    let visualOffset = 0;
    let stopAt = 0;

    const restoreScrollBehavior = () => {
      requestAnimationFrame(() => {
        root.style.scrollBehavior = originalScrollBehavior;
      });
    };

    const commitVisualPositionToPage = () => {
      if (!started) return;
      const committedPosition = Math.max(0, Math.round(visualOffset));
      root.style.scrollBehavior = "auto";
      track.style.transform = "none";
      track.style.willChange = "auto";
      window.scrollTo(0, committedPosition);
      restoreScrollBehavior();
    };

    const stop = () => {
      if (stopped) return;
      stopped = true;
      if (startTimer) clearTimeout(startTimer);
      if (frame) cancelAnimationFrame(frame);
      commitVisualPositionToPage();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "].includes(event.key)) {
        stop();
      }
    };

    const onNativeScroll = () => {
      if (!stopped && started && window.scrollY > 1) stop();
    };

    const step = (time: number) => {
      if (stopped) return;
      if (!startTime) startTime = time;

      const elapsedSeconds = (time - startTime) / 1000;
      visualOffset = Math.min(SCROLL_SPEED_PX_PER_SECOND * elapsedSeconds, stopAt);
      track.style.transform = `translate3d(0, -${visualOffset.toFixed(3)}px, 0)`;

      if (visualOffset >= stopAt - 0.25) {
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
    window.addEventListener("scroll", onNativeScroll, interactionOptions);

    startTimer = setTimeout(() => {
      if (stopped || document.visibilityState !== "visible" || window.scrollY > 2) return;

      const guestbook = document.getElementById("guestbook");
      const documentBottom = Math.max(0, root.scrollHeight - window.innerHeight);
      const guestbookTop = guestbook
        ? guestbook.getBoundingClientRect().top + window.scrollY
        : documentBottom;
      const guestbookStop = Math.max(
        0,
        guestbookTop - Math.min(window.innerHeight * 0.18, 120),
      );
      stopAt = Math.min(guestbookStop, documentBottom);

      if (stopAt <= 1) return;

      started = true;
      track.style.willChange = "transform";
      track.style.transform = "translate3d(0, 0, 0)";
      frame = requestAnimationFrame(step);
    }, START_DELAY_MS);

    return () => {
      stop();
      window.removeEventListener("wheel", stop);
      window.removeEventListener("touchstart", stop);
      window.removeEventListener("pointerdown", stop);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("scroll", onNativeScroll);
    };
  }, []);

  return null;
}
