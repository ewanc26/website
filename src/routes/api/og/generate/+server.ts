import type { RequestHandler } from "./$types";
import { Resvg } from "@resvg/resvg-js";
import satori from "satori";
import { getOgTemplate } from "$lib/og";
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

    const svg = await satori(
      getOgTemplate({
        title: url.searchParams.get("title") ?? "ewancroft.uk",
        subtitle: url.searchParams.get("subtitle") ?? "software engineer",
        slug: url.searchParams.get("slug") ?? "/",
      }),
      {
        width: 1200,
        height: 630,
        fonts: [
          {
            name: "Inter",
            data: interFont,
            weight: 800,
            style: "normal",
          },
          {
            name: "JetBrains Mono",
            data: monoFont,
            weight: 400,
            style: "normal",
          },
        ],
      },
    );

    const resvg = new Resvg(svg, {
      fitTo: { mode: "width", value: 1200 },
    });

    const pngData = resvg.render();

    setHeaders({
      "Content-Type": "image/png",
      "Cache-Control": import.meta.env.DEV
        ? "no-store"
        : "public, max-age=86400, s-maxage=31536000, stale-while-revalidate",
    });

    return new Response(pngData.asPng());
  } catch (e) {
    console.error("OG Generation Error:", e);
    return new Response("Error generating image", { status: 500 });
  }
};
