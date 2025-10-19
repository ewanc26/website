<script lang="ts">
	import { ExternalLink, GitBranch, Server, User } from '@lucide/svelte';
	import type { TangledRepo } from '$lib/services/atproto';
	import { PUBLIC_ATPROTO_DID } from '$env/static/public';

	interface Props {
		repo: TangledRepo;
		handle: string | null;
	}

	let { repo, handle }: Props = $props();

	// Build the tangled.org URL: tangled.org/[handle or did]/[repo]
	// Prefer handle if available, otherwise use DID
	const identifier = $derived(handle || PUBLIC_ATPROTO_DID);
	const repoUrl = $derived(`https://tangled.org/${identifier}/${repo.name}`);

	// Extract knot server name from DID or URL
	function getKnotServerName(knot: string): string {
		if (knot.startsWith('http')) {
			try {
				return new URL(knot).hostname;
			} catch {
				return knot;
			}
		}
		// If it's a DID, just return it as-is
		return knot;
	}
</script>

<a
	href={repoUrl}
	target="_blank"
	rel="noopener noreferrer"
	class="flex items-center justify-between gap-3 rounded-lg bg-canvas-200 p-4 transition-colors hover:bg-canvas-300 dark:bg-canvas-800 dark:hover:bg-canvas-700"
>
	<div class="flex items-center gap-3 min-w-0 flex-1">
		<GitBranch
			class="h-5 w-5 flex-shrink-0 text-sage-600 dark:text-sage-400"
			aria-hidden="true"
		/>
		<div class="flex flex-col gap-1 min-w-0">
			<h3 class="font-semibold text-ink-900 truncate dark:text-ink-50">
				{repo.name}
			</h3>
			<div class="flex items-center gap-3 text-xs text-ink-700 dark:text-ink-200">
				<div class="flex items-center gap-1">
					<Server class="h-3 w-3" aria-hidden="true" />
					<span class="truncate">{getKnotServerName(repo.knot)}</span>
				</div>
				<div class="flex items-center gap-1">
					<User class="h-3 w-3" aria-hidden="true" />
					<span class="truncate">{handle || PUBLIC_ATPROTO_DID}</span>
				</div>
			</div>
		</div>
	</div>
	<ExternalLink
		class="h-4 w-4 flex-shrink-0 text-ink-700 transition-colors dark:text-ink-200"
		aria-hidden="true"
	/>
</a>
