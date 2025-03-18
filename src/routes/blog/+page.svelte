<script lang="ts">
	import { formatDate } from '$lib/components/dateFormatter';
	import { onMount } from 'svelte';
	import Profile from '$lib/components/ATProfile.svelte';

	const { data } = $props();

	// Get posts from data and sort them by createdAt in descending order (newest first)
	const posts = $derived(
		Array.from(data.posts.values()).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
	);

	// State to track if locale has been properly loaded
	let localeLoaded = $state(false);

	onMount(() => {
		// Set a brief timeout to ensure the browser has time to determine locale
		setTimeout(() => {
			localeLoaded = true;
		}, 10);
	});
</script>

<svelte:head>
	<title>Blog | Ewan's Web Corner</title>
	<meta name="description" content="Ewan's Self-Hosted WhiteWind Blog" />
	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:url" content="/blog" />
	<meta property="og:title" content="Blog | Ewan's Web Corner" />
	<meta property="og:description" content="Ewan's Self-Hosted WhiteWind Blog" />

	<!-- Twitter -->
	<meta property="twitter:card" content="summary_large_image" />
	<meta property="twitter:url" content="/blog" />
	<meta property="twitter:title" content="Blog | Ewan's Web Corner" />
	<meta property="twitter:description" content="Ewan's Self-Hosted WhiteWind Blog" />
</svelte:head>

<div class="container">
    <h1>My Blog</h1>
	<div class="mx-2 my-6 grid grid-cols-[repeat(auto-fill,minmax(260px,1fr)_)] gap-x-4 gap-y-6">
		{#each posts as post}
			<div class="post-card">
				<a href="/blog/{post.rkey}" class="h-full w-full flex flex-col">
					<div class="flex flex-col h-full justify-between">
						<div class="title-container">
							<p
								class="title-truncate pb-2 leading-[1.5] font-medium"
								title={post.title}
							>
								{post.title}
							</p>
						</div>
						<div class="date-container">
							<p class="text-sm">Last Updated:</p>
							<p>
								{#if localeLoaded}
									{formatDate(post.createdAt)}
								{:else}
									<span class="opacity-50">Loading...</span>
								{/if}
							</p>
						</div>
					</div>
				</a>
			</div>
		{/each}
	</div>
</div>

<style>
	.container {
		max-width: 800px;
		margin: 0 auto;
		padding: 2rem;
	}

	/* Local styles to override the blog.css for post cards */
	.post-card {
		background-color: var(--color-header-footer);
		transition: all 0.3s ease;
		height: 150px;
		display: flex;
		flex-direction: column;
	}

	.post-card:hover {
		background-color: var(--color-button-hover);
		transform: scale(1.005);
	}

	.post-card .title-truncate {
		overflow: hidden;
		text-overflow: ellipsis;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		max-height: 3em;
	}

	.post-card p {
		color: var(--color-text);
		margin: 0;
	}

	.post-card a {
		padding: 0.5rem;
		height: 100%;
		text-decoration: none;
	}

	.title-container {
		margin-bottom: 0.5rem;
		flex-grow: 1;
	}

	.date-container {
		margin-top: auto;
	}
</style>