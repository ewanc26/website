/**
 * Seasonal colour theme engine.
 *
 * The entire site's colour palette is derived from the current Sabbat
 * position on the Wheel of the Year. This module interpolates between
 * Sabbat hue rotations using OKLCH colour space via chroma-js.
 *
 * The generated CSS is injected server-side in the SvelteKit handle hook
 * so the theme is present before any client JS runs.
 */

import chroma from "chroma-js";
import { type Sabbat, sabbats, getCurrentSabbat } from "$lib/utils/sabbats";

export interface ModeColors {
  light: [number, number, number];
  dark: [number, number, number];
}

export interface Scale {
  [key: string]: ModeColors;
}

export interface Baseline {
  text: Scale;
  background: Scale;
  primary: Scale;
  secondary: Scale;
  accent: Scale;
}

export const baseline: Baseline = {
  text: {
    "50": { light: [0.967, 0.012, 133.22], dark: [0.168, 0.019, 137.9] },
    "100": { light: [0.935, 0.026, 136.26], dark: [0.235, 0.036, 136.87] },
    "200": { light: [0.871, 0.053, 136.42], dark: [0.357, 0.063, 137.05] },
    "300": { light: [0.806, 0.08, 136.59], dark: [0.47, 0.088, 137.13] },
    "400": { light: [0.742, 0.106, 136.4], dark: [0.576, 0.11, 136.77] },
    "500": { light: [0.677, 0.132, 136.88], dark: [0.677, 0.132, 136.88] },
    "600": { light: [0.576, 0.11, 136.77], dark: [0.742, 0.106, 136.4] },
    "700": { light: [0.47, 0.088, 137.13], dark: [0.806, 0.08, 136.59] },
    "800": { light: [0.357, 0.063, 137.05], dark: [0.871, 0.053, 136.42] },
    "900": { light: [0.235, 0.036, 136.87], dark: [0.935, 0.026, 136.26] },
    "950": { light: [0.168, 0.019, 137.9], dark: [0.967, 0.012, 133.22] },
  },
  background: {
    "50": { light: [0.971, 0.02, 138.34], dark: [0.173, 0.03, 135.76] },
    "100": { light: [0.941, 0.038, 136.8], dark: [0.248, 0.054, 138.26] },
    "200": { light: [0.885, 0.079, 137.16], dark: [0.379, 0.091, 138.25] },
    "300": { light: [0.829, 0.118, 137.07], dark: [0.502, 0.127, 138.48] },
    "400": { light: [0.774, 0.154, 137.48], dark: [0.615, 0.158, 138.46] },
    "500": { light: [0.722, 0.185, 138.14], dark: [0.726, 0.19, 138.57] },
    "600": { light: [0.614, 0.155, 138.07], dark: [0.775, 0.158, 137.9] },
    "700": { light: [0.5, 0.124, 137.97], dark: [0.829, 0.122, 137.66] },
    "800": { light: [0.38, 0.091, 137.79], dark: [0.884, 0.08, 137.33] },
    "900": { light: [0.245, 0.05, 137.64], dark: [0.942, 0.042, 137.5] },
    "950": { light: [0.173, 0.03, 135.76], dark: [0.971, 0.02, 138.34] },
  },
  primary: {
    "50": { light: [0.968, 0.015, 135.96], dark: [0.17, 0.024, 139.17] },
    "100": { light: [0.938, 0.032, 136.58], dark: [0.24, 0.043, 137.3] },
    "200": { light: [0.874, 0.063, 137.87], dark: [0.363, 0.074, 138.38] },
    "300": { light: [0.813, 0.096, 137.64], dark: [0.48, 0.104, 138.17] },
    "400": { light: [0.753, 0.128, 137.7], dark: [0.59, 0.131, 138.08] },
    "500": { light: [0.695, 0.157, 138.19], dark: [0.695, 0.157, 138.19] },
    "600": { light: [0.59, 0.131, 138.08], dark: [0.753, 0.128, 137.7] },
    "700": { light: [0.48, 0.104, 138.17], dark: [0.813, 0.096, 137.64] },
    "800": { light: [0.363, 0.074, 138.38], dark: [0.874, 0.063, 137.87] },
    "900": { light: [0.24, 0.043, 137.3], dark: [0.938, 0.032, 136.58] },
    "950": { light: [0.17, 0.024, 139.17], dark: [0.968, 0.015, 135.96] },
  },
  secondary: {
    "50": { light: [0.97, 0.017, 136.91], dark: [0.17, 0.026, 136.9] },
    "100": { light: [0.939, 0.035, 137.42], dark: [0.242, 0.047, 138.05] },
    "200": { light: [0.878, 0.068, 137.18], dark: [0.369, 0.08, 137.91] },
    "300": { light: [0.819, 0.105, 137.49], dark: [0.487, 0.112, 138.14] },
    "400": { light: [0.761, 0.139, 137.82], dark: [0.599, 0.142, 138.26] },
    "500": { light: [0.706, 0.17, 138.33], dark: [0.706, 0.17, 138.33] },
    "600": { light: [0.599, 0.142, 138.26], dark: [0.761, 0.139, 137.82] },
    "700": { light: [0.487, 0.112, 138.14], dark: [0.819, 0.105, 137.49] },
    "800": { light: [0.369, 0.08, 137.91], dark: [0.878, 0.068, 137.18] },
    "900": { light: [0.242, 0.047, 138.05], dark: [0.939, 0.035, 137.42] },
    "950": { light: [0.17, 0.026, 136.9], dark: [0.97, 0.017, 136.91] },
  },
  accent: {
    "50": { light: [0.969, 0.018, 137.69], dark: [0.173, 0.028, 137.62] },
    "100": { light: [0.939, 0.035, 137.42], dark: [0.242, 0.047, 138.05] },
    "200": { light: [0.881, 0.074, 137.26], dark: [0.374, 0.086, 138.08] },
    "300": { light: [0.822, 0.11, 137.55], dark: [0.492, 0.117, 138.25] },
    "400": { light: [0.767, 0.147, 137.77], dark: [0.606, 0.149, 138.27] },
    "500": { light: [0.712, 0.177, 138.34], dark: [0.712, 0.177, 138.34] },
    "600": { light: [0.606, 0.149, 138.27], dark: [0.767, 0.147, 137.77] },
    "700": { light: [0.492, 0.117, 138.25], dark: [0.822, 0.11, 137.55] },
    "800": { light: [0.374, 0.086, 138.08], dark: [0.881, 0.074, 137.26] },
    "900": { light: [0.242, 0.047, 138.05], dark: [0.939, 0.035, 137.42] },
    "950": { light: [0.173, 0.028, 137.62], dark: [0.969, 0.018, 137.69] },
  },
};

