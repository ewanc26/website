<script lang="ts">
	import { page } from '$app/stores';
	import { MetaTags } from '$lib/components/seo';
	import { Card } from '$lib/components/ui';
	import { Home, RefreshCw, FileQuestion, Shield, ServerCrash, AlertTriangle } from '@lucide/svelte';

	// Get error details from page store
	const status = $derived($page.status);
	const errorMessage = $derived($page.error?.message || 'An unexpected error occurred');
	const pathname = $derived($page.url.pathname);

	// Error configurations with icon, title, description, and suggestions
	const errorConfig = $derived.by(() => {
		switch (status) {
			case 404:
				return {
					icon: FileQuestion,
					title: 'Page Not Found',
					description: `The page at <code class="rounded bg-canvas-200 px-2 py-1 font-mono text-sm dark:bg-canvas-800">${pathname}</code> doesn't exist or may have been moved.`,
					suggestions: [
						'Check the URL for typos',
						'The page may have been renamed or deleted',
						'Try navigating from the homepage'
					],
					primaryAction: { label: 'Go to Homepage', href: '/', icon: Home },
					secondaryAction: null
				};
			case 403:
				return {
					icon: Shield,
					title: 'Access Denied',
					description: 'You don\'t have permission to access this resource. This could be due to authentication requirements or restricted access.',
					suggestions: [
						'Make sure you\'re logged in if required',
						'The content may be private or restricted',
						'Contact the site owner if you believe this is an error'
					],
					primaryAction: { label: 'Go to Homepage', href: '/', icon: Home },
					secondaryAction: null
				};
			case 500:
				return {
					icon: ServerCrash,
					title: 'Something Went Wrong',
					description: 'An internal error occurred while processing your request. This is usually temporary.',
					suggestions: [
						'Try refreshing the page',
						'Clear your browser cache',
						'The issue has been logged and will be investigated'
					],
					primaryAction: { label: 'Try Again', href: null, icon: RefreshCw, action: () => window.location.reload() },
					secondaryAction: { label: 'Go to Homepage', href: '/', icon: Home }
				};
			case 503:
				return {
					icon: AlertTriangle,
					title: 'Service Temporarily Unavailable',
					description: 'The server is currently unavailable, usually due to maintenance or high load. Please try again shortly.',
					suggestions: [
						'Wait a few moments and try again',
						'The site may be undergoing maintenance',
						'Check back in a minute or two'
					],
					primaryAction: { label: 'Try Again', href: null, icon: RefreshCw, action: () => window.location.reload() },
					secondaryAction: { label: 'Go to Homepage', href: '/', icon: Home }
				};
			default:
				return {
					icon: AlertTriangle,
					title: 'An Error Occurred',
					description: `Something unexpected happened${pathname ? ` at <code class="rounded bg-canvas-200 px-2 py-1 font-mono text-sm dark:bg-canvas-800">${pathname}</code>` : ''}.`,
					suggestions: [
						'Try refreshing the page',
						'Clear your browser cache',
						'If the problem persists, please contact support'
					],
					primaryAction: { label: 'Go to Homepage', href: '/', icon: Home },
					secondaryAction: { label: 'Try Again', href: null, icon: RefreshCw, action: () => window.location.reload() }
				};
		}
	});

	const meta = $derived({
		title: `${status} - ${errorConfig.title}`
	});
</script>

<svelte:head>
	<title>{meta.title}</title>
	<meta name="description" content={errorConfig.description.replace(/<[^>]*>/g, '')} />
</svelte:head>

<MetaTags {meta} siteMeta={meta} />

