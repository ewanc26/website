import { redirect } from "@sveltejs/kit";

export const load = () => redirect(301, "https://docs.ewancroft.uk");
