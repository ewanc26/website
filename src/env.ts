import { defineEnvVars } from "@sveltejs/kit/env";

// PUBLIC_* values are inlined at build time. The GitHub values are optional
// and read when the server starts.
export const variables = defineEnvVars({
  PUBLIC_ATPROTO_DID: { public: true, static: true },
  PUBLIC_LEAFLET_BLOG_PUBLICATION: { public: true, static: true },
  PUBLIC_SITE_TITLE: { public: true, static: true },
  PUBLIC_SITE_DESCRIPTION: { public: true, static: true },
  GITHUB_USERNAME: { schema: (value) => value },
  GITHUB_TOKEN: { schema: (value) => value },
});
