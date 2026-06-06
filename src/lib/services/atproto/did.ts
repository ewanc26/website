// In-process DID cache — avoids duplicate resolutions within a single request
// and benefits warm Vercel function instances.
const DID_CACHE = new Map<string, { doc: any; ts: number }>();
const DID_CACHE_TTL_MS = 1000 * 60 * 60; // 1 hour

function fetchWithAbort(
  url: string,
  fetchFn: typeof fetch,
  timeoutMs = 8000,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetchFn(url, { signal: controller.signal }).finally(() =>
    clearTimeout(timer),
  );
}

export async function resolveDid(
  did: string,
  fetchFn: typeof fetch = fetch,
): Promise<any> {
  const cached = DID_CACHE.get(did);
  if (cached && Date.now() - cached.ts < DID_CACHE_TTL_MS) return cached.doc;

  let res: Response;
  if (did.startsWith("did:plc:")) {
    res = await fetchWithAbort(
      `https://plc.directory/${encodeURIComponent(did)}`,
      fetchFn,
    );
    if (!res.ok) throw new Error(`DID resolution failed for ${did}`);
  } else if (did.startsWith("did:web:")) {
    const domain = did.replace("did:web:", "");
    res = await fetchWithAbort(
      `https://${domain}/.well-known/did.json`,
      fetchFn,
    );
    if (!res.ok) throw new Error(`DID resolution failed for ${did}`);
  } else {
    throw new Error(`Unsupported DID method: ${did}`);
  }

  const doc = await res.json();
  DID_CACHE.set(did, { doc, ts: Date.now() });
  return doc;
}
