import { PUBLIC_HANDLE } from "$env/static/public"

interface Profile {
    avatar: string,
    banner: string,
    displayName: string,
    did: string,
    handle: string,
    description: string,
    pds: string,
    followersCount: number,
    followingCount: number,
    postsCount: number,
    repliesCount: number
}

async function safeFetch(url: string) {
    const response = await fetch(url)
    if (!response.ok) throw new Error(response.status + ":" + response.statusText)
    return await response.json();
}

async function getProfile(): Promise<Profile> {
    const fetchProfile = await safeFetch(`https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile?actor=${PUBLIC_HANDLE}`)
    const split = fetchProfile["did"].split(":")
    let diddoc;
    if (split[0] === "did") {
        if (split[1] === "plc") {
            diddoc = await safeFetch(`https://plc.directory/${fetchProfile["did"]}`)
        } else if (split[1] === "web") {
            diddoc = await safeFetch("https://" + split[2] + "/.well-known/did.json")
        } else {
            throw new Error("Invalid DID, Not blessed method")
        }
    } else {
        throw new Error("Invalid DID, malformed")
    }
    let pdsurl;
    for (const service of diddoc["service"]) {
        if (service["id"] === "#atproto_pds") {
            pdsurl = service["serviceEndpoint"]
        }
    }
    if (!pdsurl) {
        throw new Error("DID lacks #atproto_pds service")
    }
    // Fetch posts and analyze for posts/replies
    let postsCount = 0;
    let repliesCount = 0;
    try {
        let cursor = undefined;
        const actor = fetchProfile.handle;
        do {
            const url = `https://public.api.bsky.app/xrpc/app.bsky.feed.getAuthorFeed?actor=${actor}&limit=100${cursor ? `&cursor=${cursor}` : ''}`;
            const feed = await safeFetch(url);
            for (const item of feed.feed) {
                if (item.post && item.post.record) {
                    if (item.post.record.reply) {
                        repliesCount += 1;
                    } else {
                        postsCount += 1;
                    }
                }
            }
            cursor = feed.cursor;
        } while (cursor);
    } catch {
        // fallback to API values if error
        postsCount = fetchProfile.postsCount || 0;
        repliesCount = fetchProfile.repliesCount || 0;
    }
    const analytics = {
      followersCount: fetchProfile.followersCount || 0,
      followingCount: fetchProfile.followsCount || 0,
      postsCount: postsCount || 0, 
      repliesCount: repliesCount || 0
    };
    return {
        avatar: fetchProfile["avatar"],
        banner: fetchProfile["banner"],
        displayName: fetchProfile["displayName"],
        did: fetchProfile["did"],
        handle: fetchProfile["handle"],
        description: fetchProfile["description"],
        pds: pdsurl,
        followersCount: analytics.followersCount,
        followingCount: analytics.followingCount,
        postsCount: analytics.postsCount,
        repliesCount: analytics.repliesCount
    };
}

// Profile data cache
let profile: Profile;

export async function load() {
    if (profile === undefined) {
        profile = await getProfile();
    }
    return { 
        profile
    };
}