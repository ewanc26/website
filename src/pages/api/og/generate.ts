import type { APIRoute } from "astro";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { Resvg, initWasm } from "@resvg/resvg-wasm";
import satori from "satori";
import { cleanOgText, getDefaultOgTitle, getOgTemplate } from "$lib/og";
import { getOgThemeColors } from "$lib/server/theme";
import { getMoonIllumination } from "$lib/utils/moonPhase";
import { getAlmanac } from "$lib/utils/almanac";

// Files are read from disk relative to the project root; the Vercel adapter
// bundles them via `includeFiles` in astro.config.mjs.
const root = process.cwd();
const readAsset = async (relative: string) => {
  const buf = await readFile(join(root, relative));
  return buf.buffer.slice(
    buf.byteOffset,
    buf.byteOffset + buf.byteLength,
  ) as ArrayBuffer;
};

let wasmInitialization: Promise<void> | undefined;
const ensureWasm = () => {
  wasmInitialization ??= readAsset(
    "node_modules/@resvg/resvg-wasm/index_bg.wasm",
  )
    .then(async (buffer) => {
      try {
        await initWasm(buffer);
      } catch (error) {
        if (
          error instanceof Error &&
          error.message.includes("Already initialized")
        ) {
          return;
        }
        throw error;
      }
    })
    .catch((error) => {
      wasmInitialization = undefined;
      throw error;
    });
  return wasmInitialization;
};

const loadFont = async (url: string) => {
  try {
    return await readAsset(url);
  } catch (err) {
    console.error(`Failed to load font from ${url}:`, err);
    throw err;
  }
};

let fonts: Promise<[ArrayBuffer, ArrayBuffer, ArrayBuffer]> | undefined;
const loadFonts = () =>
  (fonts ??= Promise.all([
    loadFont(
      "node_modules/@fontsource/fraunces/files/fraunces-latin-300-normal.woff",
    ),
    loadFont(
      "node_modules/@fontsource/fraunces/files/fraunces-latin-400-italic.woff",
    ),
    loadFont("src/lib/fonts/JetBrainsMono-Regular.ttf"),
  ]).catch((error) => {
    fonts = undefined;
    throw error;
  }));

import { SITE } from "$lib/config";

export const GET: APIRoute = async ({ url }) => {
  try {
    await ensureWasm();

    const [frauncesLight, frauncesItalic, monoFont] = await loadFonts();

    const theme = getOgThemeColors();
    const almanac = getAlmanac();

    const title = cleanOgText(url.searchParams.get("title"), 180);
    const subtitle = cleanOgText(url.searchParams.get("subtitle"), 180);
    const type = url.searchParams.get("type");
    const finalTitle = title ?? getDefaultOgTitle(type) ?? SITE.title;

    const svg = await satori(
      getOgTemplate({
        title: finalTitle,
        subtitle,
        slug: cleanOgText(url.searchParams.get("slug"), 100) ?? "/",
        type,
        moonPhase: getMoonIllumination(new Date()).phase,
        dateline: [almanac.weekday, almanac.date, almanac.moon.name].join(
          " · ",
        ),
        theme,
      }),
      {
        width: 1200,
        height: 630,
        fonts: [
          {
            name: "Fraunces",
            data: frauncesLight,
            weight: 300,
            style: "normal",
          },
          {
            name: "Fraunces",
            data: frauncesItalic,
            weight: 400,
            style: "italic",
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

    return new Response(Uint8Array.from(pngData.asPng()).buffer, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": import.meta.env.DEV
          ? "no-store"
          : "public, max-age=86400, s-maxage=2592000, stale-while-revalidate=604800",
      },
    });
  } catch (e) {
    console.error("OG Generation Error:", e);
    return new Response("Error generating image", { status: 500 });
  }
};
