export async function resolveDid(
  did: string,
  fetchFn: typeof fetch = fetch,
): Promise<any> {
  if (did.startsWith("did:plc:")) {
    const res = await fetchFn(
      `https://plc.directory/${encodeURIComponent(did)}`,
    );
    if (!res.ok) throw new Error(`DID resolution failed for ${did}`);
    return res.json();
  }

  if (did.startsWith("did:web:")) {
    const domain = did.replace("did:web:", "");
    const res = await fetchFn(`https://${domain}/.well-known/did.json`);
    if (!res.ok) throw new Error(`DID resolution failed for ${did}`);
    return res.json();
  }

  throw new Error(`Unsupported DID method: ${did}`);
}
