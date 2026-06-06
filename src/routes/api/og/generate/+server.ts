import type { RequestHandler } from "./$types";
import { Resvg } from "@resvg/resvg-js";
import { baseline, getTargetHues } from "$lib/server/theme";
import chroma from "chroma-js";

// Cache fonts in memory
let fontCache: Record<string, ArrayBuffer> = {};

// Load fonts from public URL to avoid filesystem issues
const fetchFont = async (url: string) => {
  if (fontCache[url]) return fontCache[url];
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch font: ${url}`);
  const arrayBuffer = await response.arrayBuffer();
  fontCache[url] = arrayBuffer;
  return arrayBuffer;
};

// Use public URLs (these will be served by the site itself or a CDN)
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
  const subtitle = url.searchParams.get("subtitle");
  const typeParam = url.searchParams.get("type") ?? "";

  // Dynamic font size based on title length
  let fontSize = 80;
  if (title.length > 40) fontSize = 50;
  else if (title.length > 25) fontSize = 65;

  // Truncate long titles to fit the card
  const maxChars = 50;
  const displayTitle =
    title.length > maxChars ? title.slice(0, maxChars - 1) + "…" : title;

  const now = new Date();
  const [primaryHue] = getTargetHues(now);

  const getSeasonalColor = (scale: keyof typeof baseline, step: number) => {
    const data = (baseline[scale] as any)[step];
    // Force dark mode values for OG images (50 is dark, 950 is light)
    const [l, c] = data.dark;
    return chroma.oklch(l, c, primaryHue).hex();
  };

  // Colours based on site theme (forced dark mode)
  // Aligned with surface tokens: sunken (50), raised (100), base (200)
  const bg = getSeasonalColor("background", 50);
  const surface = getSeasonalColor("background", 100);
  const border = getSeasonalColor("background", 200);

  // Use dark mode values explicitly for primary and text
  const primaryData = baseline.primary[500].dark;
  const primary = chroma
    .oklch(primaryData[0], primaryData[1], primaryHue)
    .hex();
  const text = getSeasonalColor("text", 950);
  const textMuted = getSeasonalColor("text", 700);

  const svg = `
    <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
      <!-- Background -->
      <rect width="1200" height="630" fill="${bg}" />

      <!-- Minimalist border card -->
      <rect x="40" y="40" width="1120" height="550" rx="16" fill="${surface}" stroke="${border}" stroke-width="2" />

      <!-- Subtle Decorative Symbols (on card bottom-right) -->
      <g opacity="0.06">
        <!-- Pentacle -->
        <g transform="translate(1020, 450) scale(10)" fill="none" stroke="${primary}" stroke-width="0.6" stroke-linecap="round" stroke-linejoin="round">
          <path d="M11 6A5 5 0 1 0 1 6a5 5 0 0 0 10 0ZM6 1l2.936 9.048-7.692-5.595h9.512l-7.692 5.595Z" />
        </g>
      </g>

      <!-- Content -->
      ${
        typeParam && typeParam !== "TECHNICAL SPEC"
          ? `<text x="80" y="120" font-family="JetBrains Mono" font-size="20" fill="${primary}" letter-spacing="0.1em" text-transform="uppercase">${escapeXml(
              typeParam,
            )}</text>`
          : ""
      }

      <text x="80" y="${
        typeParam && typeParam !== "TECHNICAL SPEC" ? "200" : "160"
      }" font-family="Inter" font-size="${fontSize}" font-weight="800" fill="${text}" letter-spacing="-0.03em">${escapeXml(
        displayTitle,
      )}</text>

      ${
        subtitle
          ? `<text x="80" y="${
              typeParam && typeParam !== "TECHNICAL SPEC" ? "280" : "240"
            }" font-family="Inter" font-size="40" font-weight="400" fill="${textMuted}">${escapeXml(
              subtitle,
            )}</text>`
          : ""
      }

      <rect x="80" y="${
        subtitle
          ? "320"
          : typeParam && typeParam !== "TECHNICAL SPEC"
            ? "240"
            : "200"
      }" width="100" height="4" fill="${primary}" />

      <!-- Footer info -->
      <text x="80" y="550" font-family="JetBrains Mono" font-size="20" fill="${textMuted}">ewancroft.uk</text>
    </svg>
  `.trim();

  const resvg = new Resvg(svg, {
    font: {
      fontBuffers: [interFont, monoFont],
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
};

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
