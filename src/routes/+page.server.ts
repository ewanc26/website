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

  return { ...homeData, posts, apps, watching, feed };
};
