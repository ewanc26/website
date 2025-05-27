import { PUBLIC_HANDLE } from "$env/static/public";

export interface Profile {
  avatar: string;
  banner: string;
  displayName: string;
  did: string;
  handle: string;
  description: string;
  pds: string;
}

export interface ProfessionalInfo {
  displayName?: string;
  description?: string;
  avatar?: {
    image: {
      $type: string;
      ref: {
        $link: string;
      };
      mimeType: string;
      size: number;
    };
    alt: string;
    aspectRatio?: { width: number; height: number };
  };
  headline?: string;
  websiteUrl?: string;
  contactEmail?: string;
  country?: string;
  skills?: string[];
}

export interface SiteInfo {
  technologyStack?: Array<{ name: string; url?: string; description?: string }>;
  privacyStatement?: string;
  openSourceInfo?: {
    description?: string;
    license?: { name?: string; url?: string };
    basedOn?: Array<{ name: string; url?: string; description?: string; type?: string }>;
    relatedServices?: Array<{ name: string; url?: string; description?: string; relationship?: string }>;
    repositories?: Array<{ platform?: string; url: string; type?: string; description?: string }>;
  };
  credits?: Array<{
    name: string;
    type: string;
    url?: string;
    author?: string;
    license?: { name?: string; url?: string };
    description?: string;
  }>;
  additionalInfo?: {
    purpose?: string;
    websiteBirthYear?: number;
    sectionLicense?: Array<{ section?: string; name?: string; url?: string }>;
    contact?: { email?: string; social?: Array<{ platform: string; url: string; handle?: string }> };
    analytics?: { services?: string[]; cookiePolicy?: string };
    deployment?: { platform?: string; cdn?: string; customDomain?: boolean };
  };
}

export async function safeFetch(url: string) {
  try {
    const response = await fetch(url);
    if (!response.ok)
      throw new Error(`HTTP error! status: ${response.status}, statusText: ${response.statusText}`);
    return await response.json();
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



export async function getProfile(): Promise<Profile> {
  try {
    const fetchProfile = await safeFetch(
      `https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile?actor=${PUBLIC_HANDLE}`
    );
    const split = fetchProfile["did"].split(":");
    let diddoc;
    if (split[0] === "did") {
      if (split[1] === "plc") {
        diddoc = await safeFetch(`https://plc.directory/${fetchProfile["did"]}`);
      } else if (split[1] === "web") {
        diddoc = await safeFetch("https://" + split[2] + "/.well-known/did.json");
      } else {
        throw new Error("Invalid DID, Not blessed method");
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
    return {
      avatar: fetchProfile["avatar"],
      banner: fetchProfile["banner"],
      displayName: fetchProfile["displayName"],
      did: fetchProfile["did"],
      handle: fetchProfile["handle"],
      description: fetchProfile["description"],
      pds: pdsurl,
    };
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
 * Fetches professional information from the user's PDS.
 * @returns A Promise that resolves to ProfessionalInfo or null if not found or an error occurs.
 */
export async function getProfessionalInfo(): Promise<ProfessionalInfo | null> {
  try {
    const profile: Profile = await getProfile(); // Assuming getProfile is available and returns the user's profile with PDS and DID
    const rawResponse = await fetch(
      `${profile.pds}/xrpc/com.atproto.repo.listRecords?repo=${profile.did}&collection=uk.ewancroft.pro.info&rkey=self`
    );
    const response = await rawResponse.json();

    if (response && response.records && response.records.length > 0) {
      // Assuming the record structure matches the ProfessionalInfo interface
      return response.records[0].value as ProfessionalInfo;
    } else {
      console.log("No professional info record found.");
      return null;
    }
  } catch (error) {
    console.error("Error fetching professional info:", error);
    return null;
  }
}

/**
 * Fetches site information from the user's PDS.
 * @returns A Promise that resolves to SiteInfo or null if not found or an error occurs.
 */
export async function getSiteInfo(): Promise<SiteInfo | null> {
  try {
    const profile: Profile = await getProfile(); // Assuming getProfile is available and returns the user's profile with PDS and DID
    const rawResponse = await fetch(
      `${profile.pds}/xrpc/com.atproto.repo.listRecords?repo=${profile.did}&collection=uk.ewancroft.site.info&rkey=self`
    );
    const response = await rawResponse.json();

    if (response && response.records && response.records.length > 0) {
      // Assuming the record structure matches the SiteInfo interface
      return response.records[0].value as SiteInfo;
    } else {
      console.log("No site info record found.");
      return null;
    }
  } catch (error) {
    console.error("Error fetching site info:", error);
    return null;
  }
}
