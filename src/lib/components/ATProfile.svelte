<script lang="ts">
	/* cSpell:ignore bsky rkey */
	import { onMount } from 'svelte';

	// Props
	export let pds: string = 'bsky.social';
	export let did: string = '';
	export let handle: string = '';
	export let blobURL: string | undefined = undefined;

	// State
	interface Profile {
		username: string;
		description: string;
		pfp: string;
	}

	let profile: Profile = {
		username: '',
		description: '',
		pfp: ''
	};
	let loading: boolean = true;
	let error: string | null = null;
	let modalVisible: boolean = false;
	let modalImage: string = '';
	let modalAlt: string = '';

	// Parse AT Protocol URI
	function parseURI(uri: string) {
		const components = uri.split('/');
		return {
			DID: components[2],
			collection: components[3],
			rkey: components[4]
		};
	}

	// Fetch a record by its URI
	async function fetchRecordByURI(uri: string) {
		const info = parseURI(uri);
		const url = `https://${pds}/xrpc/com.atproto.repo.getRecord?repo=${info.DID}&collection=${info.collection}&rkey=${info.rkey}`;

		try {
			const response = await fetch(url, { method: 'GET' });
			if (!response.ok) {
				throw new Error(`Failed to fetch: ${response.status}`);
			}
			return await response.json();
		} catch (err: unknown) {
			console.error('Error fetching record:', err);
			if (err instanceof Error) {
				error = err.message;
			} else {
				error = String(err);
			}
			return undefined;
		}
	}

	// Create image URL from blob or direct link
	function getImageUrl(blob: any): string {
		if (!blob) return '';

		if (blob.ref) {
			if (blobURL) {
				return `${blobURL}/${did}/${blob.ref.$link}`;
			} else {
				return `https://${pds}/xrpc/com.atproto.sync.getBlob?did=${did}&cid=${blob.ref.$link}`;
			}
		} else {
			return blob;
		}
	}

	// Open modal with image
	function openImageModal(src: string, alt: string) {
		modalImage = src;
		modalAlt = alt;
		modalVisible = true;
	}

	// Close modal
	function closeModal() {
		modalVisible = false;
	}

	// Fetch profile data
	async function fetchProfile() {
		loading = true;
		error = null;

		try {
			const response = await fetchRecordByURI(`at://${did}/app.bsky.actor.profile/self`);

			if (response) {
				profile = {
					username: response.value.displayName || handle,
					description: response.value.description || '',
					pfp: response.value.avatar || ''
				};
			} else {
				throw new Error(`Could not load profile for DID ${did}`);
			}
		} catch (err: unknown) {
			console.error('Error loading profile:', err);
			if (err instanceof Error) {
				error = err.message;
			} else {
				error = String(err);
			}
			profile = {
				username: handle || did,
				description: `Could not load profile description.`,
				pfp: ''
			};
		} finally {
			loading = false;
		}
	}

	// Initialize on component mount
	onMount(async () => {
		if (did) {
			await fetchProfile();
		} else {
			error = 'No DID provided';
			loading = false;
		}
	});
</script>

{#if loading}
	<div class="loading">Loading profile...</div>
{:else if error}
	<div class="error">{error}</div>
{:else}
	<div class="profile">
		{#if profile.pfp}
			<button
				class="profile-picture"
				type="button"
				on:click={() =>
					openImageModal(getImageUrl(profile.pfp), `${profile.username}'s profile picture`)}
			>
				<img src={getImageUrl(profile.pfp)} alt={`${profile.username}'s profile picture`} />
			</button>
		{/if}

		<div class="profile-info">
			<h1 class="profile-username">{profile.username}</h1>
			{#if handle}
				<div class="profile-handle">@{handle}</div>
			{/if}
			{#if profile.description}
				<div class="profile-description">{profile.description}</div>
			{/if}
		</div>

		<style>
			.profile {
				display: flex;
				flex-direction: column;
				align-items: center;
				gap: 1.5rem;
				text-align: center;
				color: var(--color-text)
			}

			@media (min-width: 640px) {
				.profile {
					flex-direction: row;
					align-items: flex-start;
					text-align: left;
				}
			}

			.profile-picture {
				cursor: pointer;
				border-radius: 50%;
				overflow: hidden;
				width: 130px;
				height: 130px;
				flex-shrink: 0;
				transition: transform 0.2s ease-in-out;
			}

			.profile-picture:hover {
				transform: scale(1.05);
			}

			.profile-picture img {
				width: 100%;
				height: 100%;
				object-fit: cover;
			}

			.profile-info {
				flex: 1;
				padding: 0 1rem;
			}

			.profile-username {
				font-size: 1.8rem;
				font-weight: bold;
				margin-bottom: 0.3rem;
			}

			.profile-handle {
				font-size: 1.2rem;
			}

			.profile-description {
				font-size: 1rem;
				line-height: 1.6;
				margin-top: 0.5rem;
				white-space: pre-wrap;
			}
		</style>
	</div>
{/if}

{#if modalVisible}
	<div
		class="modal-background"
		role="button"
		tabindex="0"
		on:click={closeModal}
		on:keydown={(e) => {
			if (e.key === 'Enter' || e.key === ' ') closeModal();
		}}
	></div>
	<div class="modal">
		<img src={modalImage} alt={modalAlt} />
		{#if modalAlt}
			<div class="modal-alt">{modalAlt}</div>
		{/if}
	</div>
{/if}
