<script lang="ts">
	import { Card, NoiseImage } from '$lib/components/ui';
	import { ExternalLink, MapPin, Link as LinkIcon, Calendar, Users, GitBranch, Star, Eye } from '@lucide/svelte';
	import type { PageData } from './$types';
	import { formatCompactNumber } from '$lib/utils/formatNumber';
	import { formatLocalizedDate, getUserLocale } from '$lib/utils/locale';
	import { createSiteMeta, defaultSiteMeta } from '$lib/helper/siteMeta';
	let { data }: { data: PageData } = $props();
	const { profile, repos, contributions } = data;

	const locale = getUserLocale();

	const siteMeta = createSiteMeta({
		...defaultSiteMeta,
		title: `GitHub @${profile.login}`,
		description: profile.bio || `${profile.name || profile.login}'s GitHub profile`,
		url: `${defaultSiteMeta.url}/github`
	});

	// Language colours for common languages
	const languageColors: Record<string, string> = {
		TypeScript: '#3178C6',
		JavaScript: '#F7DF1E',
		Python: '#3776AB',
		Svelte: '#FF3E00',
		HTML: '#E34F26',
		CSS: '#1572B6',
		Nix: '#5277C3',
		Shell: '#4EAA25',
		Rust: '#DEA584',
		'Java': '#B07219',
		Go: '#00ADD8',
		Vue: '#4FC08D',
		Swift: '#FA7343',
		Kotlin: '#A97BFF',
		SCSS: '#C6538C',
		Less: '#1D365D',
		Dockerfile: '#384D54',
		Makefile: '#427819'
	};

	function getLanguageColor(lang: string): string {
		return languageColors[lang] || '#8E8E8E';
	}

	function formatDateSafe(dateStr: string): string {
		try {
			return formatLocalizedDate(new Date(dateStr), locale, { year: 'numeric', month: 'short', day: 'numeric' });
		} catch {
			return dateStr;
		}
	}
</script>

<svelte:head>
	<title>{siteMeta.title}</title>
	<meta name="description" content={siteMeta.description} />
</svelte:head>

