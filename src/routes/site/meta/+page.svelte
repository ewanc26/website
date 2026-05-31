<script lang="ts">
	import SiteHead from '$lib/components/SiteHead.svelte';
	import { ExternalLink } from '@lucide/svelte';

	let { data } = $props();

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

	const info = $derived(data.siteInfo as SiteInfo | null);

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

<main class="shell-wide">
	<header class="page-hd">
		<h1 class="page-title">Site Meta</h1>
		<p class="page-desc">Information about this website, its technology, and the people who made it possible.</p>
	</header>

	{#if data.error}
		<p style="color: var(--color-accent-500);">{data.error}</p>
	{:else if info}
		<div class="meta-grid">
			<div class="meta-main">
				{#if info.additionalInfo?.purpose}
					<section class="meta-section">
						<h2 class="meta-heading">Purpose</h2>
						<p class="meta-text">{info.additionalInfo.purpose}</p>
					</section>
				{/if}

				{#if info.additionalInfo?.websiteBirthYear}
					<section class="meta-section">
						<h2 class="meta-heading">History</h2>
						<p class="meta-text">This website was first launched in {info.additionalInfo.websiteBirthYear}.</p>
					</section>
				{/if}

				{#if info.privacyStatement}
					<section class="meta-section">
						<h2 class="meta-heading">Privacy</h2>
						<p class="meta-text">{info.privacyStatement}</p>
					</section>
				{/if}

				{#if info.openSourceInfo}
					<section class="meta-section">
						<h2 class="meta-heading">Open Source</h2>
						{#if info.openSourceInfo.description}
							<p class="meta-text">{info.openSourceInfo.description}</p>
						{/if}
						{#if info.openSourceInfo.repositories?.length}
							<ul class="meta-list">
								{#each info.openSourceInfo.repositories as repo}
									<li class="meta-card">
										<a href={repo.url} target="_blank" rel="noopener" class="meta-card-link">
											<strong>{repo.description || repo.url}</strong>
											<ExternalLink size={12} strokeWidth={2} style="opacity: 0.5; flex-shrink: 0;" />
										</a>
										<div class="meta-tags">
											{#if repo.platform}
												<span class="meta-tag">{repo.platform}</span>
											{/if}
											{#if repo.type}
												<span class="meta-tag meta-tag--accent">{repo.type}</span>
											{/if}
										</div>
									</li>
								{/each}
							</ul>
						{/if}
					</section>
				{/if}
			</div>

			<aside class="meta-sidebar">
				{#if info.technologyStack?.length}
					<section class="meta-section">
						<h2 class="meta-heading">Technology Stack</h2>
						{#each groupBySection(info.technologyStack) as [section, techs]}
							<div style="margin-bottom: var(--space-md);">
								<h3 class="meta-subheading">{section}</h3>
								<ul class="meta-list">
									{#each techs as tech}
										<li class="meta-card">
											{#if tech.url}
												<a href={tech.url} target="_blank" rel="noopener" class="meta-card-link">
													<strong>{tech.name}</strong>
													<ExternalLink size={12} strokeWidth={2} style="opacity: 0.5; flex-shrink: 0;" />
												</a>
											{:else}
												<strong>{tech.name}</strong>
											{/if}
											{#if tech.description}
												<p class="meta-card-desc">{tech.description}</p>
											{/if}
										</li>
									{/each}
								</ul>
							</div>
						{/each}
					</section>
				{/if}

				{#if info.credits?.length}
					<section class="meta-section">
						<h2 class="meta-heading">Credits</h2>
						{#each groupBySection(info.credits) as [section, credits]}
							<div style="margin-bottom: var(--space-md);">
								<h3 class="meta-subheading">{section}</h3>
								<ul class="meta-list">
									{#each credits as credit}
										<li class="meta-card">
											{#if credit.url}
												<a href={credit.url} target="_blank" rel="noopener" class="meta-card-link">{credit.name}</a>
											{:else}
												<span style="font-weight: 600;">{credit.name}</span>
											{/if}
											{#if credit.author}
												<p class="meta-card-desc">by {credit.author}</p>
											{/if}
											{#if credit.license}
												<p class="meta-card-desc" style="opacity: 0.5;">
													{#if credit.license.url}
														<a href={credit.license.url} target="_blank" rel="noopener">{credit.license.name ?? 'License'}</a>
													{:else}
														{credit.license.name}
													{/if}
												</p>
											{/if}
										</li>
									{/each}
								</ul>
							</div>
						{/each}
					</section>
				{/if}
			</aside>
		</div>
	{:else}
		<p style="opacity: 0.6;">No site information available.</p>
	{/if}
</main>

<style>
	.page-hd {
		padding: var(--space-lg) 0;
	}

	.page-title {
		font-size: clamp(2rem, 5vw, 3rem);
		font-weight: 800;
		letter-spacing: -0.03em;
		margin: 0 0 var(--space-sm);
	}

	.page-desc {
		margin: 0;
		color: var(--color-ink-700);
	}

	.meta-grid {
		display: grid;
		grid-template-columns: 1fr 320px;
		gap: var(--space-lg);
		padding: var(--space-lg) 0;
		align-items: start;
		contain: layout;
	}

	.meta-sidebar {
		position: sticky;
		top: 72px;
		max-height: calc(100vh - 72px - var(--space-md));
		overflow-y: auto;
		overscroll-behavior: contain;
		min-width: 0;
	}

	.meta-section {
		margin-bottom: var(--space-lg);
	}

	.meta-heading {
		font-size: var(--text-md);
		font-weight: 700;
		margin: 0 0 var(--space-md);
	}

	.meta-subheading {
		font-size: var(--text-sm);
		font-weight: 600;
		color: var(--color-ink-700);
		margin: 0 0 var(--space-sm);
	}

	.meta-text {
		white-space: pre-wrap;
		line-height: 1.75;
		margin: 0;
	}

	.meta-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-xs);
	}

	.meta-card {
		padding: var(--space-sm);
		border: 1px solid var(--surface-color);
	}

	.meta-card-link {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
		text-decoration: none;
		color: inherit;
		font-weight: 600;
	}

	.meta-card-desc {
		margin: var(--space-2xs) 0 0;
		font-size: var(--text-sm);
		color: var(--color-ink-600);
	}

	.meta-tags {
		display: flex;
		gap: var(--space-xs);
		margin-top: var(--space-2xs);
	}

	.meta-tag {
		font-size: var(--text-xs);
		padding: 2px 6px;
		border: 1px solid var(--surface-color);
		background: var(--surface-raised);
	}

	.meta-tag--accent {
		background: var(--color-primary-900);
		color: var(--color-primary-400);
		border-color: var(--color-primary-800);
	}

	@media (max-width: 900px) {
		.meta-grid {
			grid-template-columns: 1fr;
		}

		.meta-sidebar {
			position: static;
			max-height: none;
			overflow-y: visible;
		}
	}
</style>
