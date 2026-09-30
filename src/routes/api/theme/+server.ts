import { getDynamicThemeCSS } from "$lib/server/theme";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = () =>
  new Response(getDynamicThemeCSS(), {
    headers: {
      "content-type": "text/css; charset=utf-8",
      "cache-control": "no-store, max-age=0",
    },
  });
