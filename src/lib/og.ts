/**
 * Shared OG-image template.
 */

export type OgEntry = {
  title: string;
  subtitle: string;
  slug: string;
};

export function buildOgSvg(entry: OgEntry): string {
  const { title, subtitle, slug } = entry;

  // Dark mode design tokens adapted to project
  const BG = "#0a1306";
  const FG = "#f1f6ee";
  const ACCENT = "#64bb44";

  return `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="630" fill="${BG}" />
      
      <text x="100" y="300" font-family="Inter" font-size="80" font-weight="800" fill="${FG}">${escape(title)}</text>
      <text x="100" y="380" font-family="Inter" font-size="40" fill="${ACCENT}">${escape(subtitle)}</text>
      
      <text x="100" y="550" font-family="JetBrains Mono" font-size="20" fill="${FG}">ewancroft.uk</text>
    </svg>`;
}

function escape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
