<script lang="ts">
  import { getStores } from "$app/stores";
  const { page } = getStores();
  import type { SiteInfo } from "$lib/components/shared";

  // Access the siteInfo data from the layout load function
  const siteInfo: SiteInfo | null = $page.data.siteInfo;
</script>

<svelte:head>
  <title>About This Website - Ewan's Corner</title>
  <meta
    name="description"
    content="Information about Ewan's Corner including privacy policy, technology stack, and website purpose."
  />
  <meta
    name="keywords"
    content="about, information, privacy policy, technology stack, Ewan's Corner"
  />

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content={$page.url.origin + $page.url.pathname} />
  <meta property="og:title" content="About This Website - Ewan's Corner" />
  <meta
    property="og:description"
    content="Learn about Ewan's Corner - including technology stack, website purpose, and privacy information."
  />
  <meta property="og:site_name" content="Ewan's Corner" />
  <meta property="og:image" content={$page.url.origin + "/embed/main.png"} />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:url" content={$page.url.origin + $page.url.pathname} />
  <meta name="twitter:title" content="About This Website - Ewan's Corner" />
  <meta
    name="twitter:description"
    content="Learn about Ewan's Corner - including technology stack, website purpose, and privacy information."
  />
  <meta name="twitter:image" content={$page.url.origin + "/embed/main.png"} />
</svelte:head>

