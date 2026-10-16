import assert from "node:assert/strict";
import test from "node:test";
import {
  BASE_DEGREE,
  buildFractalPath,
  buildFractalSegments,
  calendarOf,
  DEGREE_RULES,
  degreeFor,
  degreeForCalendar,
  FRACTAL_DEPTH,
  MAX_ANGLE,
  MIN_ANGLE,
  seasonOf,
  type CalendarContext,
  type FractalSegment,
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

function pointToSegment(px: number, py: number, s: FractalSegment) {
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
function segmentDistance(a: FractalSegment, b: FractalSegment) {
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
