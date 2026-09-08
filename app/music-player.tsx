"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const VIDEO_ID = "GMihmMfeazY";
const START_AT_SECONDS = 28;
const START_EVENT = "wedding-music-start";

export default function MusicPlayer() {
  const pathname = usePathname();
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const retryTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const [requested, setRequested] = useState(false);
  const [playing, setPlaying] = useState(false);

  const command = (func: string, args: unknown[] = []) => {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: "command", func, args }),
      "*",
    );
  };

  useEffect(() => {
    const startMusic = () => {
      setRequested(true);
      setPlaying(true);

      const sendStartCommands = (includeSeek: boolean) => {
        const player = iframeRef.current?.contentWindow;
        if (!player) return;

        if (includeSeek) {
          player.postMessage(
            JSON.stringify({ event: "command", func: "seekTo", args: [START_AT_SECONDS, true] }),
            "*",
          );
        }
        player.postMessage(
          JSON.stringify({ event: "command", func: "setVolume", args: [28] }),
          "*",
        );
        player.postMessage(
          JSON.stringify({ event: "command", func: "playVideo", args: [] }),
          "*",
        );
      };

      // First attempt runs directly from the user's envelope tap.
      sendStartCommands(true);

      if (retryTimer.current) clearInterval(retryTimer.current);
      let attempts = 0;
      retryTimer.current = setInterval(() => {
        attempts += 1;
        sendStartCommands(false);
        if (attempts >= 8 && retryTimer.current) {
          clearInterval(retryTimer.current);
          retryTimer.current = null;
        }
      }, 180);
    };

    window.addEventListener(START_EVENT, startMusic);
    return () => {
      window.removeEventListener(START_EVENT, startMusic);
      if (retryTimer.current) clearInterval(retryTimer.current);
    };
  }, []);

  const toggleMusic = () => {
    if (playing) {
      command("pauseVideo");
      setPlaying(false);
    } else {
      command("playVideo");
      setPlaying(true);
    }
  };

  return (
    <>
      <iframe
        ref={iframeRef}
        src={`https://www.youtube-nocookie.com/embed/${VIDEO_ID}?enablejsapi=1&playsinline=1&controls=0&disablekb=1&fs=0&rel=0&loop=1&playlist=${VIDEO_ID}&start=${START_AT_SECONDS}`}
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

      {requested && pathname.startsWith("/invitation") ? (
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
            width: 42,
            height: 42,
            display: "grid",
            placeItems: "center",
            border: "1px solid rgba(155,131,93,.68)",
            borderRadius: "50%",
            background: "rgba(250,247,240,.9)",
            color: "#5c4e3f",
            boxShadow: "0 8px 24px rgba(74,59,39,.10)",
            backdropFilter: "blur(7px)",
            WebkitBackdropFilter: "blur(7px)",
            cursor: "pointer",
            font: "18px/1 Georgia, serif",
          }}
        >
          <span aria-hidden="true">{playing ? "♫" : "♩"}</span>
        </button>
      ) : null}
    </>
  );
}
