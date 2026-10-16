import assert from "node:assert/strict";
import test from "node:test";
import {
  ARC_SPACING,
  arcPoint,
  arcsPathOf,
  BASE_DEGREE,
  BLEND_BAND,
  calendarOf,
  cellHash,
  DEGREE_RULES,
  degreeFor,
  averageDegreeFor,
  degreeForCalendar,
  flipShare,
  MAX_ANGLE,
  MIN_ANGLE,
  seasonOf,
  smootherstep,
  smoothWindow,
  textureAngle,
  textureLayers,
  tileArcs,
  tileWeight,
  type Arc,
  type CalendarContext,
} from "./texture.ts";
import { getMoonCycle, getMoonIllumination } from "./moonPhase.ts";

const rule = (label: string) => {
  const found = DEGREE_RULES.find((r) => r.label === label);
  assert.ok(found, `no rule "${label}"`);
  return found;
};
/** The weight of a rule at a local date and time. */
const weightAt = (
  label: string,
  ...when: [number, number, number, number?, number?]
) => rule(label).weight(calendarOf(new Date(...when)));

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

test("smootherstep eases between 0 and 1 with flat ends", () => {
  assert.equal(smootherstep(-1), 0);
  assert.equal(smootherstep(0), 0);
  assert.equal(smootherstep(0.5), 0.5);
  assert.equal(smootherstep(1), 1);
  assert.equal(smootherstep(2), 1);
  // Slope and curvature vanish at both ends (checked by finite differences).
  const h = 1e-4;
  for (const t of [0, 1]) {
    const slope = (smootherstep(t + h) - smootherstep(t - h)) / (2 * h);
    assert.ok(Math.abs(slope) < 1e-6, `slope at ${t}: ${slope}`);
  }
  let previous = 0;
  for (let t = 0; t <= 1; t += 0.01) {
    assert.ok(smootherstep(t) >= previous - 1e-12, "not monotonic");
    previous = smootherstep(t);
  }
});

test("a smooth window is 1 inside, 0 outside, and eases across its edges", () => {
  // The window [0, 6) of a 12-long cycle, softened over 1.
  const w = (x: number) => smoothWindow(x, 0, 6, 1, 12);
  assert.equal(w(3), 1);
  assert.equal(w(9), 0);
  assert.equal(w(0), 0.5);
  assert.equal(w(6), 0.5);
  assert.ok(w(0.25) > 0.5 && w(0.25) < 1);
  // Half-period windows used to be the hard case: no jump anywhere, wrap included.
  let max = 0;
  for (let x = -1; x < 13; x += 0.001)
    max = Math.max(max, Math.abs(w(x + 0.001) - w(x)));
  assert.ok(max < 0.01, `largest step ${max}`);
});

test("windows that meet add up to exactly 1, so swapping them never jumps", () => {
  for (let x = 0; x < 12; x += 0.037) {
    const sum =
      smoothWindow(x, 2, 8, 0.7, 12) + smoothWindow(x, 8, 14, 0.7, 12);
    assert.ok(Math.abs(sum - 1) < 1e-9, `season windows at ${x}: ${sum}`);
  }
  for (let x = 0; x < 24; x += 0.1) {
    const sum = smoothWindow(x, 0, 12, 4, 24) + smoothWindow(x, 12, 24, 4, 24);
    assert.ok(Math.abs(sum - 1) < 1e-9, `hour windows at ${x}: ${sum}`);
  }
  for (let x = 0; x < 1; x += 0.003) {
    const sum =
      smoothWindow(x, 0, 0.5, 0.1, 1) + smoothWindow(x, 0.5, 1, 0.1, 1);
    assert.ok(Math.abs(sum - 1) < 1e-9, `moon windows at ${x}: ${sum}`);
  }
});

test("calendarOf reads continuous positions from the date", () => {
  // 16 Oct 2026 is a Friday; 09:00 is 0.375 of a day.
  const c = calendarOf(new Date(2026, 9, 16, 9));
  assert.ok(Math.abs(c.monthPos - 15.375) < 1e-9);
  assert.equal(c.monthLength, 31);
  assert.ok(Math.abs(c.yearMonth - (9 + 15.375 / 31)) < 1e-9);
  assert.ok(Math.abs(c.weekPos - 4.375) < 1e-9);
  assert.ok(Math.abs(c.hourPos - 9) < 1e-9);
  assert.equal(c.season, 3);
  // Samhain's noon is 15 days and 3 hours away.
  assert.ok(Math.abs(c.sabbatDistance - 15.125) < 1e-9);
  assert.ok(c.moonPhase >= 0 && c.moonPhase < 1);
  assert.ok(c.moonFraction >= 0 && c.moonFraction <= 1);
  // Monday starts the week and Sunday ends it.
  assert.ok(Math.abs(calendarOf(new Date(2026, 9, 12)).weekPos) < 1e-9);
  assert.ok(
    Math.abs(calendarOf(new Date(2026, 9, 18, 12)).weekPos - 6.5) < 1e-9,
  );
});

