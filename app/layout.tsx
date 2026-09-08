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
        <link rel="preconnect" href="https://www.youtube.com" />
        <link rel="preconnect" href="https://i.ytimg.com" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Libre+Baskerville:ital,wght@0,400;1,400&display=swap"
        />
      </head>
      <body>
        <MusicPlayer />
        {children}
      </body>
    </html>
  );
}
