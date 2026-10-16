import assert from "node:assert/strict";
import test from "node:test";
import {
  BASE_DEGREE,
  buildFractalPath,
  buildFractalSegments,
  calendarOf,
  cellWidthFor,
  DEGREE_RULES,
  degreeFor,
  degreeForCalendar,
  fitTree,
  fractalTips,
  FRACTAL_DEPTH,
  fractalBounds,
  MAX_ANGLE,
  MIN_ANGLE,
  linksPathOf,
  seasonOf,
  wallpaperLinks,
  type CalendarContext,
  type FractalSegment,
  type Link,
} from "./fractal.ts";

// A calendar where only season<=2 (+0.5), hour>=12 (-0.5) and moon waning
// (-0.5) apply, so each test below changes one field and checks the shift.
const neutral: CalendarContext = {
  day: 20,
  month: 7,
  season: 2,
  weekday: 3,
  hour: 12,
  moonPhase: 0.5,
  fullMoon: false,
  sabbatDay: false,
};
const shift = (overrides: Partial<CalendarContext>) =>
  degreeForCalendar({ ...neutral, ...overrides }) - degreeForCalendar(neutral);

test("seasons are northern-hemisphere quarters numbered 1–4", () => {
  assert.equal(seasonOf(3), 1);
  assert.equal(seasonOf(5), 1);
  assert.equal(seasonOf(6), 2);
  assert.equal(seasonOf(8), 2);
  assert.equal(seasonOf(9), 3);
  assert.equal(seasonOf(11), 3);
  assert.equal(seasonOf(12), 4);
  assert.equal(seasonOf(2), 4);
});

test("the neutral calendar sums the three rules that apply to it", () => {
  assert.equal(degreeForCalendar(neutral), BASE_DEGREE - 0.5);
});

test("each rule moves the degree by its delta", () => {
  assert.equal(shift({ day: 10 }), 1); // day <= 15
  assert.equal(shift({ month: 3 }), -1); // month <= 6
  assert.equal(shift({ season: 3 }), -1); // +0.5 (season<=2) swapped for -0.5
  assert.equal(shift({ weekday: 1 }), -1); // Monday
  assert.equal(shift({ weekday: 6 }), 0.5); // weekend
  assert.equal(shift({ hour: 9 }), 1); // -0.5 (afternoon) swapped for +0.5
  assert.equal(shift({ moonPhase: 0.25 }), 1); // waning -0.5 swapped for waxing +0.5
  assert.equal(shift({ fullMoon: true }), 1);
  assert.equal(shift({ sabbatDay: true }), 2);
});

test("calendarOf reads weekday, hour and sabbat day from the date", () => {
  // 16 Oct 2026 is a Friday and not a Sabbat.
  const friday = calendarOf(new Date(2026, 9, 16, 9));
  assert.equal(friday.weekday, 5);
  assert.equal(friday.hour, 9);
  assert.equal(friday.season, 3);
  assert.equal(friday.sabbatDay, false);
  // Monday and Sunday are 1 and 7.
  assert.equal(calendarOf(new Date(2026, 9, 12)).weekday, 1);
  assert.equal(calendarOf(new Date(2026, 9, 18)).weekday, 7);
  // 31 Oct is Samhain.
  assert.equal(calendarOf(new Date(2026, 9, 31)).sabbatDay, true);
  const { moonPhase } = friday;
  assert.ok(moonPhase >= 0 && moonPhase < 1);
});

test("degreeFor agrees with degreeForCalendar and stays in a drawable range", () => {
  const date = new Date(2026, 9, 16, 9);
  assert.equal(degreeFor(date), degreeForCalendar(calendarOf(date)));
  for (let day = 0; day < 366; day++) {
    const degree = degreeFor(new Date(2026, 0, 1 + day, day % 24));
    assert.ok(degree > 10 && degree < 35, `degree ${degree} out of range`);
  }
});

const length = (s: FractalSegment) => Math.hypot(s.x2 - s.x1, s.y2 - s.y1);