<div class="mx-auto max-w-2xl py-8">
	<Card variant="elevated" padding="lg">
		{#snippet children()}
			<div class="text-center">
				<!-- Icon with status code -->
				<div class="mb-6 flex flex-col items-center">
					<div class="mb-4 rounded-full bg-primary-100 p-6 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
						{#if errorConfig.icon === FileQuestion}
							<FileQuestion class="h-16 w-16" />
						{:else if errorConfig.icon === Shield}
							<Shield class="h-16 w-16" />
						{:else if errorConfig.icon === ServerCrash}
							<ServerCrash class="h-16 w-16" />
						{:else}
							<AlertTriangle class="h-16 w-16" />
						{/if}
					</div>
					<h1 class="text-6xl font-bold text-ink-900 md:text-7xl dark:text-ink-50">
						{status}
					</h1>
				</div>

				<!-- Error title -->
				<h2 class="mb-4 text-2xl font-bold text-ink-900 md:text-3xl dark:text-ink-50">
					{errorConfig.title}
				</h2>

				<!-- Error description -->
				<p class="mb-6 text-ink-700 dark:text-ink-200">
					{@html errorConfig.description}
				</p>

				<!-- Show additional error message if available and meaningful -->
				{#if errorMessage && !errorMessage.includes('Internal Error') && status !== 404}
					<div class="mb-6 rounded-lg bg-red-50 p-4 text-left dark:bg-red-900/20">
						<p class="text-sm font-medium text-red-800 dark:text-red-200">
							Error details:
						</p>
						<p class="mt-1 font-mono text-sm text-red-700 dark:text-red-300">
							{errorMessage}
						</p>
					</div>
				{/if}

				<!-- Suggestions -->
				{#if errorConfig.suggestions.length > 0}
					<div class="mb-8 text-left">
						<p class="mb-3 text-sm font-medium text-ink-600 dark:text-ink-400">
							What you can try:
						</p>
						<ul class="space-y-2">
							{#each errorConfig.suggestions as suggestion}
								<li class="flex items-start gap-2 text-sm text-ink-700 dark:text-ink-300">
									<span class="mt-0.5 text-primary-500 dark:text-primary-400">•</span>
									<span>{suggestion}</span>
								</li>
							{/each}
						</ul>
					</div>
				{/if}

				<!-- Action buttons -->
				<div class="flex flex-col items-center justify-center gap-3 sm:flex-row">
					{#if errorConfig.primaryAction}
						{#if errorConfig.primaryAction.href}
							<a
								href={errorConfig.primaryAction.href}
								class="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary-500 px-6 py-3 font-medium text-white transition-colors hover:bg-primary-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700"
							>
								{#if errorConfig.primaryAction.icon === Home}
									<Home class="h-5 w-5" />
								{:else if errorConfig.primaryAction.icon === RefreshCw}
									<RefreshCw class="h-5 w-5" />
								{/if}
								{errorConfig.primaryAction.label}
							</a>
						{:else if errorConfig.primaryAction.action}
							<button
								onclick={errorConfig.primaryAction.action}
								class="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary-500 px-6 py-3 font-medium text-white transition-colors hover:bg-primary-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700"
							>
								{#if errorConfig.primaryAction.icon === Home}
									<Home class="h-5 w-5" />
								{:else if errorConfig.primaryAction.icon === RefreshCw}
									<RefreshCw class="h-5 w-5" />
								{/if}
								{errorConfig.primaryAction.label}
							</button>
						{/if}
					{/if}

					{#if errorConfig.secondaryAction}
						{#if errorConfig.secondaryAction.href}
							<a
								href={errorConfig.secondaryAction.href}
								class="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-canvas-200 px-6 py-3 font-medium text-ink-900 transition-colors hover:bg-canvas-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-canvas-600 sm:w-auto dark:bg-canvas-700 dark:text-ink-50 dark:hover:bg-canvas-600"
							>
								{#if errorConfig.secondaryAction.icon === Home}
									<Home class="h-5 w-5" />
								{:else if errorConfig.secondaryAction.icon === RefreshCw}
									<RefreshCw class="h-5 w-5" />
								{/if}
								{errorConfig.secondaryAction.label}
							</a>
						{:else if errorConfig.secondaryAction.action}
							<button
								onclick={errorConfig.secondaryAction.action}
								class="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-canvas-200 px-6 py-3 font-medium text-ink-900 transition-colors hover:bg-canvas-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-canvas-600 sm:w-auto dark:bg-canvas-700 dark:text-ink-50 dark:hover:bg-canvas-600"
							>
								{#if errorConfig.secondaryAction.icon === Home}
									<Home class="h-5 w-5" />
								{:else if errorConfig.secondaryAction.icon === RefreshCw}
									<RefreshCw class="h-5 w-5" />
								{/if}
								{errorConfig.secondaryAction.label}
							</button>
						{/if}
					{/if}
				</div>

				<!-- Helpful links for 404 -->
				{#if status === 404}
					<div class="mt-8 border-t border-canvas-200 pt-6 dark:border-canvas-800">
						<p class="mb-3 text-sm font-medium text-ink-600 dark:text-ink-400">
							Looking for something specific?
						</p>
						<div class="flex flex-wrap justify-center gap-2">
							<a
								href="/archive"
								class="rounded-lg bg-canvas-100 px-4 py-2 text-sm text-ink-700 transition-colors hover:bg-canvas-200 dark:bg-canvas-800 dark:text-ink-300 dark:hover:bg-canvas-700"
							>
								Archive
							</a>
							<a
								href="/github"
								class="rounded-lg bg-canvas-100 px-4 py-2 text-sm text-ink-700 transition-colors hover:bg-canvas-200 dark:bg-canvas-800 dark:text-ink-300 dark:hover:bg-canvas-700"
							>
								GitHub
							</a>
							<a
								href="/site/meta"
								class="rounded-lg bg-canvas-100 px-4 py-2 text-sm text-ink-700 transition-colors hover:bg-canvas-200 dark:bg-canvas-800 dark:text-ink-300 dark:hover:bg-canvas-700"
							>
								About
							</a>
						</div>
					</div>
				{/if}
			</div>
		{/snippet}
	</Card>
</div>
