/**
 * texture.ts — the degree rules and geometry behind the background texture.
 *
 * The texture is the contour lines of one smooth field. The "degree" tilts
 * the field and sets how far it morphs from parallel wavy bands into a lattice
 * of loops. The degree starts at BASE_DEGREE and
 * each rule in DEGREE_RULES adds its delta times a weight between 0 and 1. The
 * rules follow the cycles the site already tracks: the day of the month, the
 * month, the season, the weekday, the time of day, the Moon, and the Sabbats.
 *
 * Nothing here is an on/off switch. Each rule is a smooth window on continuous
 * time, so the degree changes gradually and never jumps, however fast time is
 * played back. Inside a rule's window (say, the first half of the month) the
 * weight is a flat 1; at its edges it eases to 0 along a smootherstep curve.
 *
 * The calendar is anchored on 22 August (ANCHOR). The year starts on that day,
 * and every "month" runs from one 22nd to the next, so the day-of-month, month
 * and season rules all count from it. The week, the hour, the Moon and the
 * Sabbats are real and do not move.
 *
 * The "season" in a rule's name is a quarter of that anchored year: the first
 * half-year is "season <= 2". (The seasons shown as labels stay the real
 * northern-hemisphere ones, 1 Spring (Mar–May) to 4 Winter (Dec–Feb).)
 */

import { getMoonCycle, getMoonIllumination } from "./moonPhase.ts";
import { sabbats } from "./sabbats.ts";

/**
 * Perlin's smootherstep: 0 at t ≤ 0, 1 at t ≥ 1, and in between a quintic whose
 * first and second derivatives are zero at both ends, so it joins its flat ends
 * without a kink in the value, the slope or the acceleration.
 */
export function smootherstep(t: number): number {
  const x = Math.min(1, Math.max(0, t));
  return x * x * x * (x * (x * 6 - 15) + 10);
}

/** `v` wrapped into [-period/2, period/2): the signed distance round a cycle. */
export function wrapSigned(v: number, period: number): number {
  return ((((v + period / 2) % period) + period) % period) - period / 2;
}

/**
 * A smooth 0–1 indicator of the window [start, end) on a cycle of `period`.
 * It is 1 well inside the window and 0 well outside, and each edge eases across
 * `soft` (half of it either side of the edge). It depends only on the distance
 * from the window's centre, so it is continuous everywhere, including where
 * the cycle wraps. Two windows that meet (say [0, 6) and [6, 12)) sum to
 * exactly 1 at every point, so swapping one for the other never jumps.
 */
export function smoothWindow(
  x: number,
  start: number,
  end: number,
  soft: number,
  period: number,
): number {
  const centre = (start + end) / 2;
  const reach = Math.abs(wrapSigned(x - centre, period));
  return smootherstep(((end - start) / 2 + soft / 2 - reach) / soft);
}

/**
 * The day the calendar is anchored on: 22 August. The year starts on it, and
 * every month starts on the 22nd. Change it here and everything follows.
 */
export const ANCHOR = { month: 8, day: 22 } as const;

export interface CalendarContext {
  /** Days since the start of this month (the last 22nd), time of day included. */
  monthPos: number;
  /** Days in this month, from one 22nd to the next. */
  monthLength: number;
  /**
   * Months since the anchored year began, continuous: 0 on 22 Aug, 1 on 22 Sep,
   * 2.5 half way through the month that starts on 22 Oct, up to 12.
   */
  yearMonth: number;
  /** Days since Monday 00:00, from 0 up to 7. */
  weekPos: number;
  /** Hours since midnight, from 0 up to 24. */
  hourPos: number;
  /** Lunar phase in [0, 1): 0 new, 0.25 first quarter, 0.5 full, 0.75 last quarter. */
  moonPhase: number;
  /** How much of the Moon is lit, 0–1. */
  moonFraction: number;
  /** Days to the nearest Sabbat, measured to noon on its date. */
  sabbatDistance: number;
  /** Season, 1–4. Only used for labels; no rule reads it. */
  season: number;
}

export interface DegreeRule {
  label: string;
  /** How strongly the rule applies right now, from 0 to 1. */
  weight: (calendar: CalendarContext) => number;
  delta: number;
}

