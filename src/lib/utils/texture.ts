/**
 * texture.ts — the degree rules and geometry behind the background texture.
 *
 * The texture is nested squares, each turned by the "degree" from the one
 * outside it. The degree starts at BASE_DEGREE and each rule in DEGREE_RULES adds its delta when its
 * condition holds for the current moment. Rules are summed, so the degree
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
/** Stop nesting at this many squares, or once a square is under 2px across. */
const MAX_LEVELS = 16;

export interface Line {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

/**
 * Concentric squares filling a `size`×`size` cell whose top-left corner is
 * (ox, oy). Each square is turned by `angleDeg` (the degree) from the one
 * outside it, and is the largest square that fits inside it: its corners land
 * exactly on the outer square's edges. Lines therefore only ever meet at those
 * corners and never cross, whatever the angle. `turn` picks the direction.
 */
export function nestedSquares(
  angleDeg: number,
  size: number,
  turn: 1 | -1 = 1,
  ox = 0,
  oy = 0,
): Line[] {
  const clamped = Math.min(MAX_ANGLE, Math.max(MIN_ANGLE, angleDeg));
  const theta = (clamped * Math.PI) / 180;
  const shrink = 1 / (Math.cos(theta) + Math.sin(theta));
  const cx = ox + size / 2;
  const cy = oy + size / 2;
  const lines: Line[] = [];
  let half = size / 2;
  let rotation = 0;
  for (let level = 0; level < MAX_LEVELS && half >= 1; level++) {
    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);
    const corners = [
      [-1, -1],
      [1, -1],
      [1, 1],
      [-1, 1],
    ].map(([sx, sy]) => ({
      x: cx + sx * half * cos - sy * half * sin,
      y: cy + sx * half * sin + sy * half * cos,
    }));
    for (let i = 0; i < 4; i++) {
      const a = corners[i];
      const b = corners[(i + 1) % 4];
      lines.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y });
    }
    rotation += turn * theta;
    half *= shrink;
  }
  return lines;
}

/**
 * One repeating tile of the texture: 2×2 cells, 2·size across and down, with
 * neighbouring cells turning in opposite directions (a checkerboard), so the
 * squares counter-rotate from cell to cell.
 */
export function textureTile(angleDeg: number, size: number): Line[] {
  return [
    nestedSquares(angleDeg, size, 1, 0, 0),
    nestedSquares(angleDeg, size, -1, size, 0),
    nestedSquares(angleDeg, size, -1, 0, size),
    nestedSquares(angleDeg, size, 1, size, size),
  ].flat();
}

/** Lines as one SVG path `d` string, so a whole tile is one DOM node. */
export function linesPathOf(lines: readonly Line[]): string {
  return lines
    .map(
      (l) =>
        `M${l.x1.toFixed(2)} ${l.y1.toFixed(2)}L${l.x2.toFixed(2)} ${l.y2.toFixed(2)}`,
    )
    .join("");
}
