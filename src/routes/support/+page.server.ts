import { redirect } from "@sveltejs/kit";

const PLATFORM_URLS: Record<string, string> = {
  "ko-fi": "https://ko-fi.com/ewancroft",
  "gh-sponsors": "https://github.com/sponsors/ewanc26",
};

export const load = ({ url }) => {
  const platform = url.searchParams.get("platform");
  if (platform && PLATFORM_URLS[platform]) {
    throw redirect(301, PLATFORM_URLS[platform]);
  }
};