/**
 * Where the degree starts. The rules below add up to a swing of about -13 to
 * +26 around it, so the degree runs from the high teens to the mid fifties:
 * wide enough that the texture looks quite different from season to season.
 * The slow rules (day of month, month, season, Sabbat) are strong, so the year
 * has a clear shape; the fast ones (weekday, hour, Moon) are gentler, so they
 * add life without making each day jerk.
 */
export const BASE_DEGREE = 30;

export const DEGREE_RULES: readonly DegreeRule[] = [
  {
    label: "day <= 15",
    weight: (c) => smoothWindow(c.monthPos, 0, 15, 3, c.monthLength),
    delta: 6,
  },
  {
    label: "month <= 6",
    weight: (c) => smoothWindow(c.yearMonth, 0, 6, 0.7, 12),
    delta: -6,
  },
  {
    label: "season <= 2",
    weight: (c) => smoothWindow(c.yearMonth, 2, 8, 0.7, 12),
    delta: 3,
  },
  {
    label: "season >= 3",
    weight: (c) => smoothWindow(c.yearMonth, 8, 14, 0.7, 12),
    delta: -3,
  },
  // Monday has its own egg on the site; start the week tightly folded.
  {
    label: "weekday = Monday",
    weight: (c) => smoothWindow(c.weekPos, 0, 1, 1, 7),
    delta: -2,
  },
  {
    label: "weekday >= 6",
    weight: (c) => smoothWindow(c.weekPos, 5, 7, 1, 7),
    delta: 1,
  },
  {
    label: "hour < 12",
    weight: (c) => smoothWindow(c.hourPos, 0, 12, 4, 24),
    delta: 1,
  },
  {
    label: "hour >= 12",
    weight: (c) => smoothWindow(c.hourPos, 12, 24, 4, 24),
    delta: -1,
  },
  // The Moon: opening while it waxes, closing while it wanes, wide at full.
  {
    label: "moon waxing",
    weight: (c) => smoothWindow(c.moonPhase, 0, 0.5, 0.1, 1),
    delta: 1,
  },
  {
    label: "moon waning",
    weight: (c) => smoothWindow(c.moonPhase, 0.5, 1, 0.1, 1),
    delta: -1,
  },
  {
    label: "full moon",
    weight: (c) => smootherstep((c.moonFraction - 0.85) / 0.14),
    delta: 2,
  },
  // The eight festival days are the biggest single shift: a swell that
  // peaks on the day and has faded within four days either side.
  {
    label: "sabbat day",
    weight: (c) => 1 - smootherstep(c.sabbatDistance / 4),
    delta: 12,
  },
];

export function seasonOf(month: number): number {
  if (month >= 3 && month <= 5) return 1;
  if (month >= 6 && month <= 8) return 2;
  if (month >= 9 && month <= 11) return 3;
  return 4;
}

const DAY_MS = 86_400_000;

const sabbatNoonCache = new Map<number, number[]>();

/** Noon on each Sabbat of `year`, as timestamps. Cached: it is asked for often. */
function sabbatNoons(year: number): number[] {
  let noons = sabbatNoonCache.get(year);
  if (!noons) {
    noons = sabbats.map((s) =>
      new Date(year, s.month - 1, s.day, 12).getTime(),
    );
    sabbatNoonCache.set(year, noons);
  }
  return noons;
}

/** Midnight on the most recent 22nd (the anchor day) at or before `date`. */
function monthStartOf(date: Date): Date {
  const before = date.getDate() < ANCHOR.day;
  return new Date(
    date.getFullYear(),
    date.getMonth() - (before ? 1 : 0),
    ANCHOR.day,
  );
}

