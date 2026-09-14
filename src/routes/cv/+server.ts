/**
 * GET /cv — interactive terminal CV.
 *
 * Content negotiation:
 * - browsers (Accept: text/html) get a landing page with the curl command
 * - everything else (curl, wget, httpie) gets a self-contained bash script,
 *   generated live from AT Protocol records — the same sources as /about.
 *
 * `curl -fsSL ewancroft.uk/cv | bash` launches the interactive menu;
 * `curl -fsSL ewancroft.uk/cv | bash -s -- skills` prints a single section.
 */

import { PUBLIC_ATPROTO_DID } from "$env/static/public";
import type { Config } from "@sveltejs/adapter-vercel";
import type { RequestHandler } from "./$types";
import { gatherCvData } from "$lib/server/cv/data";
import { generateCvScript } from "$lib/server/cv/script";
import { landingPage } from "$lib/server/cv/landing";

export const config: Config = { maxDuration: 30 };
export const prerender = false;

export const GET: RequestHandler = async ({
  fetch,
  request,
  url,
  setHeaders,
}) => {
  const accept = request.headers.get("accept") ?? "";
  const wantsHtml = accept.includes("text/html");

  if (wantsHtml) {
    setHeaders({
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
    });
    return new Response(landingPage(url.origin), { status: 200 });
  }

  const data = await gatherCvData(PUBLIC_ATPROTO_DID, fetch);
  const script = generateCvScript(data);

  setHeaders({
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
  });
  return new Response(script, { status: 200 });
};
