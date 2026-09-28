/**
 * Stand-in for SvelteKit's `$app/state`. Islands that read `page.url` stay
 * reactive across Astro view-transition navigations, which fire
 * `astro:page-load` after each swap. `page.data` is empty: pages that need
 * data in an island pass it as props instead.
 */
const initial =
  typeof location !== "undefined" ? location.href : "http://localhost/";

export const page = $state({
  url: new URL(initial),
  data: {} as Record<string, unknown>,
  params: {} as Record<string, string>,
});

if (typeof document !== "undefined") {
  document.addEventListener("astro:page-load", () => {
    page.url = new URL(location.href);
  });
}