function pointToSegment(px: number, py: number, s: Link) {
  const dx = s.x2 - s.x1;
  const dy = s.y2 - s.y1;
  const t = Math.max(
    0,
    Math.min(1, ((px - s.x1) * dx + (py - s.y1) * dy) / (dx * dx + dy * dy)),
  );
  return Math.hypot(px - (s.x1 + t * dx), py - (s.y1 + t * dy));
}

const side = (
  ax: number,
  ay: number,
  bx: number,
  by: number,
  cx: number,
  cy: number,
) => Math.sign((bx - ax) * (cy - ay) - (by - ay) * (cx - ax));

/** Distance between two segments; 0 if they cross. */
function segmentDistance(a: Link, b: Link) {
  const crosses =
    side(a.x1, a.y1, a.x2, a.y2, b.x1, b.y1) *
      side(a.x1, a.y1, a.x2, a.y2, b.x2, b.y2) <
      0 &&
    side(b.x1, b.y1, b.x2, b.y2, a.x1, a.y1) *
      side(b.x1, b.y1, b.x2, b.y2, a.x2, a.y2) <
      0;
  if (crosses) return 0;
  return Math.min(
    pointToSegment(a.x1, a.y1, b),
    pointToSegment(a.x2, a.y2, b),
    pointToSegment(b.x1, b.y1, a),
    pointToSegment(b.x2, b.y2, a),
  );
}

/**
 * The smallest gap between any two branches that do not share a fork, as a
 * fraction of the shorter of the two. Zero or less means branches overlap.
 */
function minRelativeClearance(segments: FractalSegment[]) {
  let min = Infinity;
  for (let i = 0; i < segments.length; i++) {
    for (let j = i + 1; j < segments.length; j++) {
      const a = segments[i];
      const b = segments[j];
      // Parent/child and siblings meet at a shared point by construction.
      if (a.parent === j || b.parent === i || a.parent === b.parent) continue;
      min = Math.min(
        min,
        segmentDistance(a, b) / Math.min(length(a), length(b)),
      );
    }
  }
  return min;
}

test("every degree the rules can produce stays inside the verified angle range", () => {
  const lowest = DEGREE_RULES.reduce(
    (d, r) => d + Math.min(0, r.delta),
    BASE_DEGREE,
  );
  const highest = DEGREE_RULES.reduce(
    (d, r) => d + Math.max(0, r.delta),
    BASE_DEGREE,
  );
  assert.ok(lowest >= MIN_ANGLE, `lowest degree ${lowest}`);
  assert.ok(highest <= MAX_ANGLE, `highest degree ${highest}`);
});

test("branches never overlap at any angle in the verified range", () => {
  const angles = [MIN_ANGLE, 13, 16.5, 20, 23.5, 26, 30, MAX_ANGLE];
  for (const angle of angles) {
    const clearance = minRelativeClearance(
      buildFractalSegments(angle, FRACTAL_DEPTH),
    );
    assert.ok(
      clearance >= 0.5,
      `angle ${angle}: clearance ${clearance.toFixed(2)}`,
    );
  }
});

/** Bounds of a tree after fitting it into the cell whose corner is (ox, oy). */
function placedBounds(
  angle: number,
  cellW: number,
  cellH: number,
  ox: number,
  oy: number,
) {
  const segments = buildFractalSegments(angle, FRACTAL_DEPTH);
  const fit = fitTree(segments, cellW, cellH);
  const b = fractalBounds(segments);
  return {
    minX: ox + b.minX * fit.scale + fit.tx,
    maxX: ox + b.maxX * fit.scale + fit.tx,
    minY: oy + b.minY * fit.scale + fit.ty,
    maxY: oy + b.maxY * fit.scale + fit.ty,
  };
}

test("a fitted tree stays inside its padded cell at every angle and size", () => {
  for (const [w, h] of [
    [120, 144],
    [180, 216],
    [240, 288],
    [200, 200],
  ]) {
    for (const angle of [MIN_ANGLE, 16.5, 20, 26, MAX_ANGLE]) {
      const b = placedBounds(angle, w, h, 0, 0);
      const label = `angle ${angle}, cell ${w}x${h}`;
      assert.ok(b.minX >= w * 0.08 - 1e-6, `${label}: left ${b.minX}`);
      assert.ok(b.maxX <= w * 0.92 + 1e-6, `${label}: right ${b.maxX}`);
      assert.ok(b.minY >= h * 0.08 - 1e-6, `${label}: top ${b.minY}`);
      assert.ok(b.maxY <= h * 0.92 + 1e-6, `${label}: bottom ${b.maxY}`);
    }
  }
});

