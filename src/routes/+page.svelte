<script lang="ts">
	import { DynamicLinks } from '$lib/components/layout';
	import { MetaTags } from '$lib/components/seo';
	import {
		ProfileCard,
		PostCard,
		BlueskyPostCard,
		MusicStatusCard,
		KibunStatusCard,
		SupportersCard,
		PopfeedCard
	} from '$lib/components/layout/main/card';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<MetaTags meta={data.meta} siteMeta={data.meta} />

<div class="mx-auto max-w-6xl">
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
		{#if data.supporters.length > 0}
			<div class="mb-6 break-inside-avoid">
				<SupportersCard supporters={data.supporters} />
			</div>
		{/if}
		{#if data.popfeedReviews.length > 0}
			<div class="mb-6 break-inside-avoid">
				<PopfeedCard reviews={data.popfeedReviews} handle={data.profile?.handle} />
			</div>
		{/if}
	</div>
</div>
