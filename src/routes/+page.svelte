<script lang="ts">
	import { DynamicLinks } from '$lib/components/layout';
	import {
		ProfileCard,
		PostCard,
		BlueskyPostCard,
		MusicStatusCard,
		KibunStatusCard,
		TangledRepoCard
	} from '$lib/components/layout/main/card';
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
		<h1
			class="overflow-wrap-anywhere mb-4 text-4xl font-bold wrap-break-word text-ink-900 md:text-5xl dark:text-ink-50"
		>
			Welcome to {meta.title}
		</h1>
		<p
			class="overflow-wrap-anywhere mx-auto max-w-2xl text-lg wrap-break-word text-ink-700 dark:text-ink-200"
		>
			{meta.description}
		</p>
	</div>

	<!-- Masonry-style grid using Tailwind's column utilities -->
	<div class="columns-1 gap-6 lg:columns-2">
		<div class="mb-6 break-inside-avoid">
			<ProfileCard />
		</div>
		<div class="mb-6 break-inside-avoid">
			<KibunStatusCard />
		</div>
		<div class="mb-6 break-inside-avoid">
			<MusicStatusCard />
		</div>
		<div class="mb-6 break-inside-avoid">
			<BlueskyPostCard />
		</div>
		<div class="mb-6 break-inside-avoid">
			<DynamicLinks />
		</div>
		<div class="mb-6 break-inside-avoid">
			<PostCard />
		</div>
		<div class="mb-6 break-inside-avoid">
			<TangledRepoCard />
		</div>
	</div>
</div>
