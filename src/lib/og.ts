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
  theme: {
    bg: string;
    fg: string;
    accent: string;
    typeFg: string;
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

// Satori uses a JSX-like object structure for defining the layout
export const getOgTemplate = (entry: OgEntry) => {
  const title = cleanOgText(entry.title, MAX_TITLE_LENGTH);
  const subtitle = cleanOgText(entry.subtitle, MAX_SUBTITLE_LENGTH);
  const type = normalizeOgType(entry.type);
  const { theme } = entry;
  const moon = getMoonPhaseGeometry(entry.moonPhase);

  const moonChildren: Array<Record<string, unknown>> = [
    {
      type: "circle",
      props: {
        cx: "12",
        cy: "12",
        r: "9",
        fill: theme.accent,
        opacity: "0.14",
      },
    },
  ];

  if (moon.isFull) {
    moonChildren.push({
      type: "circle",
      props: { cx: "12", cy: "12", r: "9", fill: theme.accent },
    });
  } else if (moon.path) {
    moonChildren.push({
      type: "path",
      props: {
        d: moon.path,
        fill: theme.accent,
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
      stroke: theme.accent,
      strokeWidth: "1",
      opacity: moon.isNew ? "0.8" : "0.3",
    },
  });

  const children = [];

  if (type) {
    children.push({
      type: "div",
      props: {
        style: {
          fontSize: "19px",
          color: theme.typeFg,
          fontFamily: "JetBrains Mono",
          textTransform: "uppercase",
          letterSpacing: "0",
          marginBottom: "24px",
        },
        children: type,
      },
    });
  }

  // Only render title when provided
  if (title) {
    const titleFontSize = getTitleFontSize(title);
    const displayTitle = truncateToFit(title, titleFontSize, 3);
    children.push({
      type: "h1",
      props: {
        style: {
          fontSize: `${titleFontSize}px`,
          fontWeight: 800,
          margin: "0 0 20px 0",
          display: "-webkit-box",
          "-webkit-line-clamp": "3",
          "-webkit-box-orient": "vertical",
          overflow: "hidden",
          lineHeight: 1.15,
        },
        children: displayTitle,
      },
    });
  }

  // Only render subtitle when one was actually provided
  if (subtitle) {
    const subtitleFontSize = getSubtitleFontSize(subtitle);
    const displaySubtitle = truncateToFit(subtitle, subtitleFontSize, 2);
    children.push({
      type: "p",
      props: {
        style: {
          fontSize: `${subtitleFontSize}px`,
          color: theme.typeFg,
          margin: "0",
          display: "-webkit-box",
          "-webkit-line-clamp": "2",
          "-webkit-box-orient": "vertical",
          overflow: "hidden",
          lineHeight: 1.4,
        },
        children: displaySubtitle,
      },
    });
  }

  children.push(
    {
      type: "div",
      props: {
        style: {
          marginTop: "auto",
          fontSize: "20px",
          fontFamily: "JetBrains Mono",
          color: theme.fg,
        },
        children: displayPath(entry.slug),
      },
    },
    // Pentacle Icon
    {
      type: "svg",
      props: {
        width: "160",
        height: "160",
        viewBox: "0 0 12 12",
        style: {
          position: "absolute",
          bottom: "54px",
          right: "64px",
          opacity: "0.13",
        },
        children: [
          {
            type: "path",
            props: {
              d: "M11 6A5 5 0 1 0 1 6a5 5 0 0 0 10 0ZM6 1l2.936 9.048-7.692-5.595h9.512l-7.692 5.595Z",
              stroke: theme.accent,
              fill: "none",
              strokeWidth: "0.6",
              strokeLinecap: "round",
              strokeLinejoin: "round",
            },
          },
        ],
      },
    },
  );

  return {
    type: "div",
    props: {
      style: {
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        backgroundColor: theme.bg,
        padding: "72px 80px 64px",
        justifyContent: "center",
        color: theme.fg,
        position: "relative",
      },
      children: [
        {
          type: "svg",
          props: {
            width: "210",
            height: "210",
            viewBox: "0 0 24 24",
            style: {
              position: "absolute",
              top: "48px",
              right: "58px",
              opacity: "0.11",
            },
            children: moonChildren,
          },
        },
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              top: "0",
              left: "0",
              width: "100%",
              height: "8px",
              backgroundColor: theme.accent,
            },
          },
        },
        ...children,
      ],
    },
  };
};
