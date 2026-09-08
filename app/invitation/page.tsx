import Link from "next/link";
import AutoScroll from "./auto-scroll";
import Guestbook from "./guestbook";
import styles from "./old-money.module.css";

function FloralCorner({ className }: { className: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 300 390"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M34 356C84 320 104 280 119 231C136 176 153 123 194 83C218 60 242 45 274 35" />
        <path d="M84 313C68 298 57 279 53 258" />
        <path d="M112 254C92 242 78 226 71 204" />
        <path d="M138 194C116 185 101 169 93 146" />
        <path d="M161 139C143 126 135 109 135 88" />
        <path d="M190 87C187 68 192 51 206 36" />
        <path d="M207 70C226 77 245 74 261 62" />
        <path d="M171 126C190 133 209 129 225 116" />
        <path d="M144 180C162 187 180 184 196 171" />
        <path d="M116 239C133 247 151 244 165 232" />
        <path d="M85 299C101 306 118 303 131 292" />
        <path d="M52 258C64 247 77 245 91 251C83 265 70 268 52 258Z" fill="currentColor" fillOpacity="0.045" />
        <path d="M71 204C83 190 97 188 112 195C104 209 90 212 71 204Z" fill="currentColor" fillOpacity="0.045" />
        <path d="M93 146C105 133 120 131 135 138C126 152 112 155 93 146Z" fill="currentColor" fillOpacity="0.045" />
        <path d="M135 88C147 75 161 74 176 80C168 94 154 98 135 88Z" fill="currentColor" fillOpacity="0.045" />
        <path d="M206 36C220 36 230 43 235 56C222 59 211 52 206 36Z" fill="currentColor" fillOpacity="0.045" />
        <path d="M261 62C270 50 282 47 293 51C288 64 278 69 261 62Z" fill="currentColor" fillOpacity="0.045" />
        <path d="M225 116C239 106 254 107 266 116C254 128 240 128 225 116Z" fill="currentColor" fillOpacity="0.045" />
        <path d="M196 171C211 161 226 162 238 171C226 184 211 184 196 171Z" fill="currentColor" fillOpacity="0.045" />
        <path d="M165 232C179 222 194 223 206 232C194 244 180 245 165 232Z" fill="currentColor" fillOpacity="0.045" />
        <path d="M131 292C145 282 160 283 172 292C160 304 145 305 131 292Z" fill="currentColor" fillOpacity="0.045" />
      </g>
    </svg>
  );
}

function Monogram() {
  return (
    <span className={styles.monogramMark} aria-label="A and Q">
      <span>A</span>
      <i aria-hidden="true">&</i>
      <span>Q</span>
    </span>
  );
}

