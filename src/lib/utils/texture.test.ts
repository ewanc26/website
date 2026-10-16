import assert from "node:assert/strict";
import test from "node:test";
import {
  BASE_DEGREE,
  calendarOf,
  DEGREE_RULES,
  degreeFor,
  degreeForCalendar,
  linesPathOf,
  MAX_ANGLE,
  MIN_ANGLE,
  nestedSquares,
  seasonOf,
  textureTile,
  type CalendarContext,
  type Line,
} from "./texture.ts";

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

const corners = (squareLines: Line[], level: number) =>
  squareLines.slice(level * 4, level * 4 + 4);

/** Distance from a point to the infinite line through a line's endpoints. */
function distanceToLine(px: number, py: number, l: Line) {
  const dx = l.x2 - l.x1;
  const dy = l.y2 - l.y1;
  return Math.abs(dx * (py - l.y1) - dy * (px - l.x1)) / Math.hypot(dx, dy);
}

test("each square is turned by the degree and its corners sit on its parent's edges", () => {
  const size = 200;
  for (const angle of [MIN_ANGLE, 16.5, 20, 26, MAX_ANGLE]) {
    const lines = nestedSquares(angle, size);
    const levels = lines.length / 4;
    assert.ok(levels >= 8, `angle ${angle}: only ${levels} squares`);
    for (let level = 1; level < levels; level++) {
      const parent = corners(lines, level - 1);
      const inner = corners(lines, level);
      // The edge direction turns by exactly the degree each level.
      const heading = (l: Line) => Math.atan2(l.y2 - l.y1, l.x2 - l.x1);
      const radians = heading(inner[0]) - heading(parent[0]);
      // Headings wrap around, so compare the turn modulo a full circle.
      const turn = ((((radians * 180) / Math.PI) % 360) + 360) % 360;
      assert.ok(
        Math.abs(turn - angle) < 1e-6,
        `angle ${angle}: turned ${turn}`,
      );
      for (const edge of inner) {
        // The corner is on the parent square's boundary: on one of its edges.
        const onBoundary = parent.some(
          (p) =>
            distanceToLine(edge.x1, edge.y1, p) < 1e-6 &&
            Math.min(p.x1, p.x2) - 1e-6 <= edge.x1 &&
            edge.x1 <= Math.max(p.x1, p.x2) + 1e-6 &&
            Math.min(p.y1, p.y2) - 1e-6 <= edge.y1 &&
            edge.y1 <= Math.max(p.y1, p.y2) + 1e-6,
        );
        assert.ok(
          onBoundary,
          `angle ${angle}, level ${level}: corner off the edge`,
        );
      }
    }
  }
});

test("squares stay inside their cell and shrink every level", () => {
  const size = 180;
  const lines = nestedSquares(20, size, 1, 50, 70);
  for (const l of lines) {
    for (const [x, y] of [
      [l.x1, l.y1],
      [l.x2, l.y2],
    ]) {
      assert.ok(x >= 50 - 1e-9 && x <= 50 + size + 1e-9, `x ${x}`);
      assert.ok(y >= 70 - 1e-9 && y <= 70 + size + 1e-9, `y ${y}`);
    }
  }
  const side = (level: number) =>
    Math.hypot(
      corners(lines, level)[0].x2 - corners(lines, level)[0].x1,
      corners(lines, level)[0].y2 - corners(lines, level)[0].y1,
    );
  for (let level = 1; level < lines.length / 4; level++) {
    assert.ok(side(level) < side(level - 1));
  }
});

/** Which side of the line a→b the point c is on: -1, 0 (on it) or 1. */
const side = (
  ax: number,
  ay: number,
  bx: number,
  by: number,
  cx: number,
  cy: number,
) => {
  const cross = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
  // Corners are meant to sit exactly on their parent's edge; ignore the
  // floating-point dust so touching is not mistaken for crossing.
  return Math.abs(cross) < 1e-7 ? 0 : Math.sign(cross);
};

/** True if the lines properly cross, as opposed to touching at an end. */
function crosses(a: Line, b: Line) {
  return (
    side(a.x1, a.y1, a.x2, a.y2, b.x1, b.y1) *
      side(a.x1, a.y1, a.x2, a.y2, b.x2, b.y2) <
      0 &&
    side(b.x1, b.y1, b.x2, b.y2, a.x1, a.y1) *
      side(b.x1, b.y1, b.x2, b.y2, a.x2, a.y2) <
      0
  );
}

test("no two lines ever cross, anywhere in the repeated texture", () => {
  const size = 120;
  for (const angle of [MIN_ANGLE, 16.5, 20, 26, MAX_ANGLE]) {
    const tile = textureTile(angle, size);
    // The tile repeats every 2·size, so check it with its neighbours.
    const lines: Line[] = [];
    for (const i of [-1, 0, 1]) {
      for (const j of [-1, 0, 1]) {
        for (const l of tile) {
          lines.push({
            x1: l.x1 + i * 2 * size,
            y1: l.y1 + j * 2 * size,
            x2: l.x2 + i * 2 * size,
            y2: l.y2 + j * 2 * size,
          });
        }
      }
    }
    for (let a = 0; a < lines.length; a++) {
      for (let b = a + 1; b < lines.length; b++) {
        assert.ok(!crosses(lines[a], lines[b]), `angle ${angle}: lines cross`);
      }
    }
  }
});

test("neighbouring cells turn in opposite directions", () => {
  const size = 100;
  const tile = textureTile(20, size);
  const perCell = tile.length / 4;
  const heading = (l: Line) => Math.atan2(l.y2 - l.y1, l.x2 - l.x1);
  // The second square of each cell, relative to its outline.
  const turnOf = (cell: number) =>
    heading(tile[cell * perCell + 4]) - heading(tile[cell * perCell]);
  assert.ok(turnOf(0) > 0 && turnOf(3) > 0);
  assert.ok(turnOf(1) < 0 && turnOf(2) < 0);
});

test("angles outside the verified range are clamped", () => {
  assert.deepEqual(nestedSquares(1, 100), nestedSquares(MIN_ANGLE, 100));
  assert.deepEqual(nestedSquares(80, 100), nestedSquares(MAX_ANGLE, 100));
});

test("the texture renders as one path with a move per line", () => {
  const tile = textureTile(20, 100);
  assert.equal(linesPathOf(tile).match(/M/g)?.length, tile.length);
});

test("the texture changes with the degree", () => {
  assert.notEqual(
    linesPathOf(textureTile(19.5, 100)),
    linesPathOf(textureTile(20.5, 100)),
  );
});
