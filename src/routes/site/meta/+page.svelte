<script lang="ts">
	import SiteHead from '$lib/components/SiteHead.svelte';
	import { ExternalLink } from '@lucide/svelte';

	let { data } = $props();
	const { siteInfo, error } = data;

	type Credit = {
		url?: string;
		name: string;
		type?: string;
		author?: string;
		section?: string;
		description?: string;
		license?: { url?: string; name?: string };
	};

	type TechItem = {
		url?: string;
		name: string;
		description?: string;
		type?: string;
		section?: string;
	};

	type Repository = {
		url: string;
		description?: string;
		platform?: string;
		type?: string;
	};

	type OpenSourceInfo = {
		description?: string;
		license?: { url?: string; name?: string };
		repositories?: Repository[];
		relatedServices?: { url: string; description?: string }[];
	};

	type SiteInfo = {
		credits?: Credit[];
		technologyStack?: TechItem[];
		openSourceInfo?: OpenSourceInfo;
		privacyStatement?: string;
		additionalInfo?: {
			purpose?: string;
			websiteBirthYear?: number;
			features?: string[];
			analytics?: string;
			deployment?: string;
			sectionLicense?: { url?: string; name?: string };
		};
	};

	const info = siteInfo as SiteInfo | null;

	// Group credits by section
	function groupBySection<T extends { section?: string }>(items: T[]): Map<string, T[]> {
		const grouped = new Map<string, T[]>();
		for (const item of items) {
			const section = item.section ?? 'Other';
			if (!grouped.has(section)) grouped.set(section, []);
			grouped.get(section)!.push(item);
		}
		return grouped;
	}
</script>

<SiteHead title="Site Meta" description="Information about this website, its technology, and the people who made it possible." />

