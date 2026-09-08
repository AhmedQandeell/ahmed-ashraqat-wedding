import Link from "next/link";
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

export default function Invitation() {
  return (
    <main className={`${styles.oldMoney} invitation-page`}>
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

            <div className="date-block">
              <span>FRIDAY</span>
              <strong>09</strong>
              <span>
                OCTOBER
                <br />
                2026
              </span>
            </div>

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
    </main>
  );
}
