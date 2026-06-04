import chroma from "chroma-js";

/**
 * @typedef {Object} OKLCH
 * @property {number} l
 * @property {number} c
 * @property {number} h
 */

/**
 * Baseline palette (Green) converted from the user's RGB values.
 * Precisely preserves L and C for both light and dark modes to maintain A11Y contrast.
 * Reference date: Ostara (March 21)
 */
export const baseline = {
  text: {
    50: { light: [0.967, 0.012, 133.22], dark: [0.168, 0.019, 137.9] },
    100: { light: [0.935, 0.026, 136.26], dark: [0.235, 0.036, 136.87] },
    200: { light: [0.871, 0.053, 136.42], dark: [0.357, 0.063, 137.05] },
    300: { light: [0.806, 0.08, 136.59], dark: [0.47, 0.088, 137.13] },
    400: { light: [0.742, 0.106, 136.4], dark: [0.576, 0.11, 136.77] },
    500: { light: [0.677, 0.132, 136.88], dark: [0.677, 0.132, 136.88] },
    600: { light: [0.576, 0.11, 136.77], dark: [0.742, 0.106, 136.4] },
    700: { light: [0.47, 0.088, 137.13], dark: [0.806, 0.08, 136.59] },
    800: { light: [0.357, 0.063, 137.05], dark: [0.871, 0.053, 136.42] },
    900: { light: [0.235, 0.036, 136.87], dark: [0.935, 0.026, 136.26] },
    950: { light: [0.168, 0.019, 137.9], dark: [0.967, 0.012, 133.22] },
  },
  background: {
    50: { light: [0.971, 0.02, 138.34], dark: [0.173, 0.03, 135.76] },
    100: { light: [0.941, 0.038, 136.8], dark: [0.248, 0.054, 138.26] },
    200: { light: [0.885, 0.079, 137.16], dark: [0.379, 0.091, 138.25] },
    300: { light: [0.829, 0.118, 137.07], dark: [0.502, 0.127, 138.48] },
    400: { light: [0.774, 0.154, 137.48], dark: [0.615, 0.158, 138.46] },
    500: { light: [0.722, 0.185, 138.14], dark: [0.726, 0.19, 138.57] },
    600: { light: [0.614, 0.155, 138.07], dark: [0.775, 0.158, 137.9] },
    700: { light: [0.5, 0.124, 137.97], dark: [0.829, 0.122, 137.66] },
    800: { light: [0.38, 0.091, 137.79], dark: [0.884, 0.08, 137.33] },
    900: { light: [0.245, 0.05, 137.64], dark: [0.942, 0.042, 137.5] },
    950: { light: [0.173, 0.03, 135.76], dark: [0.971, 0.02, 138.34] },
  },
  primary: {
    50: { light: [0.968, 0.015, 135.96], dark: [0.17, 0.024, 139.17] },
    100: { light: [0.938, 0.032, 136.58], dark: [0.24, 0.043, 137.3] },
    200: { light: [0.874, 0.063, 137.87], dark: [0.363, 0.074, 138.38] },
    300: { light: [0.813, 0.096, 137.64], dark: [0.48, 0.104, 138.17] },
    400: { light: [0.753, 0.128, 137.7], dark: [0.59, 0.131, 138.08] },
    500: { light: [0.695, 0.157, 138.19], dark: [0.695, 0.157, 138.19] },
    600: { light: [0.59, 0.131, 138.08], dark: [0.753, 0.128, 137.7] },
    700: { light: [0.48, 0.104, 138.17], dark: [0.813, 0.096, 137.64] },
    800: { light: [0.363, 0.074, 138.38], dark: [0.874, 0.063, 137.87] },
    900: { light: [0.24, 0.043, 137.3], dark: [0.938, 0.032, 136.58] },
    950: { light: [0.17, 0.024, 139.17], dark: [0.968, 0.015, 135.96] },
  },
  secondary: {
    50: { light: [0.97, 0.017, 136.91], dark: [0.17, 0.026, 136.9] },
    100: { light: [0.939, 0.035, 137.42], dark: [0.242, 0.047, 138.05] },
    200: { light: [0.878, 0.068, 137.18], dark: [0.369, 0.08, 137.91] },
    300: { light: [0.819, 0.105, 137.49], dark: [0.487, 0.112, 138.14] },
    400: { light: [0.761, 0.139, 137.82], dark: [0.599, 0.142, 138.26] },
    500: { light: [0.706, 0.17, 138.33], dark: [0.706, 0.17, 138.33] },
    600: { light: [0.599, 0.142, 138.26], dark: [0.761, 0.139, 137.82] },
    700: { light: [0.487, 0.112, 138.14], dark: [0.819, 0.105, 137.49] },
    800: { light: [0.369, 0.08, 137.91], dark: [0.878, 0.068, 137.18] },
    900: { light: [0.242, 0.047, 138.05], dark: [0.939, 0.035, 137.42] },
    950: { light: [0.17, 0.026, 136.9], dark: [0.97, 0.017, 136.91] },
  },
  accent: {
    50: { light: [0.969, 0.018, 137.69], dark: [0.173, 0.028, 137.62] },
    100: { light: [0.939, 0.035, 137.42], dark: [0.242, 0.047, 138.05] },
    200: { light: [0.881, 0.074, 137.26], dark: [0.374, 0.086, 138.08] },
    300: { light: [0.822, 0.11, 137.55], dark: [0.492, 0.117, 138.25] },
    400: { light: [0.767, 0.147, 137.77], dark: [0.606, 0.149, 138.27] },
    500: { light: [0.712, 0.177, 138.34], dark: [0.712, 0.177, 138.34] },
    600: { light: [0.606, 0.149, 138.27], dark: [0.767, 0.147, 137.77] },
    700: { light: [0.492, 0.117, 138.25], dark: [0.822, 0.11, 137.55] },
    800: { light: [0.374, 0.086, 138.08], dark: [0.881, 0.074, 137.26] },
    900: { light: [0.242, 0.047, 138.05], dark: [0.939, 0.035, 137.42] },
    950: { light: [0.173, 0.028, 137.62], dark: [0.969, 0.018, 137.69] },
  },
};

