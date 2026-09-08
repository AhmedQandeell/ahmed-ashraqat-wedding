from __future__ import annotations

from pathlib import Path

import cv2
import numpy as np
from PIL import Image

ROOT = Path('.')
CSS_PATH = ROOT / 'app/globals.css'
ASSETS = [ROOT / 'public/envelope.png', ROOT / 'public/envelope-open.png']

SHADOW = np.array([188, 175, 157], dtype=np.float32)   # #BCAF9D
BASE = np.array([214, 203, 187], dtype=np.float32)     # #D6CBBB
HIGHLIGHT = np.array([226, 216, 202], dtype=np.float32) # #E2D8CA
GOLD_SHADOW = np.array([123, 91, 48], dtype=np.float32)
GOLD_BASE = np.array([164, 128, 72], dtype=np.float32)
GOLD_HIGHLIGHT = np.array([198, 164, 105], dtype=np.float32)

TRIAL_MARKER = '/* FLORAL_STONE_ENVELOPE_TRIAL */'


def piecewise_map(norm: np.ndarray, low: np.ndarray, mid: np.ndarray, high: np.ndarray) -> np.ndarray:
    t = norm[..., None]
    lower = low + (mid - low) * np.clip(t * 2.0, 0.0, 1.0)
    upper = mid + (high - mid) * np.clip((t - 0.5) * 2.0, 0.0, 1.0)
    return np.where((t <= 0.5), lower, upper)


def transparent_outer_canvas(rgb: np.ndarray, alpha: np.ndarray) -> np.ndarray:
    if np.mean(alpha < 250) > 0.02:
        return alpha

    h, w = alpha.shape
    s = max(8, min(h, w) // 40)
    corner_samples = np.concatenate([
        rgb[:s, :s].reshape(-1, 3),
        rgb[:s, -s:].reshape(-1, 3),
        rgb[-s:, :s].reshape(-1, 3),
        rgb[-s:, -s:].reshape(-1, 3),
    ], axis=0)
    bg = np.median(corner_samples, axis=0)
    dist = np.linalg.norm(rgb.astype(np.float32) - bg.astype(np.float32), axis=2)
    candidate = (dist < 24).astype(np.uint8)

    count, labels, _, _ = cv2.connectedComponentsWithStats(candidate, 8)
    border_labels = set(np.unique(np.concatenate([
        labels[0, :], labels[-1, :], labels[:, 0], labels[:, -1]
    ])))
    bg_mask = np.zeros_like(candidate, dtype=np.uint8)
    for label in border_labels:
        if label != 0:
            bg_mask[labels == label] = 1

    # Feather only the outside cutout. The envelope itself remains untouched.
    foreground = 1.0 - bg_mask.astype(np.float32)
    soft = cv2.GaussianBlur(foreground, (0, 0), 1.35)
    new_alpha = np.minimum(alpha.astype(np.float32), soft * 255.0)
    return np.clip(new_alpha, 0, 255).astype(np.uint8)


def recolor_asset(path: Path) -> None:
    image = Image.open(path).convert('RGBA')
    arr = np.asarray(image).copy()
    rgb = arr[:, :, :3]
    alpha = arr[:, :, 3]
    alpha = transparent_outer_canvas(rgb, alpha)

    hsv = cv2.cvtColor(rgb, cv2.COLOR_RGB2HSV)
    gray = cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY).astype(np.float32)
    h, w = gray.shape

    # Warm, saturated pixels near the original seal are treated as wax.
    yy, xx = np.ogrid[:h, :w]
    seal_region = (
        (xx > w * 0.32) & (xx < w * 0.68) &
        (yy > h * 0.28) & (yy < h * 0.70)
    )
    wax = (
        seal_region &
        (hsv[:, :, 0] >= 4) & (hsv[:, :, 0] <= 42) &
        (hsv[:, :, 1] >= 38) &
        (hsv[:, :, 2] >= 45) &
        (alpha > 24)
    )

    paper = (
        (alpha > 24) &
        (~wax) &
        (hsv[:, :, 1] < 105) &
        (gray > 55)
    )

    out = rgb.astype(np.float32)

    if np.any(paper):
        values = gray[paper]
        lo, hi = np.percentile(values, [3, 98])
        norm = np.clip((gray - lo) / max(hi - lo, 1.0), 0.0, 1.0)
        mapped = piecewise_map(norm, SHADOW, BASE, HIGHLIGHT)
        # Preserve a little of the original grain/chroma so the paper never looks flat.
        out[paper] = mapped[paper] * 0.86 + out[paper] * 0.14

    if np.any(wax):
        values = gray[wax]
        lo, hi = np.percentile(values, [4, 97])
        norm = np.clip((gray - lo) / max(hi - lo, 1.0), 0.0, 1.0)
        mapped = piecewise_map(norm, GOLD_SHADOW, GOLD_BASE, GOLD_HIGHLIGHT)
        out[wax] = mapped[wax] * 0.88 + out[wax] * 0.12

    arr[:, :, :3] = np.clip(out, 0, 255).astype(np.uint8)
    arr[:, :, 3] = alpha
    Image.fromarray(arr, 'RGBA').save(path, optimize=True, compress_level=8)
    print(f'Updated {path}')


