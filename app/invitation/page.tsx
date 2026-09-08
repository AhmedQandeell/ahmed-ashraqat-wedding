import Link from "next/link";
import Guestbook from "./guestbook";

function FloralCorner({ className }: { className: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 260 260"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M24 234C66 203 85 176 98 143C112 108 126 77 154 54C174 38 198 28 232 24" />
        <path d="M81 180C58 178 43 168 34 151" />
        <path d="M103 132C80 129 66 118 58 100" />
        <path d="M130 87C111 81 100 70 96 55" />
        <path d="M150 58C151 38 160 24 174 15" />
        <path d="M174 42C189 48 205 47 218 39" />
        <path d="M111 118C127 121 142 117 154 106" />
        <path d="M72 168C88 170 102 165 112 153" />
        <path d="M34 151C43 138 55 133 70 136C65 150 53 157 34 151Z" fill="currentColor" fillOpacity="0.06" />
        <path d="M58 100C68 87 81 83 96 88C89 102 76 107 58 100Z" fill="currentColor" fillOpacity="0.06" />
        <path d="M96 55C105 42 117 38 131 42C125 55 113 61 96 55Z" fill="currentColor" fillOpacity="0.06" />
        <path d="M174 15C187 17 195 25 198 39C184 39 176 31 174 15Z" fill="currentColor" fillOpacity="0.06" />
        <path d="M218 39C226 28 237 25 248 29C244 41 234 46 218 39Z" fill="currentColor" fillOpacity="0.06" />
        <path d="M154 106C167 98 180 99 191 108C180 119 168 119 154 106Z" fill="currentColor" fillOpacity="0.06" />
        <path d="M112 153C126 144 140 145 151 155C139 166 126 166 112 153Z" fill="currentColor" fillOpacity="0.06" />
        <circle cx="151" cy="56" r="5.5" fill="currentColor" fillOpacity="0.04" />
        <path d="M151 50C146 42 137 41 132 47C130 53 137 59 151 62" />
        <path d="M151 50C156 41 165 40 170 47C172 54 164 60 151 62" />
      </g>
    </svg>
  );
}

export default function Invitation() {
  return (
    <main className="invitation-page relative overflow-hidden">
      <FloralCorner className="pointer-events-none absolute -left-10 top-14 z-0 h-64 w-64 text-[#b39363] opacity-[0.16] sm:h-80 sm:w-80" />
      <FloralCorner className="pointer-events-none absolute -right-12 bottom-4 z-0 h-64 w-64 rotate-180 text-[#b39363] opacity-[0.12] sm:h-80 sm:w-80" />

      <div className="relative z-10">
        <nav>
          <Link href="/" aria-label="Back to envelope" className="monogram">
            A&Q
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
            <h1 className="couple">
              <span>Ahmed Qandeel</span>
              <i>&</i>
              <span>Ashraqat El-Bidwehy</span>
            </h1>
            <div className="divider" aria-hidden="true">
              ✧
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
          <div className="monogram">A&Q</div>
          <p>With love and gratitude</p>
          <p>Ahmed & Ashraqat</p>
          <span>09 · 10 · 2026</span>
        </footer>
      </div>
    </main>
  );
}
