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

export interface ContributionDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface ContributionCalendar {
  total: number;
  weeks: ContributionDay[][];
}

export interface LanguageShare {
  name: string;
  color?: string;
  size: number;
  percent: number;
}

const CONTRIBUTIONS_QUERY = `
  query Contributions($login: String!) {
    user(login: $login) {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays { date contributionCount contributionLevel }
          }
        }
      }
    }
  }
`;

const LANGUAGES_QUERY = `
  query Languages($login: String!, $cursor: String) {
    user(login: $login) {
      repositories(first: 100, after: $cursor, ownerAffiliations: OWNER, isFork: false, orderBy: { field: PUSHED_AT, direction: DESC }) {
        pageInfo { hasNextPage endCursor }
        nodes {
          languages(first: 20, orderBy: { field: SIZE, direction: DESC }) {
            edges { size node { name color } }
          }
        }
      }
    }
  }
`;

const LEVELS = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
} as const;

async function graphql(
  query: string,
  username: string,
  token: string,
  fetchFn: Fetch,
  extraVariables: Record<string, unknown> = {},
): Promise<any> {
  const response = await fetchFn("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "User-Agent": "ewancroft.uk",
    },
    body: JSON.stringify({ query, variables: { login: username, ...extraVariables } }),
  });
  if (!response.ok)
    throw new Error(`GitHub GraphQL returned ${response.status}`);
  const payload = await response.json();
  if (payload.errors?.length) throw new Error(payload.errors[0].message);
  return payload.data;
}

function toWeeks(days: ContributionDay[]): ContributionDay[][] {
  const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date));
  const weeks: ContributionDay[][] = [];
  for (const day of sorted) {
    const dow = new Date(`${day.date}T00:00:00Z`).getUTCDay();
    if (dow === 0 || weeks.length === 0) weeks.push([]);
    weeks[weeks.length - 1].push(day);
  }
  return weeks;
}

async function fetchContributionsFromProfile(
  username: string,
  fetchFn: Fetch,
): Promise<ContributionCalendar> {
  const response = await fetchFn(
    `https://github.com/users/${encodeURIComponent(username)}/contributions`,
    { headers: { Accept: "text/html", "User-Agent": "ewancroft.uk" } },
  );
  if (!response.ok)
    throw new Error(`GitHub contributions returned ${response.status}`);

  const html = await response.text();
  const counts = new Map<string, number>();
  for (const m of html.matchAll(
    /<tool-tip\b[^>]*\bfor="([^"]+)"[^>]*>\s*(No|[\d,]+) contributions?\b/gi,
  )) {
    counts.set(m[1], m[2] === "No" ? 0 : Number.parseInt(m[2].replace(/,/g, ""), 10));
  }

  const days: ContributionDay[] = [];
  for (const m of html.matchAll(/<td\b[^>]*ContributionCalendar-day[^>]*>/g)) {
    const tag = m[0];
    const date = tag.match(/data-date="(\d{4}-\d{2}-\d{2})"/)?.[1];
    const id = tag.match(/\bid="([^"]+)"/)?.[1];
    const level = Number.parseInt(tag.match(/data-level="(\d)"/)?.[1] ?? "0", 10);
    if (!date) continue;
    days.push({
      date,
      count: (id && counts.get(id)) || 0,
      level: Math.min(4, Math.max(0, level)) as ContributionDay["level"],
    });
  }
  if (days.length === 0) throw new Error("No contribution data found");

  return { total: days.reduce((n, d) => n + d.count, 0), weeks: toWeeks(days) };
}

export async function fetchGitHubContributions(
  username: string,
  fetchFn: Fetch,
  token?: string,
): Promise<ContributionCalendar> {
  if (token) {
    try {
      const data = await graphql(CONTRIBUTIONS_QUERY, username, token, fetchFn);
      const cal = data.user.contributionsCollection.contributionCalendar;
      const days: ContributionDay[] = cal.weeks.flatMap((w: any) =>
        w.contributionDays.map((d: any) => ({
          date: d.date,
          count: d.contributionCount,
          level: LEVELS[d.contributionLevel as keyof typeof LEVELS] ?? 0,
        })),
      );
      return { total: cal.totalContributions, weeks: toWeeks(days) };
    } catch (error) {
      console.warn("GitHub GraphQL contributions unavailable; using public profile", error);
    }
  }
  return fetchContributionsFromProfile(username, fetchFn);
}