<div class="max-w-2xl mx-auto px-4 py-8">
  <h1 class="text-3xl font-bold mb-6">About This Website</h1>

  {#if siteInfo}
    <div class="prose dark:prose-invert">
      {#if siteInfo.additionalInfo?.purpose}
        <h2 class="text-xl font-semibold mt-6 mb-2">Website Purpose</h2>
        <p>{@html siteInfo.additionalInfo.purpose}</p>
      {/if}

      {#if siteInfo.technologyStack && siteInfo.technologyStack.length > 0}
        <h2 class="text-xl font-semibold mt-6 mb-2">Technology Stack</h2>
        <p>This website is built with:</p>
        <ul>
          {#each siteInfo.technologyStack as tech}
            <li>
              {#if tech.url}
                <a
                  href="{tech.url}"
                  class="text-[var(--link-color)] hover:text-[var(--link-hover-color)]"
                  >{tech.name}</a
                >
              {:else}
                {tech.name}
              {/if}
              {#if tech.description}
                - {@html tech.description}
              {/if}
            </li>
          {/each}
        </ul>
      {/if}

      {#if siteInfo.privacyStatement}
        <h2 class="text-xl font-semibold mt-6 mb-2">Privacy Notice</h2>
        <p>{@html siteInfo.privacyStatement}</p>
      {/if}

      {#if siteInfo.openSourceInfo}
        <h2 class="text-xl font-semibold mt-6 mb-2">Open Source</h2>
        {#if siteInfo.openSourceInfo.description}
          <p>{@html siteInfo.openSourceInfo.description}</p>
        {/if}
        {#if siteInfo.openSourceInfo.basedOn && siteInfo.openSourceInfo.basedOn.length > 0}
          <p>Based on:</p>
          <ul>
            {#each siteInfo.openSourceInfo.basedOn as item}
              <li>
                {#if item.url}
                  <a
                    href="{item.url}"
                    class="text-[var(--link-color)] hover:text-[var(--link-hover-color)]"
                    >{item.name}</a
                  >
                {:else}
                  {item.name}
                {/if}
                {#if item.type}
                  ({item.type})
                {/if}
                {#if item.description}
                  - {@html item.description}
                {/if}
              </li>
            {/each}
          </ul>
        {/if}
        {#if siteInfo.openSourceInfo.repositories && siteInfo.openSourceInfo.repositories.length > 0}
          <p>Repositories:</p>
          <ul>
            {#each siteInfo.openSourceInfo.repositories as repo}
              <li>
                {#if repo.url}
                  <a
                    href="{repo.url}"
                    class="text-[var(--link-color)] hover:text-[var(--link-hover-color)]"
                    >{repo.platform || 'Repository'}</a
                  >
                {:else}
                  {repo.platform || 'Repository'}
                {/if}
                {#if repo.type}
                  ({repo.type})
                {/if}
                {#if repo.description}
                  - {@html repo.description}
                {/if}
              </li>
            {/each}
          </ul>
        {/if}
        {#if siteInfo.openSourceInfo.license}
          <p>
            License: {#if siteInfo.openSourceInfo.license.url}
              <a
                href="{siteInfo.openSourceInfo.license.url}"
                class="text-[var(--link-color)] hover:text-[var(--link-hover-color)]"
                >{siteInfo.openSourceInfo.license.name || 'License'}</a
              >
            {:else}
              {siteInfo.openSourceInfo.license.name || 'License'}
            {/if}
          </p>
        {/if}
        {#if siteInfo.openSourceInfo.relatedServices && siteInfo.openSourceInfo.relatedServices.length > 0}
          <p>Related Services:</p>
          <ul>
            {#each siteInfo.openSourceInfo.relatedServices as service}
              <li>
                {#if service.url}
                  <a
                    href="{service.url}"
                    class="text-[var(--link-color)] hover:text-[var(--link-hover-color)]"
                    >{service.name}</a
                  >
                {:else}
                  {service.name}
                {/if}
                {#if service.relationship}
                  ({service.relationship})
                {/if}
                {#if service.description}
                  - {@html service.description}
                {/if}
              </li>
            {/each}
          </ul>
        {/if}
      {/if}

      {#if siteInfo.credits && siteInfo.credits.length > 0}
        <h2 class="text-xl font-semibold mt-6 mb-2">Credits</h2>
        <ul>
          {#each siteInfo.credits as credit}
            <li>
              {#if credit.url}
                <a
                  href="{credit.url}"
                  class="text-[var(--link-color)] hover:text-[var(--link-hover-color)]"
                  >{credit.name}</a
                >
              {:else}
                {credit.name}
              {/if}
              {#if credit.type}
                ({credit.type})
              {/if}
              {#if credit.author}
                by {credit.author}
              {/if}
              {#if credit.license}
                under {#if credit.license.url}
                  <a
                    href="{credit.license.url}"
                    class="text-[var(--link-color)] hover:text-[var(--link-hover-color)]"
                    >{credit.license.name || 'License'}</a
                  >
                {:else}
                  {credit.license.name || 'License'}
                {/if}
              {/if}
              {#if credit.description}
                - {@html credit.description}
              {/if}
            </li>
          {/each}
        </ul>
      {/if}

      {#if siteInfo.additionalInfo}
        {#if siteInfo.additionalInfo.websiteBirthYear}
            <h2 class="text-xl font-semibold mt-6 mb-2">Website Creation Year</h2>
            <p>{siteInfo.additionalInfo.websiteBirthYear}</p>
          {/if}

          {#if siteInfo.additionalInfo.contact}
            <h2 class="text-xl font-semibold mt-6 mb-2">Contact</h2>
            {#if siteInfo.additionalInfo.contact.email}
              <p>Email: <a href="mailto:{siteInfo.additionalInfo.contact.email}" class="text-[var(--link-color)] hover:text-[var(--link-hover-color)]">{siteInfo.additionalInfo.contact.email}</a></p>
            {/if}
            {#if siteInfo.additionalInfo.contact.social && siteInfo.additionalInfo.contact.social.length > 0}
              <p>Social:</p>
              <ul>
                {#each siteInfo.additionalInfo.contact.social as social}
                  <li>
                    {#if social.url}
                      <a
                        href="{social.url}"
                        class="text-[var(--link-color)] hover:text-[var(--link-hover-color)]"
                        >{social.platform}</a
                      >
                    {:else}
                      {social.platform}
                    {/if}
                    {#if social.handle}
                      ({social.handle})
                    {/if}
                  </li>
                {/each}
              </ul>
            {/if}
          {/if}

          {#if siteInfo.additionalInfo.deployment}
            <h2 class="text-xl font-semibold mt-6 mb-2">Deployment</h2>
            {#if siteInfo.additionalInfo.deployment.platform}
              <p>Platform: {siteInfo.additionalInfo.deployment.platform}</p>
            {/if}
            {#if siteInfo.additionalInfo.deployment.cdn}
              <p>CDN: {siteInfo.additionalInfo.deployment.cdn}</p>
            {/if}
            {#if siteInfo.additionalInfo.deployment.customDomain !== undefined}
              <p>Custom Domain: {siteInfo.additionalInfo.deployment.customDomain ? 'Yes' : 'No'}</p>
            {/if}
          {/if}

          {#if siteInfo.additionalInfo.analytics}
            <h2 class="text-xl font-semibold mt-6 mb-2">Analytics</h2>
            {#if siteInfo.additionalInfo.analytics.services && siteInfo.additionalInfo.analytics.services.length > 0}
              <p>Services: {siteInfo.additionalInfo.analytics.services.join(', ')}</p>
            {/if}
            {#if siteInfo.additionalInfo.analytics.cookiePolicy}
              <p>Cookie Policy: {@html siteInfo.additionalInfo.analytics.cookiePolicy}</p>
            {/if}
          {/if}

          {#if siteInfo.additionalInfo.sectionLicense && siteInfo.additionalInfo.sectionLicense.length > 0}
            <h2 class="text-xl font-semibold mt-6 mb-2">Section Licenses</h2>
            <ul>
              {#each siteInfo.additionalInfo.sectionLicense as license}
                <li>
                  {#if license.url}
                    <a
                      href="{license.url}"
                      class="text-[var(--link-color)] hover:text-[var(--link-hover-color)]"
                      >{license.name || 'License'}</a
                    >
                  {:else}
                    {license.name || 'License'}
                  {/if}
                  {#if license.section}
                    ({license.section})
                  {/if}
                </li>
              {/each}
            </ul>
          {/if}
      {/if}
    </div>
  {:else}
    <p>Loading site information...</p>
  {/if}
</div>
