import type { RequestHandler } from "./$types";
import {
  getCurrentPrimaryShade,
  baseline,
  getHueRotation,
} from "$lib/server/theme";
import chroma from "chroma-js";

export const GET: RequestHandler = async ({ url }) => {
  const title = url.searchParams.get("title") ?? "ewan croft";
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
  const rotation = getHueRotation(now);

  const getSeasonalColor = (scale: keyof typeof baseline, step: number) => {
    const data = (baseline[scale] as any)[step];
    const [l, c, hBase] = data.light;
    const h = (hBase + rotation) % 360;
    return chroma.oklch(l, c, h).hex();
  };

  // Colours based on site theme, with dynamic Sabbat-interpolated primary
  const bg = getSeasonalColor("background", 950);
  const surface = getSeasonalColor("background", 100);
  const border = getSeasonalColor("background", 400);
  const primary = getCurrentPrimaryShade(500);
  const text = getSeasonalColor("text", 50);
  const textMuted = getSeasonalColor("text", 500);

  const svg = `
    <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style>
          @font-face {
            font-family: 'Inter';
            font-style: normal;
            font-weight: 800;
            src: local('Inter-ExtraBold');
          }
          @font-face {
            font-family: 'JetBrains Mono';
            src: local('JetBrains Mono');
          }
        </style>
      </defs>

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
      ${typeParam && typeParam !== "TECHNICAL SPEC" ? `<text x="80" y="120" font-family="'JetBrains Mono', monospace" font-size="20" fill="${primary}" letter-spacing="0.1em" text-transform="uppercase">${escapeXml(typeParam)}</text>` : ""}

      <text x="80" y="${typeParam && typeParam !== "TECHNICAL SPEC" ? "200" : "160"}" font-family="'Inter', sans-serif" font-size="${fontSize}" font-weight="800" fill="${text}" letter-spacing="-0.02em">${escapeXml(displayTitle)}</text>
      
      ${subtitle ? `<text x="80" y="${typeParam && typeParam !== "TECHNICAL SPEC" ? "280" : "240"}" font-family="'Inter', sans-serif" font-size="40" font-weight="400" fill="${textMuted}">${escapeXml(subtitle)}</text>` : ""}

      <rect x="80" y="${subtitle ? "320" : typeParam && typeParam !== "TECHNICAL SPEC" ? "240" : "200"}" width="100" height="4" fill="${primary}" />

      <!-- Footer info -->
      <text x="80" y="550" font-family="'JetBrains Mono', monospace" font-size="20" fill="${textMuted}">ewancroft.uk</text>
    </svg>
  `.trim();

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
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
