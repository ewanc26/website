import type { RequestHandler } from "./$types";
import { Resvg } from "@resvg/resvg-js";
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { buildOgSvg } from "$lib/og";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load fonts from the bundled directory.
// Vite puts bundled assets in the build output, so we need a path that works in production.
// Based on typical SvelteKit build output:
// .svelte-kit/output/server/entries/endpoints/api/og/generate/+server.ts.js
// Assets are usually in .svelte-kit/output/server/lib/assets/fonts/...
const loadFont = (relativePath: string) =>
  readFileSync(
    path.resolve(__dirname, `../../../lib/assets/fonts/${relativePath}`),
  );

const interFontBuffer = loadFont("Inter-4.1/extras/ttf/Inter-ExtraBold.ttf");
const monoFontBuffer = loadFont(
  "JetBrainsMono-2.304/fonts/ttf/JetBrainsMono-Regular.ttf",
);

export const GET: RequestHandler = async ({ url }) => {
  const title = url.searchParams.get("title") ?? "ewancroft.uk";
  const subtitle = url.searchParams.get("subtitle") ?? "software engineer";
  const slug = url.searchParams.get("slug") ?? "/";

  const svg = buildOgSvg({ title, subtitle, slug });

  const resvg = new Resvg(svg, {
    font: {
      fontBuffers: [interFontBuffer, monoFontBuffer],
      defaultFontFamily: "Inter",
    },
    fitTo: { mode: "width", value: 1200 },
  });
  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();

  return new Response(new Uint8Array(pngBuffer), {
    headers: {
      "Content-Type": "image/png",
    },
  });
};
