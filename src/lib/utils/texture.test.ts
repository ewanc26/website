import assert from "node:assert/strict";
import test from "node:test";
import {
  ARC_SPACING,
  arcPoint,
  arcsPathOf,
  BASE_DEGREE,
  calendarOf,
  cellHash,
  DEGREE_RULES,
  degreeFor,
  degreeForCalendar,
  flipShare,
  MAX_ANGLE,
  MIN_ANGLE,
  seasonOf,
  textureAngle,
  textureArcs,
  tileArcs,
  type Arc,
  type CalendarContext,
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

test("the degree is clamped to the safe range and sets the flip share", () => {
  assert.equal(textureAngle(1), MIN_ANGLE);
  assert.equal(textureAngle(80), MAX_ANGLE);
  assert.equal(flipShare(MIN_ANGLE), 0);
  assert.equal(flipShare(MAX_ANGLE), 1);
  assert.ok(flipShare(19.5) < flipShare(20.5));
});

test("tile hashes are deterministic and spread evenly", () => {
  assert.equal(cellHash(3, -7), cellHash(3, -7));
  assert.notEqual(cellHash(3, -7), cellHash(-7, 3));
  let sum = 0;
  const n = 100;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const h = cellHash(i - 50, j - 50);
      assert.ok(h >= 0 && h < 1);
      sum += h;
    }
  }
  assert.ok(Math.abs(sum / (n * n) - 0.5) < 0.02, `mean ${sum / (n * n)}`);
});

test("the share of flipped tiles follows the degree", () => {
  for (const share of [0.25, 0.5, 0.75]) {
    let flipped = 0;
    const n = 100;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) if (cellHash(i, j) < share) flipped++;
    }
    assert.ok(Math.abs(flipped / (n * n) - share) < 0.03, `share ${share}`);
  }
});

const SIZE = 100;
const ends = (arc: Arc) => [arcPoint(arc, arc.a0), arcPoint(arc, arc.a1)];

test("every arc leaves a tile at one of three points on its edges", () => {
  const allowed = [0.5 - ARC_SPACING, 0.5, 0.5 + ARC_SPACING].map(
    (f) => f * SIZE,
  );
  const x0 = 2 * SIZE;
  const y0 = -3 * SIZE;
  for (const flipped of [false, true]) {
    const arcs = tileArcs(SIZE, 2, -3, flipped);
    assert.equal(arcs.length, 6);
    for (const arc of arcs) {
      for (const { x, y } of ends(arc)) {
        const onVertical =
          Math.abs(x - x0) < 1e-9 || Math.abs(x - x0 - SIZE) < 1e-9;
        const onHorizontal =
          Math.abs(y - y0) < 1e-9 || Math.abs(y - y0 - SIZE) < 1e-9;
        assert.ok(onVertical !== onHorizontal, "arc end is not on an edge");
        const along = onVertical ? y - y0 : x - x0;
        assert.ok(
          allowed.some((a) => Math.abs(a - along) < 1e-9),
          `arc leaves at ${along}`,
        );
      }
    }
  }
});

/** A block of tiles with a mix of flips, as the texture would draw. */
function block(columns: number, rows: number, share: number) {
  const tiles: { i: number; j: number; arcs: Arc[] }[] = [];
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < columns; i++) {
      tiles.push({ i, j, arcs: tileArcs(SIZE, i, j, cellHash(i, j) < share) });
    }
  }
  return tiles;
}

test("arcs join up across every tile edge, so curves run on unbroken", () => {
  for (const share of [0, 0.5, 1]) {
    const columns = 8;
    const rows = 8;
    const counts = new Map<string, number>();
    for (const { arcs } of block(columns, rows, share)) {
      for (const arc of arcs) {
        for (const { x, y } of ends(arc)) {
          const key = `${x.toFixed(6)},${y.toFixed(6)}`;
          counts.set(key, (counts.get(key) ?? 0) + 1);
        }
      }
    }
    for (const [key, count] of counts) {
      const [x, y] = key.split(",").map(Number);
      const outside =
        Math.abs(x) < 1e-6 ||
        Math.abs(y) < 1e-6 ||
        Math.abs(x - columns * SIZE) < 1e-6 ||
        Math.abs(y - rows * SIZE) < 1e-6;
      // Inside the block every end meets exactly one other; on its rim, none.
      assert.equal(
        count,
        outside ? 1 : 2,
        `share ${share}: end ${key} met ${count}`,
      );
    }
  }
});

