#!/usr/bin/env python3
"""Visuels Open Graph 1200×630 — même famille que og-credit-immo.jpg."""
from __future__ import annotations

import math
import os
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "og"
FONT_DIR = Path("/usr/share/fonts/truetype/macos")
NAVY = (8, 24, 56)
NAVY2 = (14, 42, 82)
TEAL = (20, 184, 166)
TEAL_D = (13, 148, 136)
WHITE = (255, 255, 255)
MUTED = (186, 210, 230)
W, H = 1200, 630
S = 2  # supersample


def font(name: str, size: int) -> ImageFont.FreeTypeFont:
    path = FONT_DIR / name
    if path.exists():
        return ImageFont.truetype(str(path), size)
    return ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", size)


def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


def gradient(w, h):
    img = Image.new("RGB", (w, h), NAVY)
    px = img.load()
    for y in range(h):
        ty = y / max(h - 1, 1)
        for x in range(0, w, 2):
            tx = x / max(w - 1, 1)
            c = lerp(NAVY, NAVY2, 0.35 * tx + 0.65 * ty)
            px[x, y] = c
            if x + 1 < w:
                px[x + 1, y] = c
    return img


def dots(draw, w, h, origin, color=(255, 255, 255, 38)):
    ox, oy = origin
    for i in range(9):
        for j in range(7):
            draw.ellipse(
                (ox + i * 22 - 2, oy + j * 22 - 2, ox + i * 22 + 2, oy + j * 22 + 2),
                fill=color,
            )


def rounded_rect(draw, box, r, fill):
    draw.rounded_rectangle(box, radius=r, fill=fill)


def house(draw, cx, cy, scale=1.0, stroke=10, fill=None):
    s = scale
    pts = [
        (cx, cy - 118 * s),
        (cx + 130 * s, cy - 18 * s),
        (cx + 130 * s, cy + 110 * s),
        (cx - 130 * s, cy + 110 * s),
        (cx - 130 * s, cy - 18 * s),
    ]
    if fill:
        draw.polygon(pts, fill=fill)
    draw.line(pts + [pts[0]], fill=WHITE, width=int(stroke), joint="curve")
    # window
    wx, wy, ww = cx, cy + 8 * s, 36 * s
    draw.rectangle((wx - ww, wy - ww, wx + ww, wy + ww), outline=WHITE, width=int(stroke * 0.7))
    draw.line((wx, wy - ww, wx, wy + ww), fill=WHITE, width=int(stroke * 0.55))
    draw.line((wx - ww, wy, wx + ww, wy), fill=WHITE, width=int(stroke * 0.55))


def key_shape(draw, x, y, scale=1.0):
    s = scale
    # head
    draw.ellipse((x, y, x + 70 * s, y + 70 * s), outline=TEAL, width=int(14 * s))
    draw.ellipse((x + 18 * s, y + 18 * s, x + 52 * s, y + 52 * s), outline=TEAL, width=int(8 * s))
    # shaft
    draw.line((x + 68 * s, y + 36 * s, x + 210 * s, y + 36 * s), fill=TEAL, width=int(16 * s))
    # teeth
    for dx in (150, 180):
        draw.line(
            (x + dx * s, y + 36 * s, x + dx * s, y + 70 * s),
            fill=TEAL,
            width=int(14 * s),
        )


def plus_badge(draw, x, y):
    draw.ellipse((x, y, x + 160, y + 160), fill=TEAL)
    draw.line((x + 80, y + 40, x + 80, y + 120), fill=WHITE, width=18)
    draw.line((x + 40, y + 80, x + 120, y + 80), fill=WHITE, width=18)


def magnifier(draw, x, y):
    draw.ellipse((x, y, x + 170, y + 170), outline=TEAL, width=22)
    draw.line((x + 145, y + 145, x + 220, y + 220), fill=TEAL, width=24)


def logo(draw, x, y):
    draw.ellipse((x, y, x + 104, y + 104), outline=WHITE, width=6)
    draw.polygon([(x + 40, y + 28), (x + 40, y + 76), (x + 80, y + 52)], fill=TEAL)


def footer_item(draw, fonts, x, y, label):
    draw.ellipse((x, y, x + 52, y + 52), outline=TEAL, width=5)
    draw.text((x + 72, y + 4), label, font=fonts["foot"], fill=WHITE)


def arrows_swap(draw, x, y):
    draw.polygon(
        [
            (x, y + 52),
            (x + 130, y),
            (x + 130, y + 34),
            (x + 240, y + 34),
            (x + 240, y + 70),
            (x + 130, y + 70),
            (x + 130, y + 104),
        ],
        fill=TEAL,
    )
    draw.polygon(
        [
            (x + 390, y + 170),
            (x + 260, y + 222),
            (x + 260, y + 188),
            (x + 150, y + 188),
            (x + 150, y + 152),
            (x + 260, y + 152),
            (x + 260, y + 118),
        ],
        fill=TEAL_D,
    )


