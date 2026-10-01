import { getHomeData } from "$lib/services/home";
import { fetchShippedApps } from "$lib/services/atproto/apps";
import { fetchWatching } from "$lib/services/atproto/watching";
import { fetchRecentPosts } from "$lib/services/atproto/feed";
import { fetchRecentPlays } from "$lib/services/atproto/plays";
import { PUBLIC_ATPROTO_DID } from "$env/static/public";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ fetch, setHeaders }) => {
  setHeaders({ "cache-control": "public, s-maxage=60, stale-while-revalidate=300" });

  const [homeData, apps, watching, feed, plays] = await Promise.all([
    getHomeData(),
    fetchShippedApps(PUBLIC_ATPROTO_DID, fetch).catch(() => []),
    fetchWatching(PUBLIC_ATPROTO_DID, fetch).catch(() => []),
    fetchRecentPosts(PUBLIC_ATPROTO_DID, fetch).catch(() => []),
    fetchRecentPlays(PUBLIC_ATPROTO_DID, 1, fetch).catch(() => []),
  ]);

  const latestPlay = plays[0] ?? null;

  // getHomeData()'s posts carry the raw Leaflet content tree (BlobRef class
  // instances and friends) for every blog post, not just the six shown here.
  // SvelteKit's load() return must be devalue-serializable for hydration —
  // unlike Astro, which never needed to ship this data to the client — so
  // only pass through the plain fields the homepage actually renders.
  const posts = homeData.posts.map((p: any) => ({
    title: p.title,
    createdAt: p.createdAt,
    publicationRkey: p.publicationRkey,
    rkey: p.rkey,
  }));

  return { ...homeData, posts, apps, watching, feed, latestPlay };
};
