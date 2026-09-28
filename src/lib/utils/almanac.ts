/**
 * The almanac's running head: what the printed page would carry above
 * the text — the date, the moon, and how far off the next sabbat is.
 * Computed per request in Europe/London so it matches the blog's dates.
 */

import { getMoonPhase } from "$lib/utils/moonPhase";
import { getCurrentSabbat } from "$lib/utils/sabbats";
import { getSabbatContext } from "$lib/utils/theme";

const DAY_MS = 86_400_000;

export interface Almanac {
  weekday: string;
  date: string;
  moon: { name: string; phase: number; fraction: number };
  sabbat: { name: string; description: string; colors: string[] };
  next: { name: string; days: number };
  isMonday: boolean;
}

export function getAlmanac(now: Date = new Date()): Almanac {
  const fmt = (opts: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/London",
      ...opts,
    }).format(now);

  const moon = getMoonPhase(now);
  const sabbat = getCurrentSabbat(now);
  const { next } = getSabbatContext(now);
  const days = Math.max(
    0,
    Math.ceil(
      ((next.date?.getTime() ?? now.getTime()) - now.getTime()) / DAY_MS,
    ),
  );

  return {
    weekday: fmt({ weekday: "long" }),
    date: fmt({ day: "numeric", month: "long", year: "numeric" }),
    moon: { name: moon.name, phase: moon.phase, fraction: moon.fraction },
    sabbat: {
      name: sabbat.name,
      description: sabbat.description,
      colors: sabbat.colors,
    },
    next: { name: next.name, days },
    isMonday: fmt({ weekday: "long" }) === "Monday",
  };
}
