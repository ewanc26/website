/**
 * Seasonal colour theme engine.
 *
 * The colour calculations themselves live in the client-safe theme utility so
 * server-rendered CSS and interactive previews cannot drift apart; the
 * WCAG-aware lightness solving on top of them lives in the likewise
 * client-safe contrast utility.
 */

import chroma from "chroma-js";
import { getCurrentSabbat } from "$lib/utils/sabbats";
import { getMoonPhase } from "$lib/utils/moonPhase";
import {
  AA,
  AA_LARGE,
  INK_B_FILL_LIGHT,
  INK_B_TEXT_DARK,
  INK_FILL_LIGHT,
  INK_LIGHT,
  ON_INK_DARK,
  ON_INK_LIGHT,
  PAPER,
  PAPER_DARK,
  PAPER_DEEP,
  PAPER_DEEP_DARK,
  darkFillLightness,
  darkTextLightness,
  lightTextLightness,
} from "$lib/utils/contrast";
import {
  baseline,
  getSabbatContext,
  getThemeHue,
  getThemeShade,
  type Baseline,
  type Scale,
} from "$lib/utils/theme";

export {
  baseline,
  getCurrentPrimaryShade,
  getHueRotation,
  getTargetHues,
} from "$lib/utils/theme";
export type { Baseline, ModeColors, Scale } from "$lib/utils/theme";

