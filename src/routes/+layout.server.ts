import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ url }) => {
  return {
    url: url.pathname,
  };
};
