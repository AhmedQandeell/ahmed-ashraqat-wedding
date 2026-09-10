"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const VIDEO_ID = "Gcxv7i02lXc";
const START_AT_SECONDS = 30;
const START_EVENT = "wedding-music-start";

export default function MusicPlayer() {
  const pathname = usePathname();
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const mutedRef = useRef(true);
  const playerStateRef = useRef(-1);
  const [playing, setPlaying] = useState(false);

  const post = (payload: object) => {
    iframeRef.current?.contentWindow?.postMessage(JSON.stringify(payload), "*");
  };

  const command = (func: string, args: unknown[] = []) => {
    post({ event: "command", func, args });
  };

  const makeAudible = (seek = false) => {
    if (seek) command("seekTo", [START_AT_SECONDS, true]);
    command("setVolume", [28]);
    command("unMute");
    command("playVideo");
  };

  useEffect(() => {
    const syncPlayingState = () => {
      setPlaying(playerStateRef.current === 1 && !mutedRef.current);
    };

    const startMusic = () => {
      makeAudible(true);
    };

    const onMessage = (event: MessageEvent) => {
      if (
        event.origin !== "https://www.youtube.com" &&
        event.origin !== "https://www.youtube-nocookie.com"
      ) {
        return;
      }

      let data: any = event.data;
      if (typeof data === "string") {
        try {
          data = JSON.parse(data);
        } catch {
          return;
        }
      }

      if (data?.event !== "infoDelivery" || !data?.info) return;

      if (typeof data.info.muted === "boolean") {
        mutedRef.current = data.info.muted;
      }
      if (typeof data.info.playerState === "number") {
        playerStateRef.current = data.info.playerState;
      }
      syncPlayingState();
    };

    window.addEventListener(START_EVENT, startMusic);
    window.addEventListener("message", onMessage);

    return () => {
      window.removeEventListener(START_EVENT, startMusic);
      window.removeEventListener("message", onMessage);
    };
  }, []);

  const toggleMusic = () => {
    if (playing) {
      command("pauseVideo");
      playerStateRef.current = 2;
      setPlaying(false);
      return;
    }

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
        onLoad={() => post({ event: "listening" })}
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
            minWidth: playing ? 42 : 118,
            height: 42,
            padding: playing ? 0 : "0 14px",
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
            font: playing ? "18px/1 Georgia, serif" : "10px/1 Arial, sans-serif",
            letterSpacing: playing ? 0 : ".13em",
          }}
        >
          <span aria-hidden="true">{playing ? "♫" : "♩"}</span>
          {!playing ? <span>PLAY MUSIC</span> : null}
        </button>
      ) : null}
    </>
  );
}