test("the moon cycle moves steadily and never jumps at new or full moon", () => {
  const start = new Date(2026, 0, 1).getTime();
  const step = 10 * 60 * 1000;
  let previous = getMoonCycle(new Date(start));
  let largest = 0;
  for (let k = 1; k < 400 * 144; k++) {
    const phase = getMoonCycle(new Date(start + k * step));
    // The cycle wraps from 1 back to 0 once a month.
    const advance = (((phase - previous) % 1) + 1) % 1;
    largest = Math.max(largest, Math.abs(advance - 1 / (29.53 * 144)));
    previous = phase;
  }
  // One lunar month is 29.5 days, about 0.00023 of a cycle per ten minutes.
  assert.ok(
    largest < 0.0003,
    `largest deviation from steady motion ${largest}`,
  );
  // It agrees with the illumination: full moon at 0.5, new at 0 or 1.
  for (let k = 0; k < 300; k++) {
    const date = new Date(start + k * 7 * 3600 * 1000);
    const phase = getMoonCycle(date);
    const lit = (1 - Math.cos(2 * Math.PI * phase)) / 2;
    assert.ok(
      Math.abs(lit - getMoonIllumination(date).fraction) < 0.06,
      `phase ${phase}`,
    );
  }
});

test("each rule keeps its original meaning in the middle of its window", () => {
  assert.equal(weightAt("day <= 15", 2026, 2, 8, 12), 1);
  assert.equal(weightAt("day <= 15", 2026, 2, 23, 12), 0);
  assert.equal(weightAt("month <= 6", 2026, 2, 15, 12), 1);
  assert.equal(weightAt("month <= 6", 2026, 8, 15, 12), 0);
  assert.equal(weightAt("season <= 2", 2026, 5, 15, 12), 1);
  assert.equal(weightAt("season >= 3", 2026, 10, 15, 12), 1);
  assert.equal(weightAt("season >= 3", 2026, 0, 15, 12), 1);
  assert.equal(weightAt("weekday = Monday", 2026, 9, 12, 12), 1);
  assert.equal(weightAt("weekday = Monday", 2026, 9, 16, 12), 0);
  assert.equal(weightAt("weekday >= 6", 2026, 9, 17, 12), 1);
  assert.equal(weightAt("weekday >= 6", 2026, 9, 14, 12), 0);
  assert.equal(weightAt("hour < 12", 2026, 9, 16, 9), 1);
  assert.equal(weightAt("hour < 12", 2026, 9, 16, 15), 0);
  assert.equal(weightAt("hour >= 12", 2026, 9, 16, 15), 1);
  assert.equal(weightAt("sabbat day", 2026, 9, 31, 12), 1);
  assert.equal(weightAt("sabbat day", 2026, 9, 25, 12), 0);
  // Moon rules read the phase and light directly.
  const moon = (moonPhase: number, moonFraction: number) =>
    ({
      ...calendarOf(new Date(2026, 9, 16)),
      moonPhase,
      moonFraction,
    }) as CalendarContext;
  assert.equal(rule("moon waxing").weight(moon(0.25, 0.5)), 1);
  assert.equal(rule("moon waning").weight(moon(0.75, 0.5)), 1);
  assert.equal(rule("full moon").weight(moon(0.5, 1)), 1);
  assert.equal(rule("full moon").weight(moon(0.25, 0.5)), 0);
});

test("a rule's weight and its opposite always add up to 1", () => {
  for (let i = 0; i < 400; i++) {
    const date = new Date(2026, 0, 1, 0, i * 1307);
    const c = calendarOf(date);
    const pair = (a: string, b: string) =>
      rule(a).weight(c) + rule(b).weight(c);
    assert.ok(Math.abs(pair("season <= 2", "season >= 3") - 1) < 1e-9);
    assert.ok(Math.abs(pair("hour < 12", "hour >= 12") - 1) < 1e-9);
    assert.ok(Math.abs(pair("moon waxing", "moon waning") - 1) < 1e-9);
  }
});

test("the degree never jumps: it moves smoothly through a whole year", () => {
  // Sample every ten minutes through 2026 and look at the largest step.
  const start = new Date(2026, 0, 1).getTime();
  const step = 10 * 60 * 1000;
  let previous = calendarOf(new Date(start));
  let previousDegree = degreeForCalendar(previous);
  let largest = 0;
  for (let k = 1; k < 365 * 144; k++) {
    const c = calendarOf(new Date(start + k * step));
    const degree = degreeForCalendar(c);
    // A clock change moves the wall clock by an hour; skip that one step.
    const clockStep = (((c.hourPos - previous.hourPos) % 24) + 24) % 24;
    if (Math.abs(clockStep - 1 / 6) < 1e-6) {
      largest = Math.max(largest, Math.abs(degree - previousDegree));
    }
    previous = c;
    previousDegree = degree;
  }
  // The steepest edge is the noon-and-midnight hour ramp, about 0.08° in ten
  // minutes. A step function would show up here as a jump of 0.5° or more.
  assert.ok(largest < 0.1, `largest ten-minute step ${largest.toFixed(4)}°`);
});