function getSabbatContext(now: Date) {
  const year = now.getFullYear();
  const getSabbatDate = (s: Sabbat, y: number) =>
    new Date(y, s.month - 1, s.day);
  const allSabbats = [
    ...sabbats.map((s) => ({ ...s, date: getSabbatDate(s, year - 1) })),
    ...sabbats.map((s) => ({ ...s, date: getSabbatDate(s, year) })),
    ...sabbats.map((s) => ({ ...s, date: getSabbatDate(s, year + 1) })),
  ].sort((a, b) => (a.date?.getTime() || 0) - (b.date?.getTime() || 0));

  let prev = allSabbats[0],
    next = allSabbats[1];
  for (let i = 0; i < allSabbats.length - 1; i++) {
    if (
      now >= (allSabbats[i].date || new Date()) &&
      now < (allSabbats[i + 1].date || new Date())
    ) {
      prev = allSabbats[i];
      next = allSabbats[i + 1];
      break;
    }
  }

  const prevDate = prev.date?.getTime() || 0;
  const nextDate = next.date?.getTime() || 0;
  const progress = (now.getTime() - prevDate) / (nextDate - prevDate);

  return { prev, next, progress };
}

export function getHueRotation(now: Date): number {
  const { prev, next, progress } = getSabbatContext(now);

  let diff = next.rotation - prev.rotation;
  while (diff > 180) diff -= 360;
  while (diff < -180) diff += 360;

  return prev.rotation + diff * progress;
}

