/**
 * GET /.well-known/site.standard.publication
 *
 * Standard.site publication discovery endpoint.
 * Returns the AT Protocol URI for the blog publication record,
 * enabling Standard.site ecosystem tools to link back to the
 * canonical publication source.
 */

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