export function calendarOf(date: Date): CalendarContext {
  const month = date.getMonth();
  const dayFraction =
    (date.getHours() * 3600 +
      date.getMinutes() * 60 +
      date.getSeconds() +
      date.getMilliseconds() / 1000) /
    86_400;

  const start = monthStartOf(date);
  const next = new Date(start.getFullYear(), start.getMonth() + 1, ANCHOR.day);
  const monthLength = (next.getTime() - start.getTime()) / DAY_MS;
  const monthPos = (date.getTime() - start.getTime()) / DAY_MS;
  // Whole months from 22 Aug up to this month's 22nd.
  const yearStartYear =
    start.getMonth() >= ANCHOR.month - 1
      ? start.getFullYear()
      : start.getFullYear() - 1;
  const monthIndex =
    (start.getFullYear() - yearStartYear) * 12 +
    start.getMonth() -
    (ANCHOR.month - 1);

  let sabbatDistance = Infinity;
  for (const year of [
    date.getFullYear() - 1,
    date.getFullYear(),
    date.getFullYear() + 1,
  ]) {
    for (const noon of sabbatNoons(year)) {
      sabbatDistance = Math.min(
        sabbatDistance,
        Math.abs(date.getTime() - noon) / DAY_MS,
      );
    }
  }

  return {
    monthPos,
    monthLength,
    yearMonth: monthIndex + monthPos / monthLength,
    // getDay() is 0 for Sunday; shift so the week starts on Monday.
    weekPos: ((date.getDay() + 6) % 7) + dayFraction,
    hourPos: dayFraction * 24,
    moonPhase: getMoonCycle(date),
    moonFraction: getMoonIllumination(date).fraction,
    sabbatDistance,
    season: seasonOf(month + 1),
  };
}

/** The branch angle, in degrees, for a pre-computed calendar context. */
export function degreeForCalendar(calendar: CalendarContext): number {
  return DEGREE_RULES.reduce(
    (degree, rule) => degree + rule.delta * rule.weight(calendar),
    BASE_DEGREE,
  );
}

/** The degree, in degrees, for the given moment. */
export function degreeFor(date: Date): number {
  return degreeForCalendar(calendarOf(date));
}

/**
 * The degree averaged over `spanDays` centred on `date`, sampled every six
 * hours. This is for time-lapse. Played back at, say, nine days a second, a
 * weekly rule swings the degree more than once a second, which reads as
 * flicker even though each rule is smooth. Averaging over the span each frame
 * covers is the usual cure (temporal anti-aliasing): a span of 7 days cancels
 * the weekly rhythm exactly and leaves the slower month, season and Moon
 * drift. On the live site one frame is a minute, so it uses degreeFor.
 */
export function averageDegreeFor(date: Date, spanDays: number): number {
  const steps = Math.max(1, Math.round(spanDays * 4));
  let sum = 0;
  for (let k = 0; k <= steps; k++) {
    const when = new Date(
      date.getTime() + (k / steps - 0.5) * spanDays * DAY_MS,
    );
    // Trapezoid rule: the two ends count half, so a whole number of cycles
    // averages out exactly.
    sum += degreeFor(when) * (k === 0 || k === steps ? 0.5 : 1);
  }
  return sum / steps;
}

/** Bounds the degree is clamped to when drawing; the rules never leave it. */
export const MIN_ANGLE = 0;
export const MAX_ANGLE = 60;
/** The degrees over which the morph runs from 0 (bands) to 1 (loops). */
export const MORPH_FROM = 10;
export const MORPH_TO = 50;

/** The degree as the angle the texture is drawn at, kept in the safe range. */
export function textureAngle(degree: number): number {
  return Math.min(MAX_ANGLE, Math.max(MIN_ANGLE, degree));
}

/**
 * How far the field has morphed, from 0 at MORPH_FROM to 1 at MORPH_TO. At 0
 * it is long parallel wavy bands; at 1 it is a lattice of closed loops; in
 * between the bands pinch and break into loops. It is a continuous function of
 * the degree, so the texture only ever transitions and never switches.
 */
export function textureMorph(degree: number): number {
  return Math.min(
    1,
    Math.max(0, (degree - MORPH_FROM) / (MORPH_TO - MORPH_FROM)),
  );
}

export interface FieldParams {
  /** Tilt of the field in degrees; the field turns about the window centre. */
  angle: number;
  /** 0 for parallel bands up to 1 for a lattice of loops. */
  morph: number;
  /** Distance between repeats of the main wave, in pixels. */
  wavelength: number;
}

const TAU = Math.PI * 2;
const COS_60 = 0.5;
const SIN_60 = Math.sqrt(3) / 2;

