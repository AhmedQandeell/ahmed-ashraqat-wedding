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
    <span className={styles.monogramMark} aria-label="Q and A">
      <span>Q</span>
      <i aria-hidden="true">&</i>
      <span>A</span>
    </span>
  );
}

function WeddingCalendar() {
  const weekdays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const days: Array<number | null> = [
    null, null, null, null, 1, 2, 3,
    4, 5, 6, 7, 8, 9, 10,
    11, 12, 13, 14, 15, 16, 17,
    18, 19, 20, 21, 22, 23, 24,
    25, 26, 27, 28, 29, 30, 31,
  ];

  return (
    <section
      aria-label="October 2026 wedding calendar"
      style={{
        width: "100%",
        maxWidth: 450,
        margin: "40px auto 20px",
        textAlign: "center",
      }}
    >
      <p
        style={{
          margin: "0 0 8px",
          color: "#776a59",
          fontFamily: "Arial, sans-serif",
          fontSize: 9,
          letterSpacing: ".28em",
        }}
      >
        SAVE THE DATE
      </p>

      <div
        style={{
          overflow: "hidden",
          border: "1px solid rgba(155,131,93,.48)",
          borderRadius: 11,
          background: "rgba(251,248,241,.78)",
          boxShadow: "0 14px 38px rgba(74,59,39,.05)",
        }}
      >
        <header
          style={{
            padding: "15px 14px 14px",
            borderBottom: "1px solid rgba(155,131,93,.28)",
            background: "rgba(238,230,216,.52)",
          }}
        >
          <h3
            style={{
              margin: 0,
              color: "#4c4034",
              fontFamily: '"Cormorant Garamond", Garamond, Georgia, serif',
              fontSize: "clamp(23px, 4.6vw, 28px)",
              fontWeight: 500,
              letterSpacing: ".04em",
              lineHeight: 1,
            }}
          >
            October 2026
          </h3>
        </header>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
            padding: "11px 10px 9px",
            borderBottom: "1px solid rgba(155,131,93,.38)",
          }}
        >
          {weekdays.map((day) => (
            <span
              key={day}
              style={{
                color: "#82745f",
                fontFamily: "Arial, sans-serif",
                fontSize: "clamp(6px, 1.4vw, 7.5px)",
                letterSpacing: ".1em",
              }}
            >
              {day}
            </span>
          ))}
        </div>

        <div
          role="grid"
          aria-label="October 2026"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
            rowGap: 2,
            padding: "11px 10px 14px",
          }}
        >
          {days.map((day, index) => {
            const weddingDay = day === 9;
            return (
              <div
                key={`${index}-${day ?? "blank"}`}
                role="gridcell"
                aria-label={weddingDay ? "Friday, October 9, 2026 — wedding day" : day ? `October ${day}, 2026` : undefined}
                style={{
                  position: "relative",
                  display: "grid",
                  placeItems: "center",
                  minHeight: "clamp(29px, 6.8vw, 39px)",
                  color: weddingDay ? "#fffaf1" : "#5b4d3f",
                  fontFamily: '"Cormorant Garamond", Garamond, Georgia, serif',
                  fontSize: "clamp(15px, 3.6vw, 19px)",
                  fontWeight: weddingDay ? 600 : 400,
                  lineHeight: 1,
                }}
              >
                {weddingDay ? (
                  <span
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      width: "clamp(29px, 6.8vw, 37px)",
                      height: "clamp(26px, 6.2vw, 34px)",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -49%)",
                      zIndex: 0,
                    }}
                  >
                    <svg viewBox="0 0 44 40" width="100%" height="100%" fill="none">
                      <path
                        d="M22 38S3 27.2 3 13.2C3 6.9 7.5 3 13 3c4.2 0 7.3 2.4 9 5.1C23.7 5.4 26.8 3 31 3c5.5 0 10 3.9 10 10.2C41 27.2 22 38 22 38Z"
                        fill="#9B835D"
                      />
                    </svg>
                  </span>
                ) : null}
                <span style={{ position: "relative", zIndex: 1 }}>{day ?? ""}</span>
              </div>
            );
          })}
        </div>
      </div>

      <p
        style={{
          margin: "12px 0 0",
          color: "#716558",
          fontFamily: '"Cormorant Garamond", Garamond, Georgia, serif',
          fontSize: "clamp(14px, 2.8vw, 17px)",
          fontStyle: "italic",
        }}
      >
        Friday, October 9 at 8:00 PM
      </p>

      <a
        href="/wedding.ics"
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 11,
          marginTop: 9,
          padding: "8px 2px 10px",
          borderBottom: "1px solid rgba(155,131,93,.72)",
          color: "#5f5142",
          textDecoration: "none",
          fontFamily: "Arial, sans-serif",
          fontSize: 8.5,
          fontWeight: 400,
          letterSpacing: ".2em",
        }}
      >
        ADD TO CALENDAR
        <span aria-hidden="true" style={{ color: "#9b835d", fontSize: 14, letterSpacing: 0 }}>＋</span>
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
                <span style={{ whiteSpace: "nowrap" }}>Ahmed And Ashrqat</span>
              </h1>

              <div className="divider" aria-hidden="true">
                ❦
              </div>

              <p className="personal">
                Your presence will make our celebration
                <br className="desktop-break" /> all the more meaningful.
              </p>

              <WeddingCalendar />

              <div className="venue">
                <p className="eyebrow">THE CELEBRATION</p>
                <h2>Tiba Rose Hotel</h2>
                <a
                  className="submit-button"
                  href="https://maps.app.goo.gl/BrGWPSXwrq8SqrQB7"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minWidth: 190,
                    textDecoration: "none",
                  }}
                >
                  VIEW LOCATION
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
            <p className={styles.footerNames}>Ahmed And Ashrqat</p>
            <span>09 · 10 · 2026</span>
          </footer>
        </div>
      </div>
    </main>
  );
}