test("trees in the half-drop wallpaper layout never touch each other", () => {
  const w = 180;
  const h = 216;
  const trees = [];
  // Rows alternate between whole cells and cells shifted half a cell across.
  for (let row = 0; row < 4; row++) {
    for (let col = -1; col < 4; col++) {
      const shift = row % 2 === 0 ? 0 : w / 2;
      trees.push(placedBounds(20, w, h, col * w + shift, row * h));
    }
  }
  for (let i = 0; i < trees.length; i++) {
    for (let j = i + 1; j < trees.length; j++) {
      const a = trees[i];
      const b = trees[j];
      const apart =
        a.maxX < b.minX ||
        b.maxX < a.minX ||
        a.maxY < b.minY ||
        b.maxY < a.minY;
      assert.ok(apart, `trees ${i} and ${j} share space`);
    }
  }
});

test("tight cells hug their trees and still never touch in the wallpaper", () => {
  for (const angle of [MIN_ANGLE, 20, 26, MAX_ANGLE]) {
    const h = 180;
    const w = cellWidthFor(buildFractalSegments(angle, FRACTAL_DEPTH), h, 1);
    const own = placedBounds(angle, w, h, 0, 0);
    // The tree fills its cell edge to edge, apart from the margin.
    assert.ok(own.maxY - own.minY >= h * 0.84 - 1);
    assert.ok(own.maxX - own.minX >= w * 0.84 - 2);
    const trees = [];
    for (let row = 0; row < 4; row++) {
      for (let col = -1; col < 4; col++) {
        const shift = row % 2 === 0 ? 0 : w / 2;
        trees.push(placedBounds(angle, w, h, col * w + shift, row * h));
      }
    }
    for (let i = 0; i < trees.length; i++) {
      for (let j = i + 1; j < trees.length; j++) {
        const a = trees[i];
        const b = trees[j];
        const apart =
          a.maxX < b.minX ||
          b.maxX < a.minX ||
          a.maxY < b.minY ||
          b.maxY < a.minY;
        assert.ok(apart, `angle ${angle}: trees ${i} and ${j} share space`);
      }
    }
  }
});

/** One wallpaper tile at the given angle and cell height, with its trees placed. */
function wallpaperTile(angle: number, h: number) {
  const segments = buildFractalSegments(angle, FRACTAL_DEPTH);
  const w = cellWidthFor(segments, h);
  const fit = fitTree(segments, w, h);
  const tips = fractalTips(segments);
  const at = (ox: number, oy: number, p: { x: number; y: number }) => ({
    x: ox + p.x * fit.scale + fit.tx,
    y: oy + p.y * fit.scale + fit.ty,
  });
  // Row 0: one tree centred in the tile. Row 1: two half trees at its edges.
  const trees = [
    [0, 0],
    [-w / 2, h],
    [w / 2, h],
  ].map(([ox, oy]) => ({
    segments: segments.map((s) => ({
      x1: ox + s.x1 * fit.scale + fit.tx,
      y1: oy + s.y1 * fit.scale + fit.ty,
      x2: ox + s.x2 * fit.scale + fit.tx,
      y2: oy + s.y2 * fit.scale + fit.ty,
    })),
    points: [
      at(ox, oy, tips.left),
      at(ox, oy, tips.right),
      at(ox, oy, tips.base),
    ],
  }));
  return { w, h, trees, links: wallpaperLinks(tips, fit, w, h) };
}

