<script lang="ts">
	import { PUBLIC_IS_DEV } from '$env/static/public';
</script>

{#if PUBLIC_IS_DEV === 'true'}
	<div
		class="pointer-events-none fixed top-4 right-4 z-50 rounded-full bg-amber-500 px-3 py-1 text-xs font-black text-black shadow-lg"
	>
		DEV BUILD
	</div>
{/if}
