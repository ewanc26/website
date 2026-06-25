import type { PageServerLoad } from "./$types";

/**
 * Subscriptions page — all data is fetched client-side via the
 * /api/subscriptions and /api/recommendations endpoints to keep
 * the initial server response lightweight. These API routes handle
 * their own caching and DID resolution.
 */
export const load: PageServerLoad = async () => {
  return {};
};
