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
		<p class="error">{data.error}</p>
	{:else if info}
		<div class="about-grid">
			<div class="about-main">
				{#if info.additionalInfo?.purpose}
					<section class="about-section">
						<h2 class="section-heading">Purpose</h2>
						<p class="meta-text">{info.additionalInfo.purpose}</p>
					</section>
				{/if}

				{#if info.additionalInfo?.websiteBirthYear}
					<section class="about-section">
						<h2 class="section-heading">History</h2>
						<p class="meta-text">This website was first launched in {info.additionalInfo.websiteBirthYear}.</p>
					</section>
				{/if}

				{#if info.privacyStatement}
					<section class="about-section">
						<h2 class="section-heading">Privacy</h2>
						<p class="meta-text">{info.privacyStatement}</p>
					</section>
				{/if}

				{#if info.openSourceInfo}
					<section class="about-section">
						<h2 class="section-heading">Open Source</h2>
						{#if info.openSourceInfo.description}
							<p class="meta-text">{info.openSourceInfo.description}</p>
						{/if}
						{#if info.openSourceInfo.repositories?.length}
							<ul class="bare-list meta-list">
								{#each info.openSourceInfo.repositories as repo}
									<li class="meta-card">
										<div class="meta-card-row">
											{#if repo.url}
												<a href={repo.url} target="_blank" rel="noopener" class="meta-card-link">
													<strong>{repo.description || repo.url}</strong>
													<ExternalLink size={12} strokeWidth={2} />
												</a>
											{:else}
												<strong>{repo.description || repo.url}</strong>
											{/if}
										</div>
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

			<aside class="about-sidebar">
				{#if info.technologyStack?.length}
					<section class="sidebar-section">
						<h2 class="section-heading">Technology Stack</h2>
						{#each groupBySection(info.technologyStack) as [section, techs]}
							<div class="sidebar-group">
								<h3 class="sub-heading">{section}</h3>
								<div class="tech-grid">
									{#each techs as tech}
										<div class="tech-card">
											<div class="meta-card-row">
												{#if tech.url}
													<a href={tech.url} target="_blank" rel="noopener" class="meta-card-link">
														<strong>{tech.name}</strong>
														<ExternalLink size={12} strokeWidth={2} />
													</a>
												{:else}
													<strong>{tech.name}</strong>
												{/if}
											</div>
											{#if tech.description}
												<p class="meta-card-desc">{tech.description}</p>
											{/if}
										</div>
									{/each}
								</div>
							</div>
						{/each}
					</section>
				{/if}

				{#if info.credits?.length}
					<section class="sidebar-section">
						<h2 class="section-heading">Credits</h2>
						{#each groupBySection(info.credits) as [section, credits]}
							<div class="sidebar-group">
								<h3 class="sub-heading">{section}</h3>
								<ul class="bare-list meta-list">
									{#each credits as credit}
										<li class="meta-card">
											<div class="meta-card-row">
												{#if credit.url}
													<a href={credit.url} target="_blank" rel="noopener" class="meta-card-link">
														{credit.name}
														<ExternalLink size={12} strokeWidth={2} />
													</a>
												{:else}
													<span class="credit-name">{credit.name}</span>
												{/if}
											</div>
											{#if credit.author}
												<p class="meta-card-desc">by {credit.author}</p>
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
		<p class="empty-state">No site information available.</p>
	{/if}
</main>

<style>
	.error { color: var(--color-accent-500); }
	.empty-state { opacity: 0.6; }
	
	/* Layout */
	.about-grid {
		display: grid;
		grid-template-columns: 1fr 280px;
		gap: var(--space-lg);
		padding: var(--space-lg) 0;
		align-items: start;
	}

	@media (max-width: 900px) {
		.about-grid {
			grid-template-columns: 1fr;
		}
	}

	.about-main {
		min-width: 0;
	}

	/* Sidebar */
	.about-sidebar {
		position: sticky;
		top: 72px;
		height: max-content;
		min-width: 0;
	}

	.sidebar-section {
		margin-bottom: var(--space-lg);
	}

	.sidebar-group {
		margin-bottom: var(--space-md);
	}

	/* Sections */
	.about-section {
		margin-bottom: var(--space-xl);
	}

	.section-heading {
		font-size: var(--text-md);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		font-weight: 800;
		margin-bottom: var(--space-md);
	}

	.sub-heading {
		font-size: var(--text-sm);
		font-weight: 700;
		margin-bottom: var(--space-xs);
		color: var(--color-ink-600);
	}

	.meta-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-xs);
	}

	.tech-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
		gap: var(--space-xs);
	}

	.tech-card {
		padding: var(--space-sm);
		border: 1px solid var(--surface-color);
		border-radius: var(--radius-md);
	}

	.credit-name { font-weight: 600; }
	.meta-text {
		white-space: pre-wrap;
		line-height: 1.75;
		margin: 0;
	}

	.meta-card {
		padding: var(--space-sm);
		border: 1px solid var(--surface-color);
		border-radius: var(--radius-md);
	}

	.meta-card-row {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: var(--space-sm);
	}

	.meta-card-link {
		color: inherit;
		text-decoration: none;
		display: inline-flex;
		align-items: baseline;
		gap: var(--space-xs);
		transition: color var(--duration-fast) var(--ease-out-quart);
	}

	.meta-card-link:hover {
		color: var(--color-primary-500);
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
		border-radius: var(--radius-sm);
		background: var(--surface-raised);
	}

	.meta-tag--accent {
		background: var(--color-primary-900);
		color: var(--color-primary-400);
		border-color: var(--color-primary-800);
	}
</style>
