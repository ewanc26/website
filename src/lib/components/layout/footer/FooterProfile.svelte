<script lang="ts">
	import { witchskyProfileUrl } from '$lib/config/urls';
	import { happyMacStore } from '$lib/stores';
	import type { ProfileData } from '$lib/services/atproto';

	let {
		profile,
		copyrightText,
		loading = false
	} = $props<{
		profile: ProfileData | null;
		copyrightText: string;
		loading?: boolean;
	}>();

	let showHint = $derived($happyMacStore.clickCount >= 3 && $happyMacStore.clickCount < 24);
</script>

<div class="flex flex-wrap items-baseline gap-x-3 text-sm tracking-tight">
	<span class="whitespace-nowrap">&copy; {copyrightText}</span>

	{#if loading}
		<span class="animate-pulse opacity-50">...</span>
	{:else if profile}
		<a
			href={witchskyProfileUrl(profile.did)}
			target="_blank"
			rel="noopener noreferrer"
			class="transition-colors hover:text-primary-400"
		>
			@{profile.handle}
		</a>
	{/if}

	<span class="opacity-20 select-none">|</span>

	<div class="flex items-baseline gap-3 opacity-60">
		<a href="https://github.com/ewanc26/website" target="_blank" class="hover:underline">code</a>
		<button type="button" onclick={() => happyMacStore.incrementClick()} class="font-mono text-xs">
			v{__APP_VERSION__}{#if showHint}({$happyMacStore.clickCount}/24){/if}
		</button>
	</div>
</div>
