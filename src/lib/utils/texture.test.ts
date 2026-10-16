import assert from "node:assert/strict";
import test from "node:test";
import {
  ANCHOR,
  averageDegreeFor,
  BASE_DEGREE,
  calendarOf,
  CONTOUR_LEVELS,
  contourLines,
  DEGREE_RULES,
  degreeFor,
  degreeForCalendar,
  fieldAt,
  linesPathOf,
  MAX_ANGLE,
  MIN_ANGLE,
  MORPH_FROM,
  MORPH_TO,
  seasonOf,
  smootherstep,
  smoothWindow,
  textureAngle,
  textureMorph,
  texturePath,
  wavelengthFor,
  type CalendarContext,
  type FieldParams,
  type Point,
  type Polyline,
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

test("calendarOf reads continuous positions on the calendar anchored on 22 Aug", () => {
  // 16 Oct 2026 09:00 is a Friday, 24.375 days into the month that began on 22 Sep.
  const c = calendarOf(new Date(2026, 9, 16, 9));
  assert.ok(Math.abs(c.monthPos - 24.375) < 1e-9);
  assert.equal(c.monthLength, 30);
  assert.ok(Math.abs(c.yearMonth - (1 + 24.375 / 30)) < 1e-9);
  assert.ok(Math.abs(c.weekPos - 4.375) < 1e-9);
  assert.ok(Math.abs(c.hourPos - 9) < 1e-9);
  assert.equal(c.season, 3);
  // Samhain's noon is 15 days and 3 hours away.
  assert.ok(Math.abs(c.sabbatDistance - 15.125) < 1e-9);
  assert.ok(c.moonPhase >= 0 && c.moonPhase < 1);
  assert.ok(c.moonFraction >= 0 && c.moonFraction <= 1);
  // The anchor: the year begins at midnight on 22 Aug.
  assert.equal(ANCHOR.month, 8);
  assert.equal(ANCHOR.day, 22);
  assert.equal(calendarOf(new Date(2026, 7, 22)).yearMonth, 0);
  assert.equal(calendarOf(new Date(2026, 7, 22)).monthPos, 0);
  // The second before it is the very end of the year before.
  const before = calendarOf(new Date(2026, 7, 21, 23, 59, 59));
  assert.ok(before.yearMonth > 11.999 && before.yearMonth < 12);
  // Every month starts on the 22nd: 22 Dec begins month 4, and 1 Jan is 10 days in.
  assert.equal(calendarOf(new Date(2026, 11, 22)).yearMonth, 4);
  const newYear = calendarOf(new Date(2027, 0, 1));
  assert.equal(newYear.monthPos, 10);
  assert.ok(Math.abs(newYear.yearMonth - (4 + 10 / 31)) < 1e-9);
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
  // Months run 22nd to 21st, and the year runs 22 Aug to 21 Aug.
  assert.equal(weightAt("day <= 15", 2026, 9, 29, 12), 1); // 7.5 days into the month
  assert.equal(weightAt("day <= 15", 2026, 10, 13, 12), 0); // 22.5 days in
  assert.equal(weightAt("month <= 6", 2026, 10, 6, 12), 1); // month 3 of 12
  assert.equal(weightAt("month <= 6", 2027, 5, 6, 12), 0); // month 10
  assert.equal(weightAt("season <= 2", 2027, 1, 6, 12), 1); // month 6
  assert.equal(weightAt("season <= 2", 2027, 7, 6, 12), 0); // month 12
  assert.equal(weightAt("season >= 3", 2027, 7, 6, 12), 1);
  assert.equal(weightAt("season >= 3", 2026, 9, 6, 12), 1); // month 2
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
  // The steepest edge is the noon-and-midnight hour ramp, about 0.2° in ten
  // minutes. A step function would show up here as a jump of 1° or more.
  assert.ok(largest < 0.3, `largest ten-minute step ${largest.toFixed(4)}°`);
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
  // Day to day, the averaged degree moves less than half as much as the raw one.
  // (Anchoring on the 22nd puts the solstice and equinox Sabbats, which fall
  // on the 21st, on the day-of-month rule's rising edge, so they stack.)
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
    averaged < raw / 2,
    `raw ${raw.toFixed(2)}° vs averaged ${averaged.toFixed(2)}°`,
  );
  // A very short span is just the degree at that moment.
  const date = new Date(2026, 5, 10, 9);
  assert.ok(Math.abs(averageDegreeFor(date, 0.01) - degreeFor(date)) < 0.01);
});

