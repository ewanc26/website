<script lang="ts">
	import { DynamicLinks, TangledRepos } from '$lib/components/layout';
	import { ProfileCard, StatusCard, PostCard } from '$lib/components/layout/main/card';
	import BlueskyPostCard from '$lib/components/layout/main/card/BlueskyPostCard.svelte';
	import { createSiteMeta, type SiteMetadata } from '$lib/helper/siteMeta';

	// The `data` object includes merged layout/page load data.
	// Give it a proper type so TS knows data.meta may exist.
	export let data: { siteMeta?: Partial<SiteMetadata>; meta?: Partial<SiteMetadata> };

	// Merge site defaults (if provided by layout) with page overrides.
	// This produces a complete SiteMetadata object we can safely read from.
	const meta: SiteMetadata = createSiteMeta({
		...(data.siteMeta ?? {}),
		...(data.meta ?? {})
	});
</script>

<div class="mx-auto max-w-6xl">
	<div class="mb-8 text-center">
		<h1 class="mb-4 text-4xl font-bold text-ink-900 md:text-5xl dark:text-ink-50">
			Welcome to {meta.title}
		</h1>
		<p class="mx-auto max-w-2xl text-lg text-ink-700 dark:text-ink-200">
			{meta.description}
		</p>
	</div>

	<div class="grid gap-6 lg:grid-cols-2">
		<div class="space-y-6">
			<ProfileCard />
			<StatusCard />
			<BlueskyPostCard />
		</div>
		<div class="space-y-6">
			<DynamicLinks />
			<PostCard />
			<TangledRepos />
		</div>
	</div>
</div>
