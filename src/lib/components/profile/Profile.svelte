<script lang="ts">
  export let profile: any;
  import { Status } from ".";
</script>

<link rel="preload" href="/fallback/profile.svg" as="image" type="image/svg+xml">
<link rel="preload" href="/fallback/banner.svg" as="image" type="image/svg+xml">

<!-- Profile Banner -->
<div
  class="profile-banner p-4 relative rounded-[1em] mx-2 mb-2"
  style="
    background-image: url({profile?.banner || '/fallback/banner.svg'});
    background-size: cover;
    background-position: center;
    min-height: 150px;
    background-color: transparent; /* remove any fallback background */
    border: none;
  "
></div>

{#if profile}
  <div class="profile-content mx-2 mb-8 relative">
    <div class="flex flex-col sm:flex-row sm:items-start text-left sm:gap-6">
      <!-- Avatar -->
      <img
        src={profile?.avatar || '/fallback/profile.svg'}
        alt="{profile?.displayName || profile?.handle || profile?.did || 'Unknown User'}'s avatar"
        class="rounded-full flex-shrink-0 relative z-10
               w-24 h-24 -mt-12 mx-auto mb-4
               sm:w-32 sm:h-32 sm:-mt-16 sm:mx-0 sm:mb-0
               bg-transparent border-none
               transition-transform duration-500 hover:rotate-[360deg] cursor-pointer"
      />

      <!-- User Information -->
      <div class="flex-1 min-w-0 p-4 rounded-[1em] overflow-hidden" style="background: var(--card-bg);">
        <div class="mb-3">
          <!-- Display name -->
          <h4 class="text-lg font-semibold mb-1 leading-tight truncate text-center sm:text-left">
            {profile?.displayName || 'Anonymous'}
          </h4>

          <!-- Handle / DID -->
          <h6 class="mb-2 text-center sm:text-left">
            {#if profile?.handle}
              <a
                href="https://bsky.app/profile/{profile.handle}"
                class="text-link hover:text-link-hover text-sm truncate block"
              >
                @{profile.handle}
              </a>
            {:else if profile?.did}
              <code
                class="text-xs font-mono truncate block text-link hover:text-link-hover"
                title={profile.did}
              >
                {profile.did}
              </code>
            {:else}
              <span class="italic opacity-60 text-sm">Unknown user</span>
            {/if}
          </h6>

          <!-- DID row (always visible on sm+) -->
          {#if profile?.did}
            <h6 class="opacity-40 mb-3 text-center sm:text-left">
              <span
                class="text-xs font-mono overflow-hidden text-ellipsis whitespace-nowrap hidden sm:block"
                title={profile.did}
              >
                {profile.did}
              </span>
            </h6>
          {/if}
        </div>

        <!-- Description -->
        {#if profile?.description}
          <div class="mb-3">
            <p class="text-sm leading-relaxed text-center sm:text-left">
              {profile.description}
            </p>
          </div>
        {/if}

        <!-- Status -->
        <div class="text-center sm:text-left">
          <Status {profile} />
        </div>
      </div>
    </div>
  </div>
{:else}
  <!-- Placeholder if no profile -->
  <div
    class="profile-content flex flex-col items-center justify-center text-center mx-2 p-4 relative rounded-[1em]"
    style="background: var(--card-bg);"
  >
    <p class="text-center text-sm italic opacity-75">
      create a `app.bsky.actor.profile` record at
      <a href="https://bsky.app/" class="text-link hover:text-link-hover">
        https://bsky.app/
      </a>
    </p>
  </div>
{/if}