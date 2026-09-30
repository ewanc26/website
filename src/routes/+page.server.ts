import { getHomeData } from "$lib/services/home";
import { fetchShippedApps } from "$lib/services/atproto/apps";
import { fetchWatching } from "$lib/services/atproto/watching";
import { fetchRecentPosts } from "$lib/services/atproto/feed";
import { PUBLIC_ATPROTO_DID } from "$env/static/public";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ fetch, setHeaders }) => {
  setHeaders({ "cache-control": "public, s-maxage=60, stale-while-revalidate=300" });

  const [homeData, apps, watching, feed] = await Promise.all([
    getHomeData(),
    fetchShippedApps(PUBLIC_ATPROTO_DID, fetch).catch(() => []),
    fetchWatching(PUBLIC_ATPROTO_DID, fetch).catch(() => []),
    fetchRecentPosts(PUBLIC_ATPROTO_DID, fetch).catch(() => []),
  ]);

  return { ...homeData, apps, watching, feed };
};
