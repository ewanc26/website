<script lang="ts">
	// Thin wrapper — NoiseImage now lives in @ewanc26/ui.
	// This file exists only so any direct path imports to '$lib/components/ui/NoiseImage.svelte'
	// continue to work. Prefer importing from '$lib/components/ui' via the barrel.
	import { NoiseImage as PackageNoiseImage } from '@ewanc26/ui';

	interface Props {
		src?: string | null | undefined;
		seed: string;
		alt?: string;
		class?: string;
		loading?: 'lazy' | 'eager';
		role?: string;
	}

	let props: Props = $props();
</script>

<PackageNoiseImage {...props} />
