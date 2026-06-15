import type { PageServerLoad } from "./$types";
import { fetchProfile } from "@ewanc26/atproto";
import { PUBLIC_ATPROTO_DID } from "$env/static/public";

export const load: PageServerLoad = async ({ fetch }) => {
  const profile = await fetchProfile(PUBLIC_ATPROTO_DID, fetch);
  return {
    profile,
  };
};
