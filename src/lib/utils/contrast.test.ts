import assert from "node:assert/strict";
import test from "node:test";
import {
  AA,
  AA_LARGE,
  INK_B_FILL_LIGHT,
  INK_FILL_LIGHT,
  INK_LIGHT,
  INK_SOFT_DARK,
  ON_INK_DARK,
  ON_INK_LIGHT,
  PAPER,
  PAPER_DARK,
  PAPER_DEEP,
  PAPER_DEEP_DARK,
  contrastRatio,
  darkFillLightness,
  darkTextLightness,
  lightTextLightness,
  wcagLuminance,
} from "./contrast.ts";

const WHEEL: number[] = [];
for (let hue = 0; hue < 360; hue += 3) WHEEL.push(hue);
/** Spot inks sit ~150° apart, so the second plate rides hue + 150. */
const hueB = (hue: number) => (hue + 150) % 360;

test("the colour math anchors correctly", () => {
  assert.equal(contrastRatio(1, 0), 21);
  assert.ok(Math.abs(wcagLuminance(1, 0, 260) - 1) < 1e-6);
  // sRGB red, whose relative luminance is the 0.2126 coefficient itself. Only
  // true if the weights are applied to linear (not gamma-encoded) channels.
  assert.ok(
    Math.abs(wcagLuminance(0.627955, 0.257683, 29.2339) - 0.2126) < 1e-3,
  );
});

test("solved light ink text clears AA on newsprint at every hue", () => {
  for (const hue of WHEEL) {
    const lightness = lightTextLightness(hue, 0.2);
    const ratio = contrastRatio(
      wcagLuminance(lightness, 0.2, hue),
      wcagLuminance(PAPER.lightness, PAPER.chroma, hue),
    );
    assert.ok(
      ratio >= AA,
      `hue ${hue}: riso-a-text ${ratio.toFixed(2)} < ${AA}`,
    );
    assert.ok(
      lightness <= 0.55 + 1e-9,
      `hue ${hue}: riso-a-text lightness ${lightness} exceeds cap`,
    );
  }
});

test("solved second-plate text clears the large-text ratio at every hue", () => {
  for (const hue of WHEEL) {
    const lightness = lightTextLightness(
      hueB(hue),
      0.12,
      PAPER,
      AA_LARGE,
      0.62,
    );
    const ratio = contrastRatio(
      wcagLuminance(lightness, 0.12, hueB(hue)),
      wcagLuminance(PAPER.lightness, PAPER.chroma, hueB(hue)),
    );
    assert.ok(
      ratio >= AA_LARGE,
      `hue ${hue}: riso-b-text ${ratio.toFixed(2)} < ${AA_LARGE}`,
    );
  }
});

test("solved muted ink clears AA at every hue", () => {
  for (const hue of WHEEL) {
    const lightness = lightTextLightness(hue, 0.03, PAPER, AA, 0.4);
    const ratio = contrastRatio(
      wcagLuminance(lightness, 0.03, hue),
      wcagLuminance(PAPER.lightness, PAPER.chroma, hue),
    );
    assert.ok(
      ratio >= AA,
      `hue ${hue}: ink-soft ${ratio.toFixed(2)} < ${AA}`,
    );
  }
});

test("solved dark-mode ink text clears AA on black stock at every hue", () => {
  for (const hue of WHEEL) {
    const lightness = darkTextLightness(hue, 0.2);
    const ratio = contrastRatio(
      wcagLuminance(lightness, 0.2, hue),
      wcagLuminance(PAPER_DARK.lightness, PAPER_DARK.chroma, hue),
    );
    assert.ok(
      ratio >= AA,
      `hue ${hue}: dark riso-a-text ${ratio.toFixed(2)} < ${AA}`,
    );
  }
});

