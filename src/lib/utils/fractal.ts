/**
 * fractal.ts — the degree rules behind the reactive background fractal.
 *
 * The fractal is a binary tree whose branch angle is the "degree". The degree
 * starts at BASE_DEGREE and each rule in DEGREE_RULES adds its delta when its
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
export const FRACTAL_DEPTH = 9;

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

/**
 * The tree is a symmetric binary tree growing upward from the bottom centre of
 * a 1000×1000 box. Each level shrinks by SHRINK and splits by ±angle. The
 * background tiles it as wallpaper (see fitTree and FractalBackground).
 *
 * Branches must never cross or touch (apart from sharing a fork). At a shrink
 * of 0.72 they do at every angle; at 0.5 they stay clear for every angle in
 * [MIN_ANGLE, MAX_ANGLE] at FRACTAL_DEPTH, with each branch at least about 0.7×
 * the shorter of the two branches away from any unrelated branch. The test
 * suite checks this by brute force, so changing SHRINK, FRACTAL_DEPTH or the
 * angle bounds needs that test to keep passing. The angle is clamped to the
 * verified range, so no combination of rules can break the guarantee.
 */
const SHRINK = 0.5;
const TRUNK = 300;
const ORIGIN = { x: 500, y: 1000 };
export const MIN_ANGLE = 10;
export const MAX_ANGLE = 35;

export interface FractalSegment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  /** Index of the segment this one grows from, or -1 for the trunk. */
  parent: number;
}

export function buildFractalSegments(
  angleDeg: number,
  depth: number = FRACTAL_DEPTH,
): FractalSegment[] {
  const clamped = Math.min(MAX_ANGLE, Math.max(MIN_ANGLE, angleDeg));
  const angle = (clamped * Math.PI) / 180;
  const segments: FractalSegment[] = [];

  const grow = (
    x: number,
    y: number,
    heading: number,
    length: number,
    level: number,
    parent: number,
  ) => {
    const x2 = x + Math.sin(heading) * length;
    const y2 = y - Math.cos(heading) * length;
    const index = segments.push({ x1: x, y1: y, x2, y2, parent }) - 1;
    if (level === 0) return;
    grow(x2, y2, heading - angle, length * SHRINK, level - 1, index);
    grow(x2, y2, heading + angle, length * SHRINK, level - 1, index);
  };

  grow(ORIGIN.x, ORIGIN.y, 0, TRUNK, depth, -1);
  return segments;
}

/** Segments as one SVG path `d` string, so a whole tree is one DOM node. */
export function fractalPathOf(segments: readonly FractalSegment[]): string {
  return segments
    .map(
      (s) =>
        `M${s.x1.toFixed(1)} ${s.y1.toFixed(1)}L${s.x2.toFixed(1)} ${s.y2.toFixed(1)}`,
    )
    .join("");
}

export function buildFractalPath(
  angleDeg: number,
  depth: number = FRACTAL_DEPTH,
): string {
  return fractalPathOf(buildFractalSegments(angleDeg, depth));
}

export interface Bounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export function fractalBounds(segments: readonly FractalSegment[]): Bounds {
  const bounds = {
    minX: Infinity,
    minY: Infinity,
    maxX: -Infinity,
    maxY: -Infinity,
  };
  for (const s of segments) {
    bounds.minX = Math.min(bounds.minX, s.x1, s.x2);
    bounds.maxX = Math.max(bounds.maxX, s.x1, s.x2);
    bounds.minY = Math.min(bounds.minY, s.y1, s.y2);
    bounds.maxY = Math.max(bounds.maxY, s.y1, s.y2);
  }
  return bounds;
}

/**
 * How much wider than its tree a wallpaper cell is. 1 packs trees tightly; 1.5
 * leaves room for the triangles that join them to read as a pattern; 2 is too
 * sparse to feel like wallpaper.
 */
export const CELL_SPREAD = 1.5;

/**
 * The cell width at which a tree of this shape fills a cell `cellH` tall as
 * tightly as fitTree allows, scaled by `spread` (see CELL_SPREAD), which sets the
 * gaps, and so the triangles that join the trees, between neighbours.
 * Whole pixels, so tile seams land on pixel edges.
 */
export function cellWidthFor(
  segments: readonly FractalSegment[],
  cellH: number,
  spread: number = CELL_SPREAD,
): number {
  const { minX, minY, maxX, maxY } = fractalBounds(segments);
  return Math.round((spread * cellH * (maxX - minX)) / (maxY - minY));
}

/** Where a tree sits inside a cell:`x' = x * scale + tx`, `y' = y * scale + ty`. */
export interface TreeFit {
  scale: number;
  tx: number;
  ty: number;
}

