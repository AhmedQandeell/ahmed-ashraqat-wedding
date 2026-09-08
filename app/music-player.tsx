"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const VIDEO_ID = "GMihmMfeazY";
const START_AT_SECONDS = 28;
const START_EVENT = "wedding-music-start";

export default function MusicPlayer() {
  const pathname = usePathname();
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [requested, setRequested] = useState(false);
  const [playing, setPlaying] = useState(false);

  const command = (func: string, args: unknown[] = []) => {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: "command", func, args }),
      "*",
    );
  };

  const makeAudible = (seek = false) => {
    if (seek) command("seekTo", [START_AT_SECONDS, true]);
    command("setVolume", [28]);
    command("unMute");
    command("playVideo");
    setPlaying(true);
  };

  useEffect(() => {
    const startMusic = () => {
      setRequested(true);

      // The iframe is already autoplaying muted. Because this function runs from
      // the envelope tap, unmuting here is treated as a user-initiated action by
      // browsers that allow it.
      makeAudible(true);
    };

    window.addEventListener(START_EVENT, startMusic);
    return () => window.removeEventListener(START_EVENT, startMusic);
  }, []);

  const toggleMusic = () => {
    if (playing) {
      command("pauseVideo");
      setPlaying(false);
      return;
    }

    // This button is a direct user gesture, so it is the reliable fallback on
    // iOS/Android when automatic unmuting is blocked by the browser.
    setRequested(true);
    makeAudible(false);
  };

  return (
    <>
      <iframe
        ref={iframeRef}
        src={`https://www.youtube-nocookie.com/embed/${VIDEO_ID}?enablejsapi=1&playsinline=1&controls=0&disablekb=1&fs=0&rel=0&loop=1&playlist=${VIDEO_ID}&start=${START_AT_SECONDS}&autoplay=1&mute=1`}
        title="Wedding music"
        allow="autoplay; encrypted-media"
        aria-hidden="true"
        tabIndex={-1}
        loading="eager"
        style={{
          position: "fixed",
          width: 1,
          height: 1,
          left: -10,
          bottom: -10,
          opacity: 0,
          pointerEvents: "none",
          border: 0,
        }}
      />

      {pathname.startsWith("/invitation") ? (
        <button
          type="button"
          onClick={toggleMusic}
          aria-label={playing ? "Pause wedding music" : "Play wedding music"}
          title={playing ? "Pause music" : "Play music"}
          style={{
            position: "fixed",
            right: 16,
            bottom: 18,
            zIndex: 50,
            minWidth: requested ? 42 : 112,
            height: 42,
            padding: requested ? 0 : "0 14px",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 7,
            border: "1px solid rgba(155,131,93,.68)",
            borderRadius: 22,
            background: "rgba(250,247,240,.94)",
            color: "#5c4e3f",
            boxShadow: "0 8px 24px rgba(74,59,39,.10)",
            backdropFilter: "blur(7px)",
            WebkitBackdropFilter: "blur(7px)",
            cursor: "pointer",
            font: requested ? "18px/1 Georgia, serif" : "10px/1 Arial, sans-serif",
            letterSpacing: requested ? 0 : ".13em",
          }}
        >
          <span aria-hidden="true">{playing ? "♫" : "♩"}</span>
          {!requested ? <span>PLAY MUSIC</span> : null}
        </button>
      ) : null}
    </>
  );
}
