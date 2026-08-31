import {
  BrowserOAuthClient,
  type OAuthSession,
} from "@atproto/oauth-client-browser";

const COMMENT_COLLECTION = "pub.leaflet.comment";
export const COMMENT_SCOPE =
  "atproto repo:pub.leaflet.comment?action=create" as const;

const PROD_CLIENT_ID = "https://ewancroft.uk/client-metadata.json";
const RETURN_TO_KEY = "ewancroft:leaflet-comment-return-to";

export interface ReaderSession {
  did: string;
  handle: string;
  oauthSession: OAuthSession;
}

interface CreateRecordResponse {
  uri: string;
  cid?: string;
}

interface SessionResponse {
  did?: string;
  handle?: string;
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

function isLoopbackHost(hostname: string): boolean {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "[::1]" ||
    hostname === "::1"
  );
}

/**
 * atproto OAuth has a special virtual client-id format for loopback clients.
 * Production always uses the discoverable metadata hosted by ewancroft.uk.
 */
function clientId(): string {
  if (typeof window === "undefined" || !isLoopbackHost(window.location.hostname)) {
    return PROD_CLIENT_ID;
  }

  const redirect = new URL("/oauth/callback", window.location.origin);
  // The OAuth loopback profile intentionally uses an IP literal rather than
  // localhost, even when Vite was opened as http://localhost:5173.
  if (redirect.hostname === "localhost") redirect.hostname = "127.0.0.1";

  return `http://localhost?${new URLSearchParams([
    ["redirect_uri", redirect.href],
    ["scope", COMMENT_SCOPE],
  ])}`;
}

let clientPromise: Promise<BrowserOAuthClient> | undefined;

function getClient(): Promise<BrowserOAuthClient> {
  if (!clientPromise) {
    clientPromise = BrowserOAuthClient.load({
      clientId: clientId(),
      handleResolver: "https://bsky.social",
    });
  }
  return clientPromise;
}

async function describeSession(oauthSession: OAuthSession): Promise<ReaderSession> {
  let handle: string = oauthSession.did;

  // getSession is useful for presentation only. The OAuth account DID remains
  // authoritative and the comment writer does not depend on this request.
  try {
    const response = await oauthSession.fetchHandler(
      "/xrpc/com.atproto.server.getSession",
      { headers: { Accept: "application/json" } },
    );
    if (response.ok) {
      const payload = (await response.json()) as SessionResponse;
      if (typeof payload.handle === "string" && payload.handle.trim()) {
        handle = payload.handle;
      }
    }
  } catch {}

  return { did: oauthSession.did, handle, oauthSession };
}

/**
 * Restore the browser's existing OAuth session or process an OAuth callback
 * when this runs on the configured callback URL.
 */
export async function initReaderSession(): Promise<ReaderSession | null> {
  const client = await getClient();
  const result = await client.init();
  return result ? describeSession(result.session) : null;
}

function safeReturnTo(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/blog";
  return value;
}

export function consumeReaderReturnTo(): string {
  if (typeof sessionStorage === "undefined") return "/blog";
  const value = sessionStorage.getItem(RETURN_TO_KEY);
  sessionStorage.removeItem(RETURN_TO_KEY);
  return safeReturnTo(value);
}

/** Begin the standards-based atproto OAuth redirect flow. */
export async function signInReader(
  identifier: string,
  returnTo: string,
): Promise<void> {
  const normalized = identifier.trim().replace(/^@/, "");
  if (!normalized) throw new Error("Enter your AT Protocol handle");

  if (typeof sessionStorage !== "undefined") {
    sessionStorage.setItem(RETURN_TO_KEY, safeReturnTo(returnTo));
  }

  const client = await getClient();
  await client.signIn(normalized, { scope: COMMENT_SCOPE });
}

export async function signOutReader(session: ReaderSession): Promise<void> {
  await session.oauthSession.signOut();
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

  const response = await session.oauthSession.fetchHandler(
    "/xrpc/com.atproto.repo.createRecord",
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        repo: session.did,
        collection: COMMENT_COLLECTION,
        record: {
          $type: COMMENT_COLLECTION,
          subject,
          plaintext: text,
          createdAt: new Date().toISOString(),
          ...(replyParent ? { reply: { parent: replyParent } } : {}),
        },
      }),
    },
  );

  const payload = (await jsonOrUndefined(response)) as
    | CreateRecordResponse
    | undefined;
  if (!response.ok || typeof payload?.uri !== "string") {
    throw new Error(errorMessage(payload, "Could not publish the comment"));
  }
  return payload;
}
