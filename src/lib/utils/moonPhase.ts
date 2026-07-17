/**
 * Lunar illumination derived from SunCalc's astronomical implementation.
 *
 * The calculation uses Julian days plus geocentric solar and lunar coordinates
 * to determine the phase angle. Unlike a fixed 29.53-day clock, it accounts for
 * the Moon's orbital anomaly and changing distance.
 *
 * Formula sources:
 * - Jean Meeus, Astronomical Algorithms, 2nd ed., chapter 48
 * - https://github.com/mourner/suncalc
 *
 * SunCalc is distributed under the BSD 2-Clause License:
 * Copyright (c) 2026, Volodymyr Agafonkin. All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the copyright notice and this
 * permission notice are retained. THIS SOFTWARE IS PROVIDED "AS IS", WITHOUT
 * WARRANTY OF ANY KIND. The complete deployed notice is at /licenses/suncalc.txt.
 */

const PI = Math.PI;
const RAD = PI / 180;
const DAY_MS = 86_400_000;
const JULIAN_1970 = 2_440_588;
const JULIAN_2000 = 2_451_545;
const EARTH_OBLIQUITY = RAD * 23.4397;
const SUN_DISTANCE_KM = 149_598_000;

function toDays(date: Date) {
  const julianDay = date.valueOf() / DAY_MS - 0.5 + JULIAN_1970;
  return julianDay - JULIAN_2000;
}

function rightAscension(longitude: number, latitude: number) {
  return Math.atan2(
    Math.sin(longitude) * Math.cos(EARTH_OBLIQUITY) -
      Math.tan(latitude) * Math.sin(EARTH_OBLIQUITY),
    Math.cos(longitude),
  );
}

function declination(longitude: number, latitude: number) {
  return Math.asin(
    Math.sin(latitude) * Math.cos(EARTH_OBLIQUITY) +
      Math.cos(latitude) * Math.sin(EARTH_OBLIQUITY) * Math.sin(longitude),
  );
}

function sunCoordinates(days: number) {
  const meanAnomaly = RAD * (357.5291 + 0.98560028 * days);
  const equationOfCentre =
    RAD *
    (1.9148 * Math.sin(meanAnomaly) +
      0.02 * Math.sin(2 * meanAnomaly) +
      0.0003 * Math.sin(3 * meanAnomaly));
  const eclipticLongitude =
    meanAnomaly + equationOfCentre + RAD * 102.9372 + PI;

  return {
    rightAscension: rightAscension(eclipticLongitude, 0),
    declination: declination(eclipticLongitude, 0),
  };
}

function moonCoordinates(days: number) {
  const meanLongitude = RAD * (218.316 + 13.176396 * days);
  const meanAnomaly = RAD * (134.963 + 13.064993 * days);
  const meanDistance = RAD * (93.272 + 13.22935 * days);
  const longitude = meanLongitude + RAD * 6.289 * Math.sin(meanAnomaly);
  const latitude = RAD * 5.128 * Math.sin(meanDistance);

  return {
    rightAscension: rightAscension(longitude, latitude),
    declination: declination(longitude, latitude),
    distance: 385_001 - 20_905 * Math.cos(meanAnomaly),
  };
}

export function getMoonIllumination(date = new Date()) {
  const days = toDays(date);
  const sun = sunCoordinates(days);
  const moon = moonCoordinates(days);
  const elongation = Math.acos(
    Math.sin(sun.declination) * Math.sin(moon.declination) +
      Math.cos(sun.declination) *
        Math.cos(moon.declination) *
        Math.cos(sun.rightAscension - moon.rightAscension),
  );
  const incidence = Math.atan2(
    SUN_DISTANCE_KM * Math.sin(elongation),
    moon.distance - SUN_DISTANCE_KM * Math.cos(elongation),
  );
  const limbAngle = Math.atan2(
    Math.cos(sun.declination) *
      Math.sin(sun.rightAscension - moon.rightAscension),
    Math.sin(sun.declination) * Math.cos(moon.declination) -
      Math.cos(sun.declination) *
        Math.sin(moon.declination) *
        Math.cos(sun.rightAscension - moon.rightAscension),
  );

  return {
    fraction: (1 + Math.cos(incidence)) / 2,
    phase: 0.5 + (0.5 * incidence * (limbAngle < 0 ? -1 : 1)) / PI,
    angle: limbAngle,
  };
}

const MOON_PHASES = [
  "New moon",
  "Waxing crescent",
  "First quarter",
  "Waxing gibbous",
  "Full moon",
  "Waning gibbous",
  "Last quarter",
  "Waning crescent",
] as const;

export function getMoonPhaseName(phase: number) {
  const normalizedPhase = ((phase % 1) + 1) % 1;
  const index =
    Math.floor(normalizedPhase * MOON_PHASES.length + 0.5) % MOON_PHASES.length;

  return {
    name: MOON_PHASES[index],
    index,
  };
}

/** Build the illuminated SVG silhouette for any point in the lunar cycle. */
export function getMoonPhaseGeometry(phase: number) {
  const normalizedPhase = ((phase % 1) + 1) % 1;
  const radius = Number(
    (9 * Math.abs(Math.cos(normalizedPhase * Math.PI * 2))).toFixed(3),
  );
  const isNew = normalizedPhase < 0.0001 || normalizedPhase > 0.9999;
  const isFull = Math.abs(normalizedPhase - 0.5) < 0.0001;
  const isGibbous = normalizedPhase > 0.25 && normalizedPhase < 0.75;

  if (isNew || isFull) {
    return { normalizedPhase, isNew, isFull, isGibbous, path: "" };
  }

  const circle = "M12 3a9 9 0 1 1 0 18 9 9 0 1 1 0-18Z";
  let path: string;

  if (normalizedPhase <= 0.25) {
    path = `M12 3a9 9 0 0 1 0 18 ${radius} 9 0 0 0 0-18Z`;
  } else if (normalizedPhase < 0.5) {
    const shadow = `M12 3a9 9 0 0 0 0 18 ${radius} 9 0 0 1 0-18Z`;
    path = `${circle}${shadow}`;
  } else if (normalizedPhase < 0.75) {
    const shadow = `M12 3a9 9 0 0 1 0 18 ${radius} 9 0 0 0 0-18Z`;
    path = `${circle}${shadow}`;
  } else {
    path = `M12 3a9 9 0 0 0 0 18 ${radius} 9 0 0 1 0-18Z`;
  }

  return { normalizedPhase, isNew, isFull, isGibbous, path };
}

/** Return the nearest of the eight conventional lunar phases. */
export function getMoonPhase(date = new Date()) {
  const { phase, fraction } = getMoonIllumination(date);
  const normalizedPhase = ((phase % 1) + 1) % 1;
  const conventionalPhase = getMoonPhaseName(normalizedPhase);

  return {
    ...conventionalPhase,
    fraction,
    phase: normalizedPhase,
  };
}

/** Treat the roughly one-day period above 99% illumination as visibly full. */
export function isVisiblyFullMoon(date = new Date()) {
  return getMoonIllumination(date).fraction >= 0.99;
}
