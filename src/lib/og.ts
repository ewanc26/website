/**
 * OG-image template using Satori-compatible structure.
 */

import { getMoonPhaseGeometry } from "$lib/utils/moonPhase";

export type OgEntry = {
  title: string | null;
  subtitle: string | null;
  slug: string;
  type?: string | null;
  moonPhase: number;
  /** Running head, e.g. "Monday · 28 September 2026 · Waning gibbous". */
  dateline: string;
  theme: {
    bg: string;
    fg: string;
    inkA: string;
    inkB: string;
  };
};

export const OG_DEFAULT_TITLES: Record<string, string> = {
  BLOG: "Blog",
  ARTICLE: "Article",
  ABOUT: "About",
  SUPPORT: "Support",
  SUBSCRIPTIONS: "Subscriptions",
  SITE_META: "Site Metadata",
  DESIGN: "Design",
  NOW: "Now",
};

/** Ink split of the top bar per page type, so sections are told apart at a glance. */
const BAR_SPLIT: Record<string, [number, number]> = {
  ARTICLE: [3, 1],
  BLOG: [1, 1],
  ABOUT: [1, 3],
  NOW: [1, 2],
  DESIGN: [2, 1],
  HOME: [1, 1],
};

const MAX_TITLE_LENGTH = 180;
const MAX_SUBTITLE_LENGTH = 180;

export const cleanOgText = (
  value: string | null | undefined,
  maxLength: number,
): string | null => {
  if (!value) return null;
  const cleaned = value
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned) return null;
  return cleaned.length > maxLength
    ? `${cleaned.slice(0, maxLength - 1).trimEnd()}\u2026`
    : cleaned;
};

export const normalizeOgType = (
  value: string | null | undefined,
): string | null => {
  const cleaned = cleanOgText(value, 32);
  if (!cleaned) return null;
  return cleaned.toUpperCase().replace(/[-_\s]+/g, " ");
};

export const getDefaultOgTitle = (value: string | null): string | null => {
  if (!value) return null;
  const key = value
    .trim()
    .toUpperCase()
    .replace(/[-\s]+/g, "_");
  return OG_DEFAULT_TITLES[key] ?? null;
};

/**
 * Derive font size directly from the canvas geometry rather than bucketing.
 *
 * Canvas: 1200×630, padding: 80px each side → 1040px usable width.
 * Avg bold char width ≈ 0.6 × font-size → chars_per_line ≈ 1040 / (size * 0.6)
 *
 * Solve for size that fits `length` chars across `maxLines` lines:
 *   size = (usableWidth * maxLines) / (length * avgCharRatio)
 *        = (1040 * maxLines) / (length * 0.6)
 *
 * Clamped to [min, max] so extreme strings don't produce absurd values.
 */
const USABLE_WIDTH = 1040;
const AVG_CHAR_RATIO = 0.6;

/**
 * Truncate `text` so it fits within `maxLines` lines at `fontSize`,
 * appending a unicode ellipsis if shortened. This is a pre-render
 * safeguard because Satori's -webkit-line-clamp hard-clips without
 * adding an ellipsis.
 */
const truncateToFit = (
  text: string,
  fontSize: number,
  maxLines: number,
): string => {
  const charsPerLine = Math.floor(USABLE_WIDTH / (fontSize * AVG_CHAR_RATIO));
  const maxChars = charsPerLine * maxLines;
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars - 1).trimEnd() + "\u2026";
};

const dynamicFontSize = (
  text: string,
  maxLines: number,
  min: number,
  max: number,
): number =>
  Math.max(
    min,
    Math.min(
      max,
      Math.round((USABLE_WIDTH * maxLines) / (text.length * AVG_CHAR_RATIO)),
    ),
  );

// Title: up to 3 lines, 38–80px
const getTitleFontSize = (title: string): number =>
  dynamicFontSize(title, 3, 38, 80);

// Subtitle: up to 2 lines, 24–40px
const getSubtitleFontSize = (subtitle: string): number =>
  dynamicFontSize(subtitle, 2, 24, 40);

const displayPath = (slug: string): string => {
  const path = cleanOgText(slug, 80) ?? "/";
  if (path === "/") return "ewancroft.uk";
  const compactPath = path.length > 48 ? `${path.slice(0, 47)}\u2026` : path;
  return `ewancroft.uk${compactPath.startsWith("/") ? "" : "/"}${compactPath}`;
};

// Title: up to 3 lines, 44–92px (Fraunces runs narrower than the Inter it replaced)
const getDisplayTitleSize = (title: string): number =>
  dynamicFontSize(title, 3, 44, 92);

const el = (
  type: string,
  style: Record<string, unknown>,
  children?: unknown,
  props: Record<string, unknown> = {},
) => ({ type, props: { style, children, ...props } });

