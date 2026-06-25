/**
 * Server-side hooks.
 *
 * The sole hook injects the dynamic Sabbat-driven theme CSS into every page
 * via transformPageChunk, so the seasonal colour palette is present before
 * any client JavaScript runs.
 */

import { getDynamicThemeCSS } from "$lib/server/theme";

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
  const response = await resolve(event, {
    transformPageChunk: ({ html }) => {
      const css = getDynamicThemeCSS();
      const styleTag = `<style id="sabbat-dynamic-theme">\n${css}\n</style>`;
      return html.replace("</head>", `${styleTag}\n</head>`);
    },
  });

  return response;
}
