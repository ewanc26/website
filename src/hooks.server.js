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
