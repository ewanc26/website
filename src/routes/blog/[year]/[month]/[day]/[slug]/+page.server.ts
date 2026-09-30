import { loadPost } from "$lib/server/post";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, setHeaders }) => {
  setHeaders({ "cache-control": "public, s-maxage=3600, stale-while-revalidate=86400" });

  const data = await loadPost({ year: params.year, month: params.month, day: params.day, slug: params.slug });
  if (!data) error(404);

  return data;
};
