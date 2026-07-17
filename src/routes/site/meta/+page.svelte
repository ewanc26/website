<script lang="ts">
	import SiteHead from '$lib/components/SiteHead.svelte';
	import { ExternalLink } from '@lucide/svelte';
	import type { NormalizedSiteInfo } from '$lib/services/atproto/siteInfo';

	let { data } = $props();

	const info = $derived(data.siteInfo as NormalizedSiteInfo | null);
	const visibleSections = $derived.by(() => {
		if (!info) return [];
		return [
			info.additionalInfo?.purpose ? 'purpose' : undefined,
			info.additionalInfo?.websiteBirthYear ? 'history' : undefined,
			info.privacyStatement || info.additionalInfo?.analytics ? 'privacy' : undefined,
			info.openSourceInfo ? 'open-source' : undefined,
			info.technologyStack.length ? 'tech-stack' : undefined,
			info.additionalInfo?.deployment || info.additionalInfo?.sectionLicense.length ? 'operations' : undefined,
			info.credits.length ? 'credits' : undefined,
		].filter((section): section is string => Boolean(section));
	});

	function sectionNumber(id: string): string {
		const index = visibleSections.indexOf(id);
		return `[${String(index + 1).padStart(2, '0')}]`;
	}

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

<SiteHead title="Site Meta" description={info?.additionalInfo?.purpose ?? 'Information about this website, its technology, privacy, and the people who made it possible.'} ogSubtitle="Tech stack, privacy, credits, and open-source info." ogType="SITE_META" />

<main class="shell-wide">
	<header class="page-hd spec-header">
		<h1 class="page-title">Site Meta</h1>
		<p class="spec-abstract">
			Information about this website, its technology, and the people who made it possible.
		</p>
	</header>

	{#if info}
		<div class="spec-content">
			{#if info.additionalInfo?.purpose}
					<section class="spec-section" id="purpose">
						<header class="section-hd">
							<span class="section-num">{sectionNumber('purpose')}</span>
							<h2 class="section-title">Purpose</h2>
						</header>
						<p class="section-intro">{info.additionalInfo.purpose}</p>
					</section>
				{/if}

				{#if info.additionalInfo?.websiteBirthYear}
					<section class="spec-section" id="history">
						<header class="section-hd">
							<span class="section-num">{sectionNumber('history')}</span>
							<h2 class="section-title">History</h2>
						</header>
						<p class="section-intro">This website was first launched in {info.additionalInfo.websiteBirthYear}.</p>
					</section>
				{/if}

				{#if info.privacyStatement || info.additionalInfo?.analytics}
					<section class="spec-section" id="privacy">
						<header class="section-hd">
							<span class="section-num">{sectionNumber('privacy')}</span>
							<h2 class="section-title">Privacy</h2>
						</header>
						{#if info.privacyStatement}<p class="section-intro">{info.privacyStatement}</p>{/if}
						{#if info.additionalInfo?.analytics}
							<div class="meta-list">
								<div class="meta-card">
									<strong>Analytics</strong>
									<p class="meta-card-desc">
										{info.additionalInfo.analytics.services.length
											? info.additionalInfo.analytics.services.join(', ')
											: 'No analytics services declared.'}
									</p>
								</div>
								{#if info.additionalInfo.analytics.cookiePolicy}
									<div class="meta-card">
										<strong>Cookies and storage</strong>
										<p class="meta-card-desc">{info.additionalInfo.analytics.cookiePolicy}</p>
									</div>
								{/if}
							</div>
						{/if}
					</section>
				{/if}

				{#if info.openSourceInfo}
					<section class="spec-section" id="open-source">
						<header class="section-hd">
							<span class="section-num">{sectionNumber('open-source')}</span>
							<h2 class="section-title">Open Source</h2>
						</header>
						{#if info.openSourceInfo.description}
							<p class="section-intro">{info.openSourceInfo.description}</p>
						{/if}
						{#if info.openSourceInfo.license}
							<p class="meta-inline">
								<span class="meta-tag">Project licence</span>
								{#if info.openSourceInfo.license.url}
									<a href={info.openSourceInfo.license.url} rel="license noopener" class="meta-card-link">
										{info.openSourceInfo.license.name ?? 'View licence'}
										<ExternalLink size={12} strokeWidth={2} />
									</a>
								{:else}
									<strong>{info.openSourceInfo.license.name}</strong>
								{/if}
							</p>
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
						{#if info.openSourceInfo.relatedServices.length}
							<div class="sidebar-group">
								<h3 class="sub-heading">Related services</h3>
								<div class="meta-list">
									{#each info.openSourceInfo.relatedServices as service}
										<div class="meta-card">
											<div class="meta-card-row">
												{#if service.url}
													<a href={service.url} rel="noopener" class="meta-card-link">
														<strong>{service.name}</strong>
														<ExternalLink size={12} strokeWidth={2} />
													</a>
												{:else}
													<strong>{service.name}</strong>
												{/if}
											</div>
											{#if service.description}<p class="meta-card-desc">{service.description}</p>{/if}
											{#if service.relationship}<span class="meta-tag meta-tag--accent">{service.relationship}</span>{/if}
										</div>
									{/each}
								</div>
							</div>
						{/if}
					</section>
				{/if}

				{#if info.technologyStack?.length}
					<section class="spec-section" id="tech-stack">
						<header class="section-hd">
							<span class="section-num">{sectionNumber('tech-stack')}</span>
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

				{#if info.additionalInfo?.deployment || info.additionalInfo?.sectionLicense.length}
					<section class="spec-section" id="operations">
						<header class="section-hd">
							<span class="section-num">{sectionNumber('operations')}</span>
							<h2 class="section-title">Operations &amp; licensing</h2>
						</header>
						<div class="meta-list">
							{#if info.additionalInfo.deployment}
								<div class="meta-card">
									<strong>Deployment</strong>
									<p class="meta-card-desc">
										{[info.additionalInfo.deployment.platform, info.additionalInfo.deployment.cdn].filter(Boolean).join(' · ')}
									</p>
									{#if info.additionalInfo.deployment.customDomain}<span class="meta-tag">Custom domain</span>{/if}
								</div>
							{/if}
							{#each info.additionalInfo.sectionLicense as license}
								<div class="meta-card">
									<div class="meta-card-row">
										{#if license.url}
											<a href={license.url} rel="license noopener" class="meta-card-link">
												<strong>{license.name ?? 'Content licence'}</strong>
												<ExternalLink size={12} strokeWidth={2} />
											</a>
										{:else}<strong>{license.name}</strong>{/if}
									</div>
									{#if license.section}<span class="meta-tag meta-tag--accent">{license.section}</span>{/if}
								</div>
							{/each}
						</div>
					</section>
				{/if}

				{#if info.credits?.length}
					<section class="spec-section" id="credits">
						<header class="section-hd">
							<span class="section-num">{sectionNumber('credits')}</span>
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
										{#if credit.description}<p class="meta-card-desc">{credit.description}</p>{/if}
										<div class="meta-tags">
											<span class="meta-tag">{credit.type}</span>
											{#if credit.license?.url}
												<a href={credit.license.url} rel="license noopener" class="meta-tag meta-tag--accent">
													{credit.license.name ?? 'Licence'}
												</a>
											{:else if credit.license?.name}
												<span class="meta-tag meta-tag--accent">{credit.license.name}</span>
											{/if}
										</div>
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
