/**
 * GitHub API fetch functions with caching
 */
import type { GitHubProfile, GitHubRepo, GitHubLanguageStats } from './types';

const GITHUB_API_BASE = 'https://api.github.com';
const CACHE_TTL = 1000 * 60 * 15; // 15 minutes

interface CacheEntry<T> {
	data: T;
	timestamp: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

function getCached<T>(key: string): T | null {
	const entry = cache.get(key) as CacheEntry<T> | undefined;
	if (!entry) return null;
	if (Date.now() - entry.timestamp > CACHE_TTL) {
		cache.delete(key);
		return null;
	}
	return entry.data;
}

function setCached<T>(key: string, data: T): void {
	cache.set(key, { data, timestamp: Date.now() });
}

async function githubFetch<T>(endpoint: string, fetchFn?: typeof fetch): Promise<T> {
	const cacheKey = endpoint;
	const cached = getCached<T>(cacheKey);
	if (cached) return cached;

	const fetchImpl = fetchFn || globalThis.fetch;
	const response = await fetchImpl(`${GITHUB_API_BASE}${endpoint}`, {
		headers: {
			Accept: 'application/vnd.github.v3+json',
			// Add user agent for rate limits
			'User-Agent': 'ewancroft-uk-website'
		}
	});

	if (!response.ok) {
		throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
	}

	const data = await response.json();
	setCached(cacheKey, data);
	return data;
}

/**
 * Fetch a GitHub user profile by username
 */
export async function fetchGitHubProfile(
	username: string,
	fetchFn?: typeof fetch
): Promise<GitHubProfile> {
	return githubFetch<GitHubProfile>(`/users/${username}`, fetchFn);
}

/**
 * Fetch a user's public repositories
 */
export async function fetchGitHubRepos(
	username: string,
	fetchFn?: typeof fetch,
	options?: { sort?: 'created' | 'updated' | 'pushed' | 'full_name'; direction?: 'asc' | 'desc'; per_page?: number }
): Promise<GitHubRepo[]> {
	const params = new URLSearchParams({
		sort: options?.sort || 'updated',
		direction: options?.direction || 'desc',
		per_page: String(options?.per_page || 100)
	});
	return githubFetch<GitHubRepo[]>(`/users/${username}/repos?${params}`, fetchFn);
}

/**
 * Fetch language breakdown for a specific repo
 */
export async function fetchRepoLanguages(
	owner: string,
	repo: string,
	fetchFn?: typeof fetch
): Promise<GitHubLanguageStats> {
	return githubFetch<GitHubLanguageStats>(`/repos/${owner}/${repo}/languages`, fetchFn);
}

/**
 * Fetch pinned repositories via the pinned API endpoint
 * Note: GitHub's API doesn't directly expose pinned repos via REST,
 * so we'll fetch all repos and mark notable ones
 */
export async function fetchNotableRepos(
	username: string,
	fetchFn?: typeof fetch,
	limit: number = 6
): Promise<GitHubRepo[]> {
	const repos = await fetchGitHubRepos(username, fetchFn, { sort: 'updated', per_page: 30 });

	// Filter and sort: prefer non-forks, then by stars + activity
	const notable = repos
		.filter((repo) => !repo.fork && !repo.archived)
		.sort((a, b) => {
			const scoreA = a.stargazers_count * 2 + (a.homepage ? 5 : 0) + (a.description ? 2 : 0);
			const scoreB = b.stargazers_count * 2 + (b.homepage ? 5 : 0) + (b.description ? 2 : 0);
			return scoreB - scoreA;
		})
		.slice(0, limit);

	return notable;
}

/**
 * Fetch profile with notable repos in parallel
 */
export async function fetchGitHubData(
	username: string,
	fetchFn?: typeof fetch
): Promise<{ profile: GitHubProfile; repos: GitHubRepo[] }> {
	const [profile, repos] = await Promise.all([
		fetchGitHubProfile(username, fetchFn),
		fetchNotableRepos(username, fetchFn)
	]);
	return { profile, repos };
}
