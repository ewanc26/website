/** GET /.well-known/site.standard.publication — AT URI of the blog publication. */
import type { APIRoute } from "astro";
import {
  PUBLIC_ATPROTO_DID,
  PUBLIC_LEAFLET_BLOG_PUBLICATION,
} from "$env/static/public";

export const GET: APIRoute = () => {
  if (!PUBLIC_ATPROTO_DID || !PUBLIC_LEAFLET_BLOG_PUBLICATION) {
    return new Response("Not Found", { status: 404 });
  }
  return new Response(
    `at://${PUBLIC_ATPROTO_DID}/site.standard.publication/${PUBLIC_LEAFLET_BLOG_PUBLICATION}`,
    {
      headers: {
        "Content-Type": "text/plain",
        "Cache-Control": "public, max-age=3600",
      },
    },
  );
};
