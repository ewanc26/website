import chroma from "chroma-js";

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

export interface Sabbat {
  name: string;
  month: number;
  day: number;
  rotation: number;
  date?: Date;
}

export interface Sabbat {
  name: string;
  month: number;
  day: number;
  rotation: number;
  description: string;
  date?: Date;
}

const sabbats: Sabbat[] = [
  {
    name: "Imbolc",
    month: 2,
    day: 1,
    rotation: -45,
    description:
      "Imbolc marks the first stirrings of spring, a time of purification and honoring the return of light. It is a period for setting intentions for the coming year and preparing for the awakening of the earth.\n\nTraditionally celebrated with fire and cleansing rituals, this festival bridges the gap between deep winter and the sprouting of new life. It encourages us to look inward and cultivate the quiet energy needed to bring our goals to fruition.",
  },
  {
    name: "Ostara",
    month: 3,
    day: 21,
    rotation: 0,
    description:
      "Ostara, the Spring Equinox, celebrates the perfect balance of light and dark, as day and night are of equal length. This Sabbat signifies new beginnings, growth, and the fertility of the land as nature bursts forth with renewed vitality.\n\nIt is a time to plant seeds, both metaphorically and physically, and to find equilibrium in our own lives. As the world awakens, we are invited to embrace action, creativity, and the joy of a fresh start.",
  },
  {
    name: "Beltane",
    month: 5,
    day: 1,
    rotation: 45,
    description:
      "Beltane honors the peak of spring and the union of the god and goddess, symbolizing fertility, passion, and the full blooming of life. The fires of Beltane are traditionally lit to celebrate the warmth of the sun and the abundance of the coming summer.\n\nThis Sabbat is an invitation to celebrate your own passions, vitality, and creativity. It is a time for outward action, community, and stepping fully into the warmth and energy of the season.",
  },
  {
    name: "Litha",
    month: 6,
    day: 21,
    rotation: 90,
    description:
      "Litha, the Summer Solstice, represents the longest day of the year and the height of the sun's power. It is a celebration of light, community, and the abundance that comes from the peak of growth and warmth.\n\nWhile we honor this pinnacle of external energy, it is also a reminder that the cycle will inevitably turn toward darkness. It is a time to be present, to give gratitude for the fruits of our efforts, and to enjoy the radiance of the season.",
  },
  {
    name: "Lughnasadh",
    month: 8,
    day: 1,
    rotation: 135,
    description:
      "Lughnasadh, the first harvest, marks the start of the transition from summer to autumn. It is a celebration of the ripening grain and the initial reaping of the rewards from the efforts planted earlier in the year.\n\nThis Sabbat invites us to acknowledge the necessity of reaping what we have sown and to express gratitude for our abundance. It is a time for reflection on what we have nurtured and what we are now ready to harvest.",
  },
  {
    name: "Mabon",
    month: 9,
    day: 21,
    rotation: 180,
    description:
      "Mabon, the Autumn Equinox, is the second harvest festival, balancing the light and dark once more as we prepare for the descent into winter. It is a time of deep gratitude, reflection, and preparation for the dormant season.\n\nAs the leaves fall and the light wanes, we are encouraged to release what no longer serves us. Mabon is a period of giving thanks for all that we have accomplished and finding peace in the natural cycle of letting go.",
  },
  {
    name: "Samhain",
    month: 10,
    day: 31,
    rotation: 225,
    description:
      "Samhain marks the end of the harvest and the start of the darker half of the year, often called the witches' new year. The veil between the physical and spiritual worlds is at its thinnest, making it a powerful time for honoring ancestors and reflecting on the cycle of life and death.\n\nIt is a Sabbat for introspection, deep listening, and releasing the old to make space for future growth during the quiet winter months. We honor the darkness not as an end, but as a necessary space for gestation and renewal.",
  },
  {
    name: "Yule",
    month: 12,
    day: 21,
    rotation: 270,
    description:
      "Yule, the Winter Solstice, is the longest night of the year, a moment of profound stillness and the turning point where the light begins its slow return. It is a time of hope, quiet celebration, and honoring the resilience of life in the midst of cold.\n\nEven in the depths of winter, the promise of spring remains. Yule encourages us to find warmth in community and reflection, nurturing our inner spark so it can grow stronger as the days begin to lengthen again.",
  },
];

export function getCurrentSabbat(): Sabbat {
  const now = new Date();
  const year = now.getFullYear();
  const getSabbatDate = (s: Sabbat, y: number) =>
    new Date(y, s.month - 1, s.day);
  const allSabbats = [
    ...sabbats.map((s) => ({ ...s, date: getSabbatDate(s, year - 1) })),
    ...sabbats.map((s) => ({ ...s, date: getSabbatDate(s, year) })),
    ...sabbats.map((s) => ({ ...s, date: getSabbatDate(s, year + 1) })),
  ].sort((a, b) => (a.date?.getTime() || 0) - (b.date?.getTime() || 0));

  for (let i = 0; i < allSabbats.length - 1; i++) {
    if (
      now >= (allSabbats[i].date || new Date()) &&
      now < (allSabbats[i + 1].date || new Date())
    ) {
      return allSabbats[i];
    }
  }
  return allSabbats[allSabbats.length - 1];
}

export function getHueRotation(now: Date): number {
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

  return (
    prev.rotation +
    (next.rotation - prev.rotation) *
      ((now.getTime() - prevDate) / (nextDate - prevDate))
  );
}

export function getCurrentPrimaryShade(step = 400): string {
  const now = new Date();
  const rotation = getHueRotation(now);
  const data = baseline.primary[String(step)];
  if (!data) return "#68b34d";
  const [l, c, hBase] = data.light;
  return chroma.oklch(l, c, (hBase + rotation) % 360).hex();
}

export function getDynamicThemeCSS(): string {
  const now = new Date();
  const rotation = getHueRotation(now);
  let css = "  :root {\n";

  Object.entries(baseline).forEach(([name, shades]) => {
    css += `    /* ── ${name.toUpperCase()} (Rotated ${rotation.toFixed(1)}°) ── */\n`;
    Object.entries(shades).forEach(([step, modes]) => {
      const typedModes = modes as ModeColors;
      const [lL, lC, lH] = typedModes.light;
      const [dL, dC, dH] = typedModes.dark;

      const lightValue = `oklch(${(lL * 100).toFixed(2)}% ${lC.toFixed(4)} ${((lH + rotation) % 360).toFixed(2)})`;
      const darkValue = `oklch(${(dL * 100).toFixed(2)}% ${dC.toFixed(4)} ${((dH + rotation) % 360).toFixed(2)})`;

      css += `    --${name}-${step}: light-dark(${lightValue}, ${darkValue});\n`;
    });
    css += "\n";
  });

  css += "    /* ── Aliases ── */\n";
  [
    "50",
    "100",
    "200",
    "300",
    "400",
    "500",
    "600",
    "700",
    "800",
    "900",
    "950",
  ].forEach((step) => {
    css += `    --ink-${step}: var(--text-${step});\n    --canvas-${step}: var(--background-${step});\n`;
  });

  css += "  }\n";
  return css;
}
