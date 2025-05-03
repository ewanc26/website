import { PUBLIC_HANDLE } from "$env/static/public";

export interface Profile {
    avatar: string,
    banner: string,
    displayName: string,
    did: string,
    handle: string,
    description: string,
    pds: string
}

export async function safeFetch(url: string) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(response.status + ":" + response.statusText);
    return await response.json();
}

export async function getProfile(): Promise<Profile> {
    const fetchProfile = await safeFetch(`https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile?actor=${PUBLIC_HANDLE}`);
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
        pds: pdsurl
    };
}