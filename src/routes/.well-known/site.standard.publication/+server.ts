import type { RequestHandler } from "./$types";
import {
  PUBLIC_ATPROTO_DID,
  PUBLIC_LEAFLET_BLOG_PUBLICATION,
} from "$env/static/public";

export const prerender = false;

export const GET: RequestHandler = ({ setHeaders }) => {
  if (!PUBLIC_ATPROTO_DID || !PUBLIC_LEAFLET_BLOG_PUBLICATION) {
    return new Response("Not Found", { status: 404 });
  }

  setHeaders({
    "Content-Type": "text/plain",
    "Cache-Control": "public, max-age=3600",
  });

  const atUri = `at://${PUBLIC_ATPROTO_DID}/site.standard.publication/${PUBLIC_LEAFLET_BLOG_PUBLICATION}`;
  return new Response(atUri);
};