/**
 * Scale a tree to fit inside a `cellW`×`cellH` cell with `pad` (a fraction of
 * each side) of empty margin all round, centred across and standing on the
 * bottom margin. Wallpaper cells never intersect, so a tree that stays inside
 * its padded cell can never touch its neighbours.
 */
export function fitTree(
  segments: readonly FractalSegment[],
  cellW: number,
  cellH: number,
  pad: number = 0.08,
): TreeFit {
  const { minX, minY, maxX, maxY } = fractalBounds(segments);
  const scale = Math.min(
    (cellW * (1 - 2 * pad)) / (maxX - minX),
    (cellH * (1 - 2 * pad)) / (maxY - minY),
  );
  return {
    scale,
    tx: cellW / 2 - ((minX + maxX) / 2) * scale,
    ty: cellH * (1 - pad) - maxY * scale,
  };
}

export interface Point {
  x: number;
  y: number;
}

export interface TreeTips {
  /** The leftmost and rightmost points of the crown. */
  left: Point;
  right: Point;
  /** Where the trunk starts. */
  base: Point;
}

/** The anchor points a tree joins its neighbours at, in tree coordinates. */
export function fractalTips(segments: readonly FractalSegment[]): TreeTips {
  let left: Point = { x: Infinity, y: 0 };
  let right: Point = { x: -Infinity, y: 0 };
  for (const s of segments) {
    for (const p of [
      { x: s.x1, y: s.y1 },
      { x: s.x2, y: s.y2 },
    ]) {
      if (p.x < left.x) left = p;
      if (p.x > right.x) right = p;
    }
  }
  return { left, right, base: { ...ORIGIN } };
}

export interface Link {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

/**
 * The lines that join the wallpaper's trees into one network, in tile
 * coordinates. A tile is `cellW` wide and two cells (`2 * cellH`) tall: one
 * tree in row 0, and row 1 offset by half a cell. Links that cross the tile
 * edge are drawn in full here and completed by the neighbouring tile, so the
 * pattern is seamless.
 *
 *  - Row links: each crown's outermost tips meet its row neighbours' tips.
 *  - Roots: each trunk base forks to the two nearest crown tips in the next
 *    row, closing a triangle with the row link between them.
 *
 * Every link leaves a tree from its extreme left, right or base point, heading
 * away from the tree, so a link can only ever touch its own tree at that point.
 */
export function wallpaperLinks(
  tips: TreeTips,
  fit: TreeFit,
  cellW: number,
  cellH: number,
): Link[] {
  const at = (ox: number, oy: number, p: Point): Point => ({
    x: ox + p.x * fit.scale + fit.tx,
    y: oy + p.y * fit.scale + fit.ty,
  });
  const link = (a: Point, b: Point): Link => ({
    x1: a.x,
    y1: a.y,
    x2: b.x,
    y2: b.y,
  });
  const down = (p: Point, dy: number): Point => ({ x: p.x, y: p.y + dy });
  const W = cellW;
  const H = cellH;
  const links: Link[] = [];

  // Row 0 trees sit in cells at x = k·W, y = 0. Row 1 trees sit at x = ±W/2.
  links.push(link(at(-W, 0, tips.right), at(0, 0, tips.left)));
  links.push(link(at(0, 0, tips.right), at(W, 0, tips.left)));
  links.push(link(at(-W / 2, H, tips.right), at(W / 2, H, tips.left)));

  // Roots: row 0's base down to the inner tips of the two row-1 trees below.
  const base0 = at(0, 0, tips.base);
  links.push(link(base0, at(-W / 2, H, tips.right)));
  links.push(link(base0, at(W / 2, H, tips.left)));

  // Roots: each row-1 base down to the next tile's row-0 trees (2H lower).
  // Drawn again 2H higher so the part that spills into the tile below shows
  // here as the part that spills in from the tile above.
  for (const ox of [-W / 2, W / 2]) {
    const base = at(ox, H, tips.base);
    const roots = [
      at(ox - W / 2, 2 * H, tips.right),
      at(ox + W / 2, 2 * H, tips.left),
    ];
    for (const shift of [0, -2 * H]) {
      for (const root of roots) {
        links.push(link(down(base, shift), down(root, shift)));
      }
    }
  }
  return links;
}

/** Links as one SVG path `d` string. */
export function linksPathOf(links: readonly Link[]): string {
  return links
    .map(
      (l) =>
        `M${l.x1.toFixed(2)} ${l.y1.toFixed(2)}L${l.x2.toFixed(2)} ${l.y2.toFixed(2)}`,
    )
    .join("");
}
