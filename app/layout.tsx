import type { Metadata } from "next";
import MusicPlayer from "./music-player";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ahmed & Ashraqat | Wedding Invitation",
  description:
    "Join us to celebrate the wedding of Ahmed Qandeel and Ashraqat El-Bidwehy. Friday, 9 October 2026, 8 PM at Tiba Rose Hotel.",
  robots: { index: false, follow: false },
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preload" as="image" href="/envelope.png" fetchPriority="high" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.youtube-nocookie.com" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Libre+Baskerville:ital,wght@0,400;1,400&display=swap"
        />
        <style>{`
          .envelope-scene::before {
            content: "A & Q";
            position: absolute;
            inset: 13.5% 7% 17%;
            z-index: 0;
            display: grid;
            place-items: center;
            border: 1px solid rgba(169, 139, 91, .42);
            background: linear-gradient(145deg, rgba(255,255,255,.5), transparent 42%), #f2eadc;
            color: #9a7a4d;
            box-shadow: 0 12px 34px rgba(73, 55, 32, .08);
            font: italic 24px/1 Georgia, 'Times New Roman', serif;
            letter-spacing: .08em;
            opacity: 1;
            transition: opacity 180ms ease;
          }
          .envelope-scene.envelope-ready::before { opacity: 0; }
        `}</style>
      </head>
      <body>
        <MusicPlayer />
        {children}
      </body>
    </html>
  );
}
