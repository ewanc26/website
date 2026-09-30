// Projects live on the docs site (managed via SIFA).
import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = () => {
  redirect(301, "https://docs.ewancroft.uk");
};
