/**
 * texture.ts — the degree rules and geometry behind the background texture.
 *
 * The texture is a field of flowing arcs (Truchet tiles). The "degree" tilts
 * it and sets how many tiles are flipped. The degree starts at BASE_DEGREE and
 * each rule in DEGREE_RULES adds its delta when its condition holds for the current moment. Rules are summed, so the degree
 * moves with the cycles the site already tracks: the day of the month, the
 * month, the season, the weekday, the time of day, the Moon, and the Sabbats.
 *
 * Seasons are the four northern-hemisphere quarters, numbered 1–4:
 *   1 Spring (Mar–May), 2 Summer (Jun–Aug), 3 Autumn (Sep–Nov), 4 Winter (Dec–Feb)
 *
 * To add a rule, append an entry to DEGREE_RULES. Add a field to
 * CalendarContext (and fill it in calendarOf) if the rule needs new input.
 */

import { getMoonIllumination, isVisiblyFullMoon } from "./moonPhase.ts";
import { sabbats } from "./sabbats.ts";

export interface CalendarContext {
  /** Day of the month, 1–31. */
  day: number;
  /** Month of the year, 1–12. */
  month: number;
  /** Season, 1–4 (see module comment). */
  season: number;
  /** Day of the week, 1 (Monday) – 7 (Sunday). */
  weekday: number;
  /** Hour of the day, 0–23. */
  hour: number;
  /** Lunar phase in [0, 1): 0 new, 0.25 first quarter, 0.5 full, 0.75 last quarter. */
  moonPhase: number;
  /** True during the roughly one-day window the Moon is visibly full. */
  fullMoon: boolean;
  /** True when today is the date of one of the eight Sabbats. */
  sabbatDay: boolean;
}

export interface DegreeRule {
  label: string;
  applies: (calendar: CalendarContext) => boolean;
  delta: number;
}

export const BASE_DEGREE = 20;

export const DEGREE_RULES: readonly DegreeRule[] = [
  { label: "day <= 15", applies: ({ day }) => day <= 15, delta: 1 },
  { label: "month <= 6", applies: ({ month }) => month <= 6, delta: -1 },
  { label: "season <= 2", applies: ({ season }) => season <= 2, delta: 0.5 },
  { label: "season >= 3", applies: ({ season }) => season >= 3, delta: -0.5 },
  // Monday has its own egg on the site; start the week tightly folded.
  {
    label: "weekday = Monday",
    applies: ({ weekday }) => weekday === 1,
    delta: -1,
  },
  { label: "weekday >= 6", applies: ({ weekday }) => weekday >= 6, delta: 0.5 },
  { label: "hour < 12", applies: ({ hour }) => hour < 12, delta: 0.5 },
  { label: "hour >= 12", applies: ({ hour }) => hour >= 12, delta: -0.5 },
  // The Moon: opening while it waxes, closing while it wanes, wide at full.
  {
    label: "moon waxing",
    applies: ({ moonPhase }) => moonPhase < 0.5,
    delta: 0.5,
  },
  {
    label: "moon waning",
    applies: ({ moonPhase }) => moonPhase >= 0.5,
    delta: -0.5,
  },
  { label: "full moon", applies: ({ fullMoon }) => fullMoon, delta: 1 },
  // The eight festival days are the biggest single shift.
  { label: "sabbat day", applies: ({ sabbatDay }) => sabbatDay, delta: 2 },
];

export function seasonOf(month: number): number {
  if (month >= 3 && month <= 5) return 1;
  if (month >= 6 && month <= 8) return 2;
  if (month >= 9 && month <= 11) return 3;
  return 4;
}

export function calendarOf(date: Date): CalendarContext {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const phase = getMoonIllumination(date).phase;
  return {
    day,
    month,
    season: seasonOf(month),
    // getDay() is 0 for Sunday; shift so Monday is 1 and Sunday is 7.
    weekday: ((date.getDay() + 6) % 7) + 1,
    hour: date.getHours(),
    moonPhase: ((phase % 1) + 1) % 1,
    fullMoon: isVisiblyFullMoon(date),
    sabbatDay: sabbats.some((s) => s.month === month && s.day === day),
  };
}

/** The branch angle, in degrees, for a pre-computed calendar context. */
export function degreeForCalendar(calendar: CalendarContext): number {
  return DEGREE_RULES.reduce(
    (degree, rule) => (rule.applies(calendar) ? degree + rule.delta : degree),
    BASE_DEGREE,
  );
}

/** The branch angle, in degrees, for the given moment. */
export function degreeFor(date: Date): number {
  return degreeForCalendar(calendarOf(date));
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
 * Every arc needed to cover a `width`×`height` window when the texture is
 * turned by the degree. Coordinates are in the texture's own (unturned) frame,
 * centred on the window's centre; the caller applies the turn. Cover is
 * measured in the turned frame, so no tile is wasted outside the window.
 */
export function textureArcs(
  width: number,
  height: number,
  size: number,
  degree: number,
): Arc[] {
  const theta = (textureAngle(degree) * Math.PI) / 180;
  const cos = Math.abs(Math.cos(theta));
  const sin = Math.abs(Math.sin(theta));
  const halfW = (width * cos + height * sin) / 2 + size;
  const halfH = (width * sin + height * cos) / 2 + size;
  const share = flipShare(degree);
  const arcs: Arc[] = [];
  for (let j = Math.floor(-halfH / size); j < Math.ceil(halfH / size); j++) {
    for (let i = Math.floor(-halfW / size); i < Math.ceil(halfW / size); i++) {
      arcs.push(...tileArcs(size, i, j, cellHash(i, j) < share));
    }
  }
  return arcs;
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
