<script lang="ts">
	import { Card } from '$lib/components/ui';
	import { MetaTags } from '$lib/components/seo';
	import {
		MapPin,
		Briefcase,
		FolderGit2,
		Languages,
		Award,
		Link as LinkIcon,
		Globe,
		Github,
		Rss
	} from '@lucide/svelte';
	import type { PageData } from './$types';
	import type {
		SifaSkill,
		SifaProject,
		SifaLanguage,
		SifaCertification,
		SifaExternalAccount
	} from '@ewanc26/atproto';

	let { data }: { data: PageData } = $props();

	const { profile, skills, projects, languages, certifications, externalAccounts, meta } = $derived(data);

	// Group skills by category
	const skillsByCategory = $derived(
		skills.reduce(
			(acc, skill) => {
				const category = skill.category.replace('id.sifa.defs#', '');
				if (!acc[category]) acc[category] = [];
				acc[category].push(skill);
				return acc;
			},
			{} as Record<string, SifaSkill[]>
		)
	);

	const categoryLabels: Record<string, string> = {
		technical: 'Technical',
		creative: 'Creative',
		industry: 'Industry',
		business: 'Business',
		interpersonal: 'Interpersonal',
		language: 'Language'
	};

	const proficiencyLabels: Record<string, string> = {
		elementary: 'Elementary',
		limitedWorking: 'Limited Working',
		professionalWorking: 'Professional Working',
		fullProfessional: 'Full Professional',
		native: 'Native'
	};

	function formatOpenTo(openTo: string[]): string[] {
		return openTo
			.map((o) => o.replace('id.sifa.defs#', ''))
			.map((o) => {
				const labels: Record<string, string> = {
					fullTimeRoles: 'Full-time roles',
					partTimeRoles: 'Part-time roles',
					contractRoles: 'Contract work',
					boardPositions: 'Board positions',
					mentoringOthers: 'Mentoring',
					beingMentored: 'Being mentored',
					collaborations: 'Collaborations'
				};
				return labels[o] || o;
			});
	}

	function formatWorkplace(workplace: string[]): string[] {
		return workplace
			.map((w) => w.replace('id.sifa.defs#', ''))
			.map((w) => w.charAt(0).toUpperCase() + w.slice(1));
	}

	function formatDate(dateStr: string): string {
		try {
			return new Date(dateStr).toLocaleDateString('en-GB', {
				year: 'numeric',
				month: 'long'
			});
		} catch {
			return dateStr;
		}
	}
</script>

<MetaTags {meta} siteMeta={meta} />