test("the degree is varied: the year spans a wide range and most of the morph", () => {
  const dates = Array.from(
    { length: 365 },
    (_, d) => new Date(2026, 0, 1 + d, 9),
  );
  const averaged = dates.map((date) => averageDegreeFor(date, 7));
  const raw = dates.map((date) => degreeFor(date));
  const span = (v: number[]) => Math.max(...v) - Math.min(...v);
  // Even smoothed over a week, the degree sweeps more than 20° over the year.
  assert.ok(span(averaged) > 20, `averaged span ${span(averaged).toFixed(1)}°`);
  assert.ok(span(raw) > 30, `raw span ${span(raw).toFixed(1)}°`);
  // And that is most of the way from bands to loops.
  const morphs = averaged.map(textureMorph);
  assert.ok(
    Math.max(...morphs) - Math.min(...morphs) > 0.4,
    "morph barely changes",
  );
  // The spread is comfortably inside the range the texture can draw.
  assert.ok(
    Math.min(...raw) > MIN_ANGLE + 5 && Math.max(...raw) < MAX_ANGLE - 2,
  );
});

test("the degree agrees with its calendar and is a number on 29 Feb", () => {
  const date = new Date(2028, 1, 29, 12);
  assert.equal(degreeFor(date), degreeForCalendar(calendarOf(date)));
  assert.ok(Number.isFinite(degreeFor(date)));
});

const params = (degree: number, wavelength = 150): FieldParams => ({
  angle: textureAngle(degree),
  morph: textureMorph(degree),
  wavelength,
});

test("the degree is clamped to the safe range and sets the morph", () => {
  assert.equal(textureAngle(-5), MIN_ANGLE);
  assert.equal(textureAngle(80), MAX_ANGLE);
  assert.equal(textureAngle(33), 33);
  assert.equal(textureMorph(MORPH_FROM), 0);
  assert.equal(textureMorph(MORPH_TO), 1);
  assert.equal(textureMorph(-20), 0);
  assert.equal(textureMorph(99), 1);
  let previous = 0;
  for (let degree = MORPH_FROM; degree <= MORPH_TO; degree += 0.5) {
    assert.ok(textureMorph(degree) >= previous, "morph went backwards");
    previous = textureMorph(degree);
  }
});

test("the field stays within [-1, 1]", () => {
  for (const degree of [MIN_ANGLE, 17, 30, 44, 56, MAX_ANGLE]) {
    for (let x = -600; x <= 600; x += 47) {
      for (let y = -400; y <= 400; y += 53) {
        const f = fieldAt(x, y, params(degree));
        assert.ok(f >= -1 - 1e-12 && f <= 1 + 1e-12, `field ${f}`);
      }
    }
  }
});

test("a small change in the degree moves the field and its lines only a little", () => {
  // No tile, flip or switch anywhere: change the degree by a hair and every
  // point of the field, and every contour line, moves by a hair.
  const delta = 0.01;
  let worstField = 0;
  for (let degree = MIN_ANGLE; degree <= MAX_ANGLE; degree += 0.61) {
    for (let x = -640; x <= 640; x += 71) {
      for (let y = -400; y <= 400; y += 67) {
        const change = Math.abs(
          fieldAt(x, y, params(degree + delta)) - fieldAt(x, y, params(degree)),
        );
        worstField = Math.max(worstField, change);
      }
    }
  }
  assert.ok(worstField < 0.01, `largest field change per 0.01°: ${worstField}`);
  // The lines found at one degree still lie on their level at the next.
  for (const degree of [17, 30, 44, 56]) {
    let off = 0;
    for (const line of contourLines(640, 400, params(degree))) {
      for (const p of line.points) {
        off = Math.max(
          off,
          Math.abs(fieldAt(p.x, p.y, params(degree + delta)) - line.level),
        );
      }
    }
    assert.ok(
      off < 0.06,
      `degree ${degree}: lines drifted ${off} from their level`,
    );
  }
});

/** Every straight segment of the lines, with the line it came from. */
function segmentsOf(lines: Polyline[]) {
  return lines.flatMap((line, owner) => {
    const n = line.points.length;
    const count = line.closed ? n : n - 1;
    return Array.from({ length: count }, (_, k) => ({
      a: line.points[k],
      b: line.points[(k + 1) % n],
      owner,
    }));
  });
}

