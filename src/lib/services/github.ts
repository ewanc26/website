export interface GitHubProject {
  name: string;
  description: string;
  url: string;
  language?: string;
  languageColor?: string;
}

type Fetch = typeof globalThis.fetch;

const PINNED_REPOSITORIES_QUERY = `
  query PinnedRepositories($login: String!) {
    user(login: $login) {
      pinnedItems(first: 6, types: [REPOSITORY]) {
        nodes {
          ... on Repository {
            name
            description
            url
            primaryLanguage {
              name
              color
            }
          }
        }
      }
    }
  }
`;

function decodeHtml(value: string): string {
  const namedEntities: Record<string, string> = {
    amp: "&",
    apos: "'",
    gt: ">",
    lt: "<",
    nbsp: " ",
    quot: '"',
  };

  return value
    .replace(/<[^>]+>/g, "")
    .replace(/&#x([\da-f]+);/gi, (_, hex: string) =>
      String.fromCodePoint(Number.parseInt(hex, 16)),
    )
    .replace(/&#(\d+);/g, (_, decimal: string) =>
      String.fromCodePoint(Number.parseInt(decimal, 10)),
    )
    .replace(
      /&([a-z]+);/gi,
      (entity, name: string) => namedEntities[name.toLowerCase()] ?? entity,
    )
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeLanguageColor(value?: string): string | undefined {
  return value && /^#[\da-f]{6}$/i.test(value) ? value : undefined;
}

async function fetchPinnedWithGraphQL(
  username: string,
  token: string,
  fetchFn: Fetch,
): Promise<GitHubProject[]> {
  const response = await fetchFn("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "User-Agent": "ewancroft.uk",
    },
    body: JSON.stringify({
      query: PINNED_REPOSITORIES_QUERY,
      variables: { login: username },
    }),
  });

  if (!response.ok)
    throw new Error(`GitHub GraphQL returned ${response.status}`);

  const payload = await response.json();
  if (payload.errors?.length) throw new Error(payload.errors[0].message);

  return (payload.data?.user?.pinnedItems?.nodes ?? []).map(
    (repository: any) => ({
      name: repository.name,
      description: repository.description ?? "",
      url: repository.url,
      language: repository.primaryLanguage?.name,
      languageColor: normalizeLanguageColor(repository.primaryLanguage?.color),
    }),
  );
}

async function fetchPinnedFromProfile(
  username: string,
  fetchFn: Fetch,
): Promise<GitHubProject[]> {
  const response = await fetchFn(
    `https://github.com/${encodeURIComponent(username)}`,
    {
      headers: {
        Accept: "text/html",
        "User-Agent": "ewancroft.uk",
      },
    },
  );

  if (!response.ok)
    throw new Error(`GitHub profile returned ${response.status}`);

  const html = await response.text();
  const items =
    html.match(
      /<li\b[^>]*class="[^"]*\bpinned-item-list-item\b[^"]*"[^>]*>[\s\S]*?<\/li>/gi,
    ) ?? [];

  return items.flatMap((item): GitHubProject[] => {
    const repository = item.match(
      /href="\/([^"?#]+)"[\s\S]*?<span\b[^>]*class="repo"[^>]*>([\s\S]*?)<\/span>/i,
    );
    if (!repository) return [];

    const path = repository[1];
    const [owner, name] = path.split("/");
    if (!owner || !name || owner.toLowerCase() !== username.toLowerCase())
      return [];

    const description = item.match(
      /<p\b[^>]*class="[^"]*\bpinned-item-desc\b[^"]*"[^>]*>([\s\S]*?)<\/p>/i,
    );
    const language = item.match(
      /<span\b[^>]*itemprop="programmingLanguage"[^>]*>([\s\S]*?)<\/span>/i,
    );
    const languageColor = item.match(
      /class="[^"]*\brepo-language-color\b[^"]*"[^>]*style="[^"]*background-color:\s*(#[\da-f]{6})/i,
    );

    return [
      {
        name: decodeHtml(name),
        description: description ? decodeHtml(description[1]) : "",
        url: `https://github.com/${path}`,
        language: language ? decodeHtml(language[1]) : undefined,
        languageColor: normalizeLanguageColor(languageColor?.[1]),
      },
    ];
  });
}

export async function fetchPinnedGitHubProjects(
  username: string,
  fetchFn: Fetch,
  token?: string,
): Promise<GitHubProject[]> {
  if (token) {
    try {
      return await fetchPinnedWithGraphQL(username, token, fetchFn);
    } catch (error) {
      console.warn(
        "GitHub GraphQL pins unavailable; using public profile",
        error,
      );
    }
  }

  return fetchPinnedFromProfile(username, fetchFn);
}
