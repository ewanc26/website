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
	{:else}
		<p class="empty-state">No site information available.</p>
	{/if}
</main>
