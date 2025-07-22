import { loadAllPosts } from "$lib/services/BlogService";

export const prerender = false;
export const trailingSlash = "never";

export async function load({ fetch }) {
  return await loadAllPosts(fetch);
}