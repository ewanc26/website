<script lang="ts">
	import { ExternalLink } from '@lucide/svelte';

	interface Badge {
		text: string;
		color?: 'mint' | 'sage';
	}

	interface Props {
		url: string;
		title: string;
		emoji?: string;
		description?: string;
		badges?: Badge[];
		meta?: string; // e.g., timestamp or extra info
		variant?: 'default' | 'button';
	}

	let { url, title, emoji, description, badges, meta, variant = 'default' }: Props = $props();

	function getDomain(url: string): string {
		try {
			const urlObj = new URL(url);
			return urlObj.hostname.replace('www.', '');
		} catch {
			return '';
		}
	}

	const displayDescription = description || getDomain(url);
</script>

<a
	href={url}
	target="_blank"
	rel="noopener noreferrer"
	class="
    {variant === 'button'
		? 'inline-flex items-center justify-center gap-2 rounded-lg bg-canvas-200 px-4 py-3 font-medium text-ink-900 transition-colors duration-200 hover:bg-canvas-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 dark:bg-canvas-800 dark:text-ink-50 dark:hover:bg-canvas-700'
		: 'flex items-start justify-between gap-3 rounded-lg bg-canvas-200 p-4 transition-colors hover:bg-canvas-300 dark:bg-canvas-800 dark:hover:bg-canvas-700'}
  "
>
	{#if variant === 'button'}
		<span class="font-medium">{title}</span>
		<ExternalLink class="h-4 w-4 shrink-0" aria-hidden="true" />
	{:else}
		<div class="flex-1 space-y-1">
			{#if emoji || (badges && badges.length > 0)}
				<div class="flex flex-wrap items-center gap-2">
					{#if emoji}
						<span class="text-lg leading-none">{emoji}</span>
					{/if}
					{#if badges && badges.length > 0}
						{#each badges as badge}
							{#if badge.color === 'mint'}
								<span
									class="rounded bg-secondary-100 px-2 py-0.5 text-xs font-medium text-secondary-800 dark:bg-secondary-900 dark:text-secondary-200"
								>
									{badge.text}
								</span>
							{:else if badge.color === 'sage'}
								<span
									class="rounded bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-800 dark:bg-primary-900 dark:text-primary-200"
								>
									{badge.text}
								</span>
							{:else}
								<span class="text-xs font-semibold text-ink-800 uppercase dark:text-ink-100">
									{badge.text}
								</span>
							{/if}
						{/each}
					{/if}
				</div>
			{/if}

			<!-- 👇 Title is always below the badges -->
			<h3 class="overflow-wrap-anywhere font-semibold wrap-break-word text-ink-900 dark:text-ink-50">
				{title}
			</h3>

			{#if displayDescription}
				<p
					class="overflow-wrap-anywhere line-clamp-2 text-sm wrap-break-word text-ink-700 dark:text-ink-200"
				>
					{displayDescription}
				</p>
			{/if}

			{#if meta}
				<p class="text-xs font-medium text-ink-800 dark:text-ink-100">
					{meta}
				</p>
			{/if}
		</div>

		<ExternalLink
			class="h-4 w-4 shrink-0 text-ink-700 transition-colors group-hover:text-primary-600 dark:text-ink-200 dark:group-hover:text-primary-400"
			aria-hidden="true"
		/>
	{/if}
</a>
