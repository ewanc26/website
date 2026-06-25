/**
 * GET /.well-known/atproto-did
 *
 * AT Protocol DID discovery endpoint (did:plc → domain binding).
 * Returns the site owner's DID as plain text so Bluesky and other
 * AT Protocol services can verify domain ownership.
 */

import type { RequestHandler } from "./$types";
import { PUBLIC_ATPROTO_DID } from "$env/static/public";

export const prerender = false;

export const GET: RequestHandler = ({ setHeaders }) => {
  setHeaders({ "Content-Type": "text/plain" });
  return new Response(PUBLIC_ATPROTO_DID ?? "");
};
