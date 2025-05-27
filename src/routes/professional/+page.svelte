<script lang="ts">
  import { page } from "$app/stores";
    import type { ProfessionalInfo, Profile } from "$lib/components/profile/interfaces";

  // Define the type for the page data
  interface PageData {
    professionalInfo: ProfessionalInfo | null;
    profile: Profile;
    pdsUrl: string;
    did: string;
  }

  // Access data from layout
  let { data } = $props();
  let professionalInfo: ProfessionalInfo | null = data.professionalInfo;
  console.log('professionalInfo:', professionalInfo);

  // Construct the full avatar image URL
  let avatarImageUrl: string | undefined = $state(undefined);
  let avatarAspectRatioStyle: string | undefined = $state(undefined);

  $effect(() => {
    if (professionalInfo?.avatar?.image?.ref?.$link && data.pdsUrl && data.did) {
      avatarImageUrl = `${data.pdsUrl}/xrpc/com.atproto.sync.getBlob?did=${data.did}&cid=${professionalInfo?.avatar.image.ref.$link}`;
    } else {
      avatarImageUrl = undefined;
    }
    console.log('avatarImageUrl:', avatarImageUrl);

    // Compute aspect ratio style
    if (professionalInfo?.avatar?.aspectRatio?.width !== undefined && professionalInfo?.avatar?.aspectRatio?.height !== undefined) {
        avatarAspectRatioStyle = `aspect-ratio: ${professionalInfo.avatar.aspectRatio.width} / ${professionalInfo.avatar.aspectRatio.height};`;
    } else {
        avatarAspectRatioStyle = undefined;
    }
  });

  // State to track if the avatar image failed to load
  let imageLoadError = $state(false);

  // Handle image load error
  function handleImageError() {
    imageLoadError = true;
    console.error('Avatar image failed to load.');
  }
</script>

<svelte:head>
  <title>Professional - Ewan's Corner</title>
  <meta
    name="description"
    content="Explore professional insights and experiences at Ewan's Corner."
  />
  <meta
    name="keywords"
    content="Ewan, professional, insights, experiences, career, skills"
  />

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content={$page.url.origin + $page.url.pathname} />
  <meta property="og:title" content="Professional - Ewan's Corner" />
  <meta
    property="og:description"
    content="Explore professional insights and experiences at Ewan's Corner."
  />
  <meta property="og:site_name" content="Professional - Ewan's Corner" />
  <meta property="og:image" content={$page.url.origin + "/embed/main.png"} />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:url" content={$page.url.origin + $page.url.pathname} />
  <meta name="twitter:title" content="Professional - Ewan's Corner" />
  <meta
    name="twitter:description"
    content="Explore professional insights and experiences at Ewan's Corner."
  />
  <meta name="twitter:image" content={$page.url.origin + "/embed/main.png"} />
</svelte:head>


{#if !professionalInfo}
  <div
    class="flex flex-col items-center justify-center min-h-[200px] text-lg text-[var(--text-color)] opacity-70 text-center"
  >
    <p>No professional information found.</p>
    <p class="mt-2 text-sm">Please check back later for updates.</p>
  </div>
{:else}
  <div class="container mx-auto px-4 py-12 professional-info">
    <div class="text-center mb-8">
      {#if professionalInfo?.avatar}
        {#if !imageLoadError}
          <img
            src={avatarImageUrl}
            alt={professionalInfo?.avatar.alt}
            class="rounded-full mx-auto mb-4 w-32 h-32 object-cover shadow-lg"
            style={avatarAspectRatioStyle}
            onerror={handleImageError}
          />
        {/if}
      {/if}
      {#if professionalInfo?.displayName}
      <h1 class="text-4xl font-bold mb-2">{professionalInfo?.displayName}</h1>
      {/if}
      {#if professionalInfo?.headline}
      <p class="text-md text-[var(--text-color)] opacity-80 mb-4">{professionalInfo?.headline}</p>
      {/if}
      {#if professionalInfo?.description}
      <p class="text-lg text-[var(--text-color)] opacity-90">{professionalInfo?.description}</p>
      {/if}
      {#if professionalInfo?.country}
        <p class="text-md text-[var(--text-color)] opacity-80 mt-2">Country: {professionalInfo?.country}</p>
      {/if}
      {#if professionalInfo?.contactEmail}
        <p class="text-md text-[var(--text-color)] opacity-80">Contact: <a href="mailto:{professionalInfo?.contactEmail}" class="text-[var(--link-color)] hover:underline">{professionalInfo?.contactEmail}</a></p>
      {/if}
      {#if professionalInfo?.websiteUrl}
        <p class="text-md text-[var(--text-color)] opacity-80">Website: <a href="{professionalInfo?.websiteUrl}" class="text-[var(--link-color)] hover:underline" target="_blank" rel="noopener noreferrer">{professionalInfo?.websiteUrl ? professionalInfo.websiteUrl.replace(/^(https?:\/\/)/, '') : ''}</a></p>
      {/if}
    </div>

    {#if professionalInfo?.skills && professionalInfo?.skills.length > 0}
      <div class="mt-8">
        <h2 class="text-2xl font-semibold mb-4 text-center">Skills</h2>
        <ul class="flex flex-wrap justify-center gap-3">
          {#each professionalInfo?.skills as skill}
            <li class="bg-[var(--card-bg)] text-[var(--text-color)] px-4 py-2 rounded-full shadow-md">
              {skill}
            </li>
          {/each}
        </ul>
      </div>
    {/if}
  </div>
{/if}