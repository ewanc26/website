<script lang="ts">
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";
  import { ArchiveCard } from "$components/archive";
  import { createComponentDebugger } from "$lib/utils/debug.js";

  // Create debugger for this component
  const debug = createComponentDebugger('DynamicRepos');

  // Type definition for repo record
  interface RepoRecord {
    knot: string;
    name: string;
    $type: "sh.tangled.repo";
    owner: string;
    createdAt: string;
  }

  interface RepoRecordWithRkey extends RepoRecord {
    rkey: string;
    url: string;
  }

  // Use $props() for Svelte 5
  let { profilePds, profileDid } = $props<{
    profilePds?: string;
    profileDid?: string;
  }>();
  
  // Internal state
  let dynamicReposData = $state<RepoRecordWithRkey[] | undefined>(undefined);
  let dynamicReposLoaded = $state(false);
  let isLoadingRepos = $state(false);
  let isVisible = $state(false);

  onMount(() => {
    debug.lifecycle('DynamicRepos', 'mounted', {
      hasProfilePds: !!profilePds,
      hasProfileDid: !!profileDid
    });

    // Start loading repos after a delay
    loadReposProgressively();
  });

  async function loadReposProgressively() {
    if (!dynamicReposLoaded && profilePds && profileDid) {
      setTimeout(async () => {
        try {
          isLoadingRepos = true;
          debug.debug('Loading dynamic repos client-side');
          
          const rawResponse = await fetch(
            `${profilePds}/xrpc/com.atproto.repo.listRecords?repo=${profileDid}&collection=sh.tangled.repo`
          );
          
          if (rawResponse.ok) {
            const response = await rawResponse.json();
            
            if (response && response.records && response.records.length > 0) {
              // Sort records by rkey in descending order and transform for display
              const sortedRepos = response.records
                .sort((a: any, b: any) => {
                  const aKey = a.rkey || a.uri?.split('/').pop() || '';
                  const bKey = b.rkey || b.uri?.split('/').pop() || '';
                  return bKey.localeCompare(aKey);
                })
                .map((record: any) => ({
                  ...record.value,
                  rkey: record.rkey || record.uri?.split('/').pop() || '',
                  url: `https://tangled.sh/${record.value.owner}/${record.value.name}`
                }));
              
              dynamicReposData = sortedRepos;
              debug.debug('Dynamic repos loaded client-side', { count: sortedRepos.length });
            }
          }
          dynamicReposLoaded = true;
        } catch (error) {
          debug.errorWithContext('Failed to load dynamic repos', error as Error);
          dynamicReposLoaded = true; // Mark as loaded to stop loading state
        } finally {
          isLoadingRepos = false;
        }
      }, 7500); // Wait 7.5 seconds before loading repos
    } else if (!profilePds || !profileDid) {
      // If we don't have the necessary profile data, mark as loaded to prevent loading state
      dynamicReposLoaded = true;
    }
  }

  // Show content with a small delay for better perceived performance
  $effect(() => {
    if (dynamicReposData) {
      setTimeout(() => {
        isVisible = true;
      }, 100);
    } else {
      isVisible = true; // Show placeholder/loading immediately
    }
  });
</script>

{#if isVisible}
  <div transition:fade={{ duration: 300 }}>
    {#if dynamicReposLoaded && dynamicReposData && dynamicReposData.length > 0}
      <section class="dynamic-repos">
        <div class="section-header" transition:fade={{ delay: 100, duration: 300 }}>
          <h2 class="section-title">Repositories</h2>
        </div>
        
        <div class="repos-container" transition:fade={{ delay: 300, duration: 400 }}>
          <div
            class="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr)_)] gap-x-6 gap-y-6 my-6"
          >
            {#each dynamicReposData as repo}
              <ArchiveCard 
                type="link" 
                url={repo.url} 
                title={repo.name} 
              />
            {/each}
          </div>
        </div>
      </section>
    {:else if isLoadingRepos}
      <div class="text-center py-4 animate-pulse">
        Loading repositories...
      </div>
    {:else if dynamicReposLoaded && (!dynamicReposData || dynamicReposData.length === 0)}
      <!-- Show placeholder only if data loading completed but empty -->
      <div class="mb-12 ml-4 text-center text-sm italic opacity-75">
        no repositories found in <code>sh.tangled.repo</code> collection
      </div>
    {/if}
  </div>
{/if}

<style>
  .dynamic-repos {
    margin-bottom: 3rem;
  }

  .section-header {
    display: flex;
    align-items: center;
    justify-content: flex-start; /* Left-aligned to differentiate from DynamicLinks */
    margin-bottom: 1.5rem;
    padding: 0;
  }

  .section-title {
    margin: 0;
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--text-color);
    position: relative;
  }

  .section-title::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 0; /* Align underline to the left */
    width: 3rem;
    height: 3px;
    background: var(--link-color);
    border-radius: 2px;
  }

  .repos-container {
    display: block;
  }

  /* Responsive adjustments */
  @media (max-width: 640px) {
    .section-header {
      flex-direction: column;
      align-items: flex-start; /* Keep left alignment on mobile */
      gap: 1rem;
    }

    .section-title {
      font-size: 1.5rem;
    }
  }
</style>