export function getDynamicThemeCSS(now: Date = new Date()): string {
  const { prev, next, progress } = getSabbatContext(now);
  const currentSabbat = getCurrentSabbat(now);
  const moon = getMoonPhase(now);

  // Calculate year progress (0-1) for overall shifting
  const yearStart = new Date(now.getFullYear(), 0, 1);
  const yearEnd = new Date(now.getFullYear() + 1, 0, 1);
  const yearProgress =
    (now.getTime() - yearStart.getTime()) /
    (yearEnd.getTime() - yearStart.getTime());

  let css = "  :root {\n";

  Object.entries(baseline).forEach(([name, shades]) => {
    css += `    /* ── ${name.toUpperCase()} (Transitioning from ${prev.name} to ${next.name}) ── */\n`;
    const targetHue = getThemeHue(now, name as keyof Baseline);

    Object.entries(shades as Scale).forEach(([step, modes]) => {
      const [lL, lC] = modes.light;
      const [dL, dC] = modes.dark;

      const lightValue = `oklch(${(lL * 100).toFixed(2)}% ${lC.toFixed(4)} ${targetHue.toFixed(2)})`;
      const darkValue = `oklch(${(dL * 100).toFixed(2)}% ${dC.toFixed(4)} ${targetHue.toFixed(2)})`;

      css += `    --${name}-${step}: light-dark(${lightValue}, ${darkValue});\n`;
    });
    css += "\n";
  });

  const colors = currentSabbat.colors;
  css += "    /* ── Sabbat-Specific Overrides ── */\n";
  css += `    --color-sabbat-primary: ${colors.length > 0 ? colors[0] : "#68b34d"};\n`;

  const primaryHue = getThemeHue(now, "primary");
  const accentHue = getThemeHue(now, "accent");

  // The riso plates ride the season's *second* colour (colourful[1] of each
  // sabbat's palette) rather than its first. The dark-half sabbats all lead
  // with reds (firebrick → orange-red → firebrick), which parked the old
  // primary-keyed inks on one ~30° hue between Mabon and Imbolc and left
  // the spine and footer looking frozen all winter. The second plate keeps
  // moving: chocolate → dark red → Yule evergreen. B sits ~150° round the
  // wheel so that where they overprint they mix toward a deep third colour,
  // as before. In dark mode the inks print on black stock (screen blend),
  // so B is darker there.
  const inkHue = accentHue;
  const hueB = (inkHue + 150) % 360;

  // The wheel sweeps every hue at a fixed chroma, and WCAG relative
  // luminance swings widely between hues at one lightness (further again
  // when out-of-gamut oklch clamps to sRGB), so the text-bearing inks get
  // their lightness solved per hue, per scheme, instead of being fixed:
  // accent text against the paper tint, and the fills that carry --on-ink
  // text (the spine, tapes, chips, hovers) against white on black stock.
  const inkTextLight = lightTextLightness(inkHue, 0.2);
  const inkTextDark = darkTextLightness(inkHue, 0.2);
  const inkSoftLight = lightTextLightness(inkHue, 0.03, PAPER, AA, 0.4);
  const stampLight = lightTextLightness(inkHue, 0.1, PAPER, AA, 0.52);
  const stampDark = darkTextLightness(inkHue, 0.1, PAPER_DARK, AA, 0.4, 0.7);
  const inkBTextLight = lightTextLightness(hueB, 0.12, PAPER, AA_LARGE, 0.62);
  const inkAFillDark = darkFillLightness(inkHue, 0.2);
  const inkBFillDark = darkFillLightness(hueB, 0.15);

  // Paper and ink base colours follow the ink plate too, tinted slightly
  // stronger than the old newsprint greys so the seasonal drift reads in
  // the quiet regions (the footer) and not just the saturated plates.
  // Lightness flips between light and dark mode: paper is light in light
  // mode, dark in dark mode.
  css += "    /* ── Paper & Ink (seasonal base, riding the ink hue) ── */\n";
  css += `    --paper: light-dark(oklch(${(PAPER.lightness * 100).toFixed(1)}% ${PAPER.chroma} ${inkHue.toFixed(2)}), oklch(${(PAPER_DARK.lightness * 100).toFixed(1)}% ${PAPER_DARK.chroma} ${inkHue.toFixed(2)}));\n`;
  css += `    --paper-deep: light-dark(oklch(${(PAPER_DEEP.lightness * 100).toFixed(1)}% ${PAPER_DEEP.chroma} ${inkHue.toFixed(2)}), oklch(${(PAPER_DEEP_DARK.lightness * 100).toFixed(1)}% ${PAPER_DEEP_DARK.chroma} ${inkHue.toFixed(2)}));\n`;
  css += `    --ink: light-dark(oklch(${(INK_LIGHT.lightness * 100).toFixed(0)}% ${INK_LIGHT.chroma} ${inkHue.toFixed(2)}), oklch(95% 0.015 ${inkHue.toFixed(2)}));\n`;
  css += `    --ink-soft: light-dark(oklch(${(inkSoftLight * 100).toFixed(2)}% 0.03 ${inkHue.toFixed(2)}), oklch(80% 0.02 ${inkHue.toFixed(2)}));\n`;
  css += `    --on-ink: light-dark(oklch(${(ON_INK_LIGHT.lightness * 100).toFixed(0)}% ${ON_INK_LIGHT.chroma} ${inkHue.toFixed(2)}), oklch(${(ON_INK_DARK.lightness * 100).toFixed(0)}% ${ON_INK_DARK.chroma} ${inkHue.toFixed(2)}));\n`;

  css += "    /* ── Riso inks (lightness solved for the hue, see contrast.ts) ── */\n";
  css += `    --riso-a: light-dark(oklch(${(INK_FILL_LIGHT.lightness * 100).toFixed(0)}% ${INK_FILL_LIGHT.chroma} ${inkHue.toFixed(2)}), oklch(${(inkAFillDark * 100).toFixed(2)}% 0.2 ${inkHue.toFixed(2)}));\n`;
  css += `    --riso-a-text: light-dark(oklch(${(inkTextLight * 100).toFixed(2)}% 0.2 ${inkHue.toFixed(2)}), oklch(${(inkTextDark * 100).toFixed(2)}% 0.2 ${inkHue.toFixed(2)}));\n`;
  css += `    --riso-b: light-dark(oklch(${(INK_B_FILL_LIGHT.lightness * 100).toFixed(0)}% ${INK_B_FILL_LIGHT.chroma} ${hueB.toFixed(2)}), oklch(${(inkBFillDark * 100).toFixed(2)}% 0.15 ${hueB.toFixed(2)}));\n`;
  css += `    --riso-b-text: light-dark(oklch(${(inkBTextLight * 100).toFixed(2)}% 0.12 ${hueB.toFixed(2)}), oklch(${(INK_B_TEXT_DARK.lightness * 100).toFixed(0)}% ${INK_B_TEXT_DARK.chroma} ${hueB.toFixed(2)}));\n`;

  // Ink on newsprint subtracts (multiply); ink on black stock adds
  // (screen). --blend is not a colour, so light-dark() cannot carry it:
  // the dark value switches via the media query appended after this rule.
  css += "    /* ── Blend mode and surfaces ── */\n";
  css += "    --blend: multiply;\n";
  css += `    --surface-color: light-dark(oklch(${(PAPER_DEEP.lightness * 100).toFixed(1)}% ${PAPER_DEEP.chroma} ${inkHue.toFixed(2)}), oklch(${(PAPER_DEEP_DARK.lightness * 100).toFixed(1)}% ${PAPER_DEEP_DARK.chroma} ${inkHue.toFixed(2)}));\n`;
  css += `    --surface-raised: light-dark(oklch(${(PAPER.lightness * 100).toFixed(1)}% ${PAPER.chroma} ${inkHue.toFixed(2)}), oklch(${(PAPER_DARK.lightness * 100).toFixed(1)}% ${PAPER_DARK.chroma} ${inkHue.toFixed(2)}));\n`;
  css += `    --surface-sunken: light-dark(oklch(${(PAPER_DEEP.lightness * 100).toFixed(1)}% ${PAPER_DEEP.chroma} ${inkHue.toFixed(2)}), oklch(${(PAPER_DEEP_DARK.lightness * 100).toFixed(1)}% ${PAPER_DEEP_DARK.chroma} ${inkHue.toFixed(2)}));\n`;
  css += `    --rule: light-dark(oklch(19% 0.025 ${accentHue.toFixed(2)}), oklch(95% 0.01 ${accentHue.toFixed(2)}));\n`;
  css += `    --stamp: light-dark(oklch(${(stampLight * 100).toFixed(2)}% 0.1 ${accentHue.toFixed(2)}), oklch(${(stampDark * 100).toFixed(2)}% 0.1 ${accentHue.toFixed(2)}));\n`;

  // Seasonal background pattern - halftone dots using primary and accent hues.
  // The pattern creates a subtle textured effect that shifts with the Sabbat cycle.
  css += "    /* ── Background Pattern ── */\n";
  css += `    --bg-pattern-size: 40px;\n`;
  css += `    --bg-pattern: repeating-radial-gradient(circle at 0 0, oklch(98% 0.005 ${primaryHue.toFixed(2)}) 0%, oklch(95% 0.01 ${primaryHue.toFixed(2)}) 10%, oklch(90% 0.015 ${accentHue.toFixed(2)}) 15%, oklch(85% 0.02 ${accentHue.toFixed(2)}) 20%, transparent 25%);\n`;
  css += `    --color-primary-text: light-dark(var(--color-primary-700), var(--color-primary-500));\n`;
  css += `    --color-primary-text-hover: light-dark(var(--color-primary-800), var(--color-primary-400));\n`;
  css += "    /* ── Aliases ── */\n";
  [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].forEach((step) => {
    css += `    --ink-${step}: var(--text-${step});\n    --canvas-${step}: var(--background-${step});\n`;
  });

  // Apply the seasonal background pattern to the body.
  css += "  }\n";
  css += `  body { background: var(--paper), var(--bg-pattern); background-size: var(--bg-pattern-size) var(--bg-pattern-size); background-position: ${((yearProgress + moon.phase) * 100).toFixed(2)}% ${((yearProgress * 0.5 + moon.phase * 0.25) * 100).toFixed(2)}%; }\n`;

  // The dark-stock side of the blend token: ink adds when printed on black.
  css += "  @media (prefers-color-scheme: dark) {\n    :root {\n      --blend: screen;\n    }\n  }\n";
  return css;
}

export function getOgThemeColors(now: Date = new Date()) {
  const inkHue = getThemeHue(now, "accent");
  return {
    inkA: chroma.oklch(0.66, 0.215, inkHue).hex(),
    inkB: chroma.oklch(0.62, 0.15, (inkHue + 150) % 360).hex(),
    bg: getThemeShade(now, "background", "950", "dark"),
    fg: getThemeShade(now, "text", "50", "dark"),
  };
}