<main style="padding-top: var(--space-lg);">
	<header style="margin-bottom: var(--space-xl);">
		<h1 style="font-size: var(--text-xl); font-weight: 800; margin-bottom: var(--space-sm);">Site Meta</h1>
		<p style="margin: 0; opacity: 0.7;">Information about this website, its technology, and the people who made it possible.</p>
	</header>

	{#if error}
		<p style="color: var(--color-accent-500);">{error}</p>
	{:else if info}
		<div style="display: flex; flex-direction: column; gap: var(--space-xl);">
			{#if info.additionalInfo?.purpose}
				<section>
					<h2 style="font-size: var(--text-lg); font-weight: 700; margin-bottom: var(--space-sm);">Purpose</h2>
					<p style="white-space: pre-wrap; line-height: 1.75;">{info.additionalInfo.purpose}</p>
				</section>
			{/if}

			{#if info.additionalInfo?.websiteBirthYear}
				<section>
					<h2 style="font-size: var(--text-lg); font-weight: 700; margin-bottom: var(--space-sm);">History</h2>
					<p style="line-height: 1.75;">This website was first launched in {info.additionalInfo.websiteBirthYear}.</p>
				</section>
			{/if}

			{#if info.privacyStatement}
				<section>
					<h2 style="font-size: var(--text-lg); font-weight: 700; margin-bottom: var(--space-sm);">Privacy</h2>
					<p style="white-space: pre-wrap; line-height: 1.75;">{info.privacyStatement}</p>
				</section>
			{/if}

			{#if info.technologyStack?.length}
				<section>
					<h2 style="font-size: var(--text-lg); font-weight: 700; margin-bottom: var(--space-md);">Technology Stack</h2>
					{#each groupBySection(info.technologyStack) as [section, techs]}
						<div style="margin-bottom: var(--space-md);">
							<h3 style="font-size: var(--text-md); font-weight: 600; margin-bottom: var(--space-sm); opacity: 0.8;">{section}</h3>
							<ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: var(--space-xs);">
								{#each techs as tech}
									<li style="padding: var(--space-sm) var(--space-3); border: 1px solid var(--surface-color); border-radius: 4px;">
										{#if tech.url}
											<a href={tech.url} target="_blank" rel="noopener" style="text-decoration: none; color: inherit; display: flex; align-items: center; gap: var(--space-xs);">
												<strong>{tech.name}</strong>
												<ExternalLink size={12} strokeWidth={2} style="opacity: 0.5; flex-shrink: 0;" />
											</a>
										{:else}
											<strong>{tech.name}</strong>
										{/if}
										{#if tech.description}
											<p style="margin: var(--space-2xs) 0 0; font-size: var(--text-sm); opacity: 0.7;">{tech.description}</p>
										{/if}
									</li>
								{/each}
							</ul>
						</div>
					{/each}
				</section>
			{/if}

			{#if info.openSourceInfo}
				<section>
					<h2 style="font-size: var(--text-lg); font-weight: 700; margin-bottom: var(--space-md);">Open Source</h2>
					{#if info.openSourceInfo.description}
						<p style="white-space: pre-wrap; line-height: 1.75; margin-bottom: var(--space-md);">{info.openSourceInfo.description}</p>
					{/if}
					{#if info.openSourceInfo.repositories?.length}
						<ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: var(--space-xs);">
							{#each info.openSourceInfo.repositories as repo}
								<li style="padding: var(--space-sm) var(--space-3); border: 1px solid var(--surface-color); border-radius: 4px;">
									<a href={repo.url} target="_blank" rel="noopener" style="text-decoration: none; color: inherit; display: flex; align-items: center; gap: var(--space-xs);">
										<strong>{repo.description || repo.url}</strong>
										<ExternalLink size={12} strokeWidth={2} style="opacity: 0.5; flex-shrink: 0;" />
									</a>
									<div style="display: flex; gap: var(--space-xs); margin-top: var(--space-2xs);">
										{#if repo.platform}
											<span style="font-size: var(--text-xs); padding: 2px 6px; border-radius: 3px; background: var(--surface-raised); border: 1px solid var(--surface-color);">{repo.platform}</span>
										{/if}
										{#if repo.type}
											<span style="font-size: var(--text-xs); padding: 2px 6px; border-radius: 3px; background: var(--color-primary-900); color: var(--color-primary-400); border: 1px solid var(--color-primary-800);">{repo.type}</span>
										{/if}
									</div>
								</li>
							{/each}
						</ul>
					{/if}
				</section>
			{/if}

			{#if info.credits?.length}
				<section>
					<h2 style="font-size: var(--text-lg); font-weight: 700; margin-bottom: var(--space-md);">Credits</h2>
					{#each groupBySection(info.credits) as [section, credits]}
						<div style="margin-bottom: var(--space-md);">
							<h3 style="font-size: var(--text-md); font-weight: 600; margin-bottom: var(--space-sm); opacity: 0.8;">{section}</h3>
							<div style="display: grid; gap: var(--space-sm); grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));">
								{#each credits as credit}
									<div style="padding: var(--space-sm) var(--space-3); border: 1px solid var(--surface-color); border-radius: 4px;">
										{#if credit.url}
											<a href={credit.url} target="_blank" rel="noopener" style="text-decoration: none; color: inherit; font-weight: 600;">{credit.name}</a>
										{:else}
											<span style="font-weight: 600;">{credit.name}</span>
										{/if}
										{#if credit.author}
											<p style="margin: var(--space-2xs) 0 0; font-size: var(--text-sm); opacity: 0.6;">by {credit.author}</p>
										{/if}
										{#if credit.description}
											<p style="margin: var(--space-2xs) 0 0; font-size: var(--text-sm); opacity: 0.7;">{credit.description}</p>
										{/if}
										{#if credit.license}
											<p style="margin: var(--space-2xs) 0 0; font-size: var(--text-xs); opacity: 0.5;">
												{#if credit.license.url}
													<a href={credit.license.url} target="_blank" rel="noopener">{credit.license.name ?? 'License'}</a>
												{:else}
													{credit.license.name}
												{/if}
											</p>
										{/if}
									</div>
								{/each}
							</div>
						</div>
					{/each}
				</section>
			{/if}
		</div>
	{:else}
		<p style="opacity: 0.6;">No site information available.</p>
	{/if}
</main>
