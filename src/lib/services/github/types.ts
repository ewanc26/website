/**
 * GitHub API type definitions
 */

export interface GitHubProfile {
	login: string;
	id: number;
	node_id: string;
	avatar_url: string;
	gravatar_id: string;
	url: string;
	html_url: string;
	followers_url: string;
	following_url: string;
	gists_url: string;
	starred_url: string;
	subscriptions_url: string;
	organizations_url: string;
	repos_url: string;
	events_url: string;
	received_events_url: string;
	type: string;
	user_view_type: 'public' | 'private';
	site_admin: boolean;
	name: string | null;
	company: string | null;
	blog: string | null;
	location: string | null;
	email: string | null;
	hireable: boolean | null;
	bio: string | null;
	twitter_username: string | null;
	public_repos: number;
	public_gists: number;
	followers: number;
	following: number;
	created_at: string;
	updated_at: string;
}

export interface GitHubRepo {
	id: number;
	node_id: string;
	name: string;
	full_name: string;
	private: boolean;
	owner: {
		login: string;
		id: number;
		avatar_url: string;
		html_url: string;
	};
	html_url: string;
	description: string | null;
	fork: boolean;
	url: string;
	forks_url: string;
	homepage: string | null;
	language: string | null;
	forks_count: number;
	stargazers_count: number;
 watchers_count: number;
	size: number;
	default_branch: string;
	open_issues_count: number;
	is_template: boolean;
	topics: string[];
	visibility: 'public' | 'private';
 pushed_at: string;
	created_at: string;
	updated_at: string;
	archived: boolean;
	disabled: boolean;
	license: {
		key: string;
		name: string;
		spdx_id: string;
		url: string | null;
	} | null;
}

export interface GitHubLanguageStats {
	[key: string]: number;
}

export interface GitHubRepoWithDetails extends GitHubRepo {
	languages?: GitHubLanguageStats;
	totalBytes?: number;
}