<div class="mx-auto max-w-6xl space-y-8">
	<!-- Profile Hero -->
	<Card variant="elevated" padding="none" class="overflow-hidden">
		{#snippet children()}
			<!-- Banner pattern -->
			<div class="h-32 w-full bg-linear-to-r from-canvas-800 to-canvas-900 dark:from-canvas-700 dark:to-canvas-800 relative overflow-hidden">
				<div class="absolute inset-0 opacity-20">
					<svg class="h-full w-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
						<pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
							<path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" stroke-width="1" class="text-primary-500" />
						</pattern>
						<rect width="100%" height="100%" fill="url(#grid)" />
					</svg>
				</div>
			</div>

			<div class="relative px-6 pb-6">
				<!-- Avatar -->
				<div class="absolute -top-16 left-6">
					<div class="h-32 w-32 overflow-hidden rounded-full border-4 border-canvas-100 bg-canvas-200 dark:border-canvas-900">
						<NoiseImage
							src={profile.avatar_url}
							seed={`${profile.login}|github|avatar`}
							class="h-full w-full object-cover"
							alt="{profile.name || profile.login}'s avatar"
						/>
					</div>
				</div>

				<!-- Profile info -->
				<div class="pt-20 sm:pt-4 sm:pl-36">
					<div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
						<div>
							<h1 class="text-3xl font-bold text-ink-900 dark:text-ink-50">
								{profile.name || profile.login}
							</h1>
							<p class="text-lg font-medium text-ink-600 dark:text-ink-300">
								@{profile.login}
							</p>

							<!-- Meta info row -->
							<div class="mt-3 flex flex-wrap items-center gap-4 text-sm text-ink-700 dark:text-ink-200">
								{#if profile.location}
									<span class="flex items-center gap-1">
										<MapPin class="h-4 w-4" aria-hidden="true" />
										{profile.location}
									</span>
								{/if}
								{#if profile.blog}
									<a
										href={profile.blog.startsWith('http') ? profile.blog : `https://${profile.blog}`}
										target="_blank"
										rel="noopener noreferrer"
										class="flex items-center gap-1 hover:text-primary-600 dark:hover:text-primary-400"
									>
										<LinkIcon class="h-4 w-4" aria-hidden="true" />
										{profile.blog.replace(/^https?:\/\//, '').replace(/\/$/, '')}
									</a>
								{/if}
								<span class="flex items-center gap-1">
									<Calendar class="h-4 w-4" aria-hidden="true" />
									Joined {formatDateSafe(profile.created_at)}
								</span>
							</div>

							{#if profile.bio}
								<p class="mt-4 max-w-2xl text-ink-700 dark:text-ink-200">
									{profile.bio}
								</p>
							{/if}
						</div>

						<!-- Stats -->
						<div class="flex gap-6 text-sm">
							<div class="text-center">
								<div class="text-2xl font-bold text-ink-900 dark:text-ink-50">
									{formatCompactNumber(profile.public_repos, locale)}
								</div>
								<div class="text-ink-600 dark:text-ink-300">Repos</div>
							</div>
							<div class="text-center">
								<div class="text-2xl font-bold text-ink-900 dark:text-ink-50">
									{formatCompactNumber(profile.followers, locale)}
								</div>
								<div class="text-ink-600 dark:text-ink-300">Followers</div>
							</div>
							<div class="text-center">
								<div class="text-2xl font-bold text-ink-900 dark:text-ink-50">
									{formatCompactNumber(profile.following, locale)}
								</div>
								<div class="text-ink-600 dark:text-ink-300">Following</div>
							</div>
						</div>
					</div>

					<!-- Link to GitHub -->
					<div class="mt-6">
						<a
							href={profile.html_url}
							target="_blank"
							rel="noopener noreferrer"
							class="inline-flex items-center gap-2 rounded-lg bg-ink-900 px-4 py-2 font-medium text-white transition-colors hover:bg-ink-800 dark:bg-ink-100 dark:text-ink-900 dark:hover:bg-ink-200"
						>
							<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
								<path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.54.63-.02 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
							</svg>
							View Profile
							<ExternalLink class="h-4 w-4" aria-hidden="true" />
						</a>
					</div>
				</div>
			</div>
		{/snippet}
	</Card>

	<!-- Contribution Graph -->
	<section>
		<Card variant="elevated" padding="lg">
			{#snippet children()}
				<div class="flex items-center justify-between">
					<h2 class="text-xl font-bold text-ink-900 dark:text-ink-50">
						{formatCompactNumber(contributions.total, locale)} contributions
					</h2>
					<span class="text-sm text-ink-600 dark:text-ink-300">last 90 days</span>
				</div>

				<!-- Contribution grid -->
				<div class="mt-4 overflow-x-auto">
					<div class="flex gap-[3px]" style="width: min-content;">
						{#each contributions.weeks as week}
							<div class="flex flex-col gap-[3px]">
								{#each week as day}
									<div
										class="h-3 w-3 rounded-sm transition-colors"
										class:bg-canvas-200={day.level === 0}
										class:dark:bg-canvas-700={day.level === 0}
										class:bg-primary-200={day.level === 1}
										class:dark:bg-primary-900={day.level === 1}
										class:bg-primary-300={day.level === 2}
										class:dark:bg-primary-700={day.level === 2}
										class:bg-primary-400={day.level === 3}
										class:dark:bg-primary-500={day.level === 3}
										class:bg-primary-600={day.level === 4}
										class:dark:bg-primary-400={day.level === 4}
										title={day.date ? `${day.count} contribution${day.count !== 1 ? 's' : ''} on ${day.date}` : ''}
										role="img"
										aria-label={day.date ? `${day.count} contribution${day.count !== 1 ? 's' : ''} on ${day.date}` : ''}
									></div>
								{/each}
							</div>
						{/each}
					</div>
				</div>

				<!-- Legend -->
				<div class="mt-4 flex items-center justify-end gap-2 text-xs text-ink-600 dark:text-ink-300">
					<span>Less</span>
					{#each [0, 1, 2, 3, 4] as level}
						<div
							class="h-3 w-3 rounded-sm"
							class:bg-canvas-200={level === 0}
							class:dark:bg-canvas-700={level === 0}
							class:bg-primary-200={level === 1}
							class:dark:bg-primary-900={level === 1}
							class:bg-primary-300={level === 2}
							class:dark:bg-primary-700={level === 2}
							class:bg-primary-400={level === 3}
							class:dark:bg-primary-500={level === 3}
							class:bg-primary-600={level === 4}
							class:dark:bg-primary-400={level === 4}
						></div>
					{/each}
					<span>More</span>
				</div>
			{/snippet}
		</Card>
	</section>

	<!-- Repositories Grid -->
	<section>
		<h2 class="mb-6 text-2xl font-bold text-ink-900 dark:text-ink-50">Notable Repositories</h2>
		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each repos as repo}
				<Card
					key={repo.id}
					variant="default"
					padding="md"
					class="flex flex-col"
					interactive={true}
					href={repo.html_url}
					showExternalIcon={true}
				>
					{#snippet children()}
						<div class="flex items-start gap-3">
							<div class="rounded-lg bg-canvas-200 p-2 dark:bg-canvas-700">
								<GitBranch class="h-5 w-5 text-primary-600 dark:text-primary-400" aria-hidden="true" />
							</div>
							<div class="min-w-0 flex-1">
								<h3 class="truncate font-semibold text-ink-900 dark:text-ink-50">
									{repo.name}
								</h3>
								{#if repo.description}
									<p class="mt-1 line-clamp-2 text-sm text-ink-700 dark:text-ink-200">
										{repo.description}
									</p>
								{/if}
							</div>
						</div>

						<!-- Repo stats -->
						<div class="mt-4 flex flex-wrap items-center gap-4 text-xs text-ink-600 dark:text-ink-300">
							{#if repo.language}
								<span class="flex items-center gap-1">
									<span
										class="h-3 w-3 rounded-full"
										style="background-color: {getLanguageColor(repo.language)}"
										aria-hidden="true"
									></span>
									{repo.language}
								</span>
							{/if}
							<span class="flex items-center gap-1">
								<Star class="h-3.5 w-3.5 text-yellow-500" aria-hidden="true" />
								{formatCompactNumber(repo.stargazers_count, locale)}
							</span>
							<span class="flex items-center gap-1">
								<GitBranch class="h-3.5 w-3.5" aria-hidden="true" />
								{formatCompactNumber(repo.forks_count, locale)}
							</span>
							{#if repo.homepage}
								<span class="flex items-center gap-1 text-primary-600 dark:text-primary-400">
									<LinkIcon class="h-3.5 w-3.5" aria-hidden="true" />
									demo
								</span>
							{/if}
						</div>

						<!-- Topics -->
						{#if repo.topics && repo.topics.length > 0}
							<div class="mt-3 flex flex-wrap gap-1.5">
								{#each repo.topics.slice(0, 4) as topic}
									<span
										class="rounded-md bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700 dark:bg-primary-900 dark:text-primary-200"
									>
										{topic}
									</span>
								{/each}
								{#if repo.topics.length > 4}
									<span class="text-xs text-ink-500">+{repo.topics.length - 4}</span>
								{/if}
							</div>
						{/if}

						<!-- License -->
						{#if repo.license}
							<div class="mt-2 text-xs text-ink-500 dark:text-ink-400">
								{repo.license.spdx_id}
							</div>
						{/if}
					{/snippet}
				</Card>
			{/each}
		</div>
	</section>
</div>
