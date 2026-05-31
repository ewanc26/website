import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ params }) => {
  const { slug } = params;

  // Decode the slug — it comes URL-encoded from SiteHead
  const title = decodeURIComponent(slug);

  // Truncate long titles to fit the card
  const maxChars = 60;
  const displayTitle =
    title.length > maxChars ? title.slice(0, maxChars - 1) + "…" : title;

  // Colours matching the Catppuccin-inspired green palette
  const bg = "#1a1f1e"; // dark green base (canvas-50 dark mode)
  const surface = "#2a3230"; // raised surface (canvas-100 dark mode)
  const border = "#3a4643"; // border (canvas-200 dark mode)
  const green = "#a6e3a1"; // primary green accent (Catppuccin green)
  const greenMuted = "#6b8f68"; // muted green for secondary text
  const text = "#d4e4d8"; // light green-tinted text (ink-900 dark mode)
  const textMuted = "#8fa893"; // muted text (ink-600 dark mode)

  const svg = `
    <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style>
          @font-face {
            font-family: 'JetBrains Mono';
            src: local('JetBrains Mono'), local('JetBrainsMono');
          }
        </style>
      </defs>

      <!-- Background -->
      <rect width="1200" height="630" fill="${bg}" />

      <!-- Terminal chrome bar -->
      <rect x="0" y="0" width="1200" height="48" fill="${surface}" />
      <line x1="0" y1="48" x2="1200" y2="48" stroke="${border}" stroke-width="1" />

      <!-- Window dots -->
      <circle cx="28" cy="24" r="6" fill="#f38ba8" />
      <circle cx="52" cy="24" r="6" fill="#f9e2af" />
      <circle cx="76" cy="24" r="6" fill="${green}" />

      <!-- Terminal title in chrome bar -->
      <text x="600" y="29" font-family="'JetBrains Mono', monospace" font-size="14" fill="${textMuted}" text-anchor="middle">ewancroft.uk</text>

      <!-- Prompt line -->
      <text x="64" y="120" font-family="'JetBrains Mono', monospace" font-size="24" fill="${greenMuted}">ewan@croft:~$</text>

      <!-- Title -->
      <text x="64" y="200" font-family="'JetBrains Mono', monospace" font-size="56" font-weight="700" fill="${text}" letter-spacing="-0.02em">${escapeXml(displayTitle)}</text>

      <!-- Cursor blink -->
      <rect x="64" y="240" width="32" height="8" fill="${green}" opacity="0.8" />

      <!-- Bottom info bar -->
      <rect x="0" y="570" width="1200" height="60" fill="${surface}" />
      <line x1="0" y1="570" x2="1200" y2="570" stroke="${border}" stroke-width="1" />

      <!-- Bottom bar content -->
      <text x="64" y="606" font-family="'JetBrains Mono', monospace" font-size="16" fill="${textMuted}">anglo-scottish pagan poet programmer</text>
      <text x="1136" y="606" font-family="'JetBrains Mono', monospace" font-size="16" fill="${greenMuted}" text-anchor="end">ewancroft.uk</text>
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
