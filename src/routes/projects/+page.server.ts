/**
 * Redirect /projects to the external docs site.
 * Projects are managed via SIFA and rendered on docs.ewancroft.uk.
 */
import { redirect } from "@sveltejs/kit";

export const load = () => redirect(301, "https://docs.ewancroft.uk");