/**
 * The field at (x, y), measured in pixels from the window centre. A main wave
 * plus two more at 60° and 120° that fade in with the morph (with all three
 * at full weight they make a hexagonal lattice of blobs), seen through a
 * gentle domain warp so the contours flow instead of forming a regular grid.
 * The result is scaled to stay within [-1, 1].
 *
 * Every term is a smooth function of position, tilt and morph, so a contour
 * moves smoothly as either changes.
 */
export function fieldAt(x: number, y: number, params: FieldParams): number {
  const k = TAU / params.wavelength;
  const theta = (params.angle * Math.PI) / 180;
  const cos = Math.cos(theta);
  const sin = Math.sin(theta);
  // Into the field's own frame, which turns with the degree.
  const u = x * cos + y * sin;
  const v = -x * sin + y * cos;
  // A slow, small warp, a few wavelengths long, bends the waves just enough
  // that the lattice flows without losing its geometry.
  const q = TAU / (2.6 * params.wavelength);
  const reach = 0.1 * params.wavelength;
  const pu = u + reach * Math.sin(q * v + 1.3);
  const pv = v + reach * Math.sin(q * u + 4.1);
  const main = Math.cos(k * pu);
  const second = Math.cos(k * (COS_60 * pu + SIN_60 * pv) + 0.7);
  const third = Math.cos(k * (-COS_60 * pu + SIN_60 * pv) + 2.1);
  return (main + params.morph * (second + third)) / (1 + 2 * params.morph);
}

/**
 * The levels contour lines are drawn at. None is 0, where the field's saddles
 * sit for the lattice, so lines meet only at the instant a band pinches off.
 */
export const CONTOUR_LEVELS = [-0.75, -0.45, -0.15, 0.15, 0.45, 0.75];

export interface Point {
  x: number;
  y: number;
}

export interface Polyline {
  points: Point[];
  /** True for a loop; its last point joins back to its first. */
  closed: boolean;
  /** The field value along the line. */
  level: number;
}

/**
 * The contour lines of the field over a `width`×`height` window, found by
 * marching squares on a grid of `step` pixels (with a margin so lines run off
 * the edges). Coordinates are in pixels from the window centre.
 *
 * Lines at different levels can never cross, because the field has one value
 * at each point, and each line is a chain of short straight segments whose
 * ends sit on grid edges.
 */
