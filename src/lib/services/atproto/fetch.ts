import { PUBLIC_ATPROTO_DID } from "$env/static/public";
import { fetchKibunStatus as _fetchKibunStatus } from "@ewanc26/atproto";

export async function fetchKibunStatus(fetchFn?: typeof fetch) {
  return _fetchKibunStatus(PUBLIC_ATPROTO_DID, fetchFn);
}
