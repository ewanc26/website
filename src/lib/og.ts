/**
 * OG-image template using Satori-compatible structure.
 */

export type OgEntry = {
  title: string;
  subtitle: string;
  slug: string;
};

// Satori uses a JSX-like object structure for defining the layout
export const getOgTemplate = (entry: OgEntry) => {
  const { title, subtitle } = entry;

  // Dark mode design tokens
  const BG = "#0a1306";
  const FG = "#f1f6ee";
  const ACCENT = "#64bb44";

  return {
    type: "div",
    props: {
      style: {
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        backgroundColor: BG,
        padding: "80px",
        justifyContent: "center",
        color: FG,
      },
      children: [
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
            style: { fontSize: "40px", color: ACCENT },
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
            },
            children: "ewancroft.uk",
          },
        },
      ],
    },
  };
};