function WeddingCalendar() {
  return (
    <section
      aria-label="Wedding date and add to calendar"
      style={{
        display: "grid",
        justifyItems: "center",
        gap: 14,
        margin: "42px auto 18px",
      }}
    >
      <div
        aria-label="Friday, 9 October 2026"
        style={{
          position: "relative",
          width: "min(194px, 70vw)",
          border: "1px solid rgba(155,131,93,.62)",
          background: "#fbf8f1",
          boxShadow: "0 14px 34px rgba(74,59,39,.075)",
          textAlign: "center",
          overflow: "visible",
        }}
      >
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            top: -9,
            left: 43,
            width: 3,
            height: 19,
            borderRadius: 99,
            background: "#9b835d",
            boxShadow: "0 0 0 3px #f7f2e9",
            zIndex: 3,
          }}
        />
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            top: -9,
            right: 43,
            width: 3,
            height: 19,
            borderRadius: 99,
            background: "#9b835d",
            boxShadow: "0 0 0 3px #f7f2e9",
            zIndex: 3,
          }}
        />

        <div
          style={{
            padding: "17px 12px 13px",
            borderBottom: "1px solid rgba(155,131,93,.34)",
            background: "#eee6d8",
            color: "#655747",
            fontFamily: "Arial, sans-serif",
            fontSize: 9,
            letterSpacing: ".31em",
          }}
        >
          OCTOBER
        </div>

        <time
          dateTime="2026-10-09"
          style={{
            display: "block",
            padding: "14px 12px 0",
            color: "#453a30",
            fontFamily: '"Cormorant Garamond", Garamond, Georgia, serif',
            fontSize: "clamp(62px, 18vw, 72px)",
            fontWeight: 400,
            letterSpacing: "-.035em",
            lineHeight: .98,
          }}
        >
          09
        </time>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            padding: "10px 12px 17px",
            color: "#736653",
            fontFamily: "Arial, sans-serif",
            fontSize: 8,
            letterSpacing: ".2em",
          }}
        >
          <span>FRIDAY</span>
          <span aria-hidden="true" style={{ color: "#a58c66", letterSpacing: 0 }}>•</span>
          <span>2026</span>
        </div>
      </div>

      <a
        href="/wedding.ics"
        download="Ahmed-Ashraqat-Wedding.ics"
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 11,
          minWidth: "min(194px, 70vw)",
          padding: "7px 2px 9px",
          borderBottom: "1px solid rgba(155,131,93,.72)",
          color: "#5f5142",
          textDecoration: "none",
          fontFamily: "Arial, sans-serif",
          fontSize: 8.5,
          fontWeight: 400,
          letterSpacing: ".2em",
        }}
      >
        ADD TO CALENDAR <span aria-hidden="true" style={{ color: "#9b835d", fontSize: 14, letterSpacing: 0 }}>＋</span>
      </a>
    </section>
  );
}

export default function Invitation() {
  return (
    <main className={`${styles.oldMoney} invitation-page`}>
      <AutoScroll />

      <div data-auto-scroll-track style={{ position: "relative" }}>
        <FloralCorner className={`${styles.floral} ${styles.floralTop}`} />
        <FloralCorner className={`${styles.floral} ${styles.floralBottom}`} />

        <div className={styles.content}>
          <nav>
            <Link href="/" aria-label="Back to envelope">
              <Monogram />
            </Link>
            <a href="#guestbook">GUESTBOOK</a>
          </nav>

          <article className="invitation-card">
            <div className="inner-frame">
              <p className="eyebrow">IN THE NAME OF ALLAH, THE MOST MERCIFUL</p>
              <p className="welcome">With love, we welcome you.</p>
              <p className="formal">
                Together with our families,
                <br />
                we request the pleasure of your company
                <br />
                as we celebrate our wedding.
              </p>

              <h1 className="couple" style={{ fontSize: "clamp(27px, 8.2vw, 50px)" }}>
                <span style={{ whiteSpace: "nowrap" }}>Ahmed Qandeel</span>
                <i>&</i>
                <span style={{ whiteSpace: "nowrap" }}>Ashraqat El-Bidwehy</span>
              </h1>

              <div className="divider" aria-hidden="true">
                ❦
              </div>

              <p className="personal">
                Your presence will make our celebration
                <br className="desktop-break" /> all the more meaningful.
              </p>

              <WeddingCalendar />

              <p className="time">AT EIGHT O’CLOCK IN THE EVENING</p>

              <div className="venue">
                <p className="eyebrow">THE CELEBRATION</p>
                <h2>Tiba Rose Hotel</h2>
                <a
                  className="outline-button"
                  href="https://maps.app.goo.gl/BrGWPSXwrq8SqrQB7"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  VIEW LOCATION <span aria-hidden="true">↗</span>
                </a>
              </div>
            </div>
          </article>

          <Guestbook />

          <footer>
            <div className="monogram">
              <Monogram />
            </div>
            <p>With love and gratitude</p>
            <p className={styles.footerNames}>Ahmed & Ashraqat</p>
            <span>09 · 10 · 2026</span>
          </footer>
        </div>
      </div>
    </main>
  );
}
