<script lang="ts">
	import { page } from '$app/stores';
	import { Card } from '$lib/components/ui';

	// Get error details from page store
	const status = $derived($page.status);
	const errorMessage = $derived($page.error?.message || 'An unexpected error occurred');

	// Error titles and descriptions based on status code
	const errorDetails = $derived.by(() => {
		switch (status) {
			case 404:
				return {
					title: 'Page Not Found',
					description: `The page <code class="rounded bg-canvas-200 px-2 py-1 font-mono text-sm dark:bg-canvas-800">${$page.url.pathname}</code> could not be found.`
				};
			case 403:
				return {
					title: 'Access Forbidden',
					description: 'You do not have permission to access this resource.'
				};
			case 500:
				return {
					title: 'Internal Server Error',
					description: 'Something went wrong on our end. Please try again later.'
				};
			case 503:
				return {
					title: 'Service Unavailable',
					description: 'The service is temporarily unavailable. Please try again in a moment.'
				};
			default:
				return {
					title: 'An Error Occurred',
					description: errorMessage
				};
		}
	});
</script>

<svelte:head>
	<title>{status} - {errorDetails.title}</title>
</svelte:head>

<div class="mx-auto max-w-2xl">
	<Card variant="elevated" padding="lg">
		{#snippet children()}
			<div class="text-center">
				<!-- Large status code number -->
				<div class="mb-6">
					<h1 class="text-8xl font-bold text-primary-500 dark:text-primary-400 md:text-9xl">
						{status}
					</h1>
				</div>

				<!-- Error title -->
				<h2 class="mb-4 text-2xl font-bold text-ink-900 md:text-3xl dark:text-ink-50">
					{errorDetails.title}
				</h2>

				<!-- Error description -->
				<p class="mb-6 text-ink-700 dark:text-ink-200">
					{@html errorDetails.description}
				</p>

				<!-- Show additional error message if it's different from the description -->
				{#if errorMessage && errorMessage !== errorDetails.description && status !== 404}
					<p class="mb-6 rounded-lg bg-canvas-200 p-4 text-sm text-ink-600 dark:bg-canvas-800 dark:text-ink-300">
						{errorMessage}
					</p>
				{/if}

				<!-- Action buttons -->
				<div class="flex flex-col items-center justify-center gap-3 sm:flex-row">
					<a
						href="/"
						class="inline-flex w-full items-center justify-center rounded-lg bg-primary-500 px-6 py-3 font-medium text-white transition-colors hover:bg-primary-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700"
					>
						Return to Home
					</a>
					
					{#if status !== 404}
						<button
							onclick={() => window.location.reload()}
							class="inline-flex w-full items-center justify-center rounded-lg bg-canvas-300 px-6 py-3 font-medium text-ink-900 transition-colors hover:bg-canvas-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-canvas-600 sm:w-auto dark:bg-canvas-700 dark:text-ink-50 dark:hover:bg-canvas-600"
						>
							Try Again
						</button>
					{/if}
				</div>
			</div>
		{/snippet}
	</Card>
</div>
