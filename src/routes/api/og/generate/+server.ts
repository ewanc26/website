import type { RequestHandler } from "./$types";
import { Resvg } from "@resvg/resvg-js";
import { buildOgSvg } from "$lib/og";
import { read } from "$app/server";

// Import fonts as Vite URLs
import interUrl from "$lib/fonts/Inter-ExtraBold.ttf";
import monoUrl from "$lib/fonts/JetBrainsMono-Regular.ttf";

const loadFont = async (url: string) => {
  const response = await read(url);
  return await response.arrayBuffer();
};

export const GET: RequestHandler = async ({ url, setHeaders }) => {
  try {
    const [interFont, monoFont] = await Promise.all([
      loadFont(interUrl),
      loadFont(monoUrl),
    ]);

    const svg = buildOgSvg({
      title: url.searchParams.get("title") ?? "ewancroft.uk",
      subtitle: url.searchParams.get("subtitle") ?? "software engineer",
      slug: url.searchParams.get("slug") ?? "/",
    });

    const resvg = new Resvg(svg, {
      font: {
        fontBuffers: [interFont, monoFont],
        loadSystemFonts: false,
        defaultFontFamily: "Inter",
      },
      fitTo: { mode: "width", value: 1200 },
    });

    const pngData = resvg.render();

    setHeaders({
      "Content-Type": "image/png",
      "Cache-Control":
        "public, max-age=86400, s-maxage=31536000, stale-while-revalidate",
    });

    return new Response(pngData.asPng());
  } catch (e) {
    console.error("OG Generation Error:", e);
    return new Response("Error generating image", { status: 500 });
  }
};
