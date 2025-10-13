<script lang="ts">
  import { onMount } from 'svelte';
  import { fetchSiteInfo, type SiteInfoData } from '$lib/services/atproto';
  
  let siteInfo = $state<SiteInfoData | null>(null);
  let loading = $state(true);
  let error = $state<string | null>(null);

  onMount(async () => {
    try {
      siteInfo = await fetchSiteInfo();
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to load site information';
    } finally {
      loading = false;
    }
  });

  function groupBy<T extends { section?: string }>(items: T[] | undefined): Map<string, T[]> {
    if (!items) return new Map();
    
    const grouped = new Map<string, T[]>();
    
    for (const item of items) {
      const section = item.section || 'General';
      if (!grouped.has(section)) {
        grouped.set(section, []);
      }
      grouped.get(section)!.push(item);
    }
    
    return grouped;
  }
</script>

<svelte:head>
  <title>Site Meta - Ewan's Corner</title>
  <meta name="description" content="Information about this website, its technology stack, and credits." />
</svelte:head>

<div class="max-w-5xl mx-auto">
  <div class="mb-8">
    <h1 class="text-4xl md:text-5xl font-bold text-text-900 dark:text-text-50 mb-4">
      Site Meta
    </h1>
    <p class="text-lg text-text-700 dark:text-text-300">
      Information about this website, its technology, and the people who made it possible.
    </p>
  </div>

  {#if loading}
    <div class="space-y-6">
      {#each Array(3) as _}
        <div class="animate-pulse bg-background-50 dark:bg-background-900 rounded-xl shadow-md p-6">
          <div class="h-6 bg-background-200 dark:bg-background-800 rounded w-1/4 mb-4"></div>
          <div class="space-y-2">
            <div class="h-4 bg-background-200 dark:bg-background-800 rounded"></div>
            <div class="h-4 bg-background-200 dark:bg-background-800 rounded w-5/6"></div>
          </div>
        </div>
      {/each}
    </div>
  {:else if error}
    <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
      <p class="text-red-600 dark:text-red-400">{error}</p>
    </div>
  {:else if siteInfo}
    <div class="space-y-8">
      
      <!-- Purpose -->
      {#if siteInfo.additionalInfo?.purpose}
        <section class="bg-background-50 dark:bg-background-900 rounded-xl shadow-md p-6">
          <h2 class="text-2xl font-bold text-text-900 dark:text-text-50 mb-4">Purpose</h2>
          <p class="text-text-800 dark:text-text-200 whitespace-pre-wrap">
            {siteInfo.additionalInfo.purpose}
          </p>
        </section>
      {/if}

      <!-- Website Birth Year -->
      {#if siteInfo.additionalInfo?.websiteBirthYear}
        <section class="bg-background-50 dark:bg-background-900 rounded-xl shadow-md p-6">
          <h2 class="text-2xl font-bold text-text-900 dark:text-text-50 mb-4">History</h2>
          <p class="text-text-800 dark:text-text-200">
            This website was first launched in <strong class="text-primary-600 dark:text-primary-400">{siteInfo.additionalInfo.websiteBirthYear}</strong>.
          </p>
        </section>
      {/if}

      <!-- Technology Stack -->
      {#if siteInfo.technologyStack && siteInfo.technologyStack.length > 0}
        <section class="bg-background-50 dark:bg-background-900 rounded-xl shadow-md p-6">
          <h2 class="text-2xl font-bold text-text-900 dark:text-text-50 mb-4">Technology Stack</h2>
          <div class="grid gap-4 md:grid-cols-2">
            {#each siteInfo.technologyStack as tech}
              <div class="p-4 bg-background-100 dark:bg-background-800 rounded-lg">
                {#if tech.url}
                  <a href={tech.url} target="_blank" rel="noopener noreferrer" class="font-semibold text-primary-600 dark:text-primary-400 hover:underline">
                    {tech.name}
                  </a>
                {:else}
                  <h3 class="font-semibold text-text-900 dark:text-text-50">{tech.name}</h3>
                {/if}
                {#if tech.description}
                  <p class="text-sm text-text-700 dark:text-text-300 mt-1">{tech.description}</p>
                {/if}
              </div>
            {/each}
          </div>
        </section>
      {/if}

      <!-- Open Source Information -->
      {#if siteInfo.openSourceInfo}
        <section class="bg-background-50 dark:bg-background-900 rounded-xl shadow-md p-6">
          <h2 class="text-2xl font-bold text-text-900 dark:text-text-50 mb-4">Open Source</h2>
          
          {#if siteInfo.openSourceInfo.description}
            <p class="text-text-800 dark:text-text-200 mb-4 whitespace-pre-wrap">
              {siteInfo.openSourceInfo.description}
            </p>
          {/if}

          {#if siteInfo.openSourceInfo.license}
            <div class="mb-4 p-4 bg-background-100 dark:bg-background-800 rounded-lg">
              <h3 class="font-semibold text-text-900 dark:text-text-50 mb-2">License</h3>
              {#if siteInfo.openSourceInfo.license.url}
                <a href={siteInfo.openSourceInfo.license.url} target="_blank" rel="noopener noreferrer" class="text-primary-600 dark:text-primary-400 hover:underline">
                  {siteInfo.openSourceInfo.license.name}
                </a>
              {:else}
                <p class="text-text-800 dark:text-text-200">{siteInfo.openSourceInfo.license.name}</p>
              {/if}
            </div>
          {/if}

          {#if siteInfo.openSourceInfo.repositories && siteInfo.openSourceInfo.repositories.length > 0}
            <div class="mb-4">
              <h3 class="font-semibold text-text-900 dark:text-text-50 mb-3">Repositories</h3>
              <div class="space-y-2">
                {#each siteInfo.openSourceInfo.repositories as repo}
                  <a href={repo.url} target="_blank" rel="noopener noreferrer" class="flex items-center gap-2 p-3 bg-background-100 dark:bg-background-800 rounded-lg hover:bg-background-200 dark:hover:bg-background-700 transition-colors">
                    <svg class="w-5 h-5 text-text-600 dark:text-text-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    <div class="flex-1">
                      <div class="flex items-center gap-2">
                        {#if repo.platform}
                          <span class="text-xs font-medium text-text-600 dark:text-text-400 uppercase">{repo.platform}</span>
                        {/if}
                        {#if repo.type}
                          <span class="text-xs px-2 py-0.5 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded">{repo.type}</span>
                        {/if}
                      </div>
                      {#if repo.description}
                        <p class="text-sm text-text-700 dark:text-text-300">{repo.description}</p>
                      {/if}
                    </div>
                    <svg class="w-4 h-4 text-text-600 dark:text-text-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                {/each}
              </div>
            </div>
          {/if}

          {#if siteInfo.openSourceInfo.basedOn && siteInfo.openSourceInfo.basedOn.length > 0}
            <div class="mb-4">
              <h3 class="font-semibold text-text-900 dark:text-text-50 mb-3">Based On / Inspired By</h3>
              {#each [...groupBy(siteInfo.openSourceInfo.basedOn).entries()] as [section, items]}
                {#if groupBy(siteInfo.openSourceInfo.basedOn).size > 1}
                  <h4 class="text-sm font-medium text-text-600 dark:text-text-400 mt-3 mb-2">{section}</h4>
                {/if}
                <div class="grid gap-3 md:grid-cols-2">
                  {#each items as item}
                    <div class="p-3 bg-background-100 dark:bg-background-800 rounded-lg">
                      {#if item.url}
                        <a href={item.url} target="_blank" rel="noopener noreferrer" class="font-medium text-primary-600 dark:text-primary-400 hover:underline">
                          {item.name}
                        </a>
                      {:else}
                        <h4 class="font-medium text-text-900 dark:text-text-50">{item.name}</h4>
                      {/if}
                      {#if item.type}
                        <span class="text-xs px-2 py-0.5 bg-secondary-100 dark:bg-secondary-900 text-secondary-700 dark:text-secondary-300 rounded">{item.type}</span>
                      {/if}
                      {#if item.description}
                        <p class="text-sm text-text-700 dark:text-text-300 mt-1">{item.description}</p>
                      {/if}
                    </div>
                  {/each}
                </div>
              {/each}
            </div>
          {/if}

          {#if siteInfo.openSourceInfo.relatedServices && siteInfo.openSourceInfo.relatedServices.length > 0}
            <div>
              <h3 class="font-semibold text-text-900 dark:text-text-50 mb-3">Related Services</h3>
              {#each [...groupBy(siteInfo.openSourceInfo.relatedServices).entries()] as [section, items]}
                {#if groupBy(siteInfo.openSourceInfo.relatedServices).size > 1}
                  <h4 class="text-sm font-medium text-text-600 dark:text-text-400 mt-3 mb-2">{section}</h4>
                {/if}
                <div class="grid gap-3 md:grid-cols-2">
                  {#each items as service}
                    <div class="p-3 bg-background-100 dark:bg-background-800 rounded-lg">
                      {#if service.url}
                        <a href={service.url} target="_blank" rel="noopener noreferrer" class="font-medium text-primary-600 dark:text-primary-400 hover:underline">
                          {service.name}
                        </a>
                      {:else}
                        <h4 class="font-medium text-text-900 dark:text-text-50">{service.name}</h4>
                      {/if}
                      {#if service.relationship}
                        <span class="text-xs px-2 py-0.5 bg-accent-100 dark:bg-accent-900 text-accent-700 dark:text-accent-300 rounded">{service.relationship}</span>
                      {/if}
                      {#if service.description}
                        <p class="text-sm text-text-700 dark:text-text-300 mt-1">{service.description}</p>
                      {/if}
                    </div>
                  {/each}
                </div>
              {/each}
            </div>
          {/if}
        </section>
      {/if}

      <!-- Credits -->
      {#if siteInfo.credits && siteInfo.credits.length > 0}
        <section class="bg-background-50 dark:bg-background-900 rounded-xl shadow-md p-6">
          <h2 class="text-2xl font-bold text-text-900 dark:text-text-50 mb-4">Credits</h2>
          {#each [...groupBy(siteInfo.credits).entries()] as [section, items]}
            {#if groupBy(siteInfo.credits).size > 1}
              <h3 class="text-lg font-semibold text-text-900 dark:text-text-50 mt-4 mb-3">{section}</h3>
            {/if}
            <div class="grid gap-4 md:grid-cols-2">
              {#each items as credit}
                <div class="p-4 bg-background-100 dark:bg-background-800 rounded-lg">
                  <div class="flex items-start justify-between mb-2">
                    <div>
                      {#if credit.url}
                        <a href={credit.url} target="_blank" rel="noopener noreferrer" class="font-medium text-primary-600 dark:text-primary-400 hover:underline">
                          {credit.name}
                        </a>
                      {:else}
                        <h4 class="font-medium text-text-900 dark:text-text-50">{credit.name}</h4>
                      {/if}
                      {#if credit.author}
                        <p class="text-sm text-text-600 dark:text-text-400">by {credit.author}</p>
                      {/if}
                    </div>
                    <span class="text-xs px-2 py-1 bg-background-200 dark:bg-background-700 text-text-700 dark:text-text-300 rounded">
                      {credit.type}
                    </span>
                  </div>
                  {#if credit.description}
                    <p class="text-sm text-text-700 dark:text-text-300 mb-2">{credit.description}</p>
                  {/if}
                  {#if credit.license}
                    <div class="text-xs text-text-600 dark:text-text-400">
                      License: 
                      {#if credit.license.url}
                        <a href={credit.license.url} target="_blank" rel="noopener noreferrer" class="text-primary-600 dark:text-primary-400 hover:underline">
                          {credit.license.name}
                        </a>
                      {:else}
                        {credit.license.name}
                      {/if}
                    </div>
                  {/if}
                </div>
              {/each}
            </div>
          {/each}
        </section>
      {/if}

      <!-- Section Licenses -->
      {#if siteInfo.additionalInfo?.sectionLicense && siteInfo.additionalInfo.sectionLicense.length > 0}
        <section class="bg-background-50 dark:bg-background-900 rounded-xl shadow-md p-6">
          <h2 class="text-2xl font-bold text-text-900 dark:text-text-50 mb-4">Content Licenses</h2>
          <div class="space-y-3">
            {#each siteInfo.additionalInfo.sectionLicense as license}
              <div class="p-4 bg-background-100 dark:bg-background-800 rounded-lg">
                {#if license.section}
                  <h3 class="font-semibold text-text-900 dark:text-text-50">{license.section}</h3>
                {/if}
                {#if license.name}
                  {#if license.url}
                    <a href={license.url} target="_blank" rel="noopener noreferrer" class="text-primary-600 dark:text-primary-400 hover:underline">
                      {license.name}
                    </a>
                  {:else}
                    <p class="text-text-800 dark:text-text-200">{license.name}</p>
                  {/if}
                {/if}
              </div>
            {/each}
          </div>
        </section>
      {/if}

      <!-- Privacy Statement -->
      {#if siteInfo.privacyStatement}
        <section class="bg-background-50 dark:bg-background-900 rounded-xl shadow-md p-6">
          <h2 class="text-2xl font-bold text-text-900 dark:text-text-50 mb-4">Privacy</h2>
          <p class="text-text-800 dark:text-text-200 whitespace-pre-wrap">
            {siteInfo.privacyStatement}
          </p>
        </section>
      {/if}

    </div>
  {:else}
    <div class="bg-background-50 dark:bg-background-900 rounded-xl shadow-md p-12 text-center">
      <p class="text-text-700 dark:text-text-300">No site information available.</p>
    </div>
  {/if}
</div>