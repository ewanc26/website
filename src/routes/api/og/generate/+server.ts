import type { RequestHandler } from "./$types";
import { Resvg, initWasm } from "@resvg/resvg-wasm";
import satori from "satori";
import { getOgTemplate } from "$lib/og";
import { read } from "$app/server";
import { getOgThemeColors } from "$lib/server/theme";
import wasmModule from "@resvg/resvg-wasm/index_bg.wasm?module";

let wasmInitialized = false;
async function ensureWasm() {
  if (wasmInitialized) return;
  try {
    if (typeof wasmModule === "string") {
      // Strip any query parameters (like ?module or ?url) that Vite might append
      const assetPath = wasmModule.split("?")[0];
      const response = await read(assetPath);
      await initWasm(await response.arrayBuffer());
    } else {
      await initWasm(wasmModule as unknown as WebAssembly.Module);
    }
    wasmInitialized = true;
  } catch (err: any) {
    if (err.message?.includes("Already initialized")) {
      wasmInitialized = true;
      return;
    }
    console.error("Failed to initialize WASM at path:", wasmModule, err);
    throw err;
  }
}

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

export const GET: RequestHandler = async ({ url, setHeaders }) => {
  try {
    await ensureWasm();

    const [interFont, monoFont] = await Promise.all([
      loadFont(interUrl),
      loadFont(monoUrl),
    ]);

    const theme = getOgThemeColors();

    const svg = await satori(
      getOgTemplate({
        title: url.searchParams.get("title") ?? "ewancroft.uk",
        subtitle: url.searchParams.get("subtitle") ?? "software engineer",
        slug: url.searchParams.get("slug") ?? "/",
        type: url.searchParams.get("type"),
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
        : "public, max-age=86400, s-maxage=31536000, stale-while-revalidate",
    });

    return new Response(pngData.asPng());
  } catch (e) {
    console.error("OG Generation Error:", e);
    return new Response("Error generating image", { status: 500 });
  }
};
