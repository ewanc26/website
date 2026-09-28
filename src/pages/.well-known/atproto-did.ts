/** GET /.well-known/atproto-did — did:plc → domain binding, as plain text. */
import type { APIRoute } from "astro";
import { PUBLIC_ATPROTO_DID } from "$env/static/public";

export const GET: APIRoute = () =>
  new Response(PUBLIC_ATPROTO_DID ?? "", {
    headers: { "Content-Type": "text/plain" },
  });
