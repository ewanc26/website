/** GET /.well-known/atproto-did — did:plc -> domain binding, as plain text. */
import { PUBLIC_ATPROTO_DID } from "$env/static/public";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = () =>
  new Response(PUBLIC_ATPROTO_DID ?? "", {
    headers: { "Content-Type": "text/plain" },
  });
