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
const MONO_URL =
  "https://ewancroft.uk/assets/fonts/JetBrainsMono-2.304/fonts/ttf/JetBrainsMono-Regular.ttf";

export const GET: RequestHandler = async ({ url }) => {
  const [interFont, monoFont] = await Promise.all([
    fetchFont(INTER_URL),
    fetchFont(MONO_URL),
  ]);

  const title = url.searchParams.get("title") ?? "ewancroft.uk";
  const subtitle = url.searchParams.get("subtitle") ?? "software engineer";

  // Colours based on site theme (dark mode)
  const BG = "#0a1306";
  const FG = "#f1f6ee";
  const ACCENT = "#64bb44";

  const svg = `
    <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="630" fill="${BG}" />
      
      <text x="100" y="300" font-family="Inter" font-size="80" font-weight="800" fill="${FG}">${escapeXml(title)}</text>
      <text x="100" y="380" font-family="Inter" font-size="40" fill="${ACCENT}">${escapeXml(subtitle)}</text>
      
      <text x="100" y="550" font-family="JetBrains Mono" font-size="20" fill="${FG}">ewancroft.uk</text>
    </svg>
  `.trim();

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
    },
  });
};

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
