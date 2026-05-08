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
	import { subscribeAutoConnect } from '$lib/stores/firehose';
	import type { JetstreamCommit } from '$lib/stores/firehose';
	import {
		fetchMusicStatus,
		fetchKibunStatus,
		fetchLatestBlueskyPost,
		fetchRecentDocuments,
		fetchAllSupporters,
		fetchRecentPopfeedReviews,
		fetchProfile
	} from '$lib/services/atproto';
	import { onMount } from 'svelte';

	let { data }: { data: PageData } = $props();

	// Reactive copies of SSR data — updated by firehose events
	let kibunStatus = $state<PageData['kibunStatus']>();
	let musicStatus = $state<PageData['musicStatus']>();
	let latestPost = $state<PageData['latestPost']>();
	let documents = $state<PageData['documents']>();
	let supporters = $state<PageData['supporters']>();
	let popfeedReviews = $state<PageData['popfeedReviews']>();
	let profile = $state<PageData['profile']>();

	// Seed from SSR data inside a closure — avoids state_referenced_locally
	// (we intentionally capture once; firehose manages subsequent updates)
	$effect(() => {
		kibunStatus ??= data.kibunStatus;
		musicStatus ??= data.musicStatus;
		latestPost ??= data.latestPost;
		documents ??= data.documents;
		supporters ??= data.supporters;
		popfeedReviews ??= data.popfeedReviews;
		profile ??= data.profile;
	});

	onMount(() => {
		// Kibun — simple record, use payload directly
		const unsubKibun = subscribeAutoConnect('kibun', (event: JetstreamCommit) => {
			if (event.commit.operation === 'delete') {
				kibunStatus = null;
			} else if (event.commit.record) {
				kibunStatus = event.commit.record as any;
			}
		});

		// Music — needs artwork resolution, re-fetch
		const unsubMusic = subscribeAutoConnect('music', async () => {
			try {
				musicStatus = await fetchMusicStatus();
			} catch {
				// Silently fail — keep existing data
			}
		});

		// Bluesky post — needs embed resolution, re-fetch
		const unsubPost = subscribeAutoConnect('bluesky-post', async () => {
			try {
				latestPost = await fetchLatestBlueskyPost();
			} catch {
				// Keep existing
			}
		});

		// Documents — re-fetch
		const unsubDocs = subscribeAutoConnect('documents', async () => {
			try {
				documents = (await fetchRecentDocuments(5)) ?? [];
			} catch {
				// Keep existing
			}
		});

		// Supporters — re-fetch
		const unsubSupporters = subscribeAutoConnect('supporters', async () => {
			try {
				supporters = await fetchAllSupporters();
			} catch {
				// Keep existing
			}
		});

		// Popfeed — re-fetch
		const unsubPopfeed = subscribeAutoConnect('popfeed', async () => {
			try {
				popfeedReviews = (await fetchRecentPopfeedReviews()) ?? [];
			} catch {
				// Keep existing
			}
		});

		// Profile — re-fetch
		const unsubProfile = subscribeAutoConnect('profile', async () => {
			try {
				profile = await fetchProfile();
			} catch {
				// Keep existing
			}
		});

		return () => {
			unsubKibun();
			unsubMusic();
			unsubPost();
			unsubDocs();
			unsubSupporters();
			unsubPopfeed();
			unsubProfile();
		};
	});
</script>

<MetaTags meta={data.meta} siteMeta={data.meta} />

<div class="mx-auto max-w-6xl">
	<!-- Masonry-style grid using Tailwind's column utilities -->
	<div class="columns-1 gap-6 lg:columns-2">
		<div class="mb-6 break-inside-avoid">
			<ProfileCard {profile} />
		</div>
		<div class="mb-6 break-inside-avoid">
			<KibunStatusCard {kibunStatus} />
		</div>
		<div class="mb-6 break-inside-avoid">
			<MusicStatusCard {musicStatus} />
		</div>
		<div class="mb-6 break-inside-avoid">
			<BlueskyPostCard post={latestPost} />
		</div>
		<div class="mb-6 break-inside-avoid">
			<DynamicLinks />
		</div>
		<div class="mb-6 break-inside-avoid">
			<PostCard {documents} />
		</div>
		{#if supporters.length > 0}
			<div class="mb-6 break-inside-avoid">
				<SupportersCard {supporters} />
			</div>
		{/if}
		{#if popfeedReviews.length > 0}
			<div class="mb-6 break-inside-avoid">
				<PopfeedCard reviews={popfeedReviews} handle={profile?.handle} />
			</div>
		{/if}
	</div>
</div>
