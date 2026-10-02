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


export interface GitHubMetric {
  name: string;
  value: number;
  percent: number;
  color?: string;
  description?: string;
  url?: string;
}

export interface GitHubProfileSummary {
  user: {
    login: string;
    name?: string;
    avatarUrl: string;
    htmlUrl: string;
    publicRepos: number;
    createdAt: string;
  };
  allTimeCommits: number;
  quarterCommits: GitHubMetric[];
  repoLanguage: GitHubMetric[];
  starLanguage: GitHubMetric[];
  commitLanguage: GitHubMetric[];
  repoCommits: GitHubMetric[];
  repoStars: GitHubMetric[];
}

const PROFILE_SUMMARY_QUERY = `
  query ProfileSummary($login: String!) {
    user(login: $login) {
      login
      name
      avatarUrl(size: 176)
      url
      createdAt
      repositories(
        first: 100
        ownerAffiliations: OWNER
        isFork: false
        visibility: PUBLIC
        orderBy: { field: PUSHED_AT, direction: DESC }
      ) {
        totalCount
        nodes {
          name
          description
          url
          isEmpty
          stargazerCount
          primaryLanguage { name color }
        }
      }
    }
  }
`;

const PROFILE_SUMMARY_YEAR_QUERY = `
  query ProfileSummaryYear($login: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $login) {
      contributionsCollection(from: $from, to: $to) {
        totalCommitContributions
        contributionCalendar {
          weeks {
            contributionDays {
              date
              contributionCount
            }
          }
        }
        commitContributionsByRepository(maxRepositories: 100) {
          repository {
            name
            description
            url
            primaryLanguage { name color }
          }
          contributions {
            totalCount
          }
        }
      }
    }
  }
`;

type SummaryRepository = {
  name: string;
  description?: string | null;
  url: string;
  isEmpty: boolean;
  stargazerCount: number;
  primaryLanguage?: { name: string; color?: string | null } | null;
};

type SummaryCommitRepository = {
  repository: {
    name: string;
    description?: string | null;
    url: string;
    primaryLanguage?: { name: string; color?: string | null } | null;
  };
  contributions: { totalCount: number };
};

const metricShares = (
  entries: Map<string, { value: number; color?: string; description?: string; url?: string }>,
): GitHubMetric[] => {
  const sorted = [...entries.entries()]
    .filter(([, item]) => item.value > 0)
    .sort((a, b) => b[1].value - a[1].value);
  const total = sorted.reduce((sum, [, item]) => sum + item.value, 0);
  if (total === 0) return [];

  return sorted.map(([name, item]) => ({
    name,
    value: item.value,
    percent: (item.value / total) * 100,
    color: normalizeLanguageColor(item.color),
    description: item.description,
    url: item.url,
  }));
};

const quarterKey = (date: string) =>
  `${date.slice(0, 4)}-Q${Math.floor((Number.parseInt(date.slice(5, 7), 10) - 1) / 3) + 1}`;

const addMetric = (
  map: Map<string, { value: number; color?: string; description?: string; url?: string }>,
  name: string,
  value: number,
  extra: { color?: string; description?: string; url?: string } = {},
) => {
  const previous = map.get(name);
  map.set(name, {
    value: (previous?.value ?? 0) + value,
    color: previous?.color ?? extra.color,
    description: previous?.description ?? extra.description,
    url: previous?.url ?? extra.url,
  });
};

let profileSummaryCache: { key: string; expiresAt: number; value: GitHubProfileSummary } | null = null;