// Satori uses a JSX-like object structure for defining the layout.
// The card is a riso-printed strip: a colour bar of both inks, a mono
// dateline, the title in colossal Archivo Black, a mono standfirst, and
// a torn-edge "cartridge" tab bottom-right carrying the moon.
export const getOgTemplate = (entry: OgEntry) => {
  const title = cleanOgText(entry.title, MAX_TITLE_LENGTH);
  const subtitle = cleanOgText(entry.subtitle, MAX_SUBTITLE_LENGTH);
  const type = normalizeOgType(entry.type);
  const { theme } = entry;
  const { inkA, inkB } = theme;
  const moon = getMoonPhaseGeometry(entry.moonPhase);
  const barSplit = BAR_SPLIT[(type ?? "").replace(/ /g, "_")] ?? [1, 1];

  const moonChildren: Array<Record<string, unknown>> = [
    {
      type: "circle",
      props: { cx: "12", cy: "12", r: "9", fill: inkA, opacity: "0.16" },
    },
  ];
  if (moon.isFull) {
    moonChildren.push({
      type: "circle",
      props: { cx: "12", cy: "12", r: "9", fill: inkA },
    });
  } else if (moon.path) {
    moonChildren.push({
      type: "path",
      props: {
        d: moon.path,
        fill: inkA,
        fillRule: moon.isGibbous ? "evenodd" : "nonzero",
      },
    });
  }
  moonChildren.push({
    type: "circle",
    props: {
      cx: "12",
      cy: "12",
      r: "9",
      fill: "none",
      stroke: inkA,
      strokeWidth: "0.6",
    },
  });

  const body: unknown[] = [];
  if (type) {
    body.push(
      el(
        "div",
        {
          fontFamily: "JetBrains Mono",
          fontSize: "22px",
          fontWeight: 700,
          letterSpacing: "5px",
          color: theme.bg,
          backgroundColor: inkB,
          padding: "4px 16px",
          marginBottom: "32px",
        },
        type,
      ),
    );
  }
  if (title) {
    const size = getDisplayTitleSize(title);
    body.push(
      el(
        "div",
        {
          fontFamily: "Archivo Black",
          fontSize: `${size}px`,
          lineHeight: 0.98,
          letterSpacing: "-2px",
          textTransform: "uppercase",
          color: inkA,
          maxWidth: "860px",
          display: "-webkit-box",
          "-webkit-line-clamp": "3",
          "-webkit-box-orient": "vertical",
          overflow: "hidden",
        },
        truncateToFit(title, size, 3),
      ),
    );
  }
  if (subtitle) {
    const size = getSubtitleFontSize(subtitle);
    body.push(
      el(
        "div",
        {
          fontFamily: "JetBrains Mono",
          fontWeight: 400,
          fontSize: `${size}px`,
          lineHeight: 1.35,
          color: theme.fg,
          marginTop: "28px",
          maxWidth: "760px",
          display: "-webkit-box",
          "-webkit-line-clamp": "2",
          "-webkit-box-orient": "vertical",
          overflow: "hidden",
        },
        truncateToFit(subtitle, size, 2),
      ),
    );
  }

  // The moon sits in a torn-corner tab, bottom right — the same cut used
  // for the "cartridge" project tiles on the site itself.
  const moonTab = el(
    "div",
    {
      position: "absolute",
      right: "64px",
      bottom: "56px",
      width: "128px",
      height: "128px",
      display: "flex",
      backgroundColor: inkB,
      border: `3px solid ${inkA}`,
    },
    el("svg", { width: "100%", height: "100%" }, undefined, {
      viewBox: "0 0 24 24",
      children: moonChildren,
    }),
  );

  return el(
    "div",
    {
      display: "flex",
      flexDirection: "column",
      width: "100%",
      height: "100%",
      backgroundColor: theme.bg,
      color: theme.fg,
      position: "relative",
    },
    [
      el("div", { display: "flex", width: "100%", height: "16px" }, [
        el("div", { flex: barSplit[0], backgroundColor: inkA }),
        el("div", { flex: barSplit[1], backgroundColor: inkB }),
      ]),
      el(
        "div",
        {
          display: "flex",
          justifyContent: "space-between",
          padding: "20px 80px",
          borderBottom: `2px solid ${theme.fg}`,
          fontFamily: "JetBrains Mono",
          fontSize: "18px",
          letterSpacing: "3px",
          textTransform: "uppercase",
          color: theme.fg,
        },
        [el("div", {}, entry.dateline), el("div", {}, "ewancroft.uk")],
      ),
      el(
        "div",
        {
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          flex: 1,
          padding: "0 80px",
        },
        body,
      ),
      el(
        "div",
        {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          margin: "0 80px",
          padding: "20px 210px 44px 0",
          borderTop: `2px solid ${inkA}`,
          fontFamily: "JetBrains Mono",
          fontSize: "22px",
          fontWeight: 700,
          letterSpacing: "1px",
          color: theme.fg,
        },
        [
          el("div", {}, displayPath(entry.slug)),
          el("div", { color: inkA }, "Ewan Croft"),
        ],
      ),
      moonTab,
    ],
  );
};
