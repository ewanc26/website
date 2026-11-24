/**
 * contrast.ts — WCAG-aware lightness solving for the seasonal spot inks.
 *
 * The ink hue sweeps the full OKLCH wheel over the Wheel of the Year, and a
 * fixed lightness cannot hold a fixed contrast while it does: at one
 * lightness a gold reads far brighter than a red in relative luminance, and
 * out-of-gamut oklch values clamp to something brighter still. So every
 * text-bearing ink gets its lightness solved for its hue at emit time, in
 * both colour schemes, against the WCAG ratio its pairing needs.
 *
 * Pure arithmetic, no imports, so `node --test` can verify the whole wheel.
 */

export const AA = 4.5;
export const AA_LARGE = 3.0;

/* Fixed, hue-independent token geometry shared by the theme engine and the
   tests: the fills that carry --on-ink text, and the paper/ink tints the
   adaptive text colours sit on. The seasonal engine emits these same shapes
   with the day's hue; the static fallbacks in tokens.css match them. */
export const PAPER = { lightness: 0.955, chroma: 0.012 };
export const PAPER_DEEP = { lightness: 0.905, chroma: 0.03 };
export const PAPER_DARK = { lightness: 0.145, chroma: 0.02 };
export const PAPER_DEEP_DARK = { lightness: 0.205, chroma: 0.03 };
export const ON_INK_LIGHT = { lightness: 0.15, chroma: 0.02 };
export const ON_INK_DARK = { lightness: 0.95, chroma: 0.01 };
export const INK_FILL_LIGHT = { lightness: 0.68, chroma: 0.205 };
export const INK_B_FILL_LIGHT = { lightness: 0.84, chroma: 0.125 };
export const INK_LIGHT = { lightness: 0.19, chroma: 0.035 };
export const INK_SOFT_DARK = { lightness: 0.8, chroma: 0.02 };
export const INK_B_TEXT_DARK = { lightness: 0.45, chroma: 0.15 };

const clamp01 = (c: number) => Math.min(1, Math.max(0, c));
const encode = (c: number) =>
  c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;

/** WCAG 2.x relative luminance (0–1) of the clipped sRGB rendering of an oklch colour. */
export function wcagLuminance(
  lightness: number,
  chromaAmount: number,
  hue: number,
): number {
  const rad = (hue * Math.PI) / 180;
  const a = chromaAmount * Math.cos(rad);
  const b = chromaAmount * Math.sin(rad);
  const l1 = lightness + 0.3963377774 * a + 0.2158037573 * b;
  const m1 = lightness - 0.1055613458 * a - 0.0638541728 * b;
  const s1 = lightness - 0.0894841775 * a - 1.291485548 * b;
  const l = l1 ** 3;
  const m = m1 ** 3;
  const s = s1 ** 3;
  const r = clamp01(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s);
  const g = clamp01(-1.268438006 * l + 2.6097574011 * m - 0.3413193965 * s);
  const bl = clamp01(-0.0041960863 * l - 0.7034186147 * m + 1.707614694 * s);
  return 0.2126 * encode(r) + 0.7152 * encode(g) + 0.0722 * encode(bl);
}

export function contrastRatio(a: number, b: number): number {
  const hi = Math.max(a, b);
  const lo = Math.min(a, b);
  return (hi + 0.05) / (lo + 0.05);
}

/** Margin kept between the solved lightness and the true pass/fail boundary, so rounding the emitted percentage cannot dip under the target. */
const SAFETY = 0.006;

/**
 * Brightest light-mode text lightness on the daily newsprint tint that still
 * contrasts `target` with ink at (chromaAmount, hue). Keeps the accent as
 * airy as the season allows without ever failing the target ratio.
 */
export function lightTextLightness(
  hue: number,
  chromaAmount: number,
  background: { lightness: number; chroma: number } = PAPER,
  target: number = AA,
  cap: number = 0.55,
): number {
  const bg = wcagLuminance(background.lightness, background.chroma, hue);
  let floor = 0.2;
  let hi = cap;
  for (let i = 0; i < 50; i++) {
    const mid = (floor + hi) / 2;
    if (contrastRatio(wcagLuminance(mid, chromaAmount, hue), bg) >= target)
      floor = mid;
    else hi = mid;
  }
  return Math.max(0.2, floor - SAFETY);
}

/** Darkest dark-mode text lightness on the daily black-stock tint still passing `target`. */
export function darkTextLightness(
  hue: number,
  chromaAmount: number,
  background: { lightness: number; chroma: number } = PAPER_DARK,
  target: number = AA,
  floor = 0.45,
  cap = 0.72,
): number {
  const bg = wcagLuminance(background.lightness, background.chroma, hue);
  let lo = floor;
  let hi = cap;
  for (let i = 0; i < 50; i++) {
    const mid = (lo + hi) / 2;
    if (contrastRatio(wcagLuminance(mid, chromaAmount, hue), bg) >= target)
      hi = mid;
    else lo = mid;
  }
  return Math.min(cap, hi + SAFETY);
}

/** Lightest dark-mode fill lightness that still lets the white `--on-ink` text clear `target`. */
export function darkFillLightness(
  hue: number,
  chromaAmount: number,
  foreground: { lightness: number; chroma: number } = ON_INK_DARK,
  target: number = AA,
  cap = 0.6,
): number {
  const fg = wcagLuminance(foreground.lightness, foreground.chroma, hue);
  let floor = 0.2;
  let hi = cap;
  for (let i = 0; i < 50; i++) {
    const mid = (floor + hi) / 2;
    if (contrastRatio(fg, wcagLuminance(mid, chromaAmount, hue)) >= target)
      floor = mid;
    else hi = mid;
  }
  return Math.max(0.2, floor - SAFETY);
}
