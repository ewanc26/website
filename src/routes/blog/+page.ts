import { handle } from '$lib/data/profile.json'
import { parse, type MarkdownPost, type Post } from '$lib/parser';

interface Profile {
    avatar: string,
    banner: string,
    displayName: string,
    did: string,
    handle: string,
    description: string,
    pds: string
}

async function safeFetch(url: string) {
    const response = await fetch(url)
    if (!response.ok) throw new Error(response.status + ":" + response.statusText)
    return await response.json();
}

async function getProfile(): Promise<Profile> {
    const fetchProfile = await safeFetch(`https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile?actor=${handle}`)
    let split = fetchProfile["did"].split(":")
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
    for (let service of diddoc["service"]) {
        if (service["id"] === "#atproto_pds") {
            pdsurl = service["serviceEndpoint"]
        }
    }
    if (!pdsurl) {
        throw new Error("DID lacks #atproto_pds service")
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

let profile: Profile;
let posts: Map<string, Post>;

export async function load() {
    if (profile === undefined) {
        profile = await getProfile();
    }
    if (posts === undefined) {
        const rawResponse = await fetch(`${profile.pds}/xrpc/com.atproto.repo.listRecords?repo=${profile.did}&collection=com.whtwnd.blog.entry`)
        const response = await rawResponse.json()
        let mdposts: Map<string, MarkdownPost> = new Map();
        for (let data of response["records"]) {
            const matches = data["uri"].split("/")
            const rkey = matches[matches.length - 1]
            const record = data["value"]
            if (matches && matches.length === 5 && record && (record["visibility"] === "public" || !record["visibility"])) {
                mdposts.set(rkey, {
                    title: record["title"],
                    createdAt: new Date(record["createdAt"]),
                    mdcontent: record["content"],
                    rkey
                })
            }
        }
        posts = await parse(mdposts)
    }
    return { posts, profile };
}