import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

// Legacy path, kept for old inbound links.
export const load: PageServerLoad = () => {
  redirect(301, "/rss.xml");
};
