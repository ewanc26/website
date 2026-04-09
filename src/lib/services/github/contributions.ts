/**
 * GitHub contributions fetcher
 * Fetches user events and aggregates by date for contribution graph
 */
import type { GitHubProfile } from './types';

const GITHUB_API_BASE = 'https://api.github.com';
const CACHE_TTL = 1000 * 60 * 30; // 30 minutes

interface CacheEntry<T> {
	data: T;
	timestamp: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

interface GitHubEvent {
	id: string;
	type: string;
	actor: {
		login: string;
	};
	repo: {
		name: string;
	};
	payload?: Record<string, unknown>;
	created_at: string;
}

interface ContributionDay {
	date: string;
	count: number;
	level: 0 | 1 | 2 | 3 | 4;
}

interface ContributionData {
	total: number;
	days: ContributionDay[];
	weeks: ContributionDay[][];
}

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

/**
 * Calculate intensity level (0-4) based on count
 */
function getLevel(count: number, maxCount: number): 0 | 1 | 2 | 3 | 4 {
	if (count === 0) return 0;
	const ratio = count / maxCount;
	if (ratio < 0.25) return 1;
	if (ratio < 0.5) return 2;
	if (ratio < 0.75) return 3;
	return 4;
}

/**
 * Format date as YYYY-MM-DD
 */
function formatDateKey(date: Date): string {
	return date.toISOString().split('T')[0];
}

/**
 * Generate array of dates for the last N days
 */
function generateDateRange(days: number): Date[] {
	const dates: Date[] = [];
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	for (let i = 0; i < days; i++) {
		const d = new Date(today);
		d.setDate(d.getDate() - i);
		dates.push(d);
	}
	return dates.reverse();
}

/**
 * Fetch GitHub events for a user
 */
async function fetchUserEvents(
	username: string,
	fetchFn?: typeof fetch,
	pages: number = 10
): Promise<GitHubEvent[]> {
	const fetchImpl = fetchFn || globalThis.fetch;
	const events: GitHubEvent[] = [];

	// Fetch multiple pages to get more historical data
	for (let page = 1; page <= pages; page++) {
		const response = await fetchImpl(
			`${GITHUB_API_BASE}/users/${username}/events?per_page=100&page=${page}`,
			{
				headers: {
					Accept: 'application/vnd.github.v3+json',
					'User-Agent': 'ewancroft-uk-website'
				}
			}
		);

		if (!response.ok) break;
		const pageEvents: GitHubEvent[] = await response.json();
		if (pageEvents.length === 0) break;
		events.push(...pageEvents);
	}

	return events;
}

/**
 * Fetch and aggregate contribution data
 */
export async function fetchContributions(
	username: string,
	fetchFn?: typeof fetch,
	days: number = 90
): Promise<ContributionData> {
	const cacheKey = `contributions:${username}:${days}`;
	const cached = getCached<ContributionData>(cacheKey);
	if (cached) return cached;

	// Fetch events
	const events = await fetchUserEvents(username, fetchFn, 10);

	// Aggregate by date
	const countsByDate = new Map<string, number>();
	events.forEach((event) => {
		const date = event.created_at.split('T')[0];
		countsByDate.set(date, (countsByDate.get(date) || 0) + 1);
	});

	// Generate date range
	const dateRange = generateDateRange(days);

	// Build contribution days
	const contributionDays: ContributionDay[] = dateRange.map((date) => {
		const dateKey = formatDateKey(date);
		const count = countsByDate.get(dateKey) || 0;
		return { date: dateKey, count, level: 0 };
	});

	// Calculate max for level scaling
	const maxCount = Math.max(...contributionDays.map((d) => d.count), 1);

	// Assign levels
	contributionDays.forEach((day) => {
		day.level = getLevel(day.count, maxCount);
	});

	// Group into weeks (7 days each, Sunday = 0)
	const weeks: ContributionDay[][] = [];
	for (let i = 0; i < contributionDays.length; i += 7) {
		weeks.push(contributionDays.slice(i, i + 7));
	}

	// Pad first week if needed to start on Sunday
	if (weeks.length > 0 && weeks[0].length < 7) {
		const firstDay = new Date(weeks[0][0].date);
		const dayOfWeek = firstDay.getDay();
		const padding: ContributionDay[] = [];
		for (let i = 0; i < dayOfWeek; i++) {
			padding.push({ date: '', count: 0, level: 0 });
		}
		weeks[0] = [...padding, ...weeks[0]];
	}

	const data: ContributionData = {
		total: contributionDays.reduce((sum, d) => sum + d.count, 0),
		days: contributionDays,
		weeks
	};

	setCached(cacheKey, data);
	return data;
}

/**
 * Get month labels for the contribution graph
 */
export function getMonthLabels(days: number = 90): { month: string; index: number }[] {
	const dateRange = generateDateRange(days);
	const months: { month: string; index: number }[] = [];
	let lastMonth = '';

	dateRange.forEach((date, index) => {
		const monthName = date.toLocaleString('en-US', { month: 'short' });
		if (monthName !== lastMonth) {
			months.push({ month: monthName, index });
			lastMonth = monthName;
		}
	});

	return months;
}