/**
 * Sabbat hue offsets relative to Ostara (Spring Equinox, Mar 21).
 * @typedef {Object} Sabbat
 * @property {string} name
 * @property {number} month
 * @property {number} day
 * @property {number} rotation
 * @property {Date} [date]
 */

/** @type {Sabbat[]} */
const sabbats = [
  { name: "imbolc", month: 2, day: 1, rotation: -45 },
  { name: "ostara", month: 3, day: 21, rotation: 0 },
  // ...
];

/**
 * Interpolates the hue rotation based on the current date.
 * @param {Date} now
 * @returns {number} Hue rotation in degrees
 */
export function getHueRotation(now) {
  const year = now.getFullYear();
  /** @param {Sabbat} s @param {number} y @returns {Date} */
  const getSabbatDate = (s, y) => new Date(y, s.month - 1, s.day);
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

  return (
    prev.rotation +
    (next.rotation - prev.rotation) *
      ((now.getTime() - prevDate) / (nextDate - prevDate))
  );
}

export function getCurrentPrimaryShade(step = 400) {
  const now = new Date();
  const rotation = getHueRotation(now);
  const data = baseline.primary[step] || baseline.primary[400];
  const [l, c, hBase] = data.light;
  return chroma.oklch(l, c, (hBase + rotation) % 360).hex();
}

export function getDynamicThemeCSS() {
  const now = new Date();
  const rotation = getHueRotation(now);
  let css = "  :root {\n";

  Object.entries(baseline).forEach(([name, shades]) => {
    css += `    /* ── ${name.toUpperCase()} (Rotated ${rotation.toFixed(1)}°) ── */\n`;
    Object.entries(shades).forEach(([step, modes]) => {
      const [lL, lC, lH] = modes.light;
      const [dL, dC, dH] = modes.dark;

      const lightValue = `oklch(${(lL * 100).toFixed(2)}% ${lC.toFixed(4)} ${((lH + rotation) % 360).toFixed(2)})`;
      const darkValue = `oklch(${(dL * 100).toFixed(2)}% ${dC.toFixed(4)} ${((dH + rotation) % 360).toFixed(2)})`;

      css += `    --${name}-${step}: light-dark(${lightValue}, ${darkValue});\n`;
    });
    css += "\n";
  });

  css += "    /* ── Aliases ── */\n";
  [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].forEach((step) => {
    css += `    --ink-${step}: var(--text-${step});\n    --canvas-${step}: var(--background-${step});\n`;
  });

  css += "  }\n";
  return css;
}
