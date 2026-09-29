/**
 * Static renderer for `pub.leaflet.blocks.drawing`.
 *
 * Ported from Leaflet's own `components/Blocks/DrawingBlock/ink.ts` so strokes
 * render with the same outline Leaflet draws: resample to even spacing, smooth
 * real pen pressure, then outline with perfect-freehand using Leaflet's
 * options. Drawing space is integer-only in the record; pressure is 0–1000.
 */
import { getStroke } from "perfect-freehand";

export interface InkViewBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface InkStroke {
  points: number[];
  color: string;
  size: number;
  simulatePressure?: boolean;
}

export interface InkFill {
  points: number[];
  color: string;
}

type Sample = [x: number, y: number, pressure: number];

const INK_PRESSURE_SCALE = 1000;
const SAMPLES_PER_SIZE = 4;
const PRESSURE_WINDOW = 8;

// Leaflet's theme colours, mapped onto this site's tokens so drawings follow
// light/dark mode. Tertiary mirrors Leaflet's faded-text mix.
const THEME_INK: Record<string, string> = {
  primary: "var(--ink)",
  accent: "var(--accent-500)",
  tertiary: "color-mix(in oklab, var(--ink), var(--paper) 55%)",
};

export function inkColor(color: unknown): string {
  if (typeof color !== "string") return "currentColor";
  if (Object.prototype.hasOwnProperty.call(THEME_INK, color))
    return THEME_INK[color];
  if (/^#[0-9a-f]{3,8}$/i.test(color)) return color;
  return "currentColor";
}

const finite = (v: unknown): v is number =>
  typeof v === "number" && Number.isFinite(v);

function numbers(v: unknown): number[] {
  return Array.isArray(v) ? v.filter(finite) : [];
}

export function parseViewBox(v: unknown): InkViewBox | undefined {
  if (!v || typeof v !== "object") return undefined;
  const { x, y, width, height } = v as Record<string, unknown>;
  if (!finite(x) || !finite(y) || !finite(width) || !finite(height))
    return undefined;
  if (width < 1 || height < 1) return undefined;
  return { x, y, width, height };
}

export function parseStrokes(v: unknown): InkStroke[] {
  if (!Array.isArray(v)) return [];
  return v.flatMap((s) => {
    if (!s || typeof s !== "object") return [];
    const o = s as Record<string, unknown>;
    if (!finite(o.size) || o.size < 1) return [];
    return [
      {
        points: numbers(o.points),
        color: typeof o.color === "string" ? o.color : "primary",
        size: o.size,
        simulatePressure: o.simulatePressure === true,
      },
    ];
  });
}

export function parseFills(v: unknown): InkFill[] {
  if (!Array.isArray(v)) return [];
  return v.flatMap((f) => {
    if (!f || typeof f !== "object") return [];
    const o = f as Record<string, unknown>;
    return [
      {
        points: numbers(o.points),
        color: typeof o.color === "string" ? o.color : "primary",
      },
    ];
  });
}

/** Resample x, y, pressure triples to even spacing and smooth the pressure. */
function inkSamples(
  points: number[],
  size: number,
  smoothPressure: boolean,
): Sample[] {
  const spacing = size / SAMPLES_PER_SIZE;
  const out: Sample[] = [];
  if (points.length < 3) return out;
  out.push([points[0], points[1], points[2]]);
  let carry = 0;
  for (let i = 3; i + 2 < points.length; i += 3) {
    const [ax, ay, ap] = [points[i - 3], points[i - 2], points[i - 1]];
    const [bx, by, bp] = [points[i], points[i + 1], points[i + 2]];
    const len = Math.hypot(bx - ax, by - ay);
    let d = spacing - carry;
    for (; d <= len; d += spacing) {
      const t = d / len;
      out.push([ax + (bx - ax) * t, ay + (by - ay) * t, ap + (bp - ap) * t]);
    }
    carry = len - (d - spacing);
  }
  const n = points.length;
  const end: Sample = [points[n - 3], points[n - 2], points[n - 1]];
  const tail = out[out.length - 1];
  if (tail[0] !== end[0] || tail[1] !== end[1]) out.push(end);
  if (!smoothPressure) return out;
  const sums = [0];
  for (const s of out) sums.push(sums[sums.length - 1] + s[2]);
  return out.map(([x, y], i) => {
    const lo = Math.max(0, i - PRESSURE_WINDOW);
    const hi = Math.min(out.length, i + PRESSURE_WINDOW + 1);
    return [x, y, (sums[hi] - sums[lo]) / (hi - lo)];
  });
}

/** Quadratic curves through the outline's midpoints (perfect-freehand's recipe). */
function svgPathFromOutline(points: number[][]): string {
  const len = points.length;
  if (len < 4) return "";
  const avg = (a: number, b: number) => ((a + b) / 2).toFixed(2);
  const [a, b, c] = points;
  let result = `M${a[0].toFixed(2)},${a[1].toFixed(2)} Q${b[0].toFixed(2)},${b[1].toFixed(2)} ${avg(b[0], c[0])},${avg(b[1], c[1])} T`;
  for (let i = 2; i < len - 1; i++) {
    result += `${avg(points[i][0], points[i + 1][0])},${avg(points[i][1], points[i + 1][1])} `;
  }
  return result + "Z";
}

export function inkStrokePath(stroke: InkStroke): string {
  const raw: number[] = [];
  const p = stroke.points;
  for (let i = 0; i + 2 < p.length; i += 3)
    raw.push(p[i], p[i + 1], p[i + 2] / INK_PRESSURE_SCALE);
  const samples = inkSamples(raw, stroke.size, !stroke.simulatePressure);
  if (!samples.length) return "";
  const outline = getStroke(samples, {
    size: stroke.size,
    thinning: 0.6,
    smoothing: 0.5,
    streamline: 0.5,
    simulatePressure: !!stroke.simulatePressure,
    last: true,
  });
  return svgPathFromOutline(outline);
}

export function inkFillPath(fill: InkFill): string {
  const p = fill.points;
  let d = "";
  for (let i = 0; i + 1 < p.length; i += 2)
    d += `${i === 0 ? "M" : "L"}${p[i]},${p[i + 1]}`;
  return d && d + "Z";
}