test("solved dark-mode ink fills carry on-ink text at AA at every hue", () => {
  for (const hue of WHEEL) {
    for (const [plate, chroma] of [
      [hue, 0.2],
      [hueB(hue), 0.15],
    ] as const) {
      const fill = darkFillLightness(plate, chroma);
      const fg = wcagLuminance(
        ON_INK_DARK.lightness,
        ON_INK_DARK.chroma,
        plate,
      );
      const ratio = contrastRatio(fg, wcagLuminance(fill, chroma, plate));
      assert.ok(
        ratio >= AA,
        `hue ${plate}: dark fill ${ratio.toFixed(2)} < ${AA}`,
      );
    }
  }
});

test("fixed light-mode pairs clear AA at every hue", () => {
  for (const hue of WHEEL) {
    // Spine nav: --on-ink on the --riso-a fill.
    let r = contrastRatio(
      wcagLuminance(ON_INK_LIGHT.lightness, ON_INK_LIGHT.chroma, hue),
      wcagLuminance(INK_FILL_LIGHT.lightness, INK_FILL_LIGHT.chroma, hue),
    );
    assert.ok(r >= AA, `hue ${hue}: spine ${r.toFixed(2)} < ${AA}`);
    // Tapes, chips and hover states: --on-ink on the --riso-b fill.
    r = contrastRatio(
      wcagLuminance(ON_INK_LIGHT.lightness, ON_INK_LIGHT.chroma, hueB(hue)),
      wcagLuminance(
        INK_B_FILL_LIGHT.lightness,
        INK_B_FILL_LIGHT.chroma,
        hueB(hue),
      ),
    );
    assert.ok(r >= AA, `hue ${hue}: tape ${r.toFixed(2)} < ${AA}`);
    // Footer body: --ink on --paper-deep.
    r = contrastRatio(
      wcagLuminance(INK_LIGHT.lightness, INK_LIGHT.chroma, hue),
      wcagLuminance(PAPER_DEEP.lightness, PAPER_DEEP.chroma, hue),
    );
    assert.ok(r >= AA, `hue ${hue}: ink on paper-deep ${r.toFixed(2)} < ${AA}`);
  }
});

test("fixed dark-mode pairs clear AA at every hue", () => {
  for (const hue of WHEEL) {
    // Footer body: --ink on --paper-deep.
    let r = contrastRatio(
      wcagLuminance(0.95, 0.015, hue),
      wcagLuminance(PAPER_DEEP_DARK.lightness, PAPER_DEEP_DARK.chroma, hue),
    );
    assert.ok(
      r >= AA,
      `hue ${hue}: dark ink on paper-deep ${r.toFixed(2)} < ${AA}`,
    );
    // Muted footer copy: --ink-soft on --paper-deep.
    r = contrastRatio(
      wcagLuminance(INK_SOFT_DARK.lightness, INK_SOFT_DARK.chroma, hue),
      wcagLuminance(PAPER_DEEP_DARK.lightness, PAPER_DEEP_DARK.chroma, hue),
    );
    assert.ok(
      r >= AA,
      `hue ${hue}: dark ink-soft on paper-deep ${r.toFixed(2)} < ${AA}`,
    );
  }
});

test("solved dark-mode second-plate and stamp text clear their ratios", () => {
  for (const hue of WHEEL) {
    for (const [plate, chroma, target, floor, cap] of [
      [hueB(hue), 0.15, AA_LARGE, 0.45, 0.72],
      [hue, 0.1, AA, 0.4, 0.7],
    ] as const) {
      const lightness = darkTextLightness(
        plate,
        chroma,
        PAPER_DARK,
        target,
        floor,
        cap,
      );
      const ratio = contrastRatio(
        wcagLuminance(lightness, chroma, plate),
        wcagLuminance(PAPER_DARK.lightness, PAPER_DARK.chroma, plate),
      );
      assert.ok(
        ratio >= target,
        `hue ${plate}: dark text ${ratio.toFixed(2)} < ${target}`,
      );
    }
  }
});
