// Projects live on the docs site (managed via SIFA). The slug param is
// unused, same as the Astro original — every /projects/* URL redirects.
import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = () => {
  redirect(301, "https://docs.ewancroft.uk");
};
