/**
 * OG-image template using Satori-compatible structure.
 */

export type OgEntry = {
  title: string;
  subtitle: string;
  slug: string;
  type?: string | null;
  theme: {
    bg: string;
    fg: string;
    accent: string;
    typeFg: string;
  };
};

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

  children.push(
    {
      type: "h1",
      props: {
        style: { fontSize: "80px", fontWeight: 800, marginBottom: "20px" },
        children: title,
      },
    },
    {
      type: "p",
      props: {
        style: { fontSize: "40px", color: theme.accent },
        children: subtitle,
      },
    },
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
