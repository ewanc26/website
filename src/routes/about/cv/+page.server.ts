/**
 * CV landing page server load.
 *
 * Gathers the same AT Protocol records the /cv terminal script uses, so the
 * browser page and the curl output never drift apart.
 */

import type { PageServerLoad } from "./$types";
import type { Config } from "@sveltejs/adapter-vercel";
import { PUBLIC_ATPROTO_DID } from "$env/static/public";
import { gatherCvData } from "$lib/server/cv/data";

export const config: Config = { maxDuration: 30 };

export const load: PageServerLoad = async ({ fetch, setHeaders }) => {
  setHeaders({
    "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
  });

  const cv = await gatherCvData(PUBLIC_ATPROTO_DID, fetch);

  return { cv };
};
