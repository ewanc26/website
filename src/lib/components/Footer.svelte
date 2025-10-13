<script lang="ts">
    import { siteMeta } from '$lib/helper/siteMeta';
</script>

<footer class="mt-auto border-t border-background-200 dark:border-background-800 py-6">
	<div class="container mx-auto px-4 text-center text-text-600 dark:text-text-400 text-sm">
		<p>&copy; {new Date().getFullYear()} {siteMeta.title}. All rights reserved.</p>
	</div>
</footer>