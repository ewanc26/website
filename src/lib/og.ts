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
        style: {
          fontSize: "80px",
          fontWeight: 800,
          marginBottom: "20px",
        },
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
      },
      children,
    },
  };
};
