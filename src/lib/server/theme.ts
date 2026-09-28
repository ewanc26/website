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
  css += "    /* ── Riso inks ── */\n";
  css += `    --riso-a: light-dark(oklch(68% 0.205 ${hueA.toFixed(2)}), oklch(66% 0.215 ${hueA.toFixed(2)}));\n`;
  css += `    --riso-b: light-dark(oklch(84% 0.125 ${hueB.toFixed(2)}), oklch(62% 0.15 ${hueB.toFixed(2)}));\n`;

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
