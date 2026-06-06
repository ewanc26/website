import type { RequestHandler } from "./$types";
import { Resvg } from "@resvg/resvg-js";

// Cache fonts in memory
let fontCache: Record<string, ArrayBuffer> = {};

// Load fonts from public URL
const fetchFont = async (url: string) => {
  if (fontCache[url]) return fontCache[url];
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch font: ${url}`);
  const arrayBuffer = await response.arrayBuffer();
  fontCache[url] = arrayBuffer;
  return arrayBuffer;
};

const INTER_URL =
  "https://ewancroft.uk/assets/fonts/Inter-4.1/extras/ttf/Inter-ExtraBold.ttf";

export const GET: RequestHandler = async ({ url }) => {
  const [interFont] = await Promise.all([fetchFont(INTER_URL)]);

  const svg = `
    <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="630" fill="white" />
      <text x="100" y="300" font-family="Inter" font-size="100" fill="black">TEST</text>
    </svg>
  `.trim();

  const resvg = new Resvg(svg, {
    font: {
      fontBuffers: [interFont],
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
