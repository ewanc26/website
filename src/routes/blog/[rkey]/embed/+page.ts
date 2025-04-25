export const prerender = false;

export const load = async ({ parent, params }) => {
    // Reuse the parent's load function to get post data
    const { getPost, profile } = await parent();
    const post = getPost(params.rkey);
    
    if (!post) return { status: 404 };
    
    return {
        post,
        profile
    };
};
