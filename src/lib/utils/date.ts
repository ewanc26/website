/**
 * Extract the year/month/day components of an ISO timestamp in the site's
 * canonical timezone (Europe/London).
 *
 * Used to derive stable blog URLs (`/blog/YYYY/MM/DD/slug`). Do not round-trip
 * through `toLocaleString` + `new Date()` — the resulting "dd/mm/yyyy" string
 * is re-parsed as US format and yields the wrong date.
 */
export function blogDateParts(iso: string): {
  year: string;
  month: string;
  day: string;
} {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(iso));

  const byType = new Map(parts.map((p) => [p.type, p.value]));
  return {
    year: byType.get("year") ?? "",
    month: byType.get("month") ?? "",
    day: byType.get("day") ?? "",
  };
}