const sideOf = (a: Point, b: Point, c: Point) => {
  const cross = (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
  return Math.abs(cross) < 1e-9 ? 0 : Math.sign(cross);
};
const crosses = (p: Point, q: Point, r: Point, s: Point) =>
  sideOf(p, q, r) * sideOf(p, q, s) < 0 &&
  sideOf(r, s, p) * sideOf(r, s, q) < 0;
const sameSpot = (p: Point, q: Point) =>
  Math.hypot(p.x - q.x, p.y - q.y) < 1e-6;

test("no two contour lines ever cross, at any degree in the range", () => {
  for (const degree of [MIN_ANGLE, 17, 30, 44, 56, MAX_ANGLE]) {
    const segments = segmentsOf(contourLines(480, 320, params(degree)));
    assert.ok(
      segments.length > 100,
      `degree ${degree}: only ${segments.length} segments`,
    );
    for (let i = 0; i < segments.length; i++) {
      for (let j = i + 1; j < segments.length; j++) {
        const s = segments[i];
        const t = segments[j];
        // Neighbouring segments of a line meet at an end; that is not a crossing.
        if (
          sameSpot(s.a, t.a) ||
          sameSpot(s.a, t.b) ||
          sameSpot(s.b, t.a) ||
          sameSpot(s.b, t.b)
        )
          continue;
        assert.ok(
          !crosses(s.a, s.b, t.a, t.b),
          `degree ${degree}: two lines cross`,
        );
      }
    }
  }
});

test("every contour line sits on its level and the levels are all used", () => {
  const lines = contourLines(640, 400, params(30));
  const used = new Set<number>();
  for (const line of lines) {
    used.add(line.level);
    assert.ok(CONTOUR_LEVELS.includes(line.level));
    for (const p of line.points) {
      assert.ok(
        Math.abs(fieldAt(p.x, p.y, params(30)) - line.level) < 0.06,
        "point off its level",
      );
    }
  }
  assert.equal(used.size, CONTOUR_LEVELS.length);
  assert.ok(
    !CONTOUR_LEVELS.includes(0),
    "level 0 passes through the lattice's saddles",
  );
});

test("closed lines have enough points and open lines run off the window", () => {
  const [width, height] = [640, 400];
  for (const line of contourLines(width, height, params(34))) {
    assert.ok(line.points.length >= (line.closed ? 3 : 2));
    if (!line.closed) {
      // An open line's two ends are on the edge of the grid, past the window.
      for (const end of [line.points[0], line.points.at(-1)!]) {
        const outside =
          Math.abs(end.x) >= width / 2 - 1e-6 ||
          Math.abs(end.y) >= height / 2 - 1e-6;
        assert.ok(outside, "open line ends inside the window");
      }
    }
  }
});

test("the texture covers the whole window", () => {
  const [width, height] = [900, 600];
  for (const degree of [17, 30, 56]) {
    const points = contourLines(
      width,
      height,
      params(degree, wavelengthFor(width)),
    ).flatMap((l) => l.points);
    // Every one of a 3x3 set of regions has lines running through it.
    for (const cx of [-1, 0, 1]) {
      for (const cy of [-1, 0, 1]) {
        const near = points.some(
          (p) =>
            Math.abs(p.x - (cx * width) / 3) < width / 6 &&
            Math.abs(p.y - (cy * height) / 3) < height / 6,
        );
        assert.ok(near, `degree ${degree}: nothing near region ${cx},${cy}`);
      }
    }
  }
});

test("the texture path is finite, one move per line, and changes with the degree", () => {
  const lines = contourLines(500, 300, params(30));
  const d = linesPathOf(lines);
  assert.ok(!/NaN|Infinity/.test(d));
  assert.equal(d.match(/M/g)?.length, lines.length);
  assert.equal(d.match(/Z/g)?.length, lines.filter((l) => l.closed).length);
  assert.notEqual(texturePath(500, 300, 30), texturePath(500, 300, 31));
  assert.equal(texturePath(500, 300, -5), texturePath(500, 300, MIN_ANGLE));
});

test("the wavelength follows the window width within bounds", () => {
  assert.equal(wavelengthFor(200), 140);
  assert.equal(wavelengthFor(10000), 220);
  assert.equal(wavelengthFor(1200), 160);
});
