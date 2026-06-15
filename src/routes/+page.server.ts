import type { PageServerLoad } from "./$types";
import type { Config } from "@sveltejs/adapter-vercel";
import { fetchProfile } from "@ewanc26/atproto";
import { PUBLIC_ATPROTO_DID } from "$env/static/public";

export const config: Config = { maxDuration: 30 };

export const load: PageServerLoad = async ({ fetch, setHeaders }) => {
  setHeaders({
    "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
  });

  const profile = await fetchProfile(PUBLIC_ATPROTO_DID, fetch);

  // Fetch verifications from Constellation
  const subject = PUBLIC_ATPROTO_DID;
  const constellationUrl = `https://constellation.microcosm.blue/xrpc/blue.microcosm.links.getBacklinks?subject=${encodeURIComponent(subject)}&source=app.bsky.graph.verification:subject`;

  let verifications = [];
  try {
    const response = await fetch(constellationUrl, {
      headers: { Accept: "application/json" },
    });
    if (response.ok) {
      const data = await response.json();
      if (data && Array.isArray(data.records)) {
        // Resolve profile details for each verifier DID
        verifications = await Promise.all(
          data.records.map(async (record: any) => {
            const verifierProfile = await fetchProfile(record.did, fetch);
            return {
              did: record.did,
              name: verifierProfile.displayName || verifierProfile.handle,
              avatarUrl: verifierProfile.avatar,
              handle: verifierProfile.handle,
              date: "", // Date is not easily available in the verification record
            };
          }),
        );
      }
    }
  } catch (e) {
    console.error("Failed to fetch verifications:", e);
  }

  return {
    profile,
    verifications,
  };
};
