// Ambient type declarations for environment variables
// This allows TypeScript to recognize $env/static/public imports during type checking
declare namespace NodeJS {
  interface ProcessEnv {
    PUBLIC_ATPROTO_DID: string;
    PUBLIC_LEAFLET_BLOG_PUBLICATION: string;
    PUBLIC_SITE_TITLE: string;
    PUBLIC_SITE_DESCRIPTION: string;
    GITHUB_USERNAME: string;
    GITHUB_TOKEN?: string;
  }
}
