"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const VIDEO_ID = "GMihmMfeazY";
const START_AT_SECONDS = 28;
const START_EVENT = "wedding-music-start";
const VOLUME = 28;

export default function MusicPlayer() {
  const pathname = usePathname();
  const playerRef = useRef<any>(null);
  const readyRef = useRef(false);
  const requestedRef = useRef(false);
  const [ready, setReady] = useState(false);
  const [requested, setRequested] = useState(false);
  const [playing, setPlaying] = useState(false);

  const syncState = (player = playerRef.current) => {
    if (!player) return;
    try {
      setPlaying(player.getPlayerState() === 1 && !player.isMuted());
    } catch {
      setPlaying(false);
    }
  };

  const playAudible = (seekToStart: boolean) => {
    const player = playerRef.current;
    if (!readyRef.current || !player) return false;

    requestedRef.current = true;
    setRequested(true);

    try {
      if (seekToStart) player.seekTo(START_AT_SECONDS, true);
      player.setVolume(VOLUME);
      player.unMute();
      player.playVideo();
      window.setTimeout(() => syncState(player), 160);
      return true;
    } catch {
      setPlaying(false);
      return false;
    }
  };

  const initializePlayer = () => {
    const YT = (window as any).YT;
    if (!YT?.Player || playerRef.current) return;

    playerRef.current = new YT.Player("wedding-youtube-player", {
      width: "2",
      height: "2",
      videoId: VIDEO_ID,
      playerVars: {
        start: START_AT_SECONDS,
        playsinline: 1,
        controls: 0,
        disablekb: 1,
        fs: 0,
        rel: 0,
        loop: 1,
        playlist: VIDEO_ID,
        origin: window.location.origin,
      },
      events: {
        onReady: (event: any) => {
          playerRef.current = event.target;
          readyRef.current = true;
          setReady(true);

          try {
            event.target.setVolume(VOLUME);
            event.target.seekTo(START_AT_SECONDS, true);
            event.target.pauseVideo();
          } catch {
            // The visible control below remains the fallback.
          }

          // If the guest tapped the envelope before YouTube finished loading,
          // make a best-effort start now. Browsers that require a fresh gesture
          // will leave the PLAY MUSIC control visible for one-tap recovery.
          if (requestedRef.current) {
            playAudible(true);
          }
        },
        onStateChange: (event: any) => {
          try {
            setPlaying(event.data === 1 && !event.target.isMuted());
          } catch {
            setPlaying(false);
          }
        },
        onError: () => {
          setPlaying(false);
        },
      },
    });
  };

  useEffect(() => {
    const startMusic = () => {
      requestedRef.current = true;
      setRequested(true);
      playAudible(true);
    };

    window.addEventListener(START_EVENT, startMusic);
    return () => window.removeEventListener(START_EVENT, startMusic);
  }, []);

  const toggleMusic = () => {
    const player = playerRef.current;

    if (playing && player) {
      try {
        player.pauseVideo();
      } finally {
        setPlaying(false);
      }
      return;
    }

    requestedRef.current = true;
    setRequested(true);

    // This runs directly from the guest's tap, which is the most reliable
    // way to unlock audio on iOS Safari, Android browsers and in-app browsers.
    if (!playAudible(false) && !ready) {
      initializePlayer();
    }
  };

  const invitationOpen = pathname.startsWith("/invitation");

  return (
    <>
      <Script
        src="https://www.youtube.com/iframe_api"
        strategy="afterInteractive"
        onReady={initializePlayer}
      />

      <div
        id="wedding-youtube-player"
        aria-hidden="true"
        style={{
          position: "fixed",
          left: -9999,
          top: 0,
          width: 2,
          height: 2,
          opacity: 0.01,
          pointerEvents: "none",
          overflow: "hidden",
        }}
      />

      {invitationOpen ? (
        <button
          type="button"
          onClick={toggleMusic}
          aria-label={playing ? "Pause wedding music" : "Play wedding music"}
          title={playing ? "Pause music" : "Play music"}
          style={{
            position: "fixed",
            right: 16,
            bottom: 18,
            zIndex: 100,
            minWidth: playing ? 42 : 122,
            height: 42,
            padding: playing ? 0 : "0 14px",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 7,
            border: "1px solid rgba(155,131,93,.72)",
            borderRadius: 22,
            background: "rgba(250,247,240,.96)",
            color: "#5c4e3f",
            boxShadow: "0 8px 24px rgba(74,59,39,.12)",
            backdropFilter: "blur(7px)",
            WebkitBackdropFilter: "blur(7px)",
            cursor: "pointer",
            font: playing ? "18px/1 Georgia, serif" : "10px/1 Arial, sans-serif",
            letterSpacing: playing ? 0 : ".13em",
          }}
        >
          <span aria-hidden="true">{playing ? "♫" : "♩"}</span>
          {!playing ? <span>{ready ? "PLAY MUSIC" : "MUSIC LOADING"}</span> : null}
        </button>
      ) : null}
    </>
  );
}
