/** Stand-in for SvelteKit's `$env/static/public`. */
const env = import.meta.env;

export const PUBLIC_ATPROTO_DID: string = env.PUBLIC_ATPROTO_DID ?? "";
export const PUBLIC_LEAFLET_BLOG_PUBLICATION: string =
  env.PUBLIC_LEAFLET_BLOG_PUBLICATION ?? "";
export const PUBLIC_SITE_TITLE: string = env.PUBLIC_SITE_TITLE ?? "";
export const PUBLIC_SITE_DESCRIPTION: string =
  env.PUBLIC_SITE_DESCRIPTION ?? "";
