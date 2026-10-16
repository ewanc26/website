/**
 * texture.ts — the degree rules and geometry behind the background texture.
 *
 * The texture is a field of flowing arcs (Truchet tiles). The "degree" tilts
 * it and sets how many tiles are flipped. The degree starts at BASE_DEGREE and
 * each rule in DEGREE_RULES adds its delta times a weight between 0 and 1. The
 * rules follow the cycles the site already tracks: the day of the month, the
 * month, the season, the weekday, the time of day, the Moon, and the Sabbats.
 *
 * Nothing here is an on/off switch. Each rule is a smooth window on continuous
 * time, so the degree changes gradually and never jumps, however fast time is
 * played back. Inside a rule's window (say, the first half of the month) the
 * weight is a flat 1; at its edges it eases to 0 along a smootherstep curve.
 *
 * Seasons are the four northern-hemisphere quarters, numbered 1–4:
 *   1 Spring (Mar–May), 2 Summer (Jun–Aug), 3 Autumn (Sep–Nov), 4 Winter (Dec–Feb)
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

export interface CalendarContext {
  /** Days since the start of the month, with the time of day as a fraction. */
  monthPos: number;
  /** Days in this month. */
  monthLength: number;
  /** Months since 1 Jan, continuous: 0 on 1 Jan, 2.5 in mid-March, up to 12. */
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

export const BASE_DEGREE = 20;

