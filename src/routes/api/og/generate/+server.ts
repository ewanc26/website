import type { RequestHandler } from "./$types";
import { Resvg } from "@resvg/resvg-js";
import { buildOgSvg } from "$lib/og";

const fetchFont = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return await response.arrayBuffer();
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

    const svg = buildOgSvg({
      title: url.searchParams.get("title") ?? "ewancroft.uk",
      subtitle: url.searchParams.get("subtitle") ?? "software engineer",
      slug: url.searchParams.get("slug") ?? "/",
    });

    const resvg = new Resvg(svg, {
      font: {
        fontBuffers: [interFont, monoFont],
        defaultFontFamily: "Inter",
      },
      fitTo: { mode: "width", value: 1200 },
    });

    const pngData = resvg.render();
    return new Response(pngData.asPng(), {
      headers: { "Content-Type": "image/png" },
    });
  } catch (e) {
    console.error("OG Generation Error:", e);
    return new Response("Error", { status: 500 });
  }
};