export async function fetchGitHubProfileSummary(
  username: string,
  fetchFn: Fetch,
  token?: string,
): Promise<GitHubProfileSummary | null> {
  if (!token) return null;

  const now = Date.now();
  if (
    profileSummaryCache &&
    profileSummaryCache.key.toLowerCase() === username.toLowerCase() &&
    profileSummaryCache.expiresAt > now
  ) {
    return profileSummaryCache.value;
  }

  try {
    const profile = await graphql(PROFILE_SUMMARY_QUERY, username, token, fetchFn);
    const user = profile.user;
    if (!user) return null;

    const repositories = (user.repositories.nodes ?? []).filter(
      (repo: SummaryRepository) => !repo.isEmpty,
    ) as SummaryRepository[];

    const repoLanguage = new Map<string, { value: number; color?: string }>();
    const starLanguage = new Map<string, { value: number; color?: string }>();

    for (const repo of repositories) {
      const language = repo.primaryLanguage?.name ?? "Unknown";
      const color = normalizeLanguageColor(repo.primaryLanguage?.color);
      addMetric(repoLanguage, language, 1, { color });
      if (repo.stargazerCount > 0) {
        addMetric(starLanguage, language, repo.stargazerCount, { color });
      }
    }

    const commitByRepo = new Map<
      string,
      { value: number; description?: string; url?: string; color?: string; language: string }
    >();
    const commitByLanguage = new Map<string, { value: number; color?: string }>();
    const quarterTotals = new Map<string, number>();
    let allTimeCommits = 0;

    const createdYear = new Date(user.createdAt).getUTCFullYear();
    const currentYear = new Date().getUTCFullYear();
    const years = Array.from(
      { length: currentYear - createdYear + 1 },
      (_, index) => createdYear + index,
    );

    const yearResults = await Promise.all(
      years.map(async (year) => {
        const data = await graphql(
          PROFILE_SUMMARY_YEAR_QUERY,
          username,
          token,
          fetchFn,
          {
            from: `${year}-01-01T00:00:00Z`,
            to: `${year}-12-31T23:59:59Z`,
          },
        );
        return { collection: data.user?.contributionsCollection };
      }),
    );

    for (const { collection } of yearResults) {
      if (!collection) continue;

      allTimeCommits += collection.totalCommitContributions ?? 0;

      for (const week of collection.contributionCalendar?.weeks ?? []) {
        for (const day of week.contributionDays ?? []) {
          const key = quarterKey(day.date);
          quarterTotals.set(key, (quarterTotals.get(key) ?? 0) + day.contributionCount);
        }
      }

      for (const item of (collection.commitContributionsByRepository ??
        []) as SummaryCommitRepository[]) {
        const repo = item.repository;
        const count = item.contributions?.totalCount ?? 0;
        if (count === 0) continue;

        const language = repo.primaryLanguage?.name ?? "Unknown";
        const color = normalizeLanguageColor(repo.primaryLanguage?.color);
        const existing = commitByRepo.get(repo.name);
        commitByRepo.set(repo.name, {
          value: (existing?.value ?? 0) + count,
          description: existing?.description ?? repo.description ?? undefined,
          url: existing?.url ?? repo.url,
          color: existing?.color ?? color,
          language,
        });
        addMetric(commitByLanguage, language, count, { color });
      }
    }

    const makeShares = (
      entries: Map<string, { value: number; color?: string; description?: string; url?: string }>,
      limit?: number,
    ) => {
      const items = metricShares(entries);
      return limit ? items.slice(0, limit) : items;
    };

    const commitEntries = new Map<
      string,
      { value: number; color?: string; description?: string; url?: string }
    >();
    for (const [name, item] of commitByRepo) {
      commitEntries.set(name, {
        value: item.value,
        color: item.color,
        description: item.description,
        url: item.url,
      });
    }

    const quarterEntries = [...quarterTotals.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, value]) => ({
        name,
        value,
        percent: 0,
      }));

    const summary: GitHubProfileSummary = {
      user: {
        login: user.login,
        name: user.name ?? undefined,
        avatarUrl: user.avatarUrl,
        htmlUrl: user.url,
        publicRepos: user.repositories.totalCount,
        createdAt: user.createdAt,
      },
      allTimeCommits,
      quarterCommits: quarterEntries,
      repoLanguage: makeShares(repoLanguage),
      starLanguage: makeShares(starLanguage),
      commitLanguage: makeShares(commitByLanguage),
      repoCommits: makeShares(commitEntries, 10),
      repoStars: makeShares(
        new Map(
          repositories
            .filter((repo) => repo.stargazerCount > 0)
            .map((repo) => [
              repo.name,
              {
                value: repo.stargazerCount,
                color: normalizeLanguageColor(repo.primaryLanguage?.color),
                description: repo.description ?? undefined,
                url: repo.url,
              },
            ]),
        ),
        10,
      ),
    };

    profileSummaryCache = {
      key: username,
      expiresAt: now + 6 * 60 * 60 * 1000,
      value: summary,
    };

    return summary;
  } catch (error) {
    console.warn("GitHub profile summary unavailable", error);
    return null;
  }
}