export function contourLines(
  width: number,
  height: number,
  params: FieldParams,
  step: number = Math.max(4, Math.round(params.wavelength / 16)),
  levels: readonly number[] = CONTOUR_LEVELS,
): Polyline[] {
  const nx = Math.ceil(width / step) + 3;
  const ny = Math.ceil(height / step) + 3;
  const x0 = -((nx - 1) * step) / 2;
  const y0 = -((ny - 1) * step) / 2;
  const values = new Float64Array(nx * ny);
  for (let j = 0; j < ny; j++) {
    for (let i = 0; i < nx; i++) {
      values[j * nx + i] = fieldAt(x0 + i * step, y0 + j * step, params);
    }
  }

  const lines: Polyline[] = [];
  for (const level of levels) {
    // A crossing sits on a grid edge: id = 2·(j·nx + i) + (0 for the edge
    // from vertex (i, j) to (i+1, j); 1 for the edge to (i, j+1)).
    const links = new Map<number, number[]>();
    const link = (a: number, b: number) => {
      (links.get(a) ?? links.set(a, []).get(a)!).push(b);
      (links.get(b) ?? links.set(b, []).get(b)!).push(a);
    };
    for (let j = 0; j < ny - 1; j++) {
      for (let i = 0; i < nx - 1; i++) {
        const tl = values[j * nx + i] - level;
        const tr = values[j * nx + i + 1] - level;
        const bl = values[(j + 1) * nx + i] - level;
        const br = values[(j + 1) * nx + i + 1] - level;
        const bits =
          (tl > 0 ? 1 : 0) |
          (tr > 0 ? 2 : 0) |
          (br > 0 ? 4 : 0) |
          (bl > 0 ? 8 : 0);
        if (bits === 0 || bits === 15) continue;
        const cell = j * nx + i;
        const T = 2 * cell;
        const B = 2 * (cell + nx);
        const L = 2 * cell + 1;
        const R = 2 * (cell + 1) + 1;
        const inside = tl + tr + br + bl > 0; // centre, for the two saddle cases
        switch (bits) {
          case 1:
          case 14:
            link(L, T);
            break;
          case 2:
          case 13:
            link(T, R);
            break;
          case 3:
          case 12:
            link(L, R);
            break;
          case 4:
          case 11:
            link(R, B);
            break;
          case 6:
          case 9:
            link(T, B);
            break;
          case 7:
          case 8:
            link(L, B);
            break;
          case 5:
            if (inside) {
              link(T, R);
              link(L, B);
            } else {
              link(L, T);
              link(R, B);
            }
            break;
          case 10:
            if (inside) {
              link(L, T);
              link(R, B);
            } else {
              link(T, R);
              link(L, B);
            }
            break;
        }
      }
    }

    const at = (id: number): Point => {
      const cell = id >> 1;
      const i = cell % nx;
      const j = (cell - i) / nx;
      const a = values[cell] - level;
      if (id & 1) {
        const t = a / (a - (values[cell + nx] - level));
        return { x: x0 + i * step, y: y0 + (j + t) * step };
      }
      const t = a / (a - (values[cell + 1] - level));
      return { x: x0 + (i + t) * step, y: y0 + j * step };
    };

    const visited = new Set<number>();
    const walk = (start: number): Polyline => {
      const ids = [start];
      visited.add(start);
      let previous = -1;
      let current = start;
      for (;;) {
        const next = links
          .get(current)!
          .find((n) => n !== previous && !visited.has(n));
        if (next === undefined) break;
        ids.push(next);
        visited.add(next);
        previous = current;
        current = next;
      }
      const closed = ids.length > 2 && links.get(current)!.includes(start);
      return { points: ids.map(at), closed, level };
    };
    // Lines that run off the edge start at a crossing with one neighbour.
    for (const [id, neighbours] of links) {
      if (neighbours.length === 1 && !visited.has(id)) lines.push(walk(id));
    }
    for (const id of links.keys()) {
      if (!visited.has(id)) lines.push(walk(id));
    }
  }
  return lines;
}

/**
 * Contour lines as one SVG path `d` string. Each line is drawn as a chain of
 * quadratic curves that use the line's points as controls and the midpoints
 * between them as joins, so it is smooth rather than faceted.
 */
export function linesPathOf(lines: readonly Polyline[]): string {
  const f = (n: number) => n.toFixed(1);
  const mid = (a: Point, b: Point): Point => ({
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
  });
  let d = "";
  for (const { points: p, closed } of lines) {
    if (p.length < 2) continue;
    if (closed) {
      const start = mid(p[p.length - 1], p[0]);
      d += `M${f(start.x)} ${f(start.y)}`;
      for (let n = 0; n < p.length; n++) {
        const m = mid(p[n], p[(n + 1) % p.length]);
        d += `Q${f(p[n].x)} ${f(p[n].y)} ${f(m.x)} ${f(m.y)}`;
      }
      d += "Z";
    } else {
      d += `M${f(p[0].x)} ${f(p[0].y)}`;
      for (let n = 1; n < p.length - 1; n++) {
        const m = mid(p[n], p[n + 1]);
        d += `Q${f(p[n].x)} ${f(p[n].y)} ${f(m.x)} ${f(m.y)}`;
      }
      d += `L${f(p[p.length - 1].x)} ${f(p[p.length - 1].y)}`;
    }
  }
  return d;
}

/** The wavelength to use for a window of this width, in pixels. */
export function wavelengthFor(width: number): number {
  return Math.min(220, Math.max(140, Math.round(width / 7.5)));
}

/** The texture for a window, as one SVG path, centred on the window centre. */
export function texturePath(
  width: number,
  height: number,
  degree: number,
  step?: number,
): string {
  const params: FieldParams = {
    angle: textureAngle(degree),
    morph: textureMorph(degree),
    wavelength: wavelengthFor(width),
  };
  return linesPathOf(contourLines(width, height, params, step));
}
