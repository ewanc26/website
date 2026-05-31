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

<SiteHead title="Site Meta" description="Information about this website, its technology, and the people who made it possible." ogType="SITE META" />

<main class="shell-wide">
	<header class="page-hd spec-header">
		<h1 class="page-title">Site Meta</h1>
		<p class="spec-abstract">
			Information about this website, its technology, and the people who made it possible.
		</p>
	</header>

	{#if data.error}
		<p class="error">{data.error}</p>
	{:else if info}
		<div class="spec-grid">
			<nav class="spec-toc">
				<ul class="bare-list toc-list">
					<li><a href="#purpose">01 Purpose</a></li>
					<li><a href="#history">02 History</a></li>
					<li><a href="#privacy">03 Privacy</a></li>
					<li><a href="#open-source">04 Open Source</a></li>
					<li><a href="#tech-stack">05 Tech Stack</a></li>
					<li><a href="#credits">06 Credits</a></li>
				</ul>
			</nav>

			<div class="spec-content">
				{#if info.additionalInfo?.purpose}
					<section class="spec-section" id="purpose">
						<header class="section-hd">
							<span class="section-num">[01]</span>
							<h2 class="section-title">Purpose</h2>
						</header>
						<p class="section-intro">{info.additionalInfo.purpose}</p>
					</section>
				{/if}

				{#if info.additionalInfo?.websiteBirthYear}
					<section class="spec-section" id="history">
						<header class="section-hd">
							<span class="section-num">[02]</span>
							<h2 class="section-title">History</h2>
						</header>
						<p class="section-intro">This website was first launched in {info.additionalInfo.websiteBirthYear}.</p>
					</section>
				{/if}

				{#if info.privacyStatement}
					<section class="spec-section" id="privacy">
						<header class="section-hd">
							<span class="section-num">[03]</span>
							<h2 class="section-title">Privacy</h2>
						</header>
						<p class="section-intro">{info.privacyStatement}</p>
					</section>
				{/if}

				{#if info.openSourceInfo}
					<section class="spec-section" id="open-source">
						<header class="section-hd">
							<span class="section-num">[04]</span>
							<h2 class="section-title">Open Source</h2>
						</header>
						{#if info.openSourceInfo.description}
							<p class="section-intro">{info.openSourceInfo.description}</p>
						{/if}
						{#if info.openSourceInfo.repositories?.length}
							<div class="meta-list">
								{#each info.openSourceInfo.repositories as repo}
									<div class="meta-card">
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
									</div>
								{/each}
							</div>
						{/if}
					</section>
				{/if}

				{#if info.technologyStack?.length}
					<section class="spec-section" id="tech-stack">
						<header class="section-hd">
							<span class="section-num">[05]</span>
							<h2 class="section-title">Technology Stack</h2>
						</header>
						{#each groupBySection(info.technologyStack) as [section, techs]}
							<div class="sidebar-group">
								<h3 class="sub-heading">{section}</h3>
								<div class="meta-list">
									{#each techs as tech}
										<div class="meta-card">
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
					<section class="spec-section" id="credits">
						<header class="section-hd">
							<span class="section-num">[06]</span>
							<h2 class="section-title">Credits</h2>
						</header>
						{#each groupBySection(info.credits) as [section, credits]}
							<div class="sidebar-group">
								<h3 class="sub-heading">{section}</h3>
								<div class="meta-list">
									{#each credits as credit}
										<div class="meta-card">
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
										</div>
									{/each}
								</div>
							</div>
						{/each}
					</section>
				{/if}
			</div>
		</div>
	{:else}
		<p class="empty-state">No site information available.</p>
	{/if}
</main>

<style>
	.error { color: var(--color-accent-500); }
	.empty-state { opacity: 0.6; }

	/* Base Layout */
	.spec-header { margin-bottom: var(--space-xl); }
	.page-title { font-size: clamp(2rem, 5vw, 3rem); font-weight: 800; margin: var(--space-sm) 0; }
	.spec-abstract { max-width: 60ch; font-size: var(--text-md); color: var(--color-ink-700); line-height: 1.5; }

	.spec-grid {
		display: grid;
		grid-template-columns: 200px 1fr;
		gap: var(--space-2xl);
		align-items: start;
	}

	@media (max-width: 900px) {
		.spec-grid { grid-template-columns: 1fr; }
	}

	.spec-toc { position: sticky; top: 72px; }

	.bare-list { list-style: none; padding: 0; margin: 0; }
	.toc-list { display: flex; flex-direction: column; gap: var(--space-xs); }
	.toc-list a { font-family: var(--font-mono); font-size: var(--text-xs); color: var(--color-ink-600); text-decoration: none; }
	.toc-list a:hover { color: var(--color-primary-500); }

	.spec-content { display: flex; flex-direction: column; gap: var(--space-2xl); }

	/* Section Styling */
	.spec-section { scroll-margin-top: var(--space-md); }
	.section-hd { margin-bottom: var(--space-md); }
	.section-num { font-family: var(--font-mono); font-size: var(--text-xs); color: var(--color-primary-500); font-weight: 700; }
	.section-title { font-size: var(--text-md); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 800; margin: 0; }
	.section-intro { font-size: var(--text-sm); color: var(--color-ink-700); max-width: 65ch; margin-bottom: var(--space-md); }

	.sidebar-group { margin-bottom: var(--space-md); }
	.sub-heading { font-size: var(--text-sm); font-weight: 700; margin-bottom: var(--space-xs); color: var(--color-ink-600); }
	.meta-list { display: flex; flex-direction: column; gap: var(--space-xs); }
	.credit-name { font-weight: 600; }
	.meta-text { white-space: pre-wrap; line-height: 1.75; margin: 0; }

	.meta-card { padding: var(--space-sm); border: 1px solid var(--surface-color); border-radius: var(--radius-md); }
	.meta-card-row { display: flex; justify-content: space-between; align-items: baseline; gap: var(--space-sm); }
	.meta-card-link { color: inherit; text-decoration: none; display: inline-flex; align-items: baseline; gap: var(--space-xs); transition: color var(--duration-fast) var(--ease-out-quart); }
	.meta-card-link:hover { color: var(--color-primary-500); }
	.meta-card-desc { margin: var(--space-2xs) 0 0; font-size: var(--text-sm); color: var(--color-ink-600); }
	.meta-tags { display: flex; gap: var(--space-xs); margin-top: var(--space-2xs); }
	.meta-tag { font-size: var(--text-xs); padding: 2px 6px; border: 1px solid var(--surface-color); border-radius: var(--radius-sm); background: var(--surface-raised); }
	.meta-tag--accent { background: var(--color-primary-900); color: var(--color-primary-400); border-color: var(--color-primary-800); }
</style>
