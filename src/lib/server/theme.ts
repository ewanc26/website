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
  const primaryHue = getThemeHue(now, "primary");
  const secondaryHue = getThemeHue(now, "secondary");
  const accentHue = getThemeHue(now, "accent");
  const hueB = (primaryHue + 150) % 360;

  // Paper and ink base colours also follow the seasonal hue, but with very
  // low chroma so they read as near-neutral. Lightness flips between light
  // and dark mode: paper is light in light mode, dark in dark mode.
  css += "    /* ── Paper & Ink (seasonal base) ── */\n";
  css += `    --paper: light-dark(oklch(95.5% 0.008 ${primaryHue.toFixed(2)}), oklch(14.5% 0.014 ${primaryHue.toFixed(2)}));\n`;
  css += `    --paper-deep: light-dark(oklch(90.5% 0.014 ${primaryHue.toFixed(2)}), oklch(20.5% 0.02 ${primaryHue.toFixed(2)}));\n`;
  css += `    --ink: light-dark(oklch(19% 0.025 ${primaryHue.toFixed(2)}), oklch(95% 0.01 ${primaryHue.toFixed(2)}));\n`;
  css += `    --ink-soft: light-dark(oklch(38% 0.025 ${primaryHue.toFixed(2)}), oklch(80% 0.012 ${primaryHue.toFixed(2)}));\n`;
  css += `    --on-ink: light-dark(oklch(15% 0.02 ${primaryHue.toFixed(2)}), oklch(95% 0.01 ${primaryHue.toFixed(2)}));\n`;

  css += "    /* ── Riso inks ── */\n";
  css += `    --riso-a: light-dark(oklch(68% 0.205 ${primaryHue.toFixed(2)}), oklch(66% 0.215 ${primaryHue.toFixed(2)}));\n`;
  css += `    --riso-a-text: light-dark(oklch(52% 0.2 ${primaryHue.toFixed(2)}), oklch(66% 0.215 ${primaryHue.toFixed(2)}));\n`;
  css += `    --riso-b: light-dark(oklch(84% 0.125 ${hueB.toFixed(2)}), oklch(62% 0.15 ${hueB.toFixed(2)}));\n`;

  css += `    --riso-b-text: light-dark(oklch(58% 0.12 ${hueB.toFixed(2)}), oklch(62% 0.15 ${hueB.toFixed(2)}));\n`;


  css += "    /* ── Blend mode and surfaces ── */\n";
  css += "    --blend: light-dark(multiply, screen);\n";
  css += `    --surface-color: light-dark(oklch(90.5% 0.014 ${secondaryHue.toFixed(2)}), oklch(20.5% 0.02 ${secondaryHue.toFixed(2)}));\n`;
  css += `    --surface-raised: light-dark(oklch(95.5% 0.008 ${secondaryHue.toFixed(2)}), oklch(14.5% 0.014 ${secondaryHue.toFixed(2)}));\n`;
  css += `    --surface-sunken: light-dark(oklch(90.5% 0.014 ${secondaryHue.toFixed(2)}), oklch(20.5% 0.02 ${secondaryHue.toFixed(2)}));\n`;
  css += `    --rule: light-dark(oklch(19% 0.025 ${accentHue.toFixed(2)}), oklch(95% 0.01 ${accentHue.toFixed(2)}));\n`;
  css += `    --stamp: light-dark(oklch(50% 0.1 ${accentHue.toFixed(2)}), oklch(50% 0.1 ${accentHue.toFixed(2)}));\n`;

  // Seasonal background pattern - halftone dots using primary and accent hues.
  // The pattern creates a subtle textured effect that shifts with the Sabbat cycle.
  css += "    /* ── Background Pattern ── */\n";
  css += `    --bg-pattern-size: 40px;\n`;
  css += `    --bg-pattern: repeating-radial-gradient(`
      `circle at 0 0, `
      `oklch(98% 0.005 ${primaryHue.toFixed(2)}) 0%, `
      `oklch(95% 0.01 ${primaryHue.toFixed(2)}) 10%, `
      `oklch(90% 0.015 ${accentHue.toFixed(2)}) 15%, `
      `oklch(85% 0.02 ${accentHue.toFixed(2)}) 20%, `
      `transparent 25% `
    `);\n`;
  css += `    --color-primary-text: light-dark(var(--color-primary-700), var(--color-primary-500));\n`;
  css += `    --color-primary-text-hover: light-dark(var(--color-primary-800), var(--color-primary-400));\n`;
  css += "    /* ── Aliases ── */\n";
  [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].forEach((step) => {
    css += `    --ink-${step}: var(--text-${step});\n    --canvas-${step}: var(--background-${step});\n`;
  });


  // Apply the seasonal background pattern to the body.
  css += "  }\n";
  css += `  body { background: var(--paper), var(--bg-pattern); background-size: var(--bg-pattern-size) var(--bg-pattern-size); }\n`;
  return css;
}

export function getOgThemeColors(now: Date = new Date()) {
  const primaryHue = getThemeHue(now, "primary");
  return {
    inkA: chroma.oklch(0.66, 0.215, primaryHue).hex(),
    inkB: chroma.oklch(0.62, 0.15, (primaryHue + 150) % 360).hex(),
    bg: getThemeShade(now, "background", "950", "dark"),
    fg: getThemeShade(now, "text", "50", "dark"),
  };
}
