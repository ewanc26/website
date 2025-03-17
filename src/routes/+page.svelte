<script lang="ts">
  import ATProfileComponent from '$lib/components/ATProfile.svelte';
  import profileSettings from '$lib/data/profile.json';
  import websiteInfo from '$lib/data/website.json';
  import externalData from '$lib/data/external.json';
  
  // Now you have access to profileSettings and websiteInfo.links
  const links = externalData.links;
  
  // Dynamically determine the number of links
  let linkCount = links.length;
</script>

<svelte:head>
  <title>{websiteInfo.title}</title>
  <meta name="description" content="Personal website of Ewan Croft" />
</svelte:head>

<main>
  <div class="container">
    <section class="profile-section">
      <ATProfileComponent 
        pds={profileSettings.pds}
        did={profileSettings.did}
        handle={profileSettings.handle}
      />
    </section>
    
    <section class="links-section">
      <h2>Find me elsewhere</h2>
      <div class="links-grid" style="grid-template-columns: repeat(auto-fill, minmax({linkCount > 3 ? 200 : 150}px, 1fr));">
        {#each links as link}
          <a href={link.url} target="_blank" rel="noopener noreferrer" class="link-card">
            <span class="link-icon">{link.icon}</span>
            <span class="link-name">{link.name}</span>
          </a>
        {/each}
      </div>
    </section>
  </div>
</main>

<style>
  .container {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
  }
  
  section {
    margin-bottom: 3rem;
    background-color: var(--color-header-footer);
    border-radius: 8px;
    padding: 2rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transition: background-color 0.3s, box-shadow 0.3s;
  }
  
  h2 {
    font-size: 1.5rem;
    margin-top: 0;
    margin-bottom: 1rem;
    color: var(--color-text);
  }
  
  .links-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
  }
  
  .link-card {
    display: flex;
    align-items: center;
    padding: 1rem;
    background-color: var(--color-button);
    border-radius: 6px;
    text-decoration: none;
    color: var(--color-text);
    transition: transform 0.2s, background-color 0.2s;
  }
  
  .link-card:hover {
    transform: translateY(-3px);
    background-color: var(--color-button-hover);
  }
  
  .link-icon {
    font-size: 1.5rem;
    margin-right: 1rem;
  }
  
  .link-name {
    font-weight: 500;
  }
  
  @media (max-width: 600px) {
    .container {
      padding: 1rem;
    }
    
    section {
      padding: 1.5rem;
    }
  }
</style>