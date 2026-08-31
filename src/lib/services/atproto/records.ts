const SLINGSHOT = "https://slingshot.microcosm.blue";

export interface AtRecord {
  uri: string;
  cid?: string;
  value: Record<string, unknown>;
}

interface AtUriParts {
  repo: string;
  collection: string;
  rkey: string;
}

export function parseAtUri(uri: unknown): AtUriParts | null {
  if (typeof uri !== "string" || !uri.startsWith("at://")) return null;

  const parts = uri.slice(5).split("/");
  if (parts.length !== 3) return null;
  const [repo, collection, rkey] = parts;
  if (!repo || !collection || !rkey) return null;
  if (!(repo.startsWith("did:") || /^[a-z0-9.-]+$/i.test(repo))) return null;
  if (!/^[a-z][a-z0-9.-]*$/i.test(collection)) return null;
  if (!/^[A-Za-z0-9._:~-]+$/.test(rkey)) return null;

  return { repo, collection, rkey };
}

/**
 * Fetch an arbitrary public AT Protocol record through Slingshot rather than
 * following a record-controlled PDS service URL from the server. This keeps
 * remote Leaflet references useful without opening an SSRF surface.
 */
export async function fetchAtRecord(
  uri: unknown,
  fetchFn: typeof fetch = fetch,
): Promise<AtRecord | null> {
  const parts = parseAtUri(uri);
  if (!parts || typeof uri !== "string") return null;

  const url = new URL(`${SLINGSHOT}/xrpc/com.atproto.repo.getRecord`);
  url.searchParams.set("repo", parts.repo);
  url.searchParams.set("collection", parts.collection);
  url.searchParams.set("rkey", parts.rkey);

  try {
    const response = await fetchFn(url, {
      headers: { Accept: "application/json" },
    });
    if (!response.ok) return null;

    const data = await response.json();
    if (!data?.value || typeof data.value !== "object") return null;

    return {
      uri,
      cid: typeof data.cid === "string" ? data.cid : undefined,
      value: data.value as Record<string, unknown>,
    };
  } catch {
    return null;
  }
}

/** Fetch unique AT-URI references with a small bounded worker pool. */
export async function fetchAtRecords(
  uris: Iterable<unknown>,
  fetchFn: typeof fetch = fetch,
  maxRecords = 64,
): Promise<Record<string, AtRecord>> {
  const queue = [...new Set([...uris].filter((uri): uri is string => !!parseAtUri(uri)))].slice(
    0,
    Math.max(0, maxRecords),
  );
  const found: Record<string, AtRecord> = {};
  let next = 0;

  const worker = async () => {
    while (next < queue.length) {
      const uri = queue[next++];
      const record = await fetchAtRecord(uri, fetchFn);
      if (record) found[uri] = record;
    }
  };

  await Promise.all(
    Array.from({ length: Math.min(6, queue.length) }, () => worker()),
  );
  return found;
}