export function getCurrentPrimaryShade(step = 400): string {
  const now = new Date();
  const rotation = getHueRotation(now);
  const data = (baseline.primary as any)[step];
  if (!data) return "#68b34d";
  const [l, c, hBase] = data.light;
  return chroma.oklch(l, c, (hBase + rotation) % 360).hex();
}

export function getTargetHues(now: Date) {
  const { prev, next, progress } = getSabbatContext(now);

  const getSabbatHues = (s: Sabbat) => {
    const colorful = s.colors
      .map((c) => chroma(c))
      .filter((c) => c.get("oklch.c") > 0.01)
      .map((c) => c.get("oklch.h"));

    if (colorful.length === 0) return [135, 135, 135];
    if (colorful.length === 1) return [colorful[0], colorful[0], colorful[0]];
    if (colorful.length === 2) return [colorful[0], colorful[1], colorful[1]];
    return [colorful[0], colorful[1], colorful[2]];
  };

  const prevHues = getSabbatHues(prev);
  const nextHues = getSabbatHues(next);

  return prevHues.map((prevHue, i) => {
    const nextHue = nextHues[i];
    let hueDiff = nextHue - prevHue;
    while (hueDiff > 180) hueDiff -= 360;
    while (hueDiff < -180) hueDiff += 360;
    return (prevHue + hueDiff * progress + 360) % 360;
  });
}

export function getDynamicThemeCSS(): string {
  const now = new Date();
  const { prev, next, progress } = getSabbatContext(now);
  const currentSabbat = getCurrentSabbat(now);
  const [primaryHue, accentHue, secondaryHue] = getTargetHues(now);

  let css = "  :root {\n";

  Object.entries(baseline).forEach(([name, shades]) => {
    css += `    /* ── ${name.toUpperCase()} (Transitioning from ${prev.name} to ${next.name}) ── */\n`;
    const targetHue =
      name === "accent"
        ? accentHue
        : name === "secondary"
          ? secondaryHue
          : primaryHue;

    Object.entries(shades as Scale).forEach(([step, modes]) => {
      const [lL, lC] = modes.light;
      const [dL, dC] = modes.dark;

      const lightValue = `oklch(${(lL * 100).toFixed(2)}% ${lC.toFixed(4)} ${targetHue.toFixed(2)})`;
      const darkValue = `oklch(${(dL * 100).toFixed(2)}% ${dC.toFixed(4)} ${targetHue.toFixed(2)})`;

      css += `    --${name}-${step}: light-dark(${lightValue}, ${darkValue});\n`;
    });
    css += "\n";
  });

  // Add specific Sabbat color overrides
  const colors = currentSabbat.colors;
  css += `    /* ── Sabbat-Specific Overrides ── */\n`;
  css += `    --color-sabbat-primary: ${colors.length > 0 ? colors[0] : "#68b34d"};\n`;

  css += "    /* ── Aliases ── */\n";
  [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].forEach((step) => {
    css += `    --ink-${step}: var(--text-${step});\n    --canvas-${step}: var(--background-${step});\n`;
  });

  css += "  }\n";
  return css;
}

export function getOgThemeColors() {
  const now = new Date();
  const [primaryHue, accentHue] = getTargetHues(now);

  const getShade = (name: keyof Baseline, step: string, hue: number) => {
    const data = (baseline[name] as any)[step];
    const [dL, dC] = data.dark;
    return chroma.oklch(dL, dC, hue).hex();
  };

  return {
    bg: getShade("background", "50", primaryHue),
    fg: getShade("text", "950", primaryHue),
    accent: getShade("primary", "500", primaryHue),
    typeFg: getShade("accent", "500", accentHue),
  };
}
