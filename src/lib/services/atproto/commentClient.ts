const SESSION_KEY = "ewancroft:leaflet-comment-session";
const RESOLVE_HANDLE = "https://bsky.social/xrpc/com.atproto.identity.resolveHandle";
const PLC_DIRECTORY = "https://plc.directory";
const COMMENT_COLLECTION = "pub.leaflet.comment";

export interface ReaderSession {
  did: string;
  handle: string;
  pds: string;
  accessJwt: string;
  refreshJwt: string;
}

interface DidDocument {
  service?: Array<{
    id?: string;
    type?: string;
    serviceEndpoint?: string;
  }>;
}

interface SessionResponse {
  did: string;
  handle: string;
  accessJwt: string;
  refreshJwt: string;
}

interface CreateRecordResponse {
  uri: string;
  cid?: string;
}

function errorMessage(payload: unknown, fallback: string): string {
  if (payload && typeof payload === "object") {
    const message = (payload as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) return message;
    const error = (payload as { error?: unknown }).error;
    if (typeof error === "string" && error.trim()) return error;
  }
  return fallback;
}

async function jsonOrUndefined(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return undefined;
  }
}

function didWebUrl(did: string): string {
  const parts = did.slice("did:web:".length).split(":").map(decodeURIComponent);
  const host = parts.shift();
  if (!host || !/^[A-Za-z0-9.-]+(?::\d+)?$/.test(host)) {
    throw new Error("Unsupported did:web identifier");
  }

  if (parts.length === 0) return `https://${host}/.well-known/did.json`;
  return `https://${host}/${parts.map(encodeURIComponent).join("/")}/did.json`;
}

async function resolveDidDocument(did: string): Promise<DidDocument> {
  let url: string;
  if (did.startsWith("did:plc:")) {
    url = `${PLC_DIRECTORY}/${encodeURIComponent(did)}`;
  } else if (did.startsWith("did:web:")) {
    url = didWebUrl(did);
  } else {
    throw new Error("This DID method is not supported for browser sign-in");
  }

  const response = await fetch(url, { headers: { Accept: "application/json" } });
  const payload = await jsonOrUndefined(response);
  if (!response.ok) {
    throw new Error(errorMessage(payload, `Could not resolve ${did}`));
  }
  return payload as DidDocument;
}

async function resolveIdentifier(identifier: string): Promise<string> {
  const normalized = identifier.trim().replace(/^@/, "");
  if (!normalized) throw new Error("Enter your AT Protocol handle");
  if (normalized.startsWith("did:")) return normalized;

  const url = new URL(RESOLVE_HANDLE);
  url.searchParams.set("handle", normalized);
  const response = await fetch(url, { headers: { Accept: "application/json" } });
  const payload = (await jsonOrUndefined(response)) as { did?: unknown } | undefined;
  if (!response.ok || typeof payload?.did !== "string") {
    throw new Error(errorMessage(payload, "Could not resolve that handle"));
  }
  return payload.did;
}

async function resolvePds(did: string): Promise<string> {
  const document = await resolveDidDocument(did);
  const service = document.service?.find(
    (entry) =>
      entry.type === "AtprotoPersonalDataServer" ||
      entry.id === "#atproto_pds" ||
      entry.id?.endsWith("#atproto_pds"),
  );
  const endpoint = service?.serviceEndpoint;
  if (!endpoint) throw new Error("No AT Protocol PDS was found for this account");

  const url = new URL(endpoint);
  if (url.protocol !== "https:") {
    throw new Error("Refusing to send an app password to a non-HTTPS PDS");
  }
  return url.origin;
}

function saveSession(session: ReaderSession): ReaderSession {
  if (typeof sessionStorage !== "undefined") {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }
  return session;
}

export function getReaderSession(): ReaderSession | null {
  if (typeof sessionStorage === "undefined") return null;
  const raw = sessionStorage.getItem(SESSION_KEY);
  if (!raw) return null;

  try {
    const value = JSON.parse(raw) as Partial<ReaderSession>;
    if (
      typeof value.did === "string" &&
      typeof value.handle === "string" &&
      typeof value.pds === "string" &&
      typeof value.accessJwt === "string" &&
      typeof value.refreshJwt === "string"
    ) {
      return value as ReaderSession;
    }
  } catch {}

  sessionStorage.removeItem(SESSION_KEY);
  return null;
}

export function clearReaderSession(): void {
  if (typeof sessionStorage !== "undefined") sessionStorage.removeItem(SESSION_KEY);
}

export async function signInReader(
  identifier: string,
  appPassword: string,
): Promise<ReaderSession> {
  if (!appPassword.trim()) throw new Error("Enter an AT Protocol app password");

  const did = await resolveIdentifier(identifier);
  const pds = await resolvePds(did);
  const response = await fetch(`${pds}/xrpc/com.atproto.server.createSession`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ identifier: did, password: appPassword }),
  });
  const payload = (await jsonOrUndefined(response)) as SessionResponse | undefined;
  if (
    !response.ok ||
    typeof payload?.did !== "string" ||
    typeof payload.handle !== "string" ||
    typeof payload.accessJwt !== "string" ||
    typeof payload.refreshJwt !== "string"
  ) {
    throw new Error(errorMessage(payload, "AT Protocol sign-in failed"));
  }
  if (payload.did !== did) throw new Error("The PDS returned a different account identity");

  return saveSession({
    did: payload.did,
    handle: payload.handle,
    pds,
    accessJwt: payload.accessJwt,
    refreshJwt: payload.refreshJwt,
  });
}

async function refreshReaderSession(session: ReaderSession): Promise<ReaderSession> {
  const response = await fetch(`${session.pds}/xrpc/com.atproto.server.refreshSession`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${session.refreshJwt}`,
    },
  });
  const payload = (await jsonOrUndefined(response)) as SessionResponse | undefined;
  if (
    !response.ok ||
    typeof payload?.accessJwt !== "string" ||
    typeof payload.refreshJwt !== "string"
  ) {
    clearReaderSession();
    throw new Error(errorMessage(payload, "Your AT Protocol session has expired"));
  }

  return saveSession({
    ...session,
    handle: typeof payload.handle === "string" ? payload.handle : session.handle,
    accessJwt: payload.accessJwt,
    refreshJwt: payload.refreshJwt,
  });
}

async function createRecord(
  session: ReaderSession,
  record: Record<string, unknown>,
): Promise<CreateRecordResponse> {
  const request = async (current: ReaderSession) =>
    fetch(`${current.pds}/xrpc/com.atproto.repo.createRecord`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${current.accessJwt}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        repo: current.did,
        collection: COMMENT_COLLECTION,
        record,
      }),
    });

  let current = session;
  let response = await request(current);
  if (response.status === 401) {
    current = await refreshReaderSession(current);
    response = await request(current);
  }

  const payload = (await jsonOrUndefined(response)) as CreateRecordResponse | undefined;
  if (!response.ok || typeof payload?.uri !== "string") {
    throw new Error(errorMessage(payload, "Could not publish the comment"));
  }
  return payload;
}

export async function publishLeafletComment(
  session: ReaderSession,
  subject: string,
  plaintext: string,
  replyParent?: string,
): Promise<CreateRecordResponse> {
  const text = plaintext.trim();
  if (!subject.startsWith("at://")) throw new Error("Invalid Leaflet document URI");
  if (!text) throw new Error("Write something before posting");

  return createRecord(session, {
    $type: COMMENT_COLLECTION,
    subject,
    plaintext: text,
    createdAt: new Date().toISOString(),
    ...(replyParent ? { reply: { parent: replyParent } } : {}),
  });
}