const sample = (arc: Arc, steps: number) =>
  Array.from({ length: steps + 1 }, (_, k) =>
    arcPoint(arc, arc.a0 + ((arc.a1 - arc.a0) * k) / steps),
  );

type Point = { x: number; y: number };

const side = (a: Point, b: Point, c: Point) => {
  const cross = (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
  return Math.abs(cross) < 1e-9 ? 0 : Math.sign(cross);
};

function pointToSegment(p: Point, a: Point, b: Point) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const t = Math.max(
    0,
    Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy)),
  );
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
}

/** Distance between two segments; 0 if they cross. */
function segmentDistance(a: Point, b: Point, c: Point, d: Point) {
  if (side(a, b, c) * side(a, b, d) < 0 && side(c, d, a) * side(c, d, b) < 0) {
    return 0;
  }
  return Math.min(
    pointToSegment(a, c, d),
    pointToSegment(b, c, d),
    pointToSegment(c, a, b),
    pointToSegment(d, a, b),
  );
}

/** Closest approach of two arcs, drawn as polylines. */
function arcDistance(p: Arc, q: Arc) {
  const a = sample(p, 12);
  const b = sample(q, 12);
  let min = Infinity;
  for (let i = 0; i < a.length - 1; i++) {
    for (let j = 0; j < b.length - 1; j++) {
      min = Math.min(min, segmentDistance(a[i], a[i + 1], b[j], b[j + 1]));
    }
  }
  return min;
}

const sharesEnd = (p: Arc, q: Arc) =>
  ends(p).some((a) =>
    ends(q).some((b) => Math.hypot(a.x - b.x, a.y - b.y) < 1e-6),
  );

test("no two arcs cross or come near each other except where they join", () => {
  const gap = 0.05 * SIZE;
  for (const share of [0, 0.5, 1]) {
    const tiles = block(6, 6, share);
    for (const a of tiles) {
      for (const b of tiles) {
        if (b.j < a.j || (b.j === a.j && b.i < a.i)) continue;
        if (Math.abs(a.i - b.i) > 1 || Math.abs(a.j - b.j) > 1) continue;
        for (const p of a.arcs) {
          for (const q of b.arcs) {
            if (p === q || sharesEnd(p, q)) continue;
            assert.ok(
              arcDistance(p, q) > gap,
              `share ${share}: arcs come within ${gap}`,
            );
          }
        }
      }
    }
  }
});

test("the texture covers the whole window at any tilt", () => {
  const [width, height, size] = [1280, 800, 90];
  for (const degree of [MIN_ANGLE, 19.5, 26, MAX_ANGLE]) {
    const arcs = textureArcs(width, height, size, degree);
    const xs = arcs.map((a) => a.cx);
    const ys = arcs.map((a) => a.cy);
    const theta = (textureAngle(degree) * Math.PI) / 180;
    // Map each window corner back into the texture's own, untilted frame.
    for (const [cx, cy] of [
      [-width / 2, -height / 2],
      [width / 2, -height / 2],
      [width / 2, height / 2],
      [-width / 2, height / 2],
    ]) {
      const x = cx * Math.cos(theta) + cy * Math.sin(theta);
      const y = -cx * Math.sin(theta) + cy * Math.cos(theta);
      assert.ok(
        x > Math.min(...xs) && x < Math.max(...xs),
        `degree ${degree}: x`,
      );
      assert.ok(
        y > Math.min(...ys) && y < Math.max(...ys),
        `degree ${degree}: y`,
      );
    }
  }
});

test("the texture changes with the degree", () => {
  assert.notEqual(
    arcsPathOf(textureArcs(600, 400, 80, 19.5)),
    arcsPathOf(textureArcs(600, 400, 80, 20.5)),
  );
});

test("the texture renders as one path with an arc per arc", () => {
  const arcs = tileArcs(SIZE, 0, 0, false);
  const d = arcsPathOf(arcs);
  assert.equal(d.match(/M/g)?.length, arcs.length);
  assert.equal(d.match(/A/g)?.length, arcs.length);
});
