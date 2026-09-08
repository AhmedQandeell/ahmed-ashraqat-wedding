from __future__ import annotations

import base64
import io
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

IMAGE_PATH = Path("public/envelope.png")
PREVIEW_PATH = Path("debug/envelope-monogram-preview.b64")


def locate_seal(bgr: np.ndarray) -> tuple[int, int, int]:
    h, w = bgr.shape[:2]
    expected = np.array([w * 0.5, h * 0.53], dtype=np.float32)

    x0, x1 = int(w * 0.34), int(w * 0.66)
    y0, y1 = int(h * 0.34), int(h * 0.69)
    roi = bgr[y0:y1, x0:x1]
    hsv = cv2.cvtColor(roi, cv2.COLOR_BGR2HSV)

    hue = hsv[:, :, 0]
    sat = hsv[:, :, 1]
    val = hsv[:, :, 2]

    # Warm gold/brown wax is substantially more saturated than the ivory paper.
    mask = (
        (hue >= 5)
        & (hue <= 40)
        & (sat >= 35)
        & (val >= 55)
        & (val <= 250)
    ).astype(np.uint8) * 255

    k = max(5, int(round(w * 0.006)) | 1)
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (k, k))
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel, iterations=2)
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel, iterations=1)

    count, _, stats, centers = cv2.connectedComponentsWithStats(mask, 8)
    candidates: list[tuple[float, int, int, int]] = []

    for i in range(1, count):
        x, y, bw, bh, area = stats[i]
        gx = x0 + centers[i][0]
        gy = y0 + centers[i][1]
        diameter = max(bw, bh)

        if area < w * h * 0.0006:
            continue
        if diameter < w * 0.045 or diameter > w * 0.23:
            continue
        ratio = bw / max(bh, 1)
        if ratio < 0.55 or ratio > 1.8:
            continue

        distance = float(np.linalg.norm(np.array([gx, gy]) - expected))
        score = distance - min(area / 1200.0, 80.0)
        candidates.append((score, int(round(gx)), int(round(gy)), int(diameter)))

    if candidates:
        candidates.sort(key=lambda item: item[0])
        _, cx, cy, diameter = candidates[0]
        return cx, cy, diameter

    # Conservative fallback based on the known original artwork layout.
    return int(round(w * 0.5)), int(round(h * 0.53)), int(round(w * 0.15))


def find_font(max_width: int, max_height: int, text: str) -> ImageFont.FreeTypeFont:
    candidates = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf",
        "/usr/share/fonts/truetype/liberation2/LiberationSerif-Regular.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSerif-Regular.ttf",
    ]
    font_path = next((p for p in candidates if Path(p).exists()), None)
    if not font_path:
        raise RuntimeError("No suitable serif font found on runner")

    size = max(12, max_height)
    while size > 10:
        font = ImageFont.truetype(font_path, size=size)
        box = font.getbbox(text)
        if (box[2] - box[0]) <= max_width and (box[3] - box[1]) <= max_height:
            return font
        size -= 1
    return ImageFont.truetype(font_path, size=10)


def main() -> None:
    raw = cv2.imread(str(IMAGE_PATH), cv2.IMREAD_UNCHANGED)
    if raw is None:
        raise RuntimeError(f"Could not open {IMAGE_PATH}")

    alpha = raw[:, :, 3].copy() if raw.ndim == 3 and raw.shape[2] == 4 else None
    bgr = raw[:, :, :3].copy() if alpha is not None else raw.copy()
    original = bgr.copy()

    h, w = bgr.shape[:2]
    cx, cy, diameter = locate_seal(bgr)
    print(f"Detected seal center=({cx},{cy}) diameter={diameter} image={w}x{h}")

    # Limit editing to the inner face of the wax seal. This removes only the
    # original A&Q lettering and leaves the outer wax rim / envelope untouched.
    gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
    yy, xx = np.ogrid[:h, :w]
    rx = max(20, int(diameter * 0.37))
    ry = max(10, int(diameter * 0.145))
    inner = (((xx - cx) / rx) ** 2 + ((yy - cy) / ry) ** 2) <= 1.0

    local_values = gray[inner]
    median_gray = float(np.median(local_values)) if local_values.size else 170.0
    threshold = max(45.0, median_gray - 10.0)
    dark = gray < threshold
    text_mask = (inner & dark).astype(np.uint8) * 255

    # Include anti-aliased edges of the original letters while feathering the
    # reconstruction from the surrounding wax texture.
    kernel_size = max(3, int(round(diameter * 0.024)) | 1)
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (kernel_size, kernel_size))
    text_mask = cv2.dilate(text_mask, kernel, iterations=1)
    radius = max(3, int(round(diameter * 0.035)))
    cleaned = cv2.inpaint(bgr, text_mask, radius, cv2.INPAINT_TELEA)

    # Sample the original lettering tone before inpainting. Fall back to the
    # same muted brown-gold used throughout the invitation.
    dark_pixels = original[text_mask > 0]
    if len(dark_pixels):
        b, g, r = np.median(dark_pixels, axis=0)
        sampled = np.array([r, g, b], dtype=np.float32)
        target = np.array([128, 96, 55], dtype=np.float32)
        rgb_color = tuple(int(v) for v in (sampled * 0.35 + target * 0.65).clip(0, 255))
    else:
        rgb_color = (128, 96, 55)

    pil = Image.fromarray(cv2.cvtColor(cleaned, cv2.COLOR_BGR2RGB))
    draw = ImageDraw.Draw(pil)
    text = "Q&A"
    font = find_font(int(diameter * 0.54), int(diameter * 0.19), text)
    box = draw.textbbox((0, 0), text, font=font)
    tw, th = box[2] - box[0], box[3] - box[1]
    tx = cx - tw / 2 - box[0]
    ty = cy - th / 2 - box[1] - diameter * 0.006

    # A faint lower highlight keeps the lettering integrated with the wax rather
    # than looking like a separate label pasted over the image.
    highlight = tuple(min(255, c + 58) for c in rgb_color)
    draw.text((tx + 1, ty + 1), text, font=font, fill=highlight)
    draw.text((tx, ty), text, font=font, fill=rgb_color)

    result_bgr = cv2.cvtColor(np.asarray(pil), cv2.COLOR_RGB2BGR)
    if alpha is not None:
        result = np.dstack([result_bgr, alpha])
    else:
        result = result_bgr

    cv2.imwrite(str(IMAGE_PATH), result, [cv2.IMWRITE_PNG_COMPRESSION, 8])

    # Commit a small text-encoded preview so the result can be inspected through
    # the GitHub connector without downloading the full binary PNG.
    half_w = int(diameter * 0.9)
    half_h = int(diameter * 0.68)
    left, right = max(0, cx - half_w), min(w, cx + half_w)
    top, bottom = max(0, cy - half_h), min(h, cy + half_h)
    preview = pil.crop((left, top, right, bottom))
    preview.thumbnail((520, 360), Image.Resampling.LANCZOS)
    buffer = io.BytesIO()
    preview.save(buffer, format="JPEG", quality=88, optimize=True)
    PREVIEW_PATH.parent.mkdir(parents=True, exist_ok=True)
    PREVIEW_PATH.write_text(base64.b64encode(buffer.getvalue()).decode("ascii"), encoding="ascii")


if __name__ == "__main__":
    main()
