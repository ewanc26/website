import type { PageServerLoad } from "./$types";
import type { Config } from "@sveltejs/adapter-vercel";
import {
  fetchProfile,
} from "@ewanc26/atproto";
import { PUBLIC_ATPROTO_DID } from "$env/static/public";

export const config: Config = { maxDuration: 30 };

export const load: PageServerLoad = async ({ fetch, setHeaders }) => {
  setHeaders({
    "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
  });

  const profile = await fetchProfile(PUBLIC_ATPROTO_DID, fetch);

  return {
    profile,
  };
};
