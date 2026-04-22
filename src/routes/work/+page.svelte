<script lang="ts">
	import { Card, NoiseImage } from '$lib/components/ui';
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
		Rss,
		Building2,
		GraduationCap,
		Heart,
		BookOpen,
		FileText,
		Calendar,
		GitBranch,
		Star,
		ExternalLink
	} from '@lucide/svelte';
	import type { PageData } from './$types';
	import type { SifaSkill } from '@ewanc26/atproto';
	import { formatCompactNumber } from '$lib/utils/formatNumber';
	import { formatLocalizedDate, getUserLocale } from '$lib/utils/locale';

	let { data }: { data: PageData } = $props();

	const locale = getUserLocale();
	const {
		profile,
		skills,
		projects,
		languages,
		certifications,
		externalAccounts,
		positions,
		education,
		volunteering,
		honors,
		courses,
		publications,
		github,
		contributions,
		meta
	} = $derived(data);

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
		Java: '#B07219',
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

	const employmentTypeLabels: Record<string, string> = {
		fullTime: 'Full-time',
		partTime: 'Part-time',
		contract: 'Contract',
		freelance: 'Freelance',
		internship: 'Internship',
		apprenticeship: 'Apprenticeship',
		volunteer: 'Volunteer',
		selfEmployed: 'Self-employed'
	};

	const workplaceTypeLabels: Record<string, string> = {
		onSite: 'On-site',
		remote: 'Remote',
		hybrid: 'Hybrid'
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

	function formatDateRange(start: string, end?: string): string {
		const startFormatted = formatDate(start);
		if (!end) return `${startFormatted} — Present`;
		return `${startFormatted} — ${formatDate(end)}`;
	}

	function stripLexiconPrefix(value: string): string {
		return value.replace('id.sifa.defs#', '');
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
									{#if profile.location.city}{profile.location.city},
									{/if}
									{#if profile.location.region}{profile.location.region},
									{/if}
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
								<h2 class="mb-2 text-sm font-medium text-ink-600 dark:text-ink-300">
									Preferred workplace
								</h2>
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

	<!-- Positions Section -->
	{#if positions.length > 0}
		<section>
			<h2 class="mb-6 text-2xl font-bold text-ink-900 dark:text-ink-50">Experience</h2>
			<div class="space-y-4">
				{#each positions as position}
					<Card key={position.uri} variant="default" padding="md">
						{#snippet children()}
							<div class="flex items-start gap-3">
								<div class="rounded-lg bg-canvas-200 p-2 dark:bg-canvas-700">
									<Building2
										class="h-5 w-5 text-primary-600 dark:text-primary-400"
										aria-hidden="true"
									/>
								</div>
								<div class="flex-1">
									<div class="flex items-start justify-between gap-2">
										<div>
											<h3 class="font-semibold text-ink-900 dark:text-ink-50">{position.title}</h3>
											<p class="text-sm text-ink-600 dark:text-ink-300">{position.company}</p>
										</div>
										{#if position.isPrimary}
											<span
												class="rounded bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700 dark:bg-primary-900 dark:text-primary-200"
												>Current</span
											>
										{/if}
									</div>
									<div class="mt-2 flex flex-wrap gap-2 text-xs text-ink-500 dark:text-ink-400">
										<span class="flex items-center gap-1">
											<Calendar class="h-3 w-3" aria-hidden="true" />
											{formatDateRange(position.startedAt, position.endedAt)}
										</span>
										{#if position.employmentType}
											<span
												>· {employmentTypeLabels[stripLexiconPrefix(position.employmentType)] ||
													position.employmentType}</span
											>
										{/if}
										{#if position.workplaceType}
											<span
												>· {workplaceTypeLabels[stripLexiconPrefix(position.workplaceType)] ||
													position.workplaceType}</span
											>
										{/if}
									</div>
									{#if position.description}
										<p class="mt-3 text-sm text-ink-700 dark:text-ink-200">
											{position.description}
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

	<!-- Education Section -->
	{#if education.length > 0}
		<section>
			<h2 class="mb-6 text-2xl font-bold text-ink-900 dark:text-ink-50">Education</h2>
			<div class="space-y-4">
				{#each education as edu}
					<Card key={edu.uri} variant="default" padding="md">
						{#snippet children()}
							<div class="flex items-start gap-3">
								<div class="rounded-lg bg-canvas-200 p-2 dark:bg-canvas-700">
									<GraduationCap
										class="h-5 w-5 text-primary-600 dark:text-primary-400"
										aria-hidden="true"
									/>
								</div>
								<div class="flex-1">
									<h3 class="font-semibold text-ink-900 dark:text-ink-50">{edu.institution}</h3>
									{#if edu.degree || edu.fieldOfStudy}
										<p class="text-sm text-ink-600 dark:text-ink-300">
											{#if edu.degree}{edu.degree}{/if}
											{#if edu.fieldOfStudy}
												in {edu.fieldOfStudy}{/if}
										</p>
									{/if}
									{#if edu.startedAt || edu.endedAt}
										<p class="mt-1 text-xs text-ink-500 dark:text-ink-400">
											{formatDateRange(edu.startedAt || '', edu.endedAt)}
										</p>
									{/if}
									{#if edu.description}
										<p class="mt-2 text-sm text-ink-700 dark:text-ink-200">{edu.description}</p>
									{/if}
								</div>
							</div>
						{/snippet}
					</Card>
				{/each}
			</div>
		</section>
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
									<FolderGit2
										class="h-5 w-5 text-primary-600 dark:text-primary-400"
										aria-hidden="true"
									/>
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

	<!-- Volunteering Section -->
	{#if volunteering.length > 0}
		<section>
			<h2 class="mb-6 text-2xl font-bold text-ink-900 dark:text-ink-50">Volunteering</h2>
			<div class="space-y-4">
				{#each volunteering as vol}
					<Card key={vol.uri} variant="default" padding="md">
						{#snippet children()}
							<div class="flex items-start gap-3">
								<div class="rounded-lg bg-canvas-200 p-2 dark:bg-canvas-700">
									<Heart
										class="h-5 w-5 text-primary-600 dark:text-primary-400"
										aria-hidden="true"
									/>
								</div>
								<div class="flex-1">
									<h3 class="font-semibold text-ink-900 dark:text-ink-50">{vol.organization}</h3>
									{#if vol.role}
										<p class="text-sm text-ink-600 dark:text-ink-300">{vol.role}</p>
									{/if}
									{#if vol.cause}
										<p class="text-xs text-ink-500 dark:text-ink-400">{vol.cause}</p>
									{/if}
									{#if vol.startedAt}
										<p class="mt-1 text-xs text-ink-500 dark:text-ink-400">
											{formatDateRange(vol.startedAt, vol.endedAt)}
										</p>
									{/if}
									{#if vol.description}
										<p class="mt-2 text-sm text-ink-700 dark:text-ink-200">{vol.description}</p>
									{/if}
								</div>
							</div>
						{/snippet}
					</Card>
				{/each}
			</div>
		</section>
	{/if}

	<!-- Publications Section -->
	{#if publications.length > 0}
		<section>
			<h2 class="mb-6 text-2xl font-bold text-ink-900 dark:text-ink-50">Publications</h2>
			<div class="space-y-4">
				{#each publications as pub}
					<Card
						key={pub.uri}
						variant="default"
						padding="md"
						interactive={!!pub.url}
						href={pub.url || undefined}
						showExternalIcon={!!pub.url}
					>
						{#snippet children()}
							<div class="flex items-start gap-3">
								<div class="rounded-lg bg-canvas-200 p-2 dark:bg-canvas-700">
									<FileText
										class="h-5 w-5 text-primary-600 dark:text-primary-400"
										aria-hidden="true"
									/>
								</div>
								<div class="flex-1">
									<h3 class="font-semibold text-ink-900 dark:text-ink-50">{pub.title}</h3>
									{#if pub.publisher}
										<p class="text-sm text-ink-600 dark:text-ink-300">{pub.publisher}</p>
									{/if}
									{#if pub.publishedAt}
										<p class="mt-1 text-xs text-ink-500 dark:text-ink-400">
											Published {formatDate(pub.publishedAt)}
										</p>
									{/if}
									{#if pub.description}
										<p class="mt-2 text-sm text-ink-700 dark:text-ink-200">{pub.description}</p>
									{/if}
								</div>
							</div>
						{/snippet}
					</Card>
				{/each}
			</div>
		</section>
	{/if}

	<!-- Honors Section -->
	{#if honors.length > 0}
		<section>
			<h2 class="mb-6 text-2xl font-bold text-ink-900 dark:text-ink-50">Honors & Awards</h2>
			<div class="space-y-4">
				{#each honors as honor}
					<Card key={honor.uri} variant="default" padding="md">
						{#snippet children()}
							<div class="flex items-start gap-3">
								<div class="rounded-lg bg-canvas-200 p-2 dark:bg-canvas-700">
									<Award
										class="h-5 w-5 text-primary-600 dark:text-primary-400"
										aria-hidden="true"
									/>
								</div>
								<div class="flex-1">
									<h3 class="font-semibold text-ink-900 dark:text-ink-50">{honor.title}</h3>
									{#if honor.issuer}
										<p class="text-sm text-ink-600 dark:text-ink-300">{honor.issuer}</p>
									{/if}
									{#if honor.awardedAt}
										<p class="mt-1 text-xs text-ink-500 dark:text-ink-400">
											Awarded {formatDate(honor.awardedAt)}
										</p>
									{/if}
									{#if honor.description}
										<p class="mt-2 text-sm text-ink-700 dark:text-ink-200">{honor.description}</p>
									{/if}
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
									<Award
										class="h-5 w-5 text-primary-600 dark:text-primary-400"
										aria-hidden="true"
									/>
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

	<!-- Courses Section -->
	{#if courses.length > 0}
		<section>
			<h2 class="mb-6 text-2xl font-bold text-ink-900 dark:text-ink-50">Courses</h2>
			<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{#each courses as course}
					<Card key={course.uri} variant="default" padding="md">
						{#snippet children()}
							<div class="flex items-start gap-3">
								<div class="rounded-lg bg-canvas-200 p-2 dark:bg-canvas-700">
									<BookOpen
										class="h-5 w-5 text-primary-600 dark:text-primary-400"
										aria-hidden="true"
									/>
								</div>
								<div class="min-w-0 flex-1">
									<h3 class="font-semibold text-ink-900 dark:text-ink-50">{course.name}</h3>
									{#if course.institution}
										<p class="text-sm text-ink-600 dark:text-ink-300">{course.institution}</p>
									{/if}
									{#if course.number}
										<p class="text-xs text-ink-500 dark:text-ink-400">{course.number}</p>
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
									<Languages
										class="h-5 w-5 text-primary-600 dark:text-primary-400"
										aria-hidden="true"
									/>
								</div>
								<div>
									<h3 class="font-semibold text-ink-900 dark:text-ink-50">{lang.name}</h3>
									<p class="text-sm text-ink-600 dark:text-ink-300">
										{proficiencyLabels[lang.proficiency.replace('id.sifa.defs#', '')] ||
											lang.proficiency}
									</p>
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
							<span
								class="rounded bg-primary-100 px-1.5 py-0.5 text-xs text-primary-700 dark:bg-primary-900 dark:text-primary-200"
								>Primary</span
							>
						{/if}
					</a>
				{/each}
			</div>
		</section>
	{/if}

	<!-- GitHub Contribution Graph -->
	{#if contributions}
		<section>
			<h2 class="mb-6 text-2xl font-bold text-ink-900 dark:text-ink-50">GitHub Activity</h2>
			<Card variant="elevated" padding="lg">
				{#snippet children()}
					<div class="flex items-center justify-between">
						<h3 class="text-lg font-medium text-ink-900 dark:text-ink-50">
							{formatCompactNumber(contributions.total, locale)} contributions
						</h3>
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
											title={day.date
												? `${day.count} contribution${day.count !== 1 ? 's' : ''} on ${day.date}`
												: ''}
											role="img"
											aria-label={day.date
												? `${day.count} contribution${day.count !== 1 ? 's' : ''} on ${day.date}`
												: ''}
										></div>
									{/each}
								</div>
							{/each}
						</div>
					</div>

					<!-- Legend -->
					<div
						class="mt-4 flex items-center justify-end gap-2 text-xs text-ink-600 dark:text-ink-300"
					>
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

					<!-- Link to GitHub profile -->
					{#if github?.profile}
						<div
							class="mt-4 flex items-center justify-between border-t border-canvas-200 pt-4 dark:border-canvas-700"
						>
							<div class="flex items-center gap-3">
								<div class="h-8 w-8 overflow-hidden rounded-full bg-canvas-200 dark:bg-canvas-700">
									<NoiseImage
										src={github.profile.avatar_url}
										seed={`${github.profile.login}|github|avatar`}
										class="h-full w-full object-cover"
										alt="{github.profile.name || github.profile.login}'s avatar"
									/>
								</div>
								<div>
									<span class="text-sm font-medium text-ink-900 dark:text-ink-50"
										>@{github.profile.login}</span
									>
									<span class="ml-2 text-xs text-ink-500 dark:text-ink-400">
										{formatCompactNumber(github.profile.public_repos, locale)} repos · {formatCompactNumber(
											github.profile.followers,
											locale
										)} followers
									</span>
								</div>
							</div>
							<a
								href={github.profile.html_url}
								target="_blank"
								rel="noopener noreferrer"
								class="inline-flex items-center gap-1.5 rounded-lg bg-ink-900 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-ink-800 dark:bg-ink-100 dark:text-ink-900 dark:hover:bg-ink-200"
							>
								<svg class="h-4 w-4" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
									<path
										d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.54.63-.02 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"
									/>
								</svg>
								Profile
								<ExternalLink class="h-3 w-3" aria-hidden="true" />
							</a>
						</div>
					{/if}
				{/snippet}
			</Card>
		</section>
	{/if}

	<!-- Notable Repositories -->
	{#if github?.repos && github.repos.length > 0}
		<section>
			<h2 class="mb-6 text-2xl font-bold text-ink-900 dark:text-ink-50">Notable Repositories</h2>
			<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{#each github.repos as repo}
					<Card
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
									<GitBranch
										class="h-5 w-5 text-primary-600 dark:text-primary-400"
										aria-hidden="true"
									/>
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
							<div
								class="mt-4 flex flex-wrap items-center gap-4 text-xs text-ink-600 dark:text-ink-300"
							>
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
	{/if}
</div>
