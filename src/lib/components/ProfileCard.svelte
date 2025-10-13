<script lang="ts">
  import { onMount } from 'svelte';
  import { fetchProfile, type ProfileData } from '$lib/services/atproto';
  
  let profile = $state<ProfileData | null>(null);
  let loading = $state(true);
  let error = $state<string | null>(null);
  let imageLoaded = $state(false);
  let bannerLoaded = $state(false);

  onMount(async () => {
    try {
      profile = await fetchProfile();
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to load profile';
    } finally {
      loading = false;
    }
  });

  function formatNumber(num?: number): string {
    if (!num) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  }
</script>

<div class="w-full max-w-2xl mx-auto bg-background-50 dark:bg-background-900 rounded-xl shadow-lg overflow-hidden transition-all duration-300">
  {#if loading}
    <div class="animate-pulse">
      <div class="h-32 bg-background-200 dark:bg-background-800"></div>
      <div class="p-6 space-y-4">
        <div class="flex items-start gap-4">
          <div class="w-20 h-20 rounded-full bg-background-200 dark:bg-background-800"></div>
          <div class="flex-1 space-y-2">
            <div class="h-6 bg-background-200 dark:bg-background-800 rounded w-1/2"></div>
            <div class="h-4 bg-background-200 dark:bg-background-800 rounded w-1/3"></div>
          </div>
        </div>
        <div class="space-y-2">
          <div class="h-4 bg-background-200 dark:bg-background-800 rounded"></div>
          <div class="h-4 bg-background-200 dark:bg-background-800 rounded w-5/6"></div>
        </div>
      </div>
    </div>
  {:else if error}
    <div class="p-6 text-center">
      <p class="text-red-600 dark:text-red-400">{error}</p>
    </div>
  {:else if profile}
    <!-- Banner -->
    <div class="relative h-32 bg-gradient-to-r from-primary-400 to-secondary-400 overflow-hidden">
      {#if profile.banner}
        <img
          src={profile.banner}
          alt="Profile banner"
          class="w-full h-full object-cover transition-opacity duration-300"
          class:opacity-0={!bannerLoaded}
          class:opacity-100={bannerLoaded}
          onload={() => bannerLoaded = true}
          loading="lazy"
        />
      {/if}
    </div>

    <div class="p-6">
      <!-- Avatar and Name -->
      <div class="flex items-start gap-4 -mt-16 mb-4">
        <div class="relative">
          <div class="w-20 h-20 rounded-full border-4 border-background-50 dark:border-background-900 bg-background-200 dark:bg-background-800 overflow-hidden">
            {#if profile.avatar}
              <img
                src={profile.avatar}
                alt={profile.displayName || profile.handle}
                class="w-full h-full object-cover transition-opacity duration-300"
                class:opacity-0={!imageLoaded}
                class:opacity-100={imageLoaded}
                onload={() => imageLoaded = true}
                loading="lazy"
              />
            {:else}
              <div class="w-full h-full flex items-center justify-center bg-primary-200 dark:bg-primary-800 text-primary-800 dark:text-primary-200 text-2xl font-bold">
                {(profile.displayName || profile.handle).charAt(0).toUpperCase()}
              </div>
            {/if}
          </div>
        </div>
        
        <div class="flex-1 mt-12">
          <h2 class="text-2xl font-bold text-text-900 dark:text-text-50">
            {profile.displayName || profile.handle}
          </h2>
          <p class="text-text-600 dark:text-text-400">@{profile.handle}</p>
        </div>
      </div>

      <!-- Description -->
      {#if profile.description}
        <p class="text-text-800 dark:text-text-200 mb-4 whitespace-pre-wrap">
          {profile.description}
        </p>
      {/if}

      <!-- Stats -->
      <div class="flex gap-6 text-sm">
        <div class="flex items-center gap-1">
          <span class="font-bold text-text-900 dark:text-text-50">
            {formatNumber(profile.postsCount)}
          </span>
          <span class="text-text-600 dark:text-text-400">Posts</span>
        </div>
        <div class="flex items-center gap-1">
          <span class="font-bold text-text-900 dark:text-text-50">
            {formatNumber(profile.followersCount)}
          </span>
          <span class="text-text-600 dark:text-text-400">Followers</span>
        </div>
        <div class="flex items-center gap-1">
          <span class="font-bold text-text-900 dark:text-text-50">
            {formatNumber(profile.followsCount)}
          </span>
          <span class="text-text-600 dark:text-text-400">Following</span>
        </div>
      </div>

      <!-- View Profile Link -->
      <a
        href="https://bsky.app/profile/{profile.handle}"
        target="_blank"
        rel="noopener noreferrer"
        class="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-primary-300 rounded-lg transition-colors duration-200"
      >
        View on Bluesky
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </a>
    </div>
  {/if}
</div>