test("the degree stays between the rules' lowest and highest sums", () => {
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
  for (let i = 0; i < 800; i++) {
    const degree = degreeFor(new Date(2026, 0, 1, 0, i * 659));
    assert.ok(
      degree >= lowest - 1e-9 && degree <= highest + 1e-9,
      `degree ${degree}`,
    );
  }
});

test("a week's average cancels the weekly rhythm but keeps the slow drift", () => {
  // The weekday rules, averaged over exactly 7 days, give the same value
  // whichever day the week starts on.
  const mean = (label: string, start: Date) => {
    const steps = 28;
    let sum = 0;
    for (let k = 0; k <= steps; k++) {
      const when = new Date(start.getTime() + (k / steps) * 7 * 86_400_000);
      sum +=
        rule(label).weight(calendarOf(when)) *
        (k === 0 || k === steps ? 0.5 : 1);
    }
    return sum / steps;
  };
  for (const label of ["weekday = Monday", "weekday >= 6"]) {
    const values = Array.from({ length: 7 }, (_, d) =>
      mean(label, new Date(2026, 5, 1 + d, 9)),
    );
    assert.ok(
      Math.max(...values) - Math.min(...values) < 0.01,
      `${label}: ${values}`,
    );
  }
  // Day to day, the averaged degree moves several times less than the raw one.
  const rms = (f: (d: Date) => number) => {
    const v = Array.from({ length: 365 }, (_, d) =>
      f(new Date(2026, 0, 1 + d, 9)),
    );
    const steps = v.slice(1).map((x, i) => x - v[i]);
    return Math.sqrt(steps.reduce((a, b) => a + b * b, 0) / steps.length);
  };
  const raw = rms(degreeFor);
  const averaged = rms((d) => averageDegreeFor(d, 7));
  assert.ok(
    averaged < raw / 3,
    `raw ${raw.toFixed(2)}° vs averaged ${averaged.toFixed(2)}°`,
  );
  // A very short span is just the degree at that moment.
  const date = new Date(2026, 5, 10, 9);
  assert.ok(Math.abs(averageDegreeFor(date, 0.01) - degreeFor(date)) < 0.01);
});

test("the degree agrees with its calendar and is a number on 29 Feb", () => {
  const date = new Date(2028, 1, 29, 12);
  assert.equal(degreeFor(date), degreeForCalendar(calendarOf(date)));
  assert.ok(Number.isFinite(degreeFor(date)));
});

test("tile weights ease from plain to flipped as the share passes a tile", () => {
  assert.equal(tileWeight(0.5, 0.5 - BLEND_BAND), 0);
  assert.equal(tileWeight(0.5, 0.5 + BLEND_BAND), 1);
  assert.equal(tileWeight(0.5, 0.5), 0.5);
  let max = 0;
  let previous = tileWeight(0.4, 0);
  for (let share = 0.001; share <= 1; share += 0.001) {
    const w = tileWeight(0.4, share);
    assert.ok(w >= previous - 1e-12, "weight went backwards");
    max = Math.max(max, w - previous);
    previous = w;
  }
  assert.ok(max < 0.03, `largest step per 0.001 of share ${max}`);
});

test("the mean tile weight follows the flip share, and each fade keeps its strength", () => {
  for (const share of [0.25, 0.5, 0.75]) {
    let sum = 0;
    const n = 100;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) sum += tileWeight(cellHash(i, j), share);
    }
    assert.ok(Math.abs(sum / (n * n) - share) < 0.03, `share ${share}`);
  }
  const { fades } = textureLayers(900, 600, 80, 21);
  assert.ok(fades.length > 0 && fades.length % 2 === 0);
  for (let k = 0; k < fades.length; k += 2) {
    const total = fades[k].opacity + fades[k + 1].opacity;
    assert.ok(Math.abs(total - 1) < 1e-9, `fade ${k / 2} sums to ${total}`);
  }
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
    const layers = textureLayers(width, height, size, degree);
    const arcs = [...layers.solid, ...layers.fades.flatMap((f) => f.arcs)];
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
  const draw = (degree: number) => {
    const layers = textureLayers(600, 400, 80, degree);
    return (
      arcsPathOf(layers.solid) +
      layers.fades
        .map((f) => f.opacity.toFixed(4) + arcsPathOf(f.arcs))
        .join("")
    );
  };
  assert.notEqual(draw(19.5), draw(20.5));
});

test("the texture renders as one path with an arc per arc", () => {
  const arcs = tileArcs(SIZE, 0, 0, false);
  const d = arcsPathOf(arcs);
  assert.equal(d.match(/M/g)?.length, arcs.length);
  assert.equal(d.match(/A/g)?.length, arcs.length);
});
