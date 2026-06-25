/**
 * Redirect individual project slugs to the external docs site.
 */
import { redirect } from "@sveltejs/kit";

export const load = () => redirect(301, "https://docs.ewancroft.uk");