export async function fetchGitHubCommitTotal(
  username: string,
  fetchFn: typeof fetch,
  token: string,
): Promise<number> {
  const data = await graphql(
    `query Commits($login: String!) { user(login: $login) { contributionsCollection { totalCommitContributions } } }`,
    username,
    token,
    fetchFn,
  );
  return data.user.contributionsCollection.totalCommitContributions;
}

const LINGUIST_COLORS: Record<string, string> = {
  Assembly: "#6E4C13", Astro: "#ff5a03", Batchfile: "#C1F12E", C: "#555555", "C#": "#178600",
  "C++": "#f34b7d", CMake: "#DA3434", CSS: "#663399", Clojure: "#db5855", Dart: "#00B4AB",
  Dockerfile: "#384d54", Elixir: "#6e4a7e", GLSL: "#5686a5", Gleam: "#ffaff3", Go: "#00ADD8",
  HTML: "#e34c26", Haskell: "#5e5086", Java: "#b07219", JavaScript: "#f1e05a",
  "Jupyter Notebook": "#DA5B0B", Julia: "#a270ba", Kotlin: "#A97BFF", Lua: "#000080",
  Makefile: "#427819", Markdown: "#083fa1", Nim: "#ffc200", Nix: "#7e7eff", "Objective-C": "#438eff",
  OCaml: "#ef7a08", PHP: "#4F5D95", Perl: "#0298c3", PowerShell: "#012456", Python: "#3572A5",
  R: "#198CE7", Ruby: "#701516", Rust: "#dea584", SCSS: "#c6538c", Shell: "#89e051",
  Svelte: "#ff3e00", Swift: "#F05138", TeX: "#3D6117", TypeScript: "#3178c6", Vue: "#41b883",
  Zig: "#ec915c",
};

function toShares(totals: Map<string, { size: number; color?: string }>, limit = 8): LanguageShare[] {
  const all = [...totals.entries()].sort((a, b) => b[1].size - a[1].size);
  const sum = all.reduce((n, [, v]) => n + v.size, 0);
  if (sum === 0) return [];
  const top = all.slice(0, limit);
  const rest = all.slice(limit).reduce((n, [, v]) => n + v.size, 0);
  const shares: LanguageShare[] = top.map(([name, v]) => ({
    name,
    color: v.color ?? LINGUIST_COLORS[name],
    size: v.size,
    percent: (v.size / sum) * 100,
  }));
  if (rest > 0) shares.push({ name: "Other", size: rest, percent: (rest / sum) * 100 });
  return shares;
}

export async function fetchGitHubLanguages(
  username: string,
  fetchFn: Fetch,
  token?: string,
): Promise<LanguageShare[]> {
  const totals = new Map<string, { size: number; color?: string }>();
  const add = (name: string, size: number, color?: string) => {
    const prev = totals.get(name);
    totals.set(name, { size: (prev?.size ?? 0) + size, color: prev?.color ?? color });
  };

  if (token) {
    try {
      let cursor: string | null = null;
      do {
        const data: any = await graphql(LANGUAGES_QUERY, username, token, fetchFn, { cursor });
        const { nodes, pageInfo } = data.user.repositories;
        for (const repo of nodes)
          for (const edge of repo.languages.edges)
            add(edge.node.name, edge.size, normalizeLanguageColor(edge.node.color));
        cursor = pageInfo.hasNextPage ? pageInfo.endCursor : null;
      } while (cursor);
      return toShares(totals);
    } catch (error) {
      console.warn("GitHub GraphQL languages unavailable; using public API", error);
      totals.clear();
    }
  }

  // Public fallback: each repo's primary language, weighted by repo size.
  const response = await fetchFn(
    `https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100&type=owner&sort=pushed`,
    { headers: { Accept: "application/vnd.github+json", "User-Agent": "ewancroft.uk" } },
  );
  if (!response.ok) throw new Error(`GitHub repos returned ${response.status}`);
  const repos: any[] = await response.json();
  for (const repo of repos) {
    if (repo.fork || repo.archived || !repo.language) continue;
    add(repo.language, Math.max(repo.size ?? 0, 1));
  }
  return toShares(totals);
}
