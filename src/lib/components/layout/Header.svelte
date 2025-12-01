<script lang="ts">
	import { onMount } from 'svelte';
	import { getStores } from '$app/stores';
	import { Menu, X } from '@lucide/svelte';
	import * as LucideIcons from '@lucide/svelte';
	import ThemeToggle from './ThemeToggle.svelte';
	import WolfToggle from './WolfToggle.svelte';
	import DecimalClock from './DecimalClock.svelte';
	import { navItems } from '$lib/data/navItems';
	import { fetchProfile, type ProfileData } from '$lib/services/atproto';
	import { defaultSiteMeta, createSiteMeta, type SiteMetadata } from '$lib/helper/siteMeta';

	const siteMeta: SiteMetadata = createSiteMeta(defaultSiteMeta);
	const { page } = getStores();

	let profile: ProfileData | null = null;
	let loading = true;
	let error: string | null = null;
	let imageLoaded = false;
	let mobileMenuOpen = false;

	// Map of icon names to Lucide components
	let iconComponents: Record<string, any> = {};
	navItems.forEach((item) => {
		const iconName = item.iconPath;
		if (iconName && (LucideIcons as any)[iconName]) {
			iconComponents[item.href] = (LucideIcons as any)[iconName];
		}
	});

	function toggleMobileMenu() {
		mobileMenuOpen = !mobileMenuOpen;
		// Trap focus when mobile menu opens
		if (mobileMenuOpen) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = '';
		}
	}

	function closeMobileMenu() {
		mobileMenuOpen = false;
		document.body.style.overflow = '';
	}

	function isActive(href: string) {
		return $page.url.pathname === href;
	}

	onMount(() => {
		// Fetch profile
		fetchProfile()
			.then((data) => {
				profile = data;
			})
			.catch((err) => {
				error = err instanceof Error ? err.message : 'Failed to load profile';
			})
			.finally(() => {
				loading = false;
			});

		// Close mobile menu on Escape key
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && mobileMenuOpen) {
				closeMobileMenu();
			}
		};
		document.addEventListener('keydown', handleEscape);
		
		return () => {
			document.removeEventListener('keydown', handleEscape);
			document.body.style.overflow = '';
		};
	});
</script>

<header
	class="sticky top-0 z-50 w-full border-b border-canvas-200 bg-canvas-50/90 backdrop-blur-md dark:border-canvas-800 dark:bg-canvas-950/90"
>
	<nav
		class="container mx-auto flex items-center justify-between px-3 py-3 sm:px-4 sm:py-4"
		aria-label="Main navigation"
	>
		<!-- Logo/Avatar with hover title -->
		<a
			href="/"
			class="group relative flex min-w-0 shrink items-center gap-2"
			onclick={closeMobileMenu}
			aria-label="Home - {siteMeta.title}"
		>
			<div class="relative flex items-center">
				{#if profile?.avatar}
					<img
						src={profile.avatar}
						alt=""
						class="h-10 w-10 rounded-full object-cover"
						onload={() => (imageLoaded = true)}
					/>
				{:else if profile}
					<div
						class="flex h-10 w-10 items-center justify-center rounded-full bg-primary-200 font-bold text-primary-800 dark:bg-primary-800 dark:text-primary-200"
						role="img"
						aria-label="{profile.displayName || profile.handle} avatar"
					>
						{(profile.displayName || profile.handle).charAt(0).toUpperCase()}
					</div>
				{:else}
					<div
						class="h-10 w-10 animate-pulse rounded-full bg-canvas-300 dark:bg-canvas-700"
						role="status"
						aria-label="Loading profile"
					></div>
				{/if}

				<!-- Site title revealed on hover -->
				<span
					class="absolute top-1/2 left-full ml-2 -translate-y-1/2 truncate text-lg font-bold text-ink-900 opacity-0 transition-all duration-300 group-hover:opacity-100 sm:ml-3 dark:text-ink-50"
					aria-hidden="true"
				>
					{siteMeta.title}
				</span>
			</div>
		</a>

		<!-- Desktop Navigation -->
		<div class="hidden items-center gap-4 md:flex">
			<ul class="flex items-center gap-6" role="list">
				{#each navItems as item}
					{@const IconComponent = iconComponents[item.href]}
					<li>
						<a
							href={item.href}
							class="group flex items-center gap-2 font-medium transition-colors
								{isActive(item.href) ? 'text-primary-600 dark:text-primary-400' : 'text-ink-700 dark:text-ink-200'}
								hover:text-primary-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
							aria-current={isActive(item.href) ? 'page' : undefined}
							title={item.label}
						>
							{#if IconComponent}
								<IconComponent
									class="h-5 w-5 transition-transform group-hover:scale-110"
									aria-hidden="true"
								/>
							{:else}
								<div class="flex h-5 w-5 items-center justify-center" aria-hidden="true">
									<div class="h-3 w-3 animate-pulse rounded-full bg-primary-500"></div>
								</div>
							{/if}
							<span>{item.label}</span>
						</a>
					</li>
				{/each}
			</ul>
			<DecimalClock />
			<div class="flex items-center gap-2">
				<WolfToggle />
				<ThemeToggle />
			</div>
		</div>

		<!-- Mobile Menu Button -->
		<div class="flex items-center gap-2 md:hidden">
			<WolfToggle />
			<ThemeToggle />
			<button
				onclick={toggleMobileMenu}
				class="flex h-9 w-9 items-center justify-center rounded-lg text-ink-700 transition-colors hover:bg-canvas-100 focus-visible:bg-canvas-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 dark:text-ink-200 dark:hover:bg-canvas-900 dark:focus-visible:bg-canvas-900"
				aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
				aria-expanded={mobileMenuOpen}
				aria-controls="mobile-menu"
			>
				{#if mobileMenuOpen}
					<X class="h-6 w-6" aria-hidden="true" />
				{:else}
					<Menu class="h-6 w-6" aria-hidden="true" />
				{/if}
			</button>
		</div>
	</nav>

	<!-- Mobile Menu Dropdown -->
	{#if mobileMenuOpen}
		<nav
			id="mobile-menu"
			class="border-t border-canvas-200 bg-canvas-50 md:hidden dark:border-canvas-800 dark:bg-canvas-950"
			aria-label="Mobile navigation"
		>
			<ul class="container mx-auto flex flex-col px-3 py-2" role="list">
				{#each navItems as item}
					{@const IconComponent = iconComponents[item.href]}
					<li>
						<a
							href={item.href}
							onclick={closeMobileMenu}
							class="flex items-center gap-3 rounded-lg px-3 py-3 font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600
								{isActive(item.href)
								? 'bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300'
								: 'text-ink-700 hover:bg-canvas-100 focus-visible:bg-canvas-100 dark:text-ink-200 dark:hover:bg-canvas-900 dark:focus-visible:bg-canvas-900'}"
							aria-current={isActive(item.href) ? 'page' : undefined}
						>
							{#if IconComponent}
								<IconComponent
									class="h-5 w-5 {isActive(item.href)
										? 'text-primary-600 dark:text-primary-400'
										: 'text-ink-600 dark:text-ink-400'}"
									aria-hidden="true"
								/>
							{:else}
								<div class="flex h-5 w-5 items-center justify-center" aria-hidden="true">
									<div class="h-3 w-3 rounded-full bg-primary-500"></div>
								</div>
							{/if}
							<span>{item.label}</span>
						</a>
					</li>
				{/each}
			</ul>
		</nav>
	{/if}
</header>
