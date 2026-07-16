const DEFAULT_BLUESKY_CLIENT = "https://bsky.app";

function blueskyClientUrl(clientHost?: string): string {
  const configuredHost = clientHost?.trim();
  if (!configuredHost) return DEFAULT_BLUESKY_CLIENT;

  try {
    const url = new URL(
      /^https?:\/\//i.test(configuredHost)
        ? configuredHost
        : `https://${configuredHost}`,
    );

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return DEFAULT_BLUESKY_CLIENT;
    }

    return url.href.replace(/\/$/, "");
  } catch {
    return DEFAULT_BLUESKY_CLIENT;
  }
}

export function blueskyPostUrl(atUri: string, clientHost?: string): string {
  const parts = atUri.replace(/^at:\/\//, "").split("/");
  const did = parts[0];
  const rkey = parts.at(-1);

  return `${blueskyClientUrl(clientHost)}/profile/${did}/post/${rkey}`;
}
