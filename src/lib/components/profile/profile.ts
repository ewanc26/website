import { env } from "$env/dynamic/public";
import { getCache, setCache } from "$utils/cache";
import type { Profile, SiteInfo } from "$components/shared";

export async function safeFetch(url: string, fetch: typeof globalThis.fetch) {
  try {
    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    try {
      const response = await fetch(url, { 
        signal: controller.signal,
        headers: {
          'Accept': 'application/json'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}, statusText: ${response.statusText}`);
      return await response.json();
    } catch (error: unknown) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Request timed out for ${url}`);
      }
      throw error;
    }
  } catch (error: unknown) {
    // Catch network errors (e.g., connection refused, timeout)
    console.error(`Network error fetching ${url}:`, error);
    if (error instanceof Error) {
      throw new Error(`Failed to fetch ${url}: ${error.message}`);
    } else {
      throw new Error(`Failed to fetch ${url}: An unknown error occurred`);
    }
  }
}

export async function getProfile(fetch: typeof globalThis.fetch): Promise<Profile> {
  const cacheKey = `profile_${env.PUBLIC_ATPROTOCOL_USER}`;
  let profile: Profile | null = getCache<Profile>(cacheKey);

  if (profile) {
    return profile;
  }

  try {
    const fetchProfile = await safeFetch(
      `https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile?actor=${env.PUBLIC_ATPROTOCOL_USER}`,
      fetch
    );
    const split = fetchProfile["did"].split(":");
    let diddoc;
    if (split[0] === "did") {
      if (split[1] === "plc") {
        diddoc = await safeFetch(`https://plc.directory/${fetchProfile["did"]}`, fetch);
      } else if (split[1] === "web") {
        diddoc = await safeFetch("https://" + split[2] + "/.well-known/did.json", fetch);
      }
    } else {
      throw new Error("Invalid DID, malformed");
    }
    let pdsurl;
    for (const service of diddoc["service"]) {
      if (service["id"] === "#atproto_pds") {
        pdsurl = service["serviceEndpoint"];
      }
    }
    if (!pdsurl) {
      throw new Error("DID lacks #atproto_pds service");
    }
    profile = {
      avatar: fetchProfile["avatar"],
      banner: fetchProfile["banner"],
      displayName: fetchProfile["displayName"],
      did: fetchProfile["did"],
      handle: fetchProfile["handle"],
      description: fetchProfile["description"],
      pds: pdsurl,
    };
    setCache(cacheKey, profile);
    return profile;
  } catch (error: unknown) {
    console.error("Error fetching profile:", error);
    if (error instanceof Error) {
      throw error; // Re-throw the error after logging
    } else {
      throw new Error("An unknown error occurred while fetching profile");
    }
  }
}

/**
 * Fetches site information from the user's PDS.
 * @returns A Promise that resolves to SiteInfo or null if not found or an error occurs.
 */
export async function getSiteInfo(fetch: typeof globalThis.fetch): Promise<SiteInfo | null> {
  const cacheKey = `siteInfo_${env.PUBLIC_ATPROTOCOL_USER}`;
  let siteInfo: SiteInfo | null = getCache<SiteInfo>(cacheKey);

  if (siteInfo) {
    return siteInfo;
  }

  try {
    const profile: Profile = await getProfile(fetch); // Assuming getProfile is available and returns the user's profile with PDS and DID
    const rawResponse = await fetch(
      `${profile.pds}/xrpc/com.atproto.repo.listRecords?repo=${profile.did}&collection=uk.ewancroft.site.info&rkey=self`
    );
    const response = await rawResponse.json();

    if (response && response.records && response.records.length > 0) {
      siteInfo = response.records[0].value as SiteInfo;
      setCache(cacheKey, siteInfo);
      return siteInfo;
    } else {
      console.log("No site info record found.");
      return null;
    }
  } catch (error) {
    console.error("Error fetching site info:", error);
    return null;
  }
}
