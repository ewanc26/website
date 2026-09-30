import { Resvg, initWasm } from "@resvg/resvg-wasm";
import wasmDataUri from "@resvg/resvg-wasm/index_bg.wasm?inline";
import archivoUri from "../../../../../node_modules/@fontsource/archivo-black/files/archivo-black-latin-400-normal.woff?inline";
import monoUri from "../../../../lib/fonts/JetBrainsMono-Regular.ttf?inline";
import satori from "satori";
import { cleanOgText, getDefaultOgTitle, getOgTemplate } from "$lib/og";
import { getOgThemeColors } from "$lib/server/theme";
import { getMoonIllumination } from "$lib/utils/moonPhase";
import { getAlmanac } from "$lib/utils/almanac";
import { SITE } from "$lib/config";
import type { RequestHandler } from "./$types";

const decode = (uri: string): ArrayBuffer => {
  const buf = Buffer.from(uri.slice(uri.indexOf(",") + 1), "base64");
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
};

let wasmInitialization: Promise<void> | undefined;
const ensureWasm = () => {
  wasmInitialization ??= Promise.resolve(decode(wasmDataUri))
    .then(async (buffer) => {
      try {
        await initWasm(buffer);
      } catch (error) {
        if (error instanceof Error && error.message.includes("Already initialized")) {
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

const loadFonts = async (): Promise<[ArrayBuffer, ArrayBuffer]> => [decode(archivoUri), decode(monoUri)];

export const GET: RequestHandler = async ({ url }) => {
  try {
    await ensureWasm();

    const [archivoBlack, monoFont] = await loadFonts();

    const theme = getOgThemeColors();
    const almanac = getAlmanac();

    const title = cleanOgText(url.searchParams.get("title"), 180);
    const type = url.searchParams.get("type");
    const subtitle = cleanOgText(url.searchParams.get("subtitle"), 180) ?? (type?.toUpperCase() === "HOME" ? "Poems, notes and the things I make." : null);
    const finalTitle = title ?? getDefaultOgTitle(type) ?? SITE.title;

    const svg = await satori(
      getOgTemplate({
        title: finalTitle,
        subtitle,
        slug: cleanOgText(url.searchParams.get("slug"), 100) ?? "/",
        type,
        moonPhase: getMoonIllumination(new Date()).phase,
        dateline: almanac.moon.name,
        theme,
      }),
      {
        width: 1200,
        height: 630,
        fonts: [
          { name: "Archivo Black", data: archivoBlack, weight: 900, style: "normal" },
          { name: "JetBrains Mono", data: monoFont, weight: 400, style: "normal" },
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
        "Cache-Control": import.meta.env.DEV ? "no-store" : "public, max-age=86400, s-maxage=2592000, stale-while-revalidate=604800",
      },
    });
  } catch (e) {
    console.error("OG Generation Error:", e);
    return new Response("Error generating image", { status: 500 });
  }
};
