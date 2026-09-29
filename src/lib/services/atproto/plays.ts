/**
 * Recent scrobbles from fm.teal.feed.play (teal.fm), newest first.
 *
 * Deliberately not cached for long: the widget polls this, so the
 * cache only needs to absorb bursts of visitors. Artwork lookups walk
 * several external services, so they are remembered per track.
 */

import { getPDSAgent, findArtwork } from "@ewanc26/atproto";

export interface Play {
  rkey: string;
  track: string;
  artists: string[];
  release?: string;
  playedAt: string;
  durationSec?: number;
  href?: string;
  service?: string;
  artworkUrl?: string;
}

const COLLECTION = "fm.teal.feed.play";
const CACHE_MS = 15_000;
const ARTWORK_MS = 1000 * 60 * 60 * 24;

let cached: { key: string; at: number; plays: Play[] } | undefined;
const artwork = new Map<string, { at: number; url: string | undefined }>();

const safeHttp = (u: unknown) =>
  typeof u === "string" && /^https?:\/\//i.test(u) ? u : undefined;

async function artworkFor(
  track: string,
  artist: string | undefined,
  release: string | undefined,
  releaseMbId: string | undefined,
  fetchFn: typeof fetch,
) {
  const key = `${artist}|${release ?? track}`;
  const hit = artwork.get(key);
  if (hit && Date.now() - hit.at < ARTWORK_MS) return hit.url;
  let url: string | undefined;
  if (artist) {
    try {
      url =
        (release &&
          (await findArtwork(
            release,
            artist,
            release,
            releaseMbId,
            fetchFn,
          ))) ||
        (await findArtwork(track, artist, release, releaseMbId, fetchFn)) ||
        undefined;
    } catch {
      url = undefined;
    }
  }
  artwork.set(key, { at: Date.now(), url });
  return url;
}

export async function fetchRecentPlays(
  did: string,
  limit = 5,
  fetchFn: typeof fetch = fetch,
): Promise<Play[]> {
  const key = `${did}:${limit}`;
  if (cached && cached.key === key && Date.now() - cached.at < CACHE_MS)
    return cached.plays;

  const agent = await getPDSAgent(did, fetchFn);
  const resp = await agent.com.atproto.repo.listRecords({
    repo: did,
    collection: COLLECTION,
    limit: Math.min(50, limit * 2),
  });

  const plays = resp.data.records
    .map(({ uri, value }) => {
      const v = value as {
        trackName?: string;
        artists?: { artistName?: string }[];
        releaseName?: string;
        releaseMbId?: string;
        playedTime?: string;
        duration?: number;
        originUri?: string;
        musicServiceUri?: string;
      };
      return {
        rkey: uri.split("/").pop() ?? "",
        track: v.trackName?.trim() ?? "",
        artists: (v.artists ?? [])
          .map((a) => a.artistName?.trim() ?? "")
          .filter(Boolean),
        release: v.releaseName?.trim() || undefined,
        releaseMbId: v.releaseMbId?.replace(/^mbid:/, ""),
        playedAt: v.playedTime ?? "",
        durationSec: typeof v.duration === "number" ? v.duration : undefined,
        href: safeHttp(v.originUri),
        service: v.musicServiceUri,
      };
    })
    .filter((p) => p.track && p.playedAt)
    .sort(
      (a, b) => new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime(),
    )
    .slice(0, limit);

  const result: Play[] = await Promise.all(
    plays.map(async ({ releaseMbId, ...p }) => ({
      ...p,
      artworkUrl: await artworkFor(
        p.track,
        p.artists[0],
        p.release,
        releaseMbId,
        fetchFn,
      ),
    })),
  );

  cached = { key, at: Date.now(), plays: result };
  return result;
}
