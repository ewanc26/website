import type { RequestHandler } from "./$types";
import { Resvg, initWasm } from "@resvg/resvg-wasm";
import { buildOgSvg } from "$lib/og";
import { read } from "$app/server";
import wasmModule from "@resvg/resvg-wasm/index_bg.wasm?module";

let wasmInitialized = false;
async function ensureWasm() {
  if (wasmInitialized) return;
  try {
    await initWasm(wasmModule as unknown as WebAssembly.Module);
    wasmInitialized = true;
  } catch (err: any) {
    if (err.message?.includes("Already initialized")) {
      wasmInitialized = true;
      return;
    }
    throw err;
  }
}

const fetchFont = async (url: string) => {
  const response = await read(url);
  return await response.arrayBuffer();
};

import interUrl from "$lib/fonts/Inter-ExtraBold.ttf";
import monoUrl from "$lib/fonts/JetBrainsMono-Regular.ttf";

export const GET: RequestHandler = async ({ url, setHeaders }) => {
  try {
    await ensureWasm();

    const [interFont, monoFont] = await Promise.all([
      fetchFont(interUrl),
      fetchFont(monoUrl),
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

    // Cache control: no-store in dev, long-lived in production
    const isDev = import.meta.env.DEV;
    setHeaders({
      "Content-Type": "image/png",
      "Cache-Control": isDev
        ? "no-store"
        : "public, max-age=86400, s-maxage=31536000, stale-while-revalidate",
    });

    return new Response(pngData.asPng());
  } catch (e) {
    console.error("OG Generation Error:", e);
    return new Response("Error generating image", { status: 500 });
  }
};
