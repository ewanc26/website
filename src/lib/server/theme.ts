/**
 * Seasonal colour theme engine.
 *
 * The colour calculations themselves live in the client-safe theme utility so
 * server-rendered CSS and interactive previews cannot drift apart.
 */

import chroma from "chroma-js";
import { getCurrentSabbat } from "$lib/utils/sabbats";
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
  const { prev, next } = getSabbatContext(now);
  const currentSabbat = getCurrentSabbat(now);

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

  // Two riso inks, derived from the same seasonal hue as the palette above.
  // A is the season's own colour; B sits ~150° round the wheel so that where
  // they overprint they mix toward a deep third colour. In dark mode the
  // inks are printed on black stock (screen blend), so B is darker there.
  const hueA = getThemeHue(now, "primary");
  const hueB = (hueA + 150) % 360;

  // Paper and ink base colours also follow the seasonal hue, but with very
  // low chroma so they read as near-neutral. Lightness flips between light
  // and dark mode: paper is light in light mode, dark in dark mode.
  css += "    /* ── Paper & Ink (seasonal base) ── */\n";
  css += `    --paper: light-dark(oklch(95.5% 0.008 ${hueA.toFixed(2)}), oklch(14.5% 0.014 ${hueA.toFixed(2)}));\n`;
  css += `    --paper-deep: light-dark(oklch(90.5% 0.014 ${hueA.toFixed(2)}), oklch(20.5% 0.02 ${hueA.toFixed(2)}));\n`;
  css += `    --ink: light-dark(oklch(19% 0.025 ${hueA.toFixed(2)}), oklch(95% 0.01 ${hueA.toFixed(2)}));\n`;
  css += `    --ink-soft: light-dark(oklch(38% 0.025 ${hueA.toFixed(2)}), oklch(80% 0.012 ${hueA.toFixed(2)}));\n`;
  css += `    --on-ink: light-dark(oklch(15% 0.02 ${hueA.toFixed(2)}), oklch(95% 0.01 ${hueA.toFixed(2)}));\n`;

  css += "    /* ── Riso inks ── */\n";
  css += `    --riso-a: light-dark(oklch(68% 0.205 ${hueA.toFixed(2)}), oklch(66% 0.215 ${hueA.toFixed(2)}));\n`;
  css += `    --riso-a-text: light-dark(oklch(52% 0.2 ${hueA.toFixed(2)}), oklch(66% 0.215 ${hueA.toFixed(2)}));\n`;
  css += `    --riso-b: light-dark(oklch(84% 0.125 ${hueB.toFixed(2)}), oklch(62% 0.15 ${hueB.toFixed(2)}));\n`;

  css += `    --riso-b-text: light-dark(oklch(58% 0.12 ${hueB.toFixed(2)}), oklch(62% 0.15 ${hueB.toFixed(2)}));\n`;


  css += "    /* ── Blend mode and surfaces ── */\n";
  css += "    --blend: light-dark(multiply, screen);\n";
  css += "    --surface-color: var(--paper-deep);\n";
  css += "    --surface-raised: var(--paper);\n";
  css += "    --surface-sunken: var(--paper-deep);\n";
  css += "    --rule: var(--ink);\n";
  css += `    --stamp: var(--color-primary-text);\n`;
  css += `    --color-primary-text: light-dark(var(--color-primary-700), var(--color-primary-500));\n`;
  css += `    --color-primary-text-hover: light-dark(var(--color-primary-800), var(--color-primary-400));\n`;
  css += "    /* ── Aliases ── */\n";
  [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].forEach((step) => {
    css += `    --ink-${step}: var(--text-${step});\n    --canvas-${step}: var(--background-${step});\n`;
  });

  css += "  }\n";
  return css;
}

export function getOgThemeColors(now: Date = new Date()) {
  const hueA = getThemeHue(now, "primary");
  return {
    inkA: chroma.oklch(0.66, 0.215, hueA).hex(),
    inkB: chroma.oklch(0.62, 0.15, (hueA + 150) % 360).hex(),
    bg: getThemeShade(now, "background", "950", "dark"),
    fg: getThemeShade(now, "text", "50", "dark"),
  };
}