export const DEGREE_RULES: readonly DegreeRule[] = [
  {
    label: "day <= 15",
    weight: (c) => smoothWindow(c.monthPos, 0, 15, 3, c.monthLength),
    delta: 1,
  },
  {
    label: "month <= 6",
    weight: (c) => smoothWindow(c.yearMonth, 0, 6, 0.7, 12),
    delta: -1,
  },
  {
    label: "season <= 2",
    weight: (c) => smoothWindow(c.yearMonth, 2, 8, 0.7, 12),
    delta: 0.5,
  },
  {
    label: "season >= 3",
    weight: (c) => smoothWindow(c.yearMonth, 8, 14, 0.7, 12),
    delta: -0.5,
  },
  // Monday has its own egg on the site; start the week tightly folded.
  {
    label: "weekday = Monday",
    weight: (c) => smoothWindow(c.weekPos, 0, 1, 1, 7),
    delta: -1,
  },
  {
    label: "weekday >= 6",
    weight: (c) => smoothWindow(c.weekPos, 5, 7, 1, 7),
    delta: 0.5,
  },
  {
    label: "hour < 12",
    weight: (c) => smoothWindow(c.hourPos, 0, 12, 4, 24),
    delta: 0.5,
  },
  {
    label: "hour >= 12",
    weight: (c) => smoothWindow(c.hourPos, 12, 24, 4, 24),
    delta: -0.5,
  },
  // The Moon: opening while it waxes, closing while it wanes, wide at full.
  {
    label: "moon waxing",
    weight: (c) => smoothWindow(c.moonPhase, 0, 0.5, 0.1, 1),
    delta: 0.5,
  },
  {
    label: "moon waning",
    weight: (c) => smoothWindow(c.moonPhase, 0.5, 1, 0.1, 1),
    delta: -0.5,
  },
  {
    label: "full moon",
    weight: (c) => smootherstep((c.moonFraction - 0.85) / 0.14),
    delta: 1,
  },
  // The eight festival days are the biggest single shift: a swell that
  // peaks on the day and has faded within four days either side.
  {
    label: "sabbat day",
    weight: (c) => 1 - smootherstep(c.sabbatDistance / 4),
    delta: 2,
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

export function calendarOf(date: Date): CalendarContext {
  const month = date.getMonth();
  const dayFraction =
    (date.getHours() * 3600 +
      date.getMinutes() * 60 +
      date.getSeconds() +
      date.getMilliseconds() / 1000) /
    86_400;
  const monthLength = new Date(date.getFullYear(), month + 1, 0).getDate();
  const monthPos = date.getDate() - 1 + dayFraction;

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
    yearMonth: month + monthPos / monthLength,
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
export const MIN_ANGLE = 10;
export const MAX_ANGLE = 35;

/** The degree as the angle the texture is drawn at, kept in the safe range. */
export function textureAngle(degree: number): number {
  return Math.min(MAX_ANGLE, Math.max(MIN_ANGLE, degree));
}

/**
 * The share of tiles that are flipped, from 0 at MIN_ANGLE to 1 at MAX_ANGLE.
 * Few flips make long ordered diagonal waves; about half make a dense maze.
 * Tiles turn over one at a time as it rises, each with a smooth cross-fade.
 */
export function flipShare(degree: number): number {
  return (textureAngle(degree) - MIN_ANGLE) / (MAX_ANGLE - MIN_ANGLE);
}

/**
 * A fixed pseudo-random number in [0, 1) for the tile at column `i`, row `j`.
 * It depends only on the tile's position, so a tile never changes its mind as
 * the window resizes, and a small change in the degree flips only a few tiles.
 */
export function cellHash(i: number, j: number): number {
  let h = Math.imul(i | 0, 0x27d4eb2d) ^ Math.imul(j | 0, 0x165667b1);
  h = Math.imul(h ^ (h >>> 15), 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/** An arc of a circle: centre, radius, and start/end angles in radians. */
export interface Arc {
  cx: number;
  cy: number;
  r: number;
  a0: number;
  a1: number;
}

/**
 * Where an arc's three lines meet a tile edge, as a fraction of the tile:
 * 1/2 and 1/2 ± ARC_SPACING. The same three points sit on all four edges, so
 * arcs join across any two neighbouring tiles however each is flipped.
 */
export const ARC_SPACING = 0.16;

const RADII = [0.5 - ARC_SPACING, 0.5, 0.5 + ARC_SPACING];

/**
 * The six arcs of the tile in column `i`, row `j` (a square `size` across, with
 * its top-left corner at (i·size, j·size)). Unflipped, the arcs wrap two
 * opposite corners (top-left and bottom-right); flipped, the other two.
 *
 * Within a tile, arcs round the same corner are concentric, and arcs round
 * opposite corners stay apart because their largest radii sum to less than the
 * diagonal (2·(0.5 + ARC_SPACING) < √2), so no two arcs ever cross.
 */
export function tileArcs(
  size: number,
  i: number,
  j: number,
  flipped: boolean,
): Arc[] {
  const x0 = i * size;
  const y0 = j * size;
  const x1 = x0 + size;
  const y1 = y0 + size;
  const half = Math.PI / 2;
  const corners = flipped
    ? [
        // top-right and bottom-left
        { cx: x1, cy: y0, a0: Math.PI, a1: half },
        { cx: x0, cy: y1, a0: 0, a1: -half },
      ]
    : [
        // top-left and bottom-right
        { cx: x0, cy: y0, a0: 0, a1: half },
        { cx: x1, cy: y1, a0: Math.PI, a1: Math.PI + half },
      ];
  return corners.flatMap((corner) =>
    RADII.map((r) => ({ ...corner, r: r * size })),
  );
}

/**
 * How wide the cross-fade is, in units of the flip share. A tile is plain
 * once the share is half a band below its hash and flipped once it is half a
 * band above, and eases from one to the other in between.
 */
export const BLEND_BAND = 0.1;

/**
 * How flipped the tile with this hash is at this share, from 0 (plain) to 1
 * (flipped). It changes smoothly as the share moves, so no tile ever pops.
 */
export function tileWeight(hash: number, share: number): number {
  return smootherstep((share - hash) / BLEND_BAND + 0.5);
}

export interface TextureLayers {
  /** The tilt to draw the field at, in degrees. */
  angle: number;
  /** Arcs drawn at full strength: every tile that is wholly plain or flipped. */
  solid: Arc[];
  /**
   * Tiles in the middle of a cross-fade, as pairs of layers. A tile's plain
   * layer is drawn at 1 − w and its flipped layer at w, so its total strength
   * stays constant and it never flashes or dims as it turns over.
   */
  fades: { opacity: number; arcs: Arc[] }[];
}

/**
 * Everything needed to cover a `width`×`height` window when the texture is
 * turned by the degree. Coordinates are in the texture's own (unturned) frame,
 * centred on the window's centre; the caller applies the turn. Cover is
 * measured in the turned frame, so no tile is wasted outside the window.
 */
export function textureLayers(
  width: number,
  height: number,
  size: number,
  degree: number,
): TextureLayers {
  const angle = textureAngle(degree);
  const theta = (angle * Math.PI) / 180;
  const cos = Math.abs(Math.cos(theta));
  const sin = Math.abs(Math.sin(theta));
  const halfW = (width * cos + height * sin) / 2 + size;
  const halfH = (width * sin + height * cos) / 2 + size;
  const share = flipShare(degree);
  const solid: Arc[] = [];
  const fades: TextureLayers["fades"] = [];
  for (let j = Math.floor(-halfH / size); j < Math.ceil(halfH / size); j++) {
    for (let i = Math.floor(-halfW / size); i < Math.ceil(halfW / size); i++) {
      const w = tileWeight(cellHash(i, j), share);
      if (w <= 0) solid.push(...tileArcs(size, i, j, false));
      else if (w >= 1) solid.push(...tileArcs(size, i, j, true));
      else {
        fades.push({ opacity: 1 - w, arcs: tileArcs(size, i, j, false) });
        fades.push({ opacity: w, arcs: tileArcs(size, i, j, true) });
      }
    }
  }
  return { angle, solid, fades };
}

export function arcPoint(arc: Arc, angle: number) {
  return {
    x: arc.cx + arc.r * Math.cos(angle),
    y: arc.cy + arc.r * Math.sin(angle),
  };
}

/** Arcs as one SVG path `d` string, so the whole texture is one DOM node. */
export function arcsPathOf(arcs: readonly Arc[]): string {
  return arcs
    .map((arc) => {
      const from = arcPoint(arc, arc.a0);
      const to = arcPoint(arc, arc.a1);
      const sweep = arc.a1 > arc.a0 ? 1 : 0;
      const r = arc.r.toFixed(1);
      return `M${from.x.toFixed(1)} ${from.y.toFixed(1)}A${r} ${r} 0 0 ${sweep} ${to.x.toFixed(1)} ${to.y.toFixed(1)}`;
    })
    .join("");
}