def patch_css() -> None:
    css = CSS_PATH.read_text(encoding='utf-8')
    if TRIAL_MARKER in css:
        return

    trial = r'''

/* FLORAL_STONE_ENVELOPE_TRIAL */
/* Dark floral cover, coordinated with the invitation's old-money palette. */
.envelope-page{
  position:relative;
  isolation:isolate;
  overflow:hidden;
  color:#e2d8ca;
  background:
    linear-gradient(180deg,rgba(12,11,10,.34),rgba(12,11,10,.46)),
    url("/floral-envelope-bg.jpg") center 46%/cover no-repeat;
}
.envelope-page::before{
  content:"";
  position:absolute;
  inset:0;
  z-index:-1;
  pointer-events:none;
  background:
    radial-gradient(circle at 50% 36%,rgba(226,216,202,.075),transparent 34%),
    linear-gradient(180deg,rgba(8,8,7,.03),rgba(8,8,7,.17));
}
.envelope-page>.eyebrow{
  color:#d6cbbb;
  text-shadow:0 1px 14px rgba(0,0,0,.58);
}
.envelope-page h1{
  color:#e2d8ca;
  text-shadow:0 2px 20px rgba(0,0,0,.48);
}
.envelope-page>.intro{
  color:#d6cbbb;
  text-shadow:0 1px 14px rgba(0,0,0,.52);
}
.envelope-page .envelope-scene{
  filter:drop-shadow(0 24px 30px rgba(6,5,4,.48));
}
.envelope-page .open-label{
  min-width:190px;
  padding:14px 22px;
  border:1px solid rgba(196,161,103,.78);
  background:rgba(18,16,14,.18);
  color:#e2d8ca;
  font:9.5px/1.5 Arial,sans-serif;
  letter-spacing:.21em;
  text-shadow:0 1px 8px rgba(0,0,0,.34);
  box-shadow:0 8px 28px rgba(0,0,0,.08);
  backdrop-filter:blur(2px);
  -webkit-backdrop-filter:blur(2px);
}
.envelope-page .open-label span{display:none}
@media (hover:hover){
  .envelope-page .open-label:hover{
    border-color:#c4a167;
    background:rgba(196,161,103,.12);
  }
}
@media(max-width:640px){
  .envelope-page{background-position:center 42%}
}
'''
    CSS_PATH.write_text(css.rstrip() + trial + '\n', encoding='utf-8')
    print('Updated app/globals.css')


def main() -> None:
    for asset in ASSETS:
        recolor_asset(asset)
    patch_css()


if __name__ == '__main__':
    main()
