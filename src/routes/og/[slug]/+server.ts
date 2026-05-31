import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ params }) => {
  const { slug } = params;

  // Decode the slug
  const title = decodeURIComponent(slug);

  // Truncate long titles to fit the card
  const maxChars = 50;
  const displayTitle =
    title.length > maxChars ? title.slice(0, maxChars - 1) + "…" : title;

  // Colours based on site theme (dark mode)
  const bg = "#1a201c"; // ink-950 dark
  const surface = "#222a26"; // surface-raised
  const border = "#3a4643"; // surface-color
  const primary = "#a6e3a1"; // primary-500 equivalent
  const text = "#d9e4de"; // ink-50
  const textMuted = "#a0b0a8"; // ink-500

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

      <!-- Content -->
      <text x="80" y="120" font-family="'JetBrains Mono', monospace" font-size="20" fill="${primary}" letter-spacing="0.1em" text-transform="uppercase">TECHNICAL SPEC</text>
      
      <text x="80" y="200" font-family="'Inter', sans-serif" font-size="80" font-weight="800" fill="${text}" letter-spacing="-0.02em">${escapeXml(displayTitle)}</text>
      
      <rect x="80" y="240" width="100" height="4" fill="${primary}" />

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
