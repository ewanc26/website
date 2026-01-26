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
	import { createSiteMeta } from '$lib/helper/siteMeta';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// Use $derived for reactive metadata
	const meta = $derived(
		createSiteMeta({
			...data.siteMeta
		})
	);
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
			<ProfileCard profile={data.profile} />
		</div>
		<div class="mb-6 break-inside-avoid">
			<KibunStatusCard kibunStatus={data.kibunStatus} />
		</div>
		<div class="mb-6 break-inside-avoid">
			<MusicStatusCard musicStatus={data.musicStatus} />
		</div>
		<div class="mb-6 break-inside-avoid">
			<BlueskyPostCard post={data.latestPost} />
		</div>
		<div class="mb-6 break-inside-avoid">
			<DynamicLinks />
		</div>
		<div class="mb-6 break-inside-avoid">
			<PostCard documents={data.documents} />
		</div>
		<div class="mb-6 break-inside-avoid">
			<TangledRepoCard repos={data.tangledRepos} profile={data.profile} />
		</div>
	</div>
</div>
