import { getDynamicThemeCSS } from "$lib/server/theme";

export const GET = () => {
  return new Response(getDynamicThemeCSS(), {
    headers: {
      "content-type": "text/css; charset=utf-8",
      "cache-control": "no-store, max-age=0",
    },
  });
};
