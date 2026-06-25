/**
 * Convert a title to a URL-friendly slug.
 * Lowercases, replaces non-alphanumeric runs with hyphens,
 * strips leading/trailing hyphens. Matches Leaflet's slug logic.
 */
export function normalizeSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric chars with hyphen
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}
