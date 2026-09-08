from pathlib import Path

path = Path("app/invitation/page.tsx")
text = path.read_text(encoding="utf-8")

old = '''              <h1 className="couple" style={{ fontSize: "clamp(27px, 8.2vw, 50px)" }}>
                <span style={{ whiteSpace: "nowrap" }}>Ahmed And Ashrqat</span>
              </h1>'''

new = '''              <h1
                className="couple"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  fontSize: "clamp(27px, 8.2vw, 50px)",
                }}
              >
                <span style={{ whiteSpace: "nowrap" }}>Ahmed</span>
                <i>&</i>
                <span style={{ whiteSpace: "nowrap" }}>Ashrqat</span>
              </h1>'''

if old not in text:
    raise SystemExit("Expected couple-name block was not found")

text = text.replace(old, new, 1)
text = text.replace(
    '<p className={styles.footerNames}>Ahmed And Ashrqat</p>',
    '<p className={styles.footerNames}>Ahmed & Ashrqat</p>',
    1,
)
path.write_text(text, encoding="utf-8")
