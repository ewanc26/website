/**
 * OG-image template using Satori-compatible structure.
 */

export type OgEntry = {
  title: string | null;
  subtitle: string | null;
  slug: string;
  type?: string | null;
  theme: {
    bg: string;
    fg: string;
    accent: string;
    typeFg: string;
  };
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

// Satori uses a JSX-like object structure for defining the layout
export const getOgTemplate = (entry: OgEntry) => {
  const { title, subtitle, type, theme } = entry;

  const children = [];

  // Conditionally render type badge
  if (type && type !== "TECHNICAL SPEC") {
    children.push({
      type: "div",
      props: {
        style: {
          fontSize: "20px",
          color: theme.typeFg,
          fontFamily: "JetBrains Mono",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          marginBottom: "20px",
        },
        children: type,
      },
    });
  }

  // Only render title when provided
  if (title) {
    children.push({
      type: "h1",
      props: {
        style: {
          fontSize: `${getTitleFontSize(title)}px`,
          fontWeight: 800,
          marginBottom: "20px",
          display: "-webkit-box",
          "-webkit-line-clamp": "3",
          "-webkit-box-orient": "vertical",
          overflow: "hidden",
          lineHeight: 1.15,
        },
        children: title,
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
          color: theme.accent,
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
        children: "ewancroft.uk",
      },
    },
    // Pentacle Icon
    {
      type: "svg",
      props: {
        width: "100",
        height: "100",
        viewBox: "0 0 12 12",
        style: {
          position: "absolute",
          bottom: "80px",
          right: "80px",
          opacity: "0.1",
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
        padding: "80px",
        justifyContent: "center",
        color: theme.fg,
        position: "relative",
      },
      children,
    },
  };
};
