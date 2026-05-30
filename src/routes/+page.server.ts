import type { PageServerLoad } from "./$types";
import { fetchKibunStatus } from "$lib/services/atproto/fetch";

export const load: PageServerLoad = async () => {
  const kibunStatus = await fetchKibunStatus();
  return {
    kibunStatus,
  };
};
