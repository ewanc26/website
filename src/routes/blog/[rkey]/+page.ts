export const prerender = false;

export const load = async ({ parent, params }) => {
  const { getPost, profile, getAdjacentPosts } = await parent();
  const post = getPost(params.rkey);

  if (!post) return { status: 404 };

  // Get adjacent posts for navigation
  const adjacentPosts = getAdjacentPosts(params.rkey);

  return {
    post,
    rkey: params.rkey,
    posts: new Map([[params.rkey, post]]),
    profile,
    adjacentPosts,
    getAdjacentPosts: () => adjacentPosts,
  };
};
