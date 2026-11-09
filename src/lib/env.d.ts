// Type declarations for SvelteKit environment variables
// This allows TypeScript to recognize $env/static/public imports
declare module "$env/static/public" {
  export const PUBLIC_ATPROTO_DID: string;
  export const PUBLIC_LEAFLET_BLOG_PUBLICATION: string;
  export const PUBLIC_SITE_TITLE: string;
  export const PUBLIC_SITE_DESCRIPTION: string;
}

declare module "$env/dynamic/public" {
  export const PUBLIC_ATPROTO_DID: string;
  export const PUBLIC_LEAFLET_BLOG_PUBLICATION: string;
  export const PUBLIC_SITE_TITLE: string;
  export const PUBLIC_SITE_DESCRIPTION: string;
}

declare module "$env/dynamic/private" {
  export const GITHUB_USERNAME: string;
  export const GITHUB_TOKEN: string | undefined;
}