<div class="mx-auto max-w-6xl space-y-8">
	<!-- Hero Section -->
	{#if profile}
		<Card variant="elevated" padding="lg">
			{#snippet children()}
				<div class="flex items-start gap-4">
					<div class="rounded-xl bg-primary-100 p-3 dark:bg-primary-900">
						<Briefcase class="h-8 w-8 text-primary-600 dark:text-primary-400" aria-hidden="true" />
					</div>
					<div class="flex-1">
						<h1 class="text-2xl font-bold text-ink-900 dark:text-ink-50">{profile.headline}</h1>

						{#if profile.location}
							<div class="mt-2 flex items-center gap-1 text-sm text-ink-600 dark:text-ink-300">
								<MapPin class="h-4 w-4" aria-hidden="true" />
								<span>
									{#if profile.location.city}{profile.location.city}, {/if}
									{#if profile.location.region}{profile.location.region}, {/if}
									{profile.location.countryCode}
								</span>
							</div>
						{/if}

						{#if profile.about}
							<p class="mt-4 whitespace-pre-line text-ink-700 dark:text-ink-200">{profile.about}</p>
						{/if}

						<!-- Open to -->
						{#if profile.openTo && profile.openTo.length > 0}
							<div class="mt-6">
								<h2 class="mb-2 text-sm font-medium text-ink-600 dark:text-ink-300">Open to</h2>
								<div class="flex flex-wrap gap-2">
									{#each formatOpenTo(profile.openTo) as item}
										<span
											class="rounded-full bg-primary-100 px-3 py-1 text-sm font-medium text-primary-700 dark:bg-primary-900 dark:text-primary-200"
										>
											{item}
										</span>
									{/each}
								</div>
							</div>
						{/if}

						<!-- Workplace preference -->
						{#if profile.preferredWorkplace && profile.preferredWorkplace.length > 0}
							<div class="mt-4">
								<h2 class="mb-2 text-sm font-medium text-ink-600 dark:text-ink-300">Preferred workplace</h2>
								<div class="flex gap-3">
									{#each formatWorkplace(profile.preferredWorkplace) as wp}
										<span class="text-sm text-ink-700 dark:text-ink-200">{wp}</span>
									{/each}
								</div>
							</div>
						{/if}
					</div>
				</div>
			{/snippet}
		</Card>
	{/if}

	<!-- Skills Section -->
	{#if skills.length > 0}
		<section>
			<h2 class="mb-6 text-2xl font-bold text-ink-900 dark:text-ink-50">Skills</h2>
			{#each Object.entries(skillsByCategory) as [category, categorySkills]}
				<div class="mb-6">
					<h3 class="mb-3 text-lg font-medium text-ink-600 dark:text-ink-300">
						{categoryLabels[category] || category}
					</h3>
					<div class="flex flex-wrap gap-2">
						{#each categorySkills as skill}
							<span
								class="rounded-lg bg-canvas-200 px-3 py-1.5 text-sm font-medium text-ink-700 dark:bg-canvas-700 dark:text-ink-200"
							>
								{skill.name}
							</span>
						{/each}
					</div>
				</div>
			{/each}
		</section>
	{/if}

	<!-- Projects Section -->
	{#if projects.length > 0}
		<section>
			<h2 class="mb-6 text-2xl font-bold text-ink-900 dark:text-ink-50">Projects</h2>
			<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{#each projects as project}
					<Card
						key={project.uri}
						variant="default"
						padding="md"
						class="flex flex-col"
						interactive={!!project.url}
						href={project.url || undefined}
						showExternalIcon={!!project.url}
					>
						{#snippet children()}
							<div class="flex items-start gap-3">
								<div class="rounded-lg bg-canvas-200 p-2 dark:bg-canvas-700">
									<FolderGit2 class="h-5 w-5 text-primary-600 dark:text-primary-400" aria-hidden="true" />
								</div>
								<div class="min-w-0 flex-1">
									<h3 class="font-semibold text-ink-900 dark:text-ink-50">{project.name}</h3>
									{#if project.description}
										<p class="mt-1 line-clamp-2 text-sm text-ink-700 dark:text-ink-200">
											{project.description}
										</p>
									{/if}
									{#if project.startedAt}
										<p class="mt-2 text-xs text-ink-500 dark:text-ink-400">
											Started {formatDate(project.startedAt)}
										</p>
									{/if}
								</div>
							</div>
						{/snippet}
					</Card>
				{/each}
			</div>
		</section>
	{/if}

	<!-- Languages Section -->
	{#if languages.length > 0}
		<section>
			<h2 class="mb-6 text-2xl font-bold text-ink-900 dark:text-ink-50">Languages</h2>
			<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				{#each languages as lang}
					<Card key={lang.uri} variant="default" padding="md">
						{#snippet children()}
							<div class="flex items-center gap-3">
								<div class="rounded-lg bg-canvas-200 p-2 dark:bg-canvas-700">
									<Languages class="h-5 w-5 text-primary-600 dark:text-primary-400" aria-hidden="true" />
								</div>
								<div>
									<h3 class="font-semibold text-ink-900 dark:text-ink-50">{lang.name}</h3>
									<p class="text-sm text-ink-600 dark:text-ink-300">
										{proficiencyLabels[lang.proficiency.replace('id.sifa.defs#', '')] || lang.proficiency}
									</p>
								</div>
							</div>
						{/snippet}
					</Card>
				{/each}
			</div>
		</section>
	{/if}

	<!-- Certifications Section -->
	{#if certifications.length > 0}
		<section>
			<h2 class="mb-6 text-2xl font-bold text-ink-900 dark:text-ink-50">Certifications</h2>
			<div class="space-y-4">
				{#each certifications as cert}
					<Card key={cert.uri} variant="default" padding="md">
						{#snippet children()}
							<div class="flex items-start gap-3">
								<div class="rounded-lg bg-canvas-200 p-2 dark:bg-canvas-700">
									<Award class="h-5 w-5 text-primary-600 dark:text-primary-400" aria-hidden="true" />
								</div>
								<div class="flex-1">
									<h3 class="font-semibold text-ink-900 dark:text-ink-50">{cert.name}</h3>
									{#if cert.authority}
										<p class="text-sm text-ink-600 dark:text-ink-300">{cert.authority}</p>
									{/if}
									{#if cert.issuedAt}
										<p class="mt-1 text-xs text-ink-500 dark:text-ink-400">
											Issued {formatDate(cert.issuedAt)}
										</p>
									{/if}
								</div>
							</div>
						{/snippet}
					</Card>
				{/each}
			</div>
		</section>
	{/if}

	<!-- External Accounts Section -->
	{#if externalAccounts.length > 0}
		<section>
			<h2 class="mb-6 text-2xl font-bold text-ink-900 dark:text-ink-50">Links</h2>
			<div class="flex flex-wrap gap-3">
				{#each externalAccounts as account}
					<a
						href={account.url}
						target="_blank"
						rel="noopener noreferrer"
						class="inline-flex items-center gap-2 rounded-lg bg-canvas-200 px-4 py-2 text-sm font-medium text-ink-700 transition-colors hover:bg-canvas-300 dark:bg-canvas-700 dark:text-ink-200 dark:hover:bg-canvas-600"
					>
						{#if account.platform === 'id.sifa.defs#platformGithub'}
							<Github class="h-4 w-4" aria-hidden="true" />
						{:else if account.platform === 'id.sifa.defs#platformWebsite'}
							<Globe class="h-4 w-4" aria-hidden="true" />
						{:else if account.platform === 'id.sifa.defs#platformRss'}
							<Rss class="h-4 w-4" aria-hidden="true" />
						{:else}
							<LinkIcon class="h-4 w-4" aria-hidden="true" />
						{/if}
						{account.label || account.url}
						{#if account.isPrimary}
							<span class="rounded bg-primary-100 px-1.5 py-0.5 text-xs text-primary-700 dark:bg-primary-900 dark:text-primary-200">Primary</span>
						{/if}
					</a>
				{/each}
			</div>
		</section>
	{/if}
</div>