/** The tile repeated 3×3 (it repeats every cellW across and 2·cellH down). */
function tileBlock(angle: number, h: number) {
  const tile = wallpaperTile(angle, h);
  const shifted = (dx: number, dy: number) => ({
    trees: tile.trees.map((t) => ({
      segments: t.segments.map((s) => ({
        x1: s.x1 + dx,
        y1: s.y1 + dy,
        x2: s.x2 + dx,
        y2: s.y2 + dy,
      })),
      points: t.points.map((p) => ({ x: p.x + dx, y: p.y + dy })),
    })),
    links: tile.links.map((l) => ({
      x1: l.x1 + dx,
      y1: l.y1 + dy,
      x2: l.x2 + dx,
      y2: l.y2 + dy,
    })),
  });
  const parts = [];
  for (const i of [-1, 0, 1]) {
    for (const j of [-1, 0, 1]) parts.push(shifted(i * tile.w, j * 2 * tile.h));
  }
  return {
    tile,
    trees: parts.flatMap((p) => p.trees),
    links: parts.flatMap((p) => p.links),
  };
}

const sharesEndpoint = (a: Link, b: Link) =>
  [
    [a.x1, a.y1],
    [a.x2, a.y2],
  ].some(([ax, ay]) =>
    [
      [b.x1, b.y1],
      [b.x2, b.y2],
    ].some(([bx, by]) => Math.hypot(ax - bx, ay - by) < 1e-6),
  );

test("links join trees without crossing or touching any branch", () => {
  for (const angle of [MIN_ANGLE, 20, MAX_ANGLE]) {
    const { trees, links } = tileBlock(angle, 180);
    for (const l of links) {
      for (const tree of trees) {
        for (const s of tree.segments) {
          if (sharesEndpoint(l, s)) continue;
          assert.ok(
            segmentDistance(l, s) > 1e-3,
            `angle ${angle}: a link touches a branch`,
          );
        }
      }
      for (const other of links) {
        if (other === l || sharesEndpoint(l, other)) continue;
        assert.ok(
          segmentDistance(l, other) > 1e-3,
          `angle ${angle}: two links touch away from a joint`,
        );
      }
    }
  }
});

test("every tree in the wallpaper is joined to its neighbours", () => {
  for (const angle of [MIN_ANGLE, 20, MAX_ANGLE]) {
    const { tile, trees, links } = tileBlock(angle, 180);
    // Union-find over anchor points: a tree joins its three anchors, a link
    // joins its two ends.
    const parent = new Map<string, string>();
    const key = (x: number, y: number) => `${x.toFixed(3)},${y.toFixed(3)}`;
    const find = (k: string): string => {
      if (!parent.has(k)) parent.set(k, k);
      const p = parent.get(k) as string;
      if (p === k) return k;
      const root = find(p);
      parent.set(k, root);
      return root;
    };
    const union = (a: string, b: string) => parent.set(find(a), find(b));
    for (const t of trees) {
      const [first, ...rest] = t.points.map((p) => key(p.x, p.y));
      for (const k of rest) union(first, k);
    }
    for (const l of links) union(key(l.x1, l.y1), key(l.x2, l.y2));
    // The three trees in the middle tile sit in one network.
    const middle = trees.slice(12, 15);
    assert.equal(middle.length, 3);
    const roots = new Set(
      middle.map((t) => find(key(t.points[0].x, t.points[0].y))),
    );
    assert.equal(roots.size, 1, `angle ${angle}: trees are not joined`);
    assert.ok(tile.links.length > 0);
  }
});

test("links render as one path", () => {
  const { tile } = tileBlock(20, 180);
  const d = linksPathOf(tile.links);
  assert.equal(d.match(/M/g)?.length, tile.links.length);
});

test("angles outside the verified range are clamped, not drawn", () => {
  assert.equal(buildFractalPath(1, 3), buildFractalPath(MIN_ANGLE, 3));
  assert.equal(buildFractalPath(80, 3), buildFractalPath(MAX_ANGLE, 3));
});

test("the fractal is one path with a segment per tree node", () => {
  const depth = 4;
  const d = buildFractalPath(BASE_DEGREE, depth);
  const segments = d.match(/M/g)?.length ?? 0;
  assert.equal(segments, 2 ** (depth + 1) - 1);
});

test("the path is deterministic and changes with the degree", () => {
  assert.equal(buildFractalPath(20, 5), buildFractalPath(20, 5));
  assert.notEqual(buildFractalPath(19.5, 5), buildFractalPath(20.5, 5));
});
