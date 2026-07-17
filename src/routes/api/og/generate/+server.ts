import type { RequestHandler } from "./$types";
import { Resvg, initWasm } from "@resvg/resvg-wasm";
import satori from "satori";
import { cleanOgText, getDefaultOgTitle, getOgTemplate } from "$lib/og";
import { read } from "$app/server";
import { getOgThemeColors } from "$lib/server/theme";
import { getMoonIllumination } from "$lib/utils/moonPhase";
import wasmUrl from "@resvg/resvg-wasm/index_bg.wasm?url";

let wasmInitialization: Promise<void> | undefined;
const ensureWasm = () => {
  wasmInitialization ??= read(wasmUrl)
    .arrayBuffer()
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

import interUrl from "$lib/fonts/Inter-ExtraBold.ttf";
import monoUrl from "$lib/fonts/JetBrainsMono-Regular.ttf";

const loadFont = async (url: string) => {
  try {
    const response = await read(url);
    return await response.arrayBuffer();
  } catch (err) {
    console.error(`Failed to load font from ${url}:`, err);
    throw err;
  }
};

let fonts: Promise<[ArrayBuffer, ArrayBuffer]> | undefined;
const loadFonts = () =>
  (fonts ??= Promise.all([loadFont(interUrl), loadFont(monoUrl)]).catch(
    (error) => {
      fonts = undefined;
      throw error;
    },
  ));

import { SITE } from "$lib/config";

export const GET: RequestHandler = async ({ url, setHeaders }) => {
  try {
    await ensureWasm();

    const [interFont, monoFont] = await loadFonts();

    const theme = getOgThemeColors();

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
        theme,
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
        : "public, max-age=86400, s-maxage=2592000, stale-while-revalidate=604800",
    });

    return new Response(Uint8Array.from(pngData.asPng()).buffer);
  } catch (e) {
    console.error("OG Generation Error:", e);
    return new Response("Error generating image", { status: 500 });
  }
};
