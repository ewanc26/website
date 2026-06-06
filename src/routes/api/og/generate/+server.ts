import type { RequestHandler } from "./$types";
import { Resvg } from "@resvg/resvg-js";
import { buildOgSvg } from "$lib/og";
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load fonts with fallback to local file
const loadFont = async (url: string, localPath: string) => {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const buffer = await response.arrayBuffer();
    if (buffer.byteLength === 0) throw new Error("Empty buffer");
    console.log(`Successfully fetched font from: ${url}`);
    return buffer;
  } catch (e) {
    console.error(`Failed to fetch font from ${url}:`, e);
    // Fallback
    const p = path.resolve(__dirname, `../../../lib/assets/fonts/${localPath}`);
    console.log(`Attempting fallback read from: ${p}`);
    return readFileSync(p).buffer;
  }
};

const INTER_URL =
  "https://ewancroft.uk/assets/fonts/Inter-4.1/extras/ttf/Inter-ExtraBold.ttf";
const MONO_URL =
  "https://ewancroft.uk/assets/fonts/JetBrainsMono-2.304/fonts/ttf/JetBrainsMono-Regular.ttf";

export const GET: RequestHandler = async ({ url }) => {
  try {
    const [interFont, monoFont] = await Promise.all([
      loadFont(INTER_URL, "Inter-4.1/extras/ttf/Inter-ExtraBold.ttf"),
      loadFont(
        MONO_URL,
        "JetBrainsMono-2.304/fonts/ttf/JetBrainsMono-Regular.ttf",
      ),
    ]);

    const title = url.searchParams.get("title") ?? "ewancroft.uk";
    const subtitle = url.searchParams.get("subtitle") ?? "software engineer";
    const slug = url.searchParams.get("slug") ?? "/";

    const svg = buildOgSvg({ title, subtitle, slug });

    const resvg = new Resvg(svg, {
      font: {
        fontBuffers: [interFont, monoFont],
        defaultFontFamily: "Inter",
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
