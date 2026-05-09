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

	// SSR data — immutable baseline from the load function
	let { data } = $props();

	// Mutable copies for firehose live updates — initialised from SSR data
	// (state_referenced_locally warnings are intentional: we need mutable copies
	// that firehose can update independently of the prop)
	let kibunStatus = $state<PageData['kibunStatus']>(data.kibunStatus);
	let musicStatus = $state<PageData['musicStatus']>(data.musicStatus);
	let latestPost = $state<PageData['latestPost']>(data.latestPost);
	let documents = $state<PageData['documents']>(data.documents);
	let supporters = $state<PageData['supporters']>(data.supporters);
	let popfeedReviews = $state<PageData['popfeedReviews']>(data.popfeedReviews);
	let profile = $state<PageData['profile']>(data.profile);

	// Live-update pulse indicators — briefly true when firehose updates a card
	let kibunPulse = $state(false);
	let musicPulse = $state(false);
	let postPulse = $state(false);
	let docsPulse = $state(false);
	let supportersPulse = $state(false);
	let popfeedPulse = $state(false);
	let profilePulse = $state(false);

	function triggerPulse(setter: (v: boolean) => void, duration = 600): void {
		setter(true);
		setTimeout(() => setter(false), duration);
	}

	onMount(() => {
		// Kibun — simple record, use payload directly
		const unsubKibun = subscribeAutoConnect('kibun', (event: JetstreamCommit) => {
			if (event.commit.operation === 'delete') {
				kibunStatus = null;
			} else if (event.commit.record) {
				kibunStatus = event.commit.record as any;
			}
			triggerPulse((v) => (kibunPulse = v));
		});

		// Music — needs artwork resolution, re-fetch
		const unsubMusic = subscribeAutoConnect('music', async () => {
			try {
				musicStatus = await fetchMusicStatus();
				triggerPulse((v) => (musicPulse = v));
			} catch {
				// Silently fail — keep existing data
			}
		});

		// Bluesky post — needs embed resolution, re-fetch
		const unsubPost = subscribeAutoConnect('bluesky-post', async () => {
			try {
				latestPost = await fetchLatestBlueskyPost();
				triggerPulse((v) => (postPulse = v));
			} catch {
				// Keep existing
			}
		});

		// Documents — re-fetch (filtered to blog posts only)
		const unsubDocs = subscribeAutoConnect('documents', async () => {
			try {
				const allDocs = (await fetchRecentDocuments(20)) ?? [];
				documents = allDocs
					.filter((doc: any) => doc.publicationRkey === '3mlen2qhzrt2s')
					.slice(0, 5);
				triggerPulse((v) => (docsPulse = v));
			} catch {
				// Keep existing
			}
		});

		// Supporters — re-fetch
		const unsubSupporters = subscribeAutoConnect('supporters', async () => {
			try {
				supporters = await fetchAllSupporters();
				triggerPulse((v) => (supportersPulse = v));
			} catch {
				// Keep existing
			}
		});

		// Popfeed — re-fetch
		const unsubPopfeed = subscribeAutoConnect('popfeed', async () => {
			try {
				popfeedReviews = (await fetchRecentPopfeedReviews()) ?? [];
				triggerPulse((v) => (popfeedPulse = v));
			} catch {
				// Keep existing
			}
		});

		// Profile — re-fetch
		const unsubProfile = subscribeAutoConnect('profile', async () => {
			try {
				profile = await fetchProfile();
				triggerPulse((v) => (profilePulse = v));
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
		<div
			class="animate-entrance mb-6 break-inside-avoid"
			class:animate-live-pulse={profilePulse}
			style="animation-delay: 0ms"
		>
			<ProfileCard {profile} />
		</div>
		<div
			class="animate-entrance mb-6 break-inside-avoid"
			class:animate-live-pulse={kibunPulse}
			style="animation-delay: 80ms"
		>
			<KibunStatusCard {kibunStatus} />
		</div>
		<div
			class="animate-entrance mb-6 break-inside-avoid"
			class:animate-live-pulse={musicPulse}
			style="animation-delay: 160ms"
		>
			<MusicStatusCard {musicStatus} />
		</div>
		<div
			class="animate-entrance mb-6 break-inside-avoid"
			class:animate-live-pulse={postPulse}
			style="animation-delay: 240ms"
		>
			<BlueskyPostCard post={latestPost} />
		</div>
		<div class="animate-entrance mb-6 break-inside-avoid" style="animation-delay: 320ms">
			<DynamicLinks />
		</div>
		<div
			class="animate-entrance mb-6 break-inside-avoid"
			class:animate-live-pulse={docsPulse}
			style="animation-delay: 400ms"
		>
			<PostCard {documents} />
		</div>
		{#if supporters.length > 0}
			<div
				class="animate-entrance mb-6 break-inside-avoid"
				class:animate-live-pulse={supportersPulse}
				style="animation-delay: 480ms"
			>
				<SupportersCard {supporters} />
			</div>
		{/if}
		{#if popfeedReviews.length > 0}
			<div
				class="animate-entrance mb-6 break-inside-avoid"
				class:animate-live-pulse={popfeedPulse}
				style="animation-delay: 560ms"
			>
				<PopfeedCard reviews={popfeedReviews} handle={profile?.handle} />
			</div>
		{/if}
	</div>
</div>