CARDS = [
    {
        "file": "og-acheteur-immo.jpg",
        "title": "Recherche de bien",
        "subtitle": "Maison • appart • pro ou particulier",
        "pills": ["Ville + budget", "Photos & description", "Alerte si aucun bien"],
        "art": "search",
    },
    {
        "file": "og-vendeur-immo.jpg",
        "title": "Déposer un bien",
        "subtitle": "Saisie manuelle • URL d’annonce • photos",
        "pills": ["Particulier ou pro", "Capture d’annonce", "Vitrine France"],
        "art": "deposit",
    },
    {
        "file": "og-acheteur-vendeur-immo.jpg",
        "title": "Vendre et racheter",
        "subtitle": "Les deux casquettes • chaîne • prêt relais",
        "pills": ["Je vends", "Je rachète", "Un seul dossier"],
        "art": "both",
    },
    {
        "file": "og-immobilier.jpg",
        "title": "Immobilier",
        "subtitle": "Acquéreurs • vendeurs • négociateurs",
        "pills": ["Recherche", "Dépôt de bien", "Courtage ORIAS"],
        "art": "hub",
    },
    {
        "file": "og-negociateur-immo.jpg",
        "title": "Négociateur immo",
        "subtitle": "Lien à partager à vos acquéreurs",
        "pills": ["Recherche de bien", "Prêt en option", "Assurances"],
        "art": "nego",
    },
]


def draw_art(draw, kind, cx, cy):
    # soft teal blobs
    overlay = Image.new("RGBA", (W * S, H * S), (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    od.ellipse((cx - 40, cy - 80, cx + 220, cy + 160), fill=(20, 184, 166, 40))
    od.ellipse((cx + 40, cy - 20, cx + 260, cy + 180), fill=(13, 148, 136, 28))
    return overlay, kind


def compose(card):
    img = gradient(W * S, H * S).convert("RGBA")
    draw = ImageDraw.Draw(img, "RGBA")
    dots(draw, W * S, H * S, (W * S - 280, 50))
    dots(draw, W * S, H * S, (40, H * S - 220))

    fonts = {
        "title": font("Inter-Bold.ttf", 184),
        "sub": font("Inter-SemiBold.ttf", 64),
        "brand": font("Inter-Bold.ttf", 52),
        "brand2": font("Inter-SemiBold.ttf", 48),
        "foot": font("Inter-SemiBold.ttf", 44),
        "orias": font("Inter-Bold.ttf", 52),
    }

    cx, cy = int(W * S * 0.78), int(H * S * 0.40)
    blob, _ = draw_art(draw, card["art"], cx, cy)
    img = Image.alpha_composite(img, blob)
    draw = ImageDraw.Draw(img, "RGBA")

    house(draw, cx, cy, scale=2.1, stroke=22)
    if card["art"] == "search":
        magnifier(draw, cx + 70, cy + 70)
    elif card["art"] == "deposit":
        plus_badge(draw, cx + 120, cy + 50)
    elif card["art"] == "both":
        arrows_swap(draw, cx - 160, cy + 70)
    elif card["art"] == "hub":
        key_shape(draw, cx - 70, cy + 90, scale=1.9)
    elif card["art"] == "nego":
        key_shape(draw, cx - 50, cy + 70, scale=1.7)

    x0, y0 = 176, 280
    draw.text((x0, y0), card["title"], font=fonts["title"], fill=WHITE)
    draw.text((x0, y0 + 220), card["subtitle"], font=fonts["sub"], fill=MUTED)

    logo(draw, 176, H * S - 320)
    draw.text((320, H * S - 318), "Courtier ", font=fonts["brand2"], fill=WHITE)
    tw = draw.textlength("Courtier ", font=fonts["brand2"])
    draw.text((320 + tw, H * S - 318), "ORIAS", font=fonts["orias"], fill=TEAL)
    draw.text((320, H * S - 250), "Leads Opportunities", font=fonts["brand"], fill=WHITE)

    fx = 176
    fy = H * S - 130
    for label in card["pills"]:
        footer_item(draw, fonts, fx, fy, label)
        fx += int(draw.textlength(label, font=fonts["foot"])) + 160

    rgb = img.convert("RGB").resize((W, H), Image.Resampling.LANCZOS)
    return rgb


def main():
    OUT.mkdir(exist_ok=True)
    for card in CARDS:
        im = compose(card)
        dest = OUT / card["file"]
        im.save(dest, "JPEG", quality=88, optimize=True)
        print("OK ", dest.relative_to(ROOT), dest.stat().st_size, "bytes")


if __name__ == "__main__":
    main()
