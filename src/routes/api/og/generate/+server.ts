import type { RequestHandler } from "./$types";
import { Resvg } from "@resvg/resvg-js";
import { buildOgSvg } from "$lib/og";

// Pre-load fonts by fetching them at build time / startup (serverless)
// This is reliable because it uses a fully qualified URL.
let fontCache: Record<string, ArrayBuffer> = {};

const fetchFont = async (url: string) => {
  if (fontCache[url]) return fontCache[url];
  const response = await fetch(url);
  if (!response.ok)
    throw new Error(
      `Failed to fetch font: ${url} (status: ${response.status})`,
    );
  const arrayBuffer = await response.arrayBuffer();
  fontCache[url] = arrayBuffer;
  return arrayBuffer;
};

const INTER_URL =
  "https://ewancroft.uk/assets/fonts/Inter-4.1/extras/ttf/Inter-ExtraBold.ttf";
const MONO_URL =
  "https://ewancroft.uk/assets/fonts/JetBrainsMono-2.304/fonts/ttf/JetBrainsMono-Regular.ttf";

export const GET: RequestHandler = async ({ url }) => {
  try {
    const [interFont, monoFont] = await Promise.all([
      fetchFont(INTER_URL),
      fetchFont(MONO_URL),
    ]);

    const title = url.searchParams.get("title") ?? "ewancroft.uk";
    const subtitle = url.searchParams.get("subtitle") ?? "software engineer";
    const slug = url.searchParams.get("slug") ?? "/";

    const svg = buildOgSvg({ title, subtitle, slug });

    // Important: Resvg needs to know about the font families
    const resvg = new Resvg(svg, {
      font: {
        fontBuffers: [interFont, monoFont],
        loadSystemFonts: false, // Don't rely on system fonts
      },
      fitTo: { mode: "width", value: 1200 },
    });

    const pngData = resvg.render();
    const pngBuffer = pngData.asPng();

    return new Response(new Uint8Array(pngBuffer), {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (e) {
    console.error("OG Generation Error:", e);
    return new Response("Error generating image", { status: 500 });
  }
};
