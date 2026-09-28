/**
 * GET /cv — interactive terminal CV.
 *
 * Browsers (Accept: text/html) are redirected to /about/cv; everything else
 * (curl, wget, httpie) gets a bash script generated live from AT Protocol
 * records. `curl -fsSL ewancroft.uk/cv | bash` launches the menu;
 * `... | bash -s -- skills` prints a single section.
 */
import type { APIRoute } from "astro";
import { PUBLIC_ATPROTO_DID } from "$env/static/public";
import { gatherCvData } from "$lib/server/cv/data";
import { generateCvScript } from "$lib/server/cv/script";

export const GET: APIRoute = async ({ request, redirect }) => {
  if ((request.headers.get("accept") ?? "").includes("text/html")) {
    return redirect("/about/cv", 302);
  }
  const script = generateCvScript(
    await gatherCvData(PUBLIC_ATPROTO_DID, fetch),
  );
  return new Response(script, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
    },
  });
};
