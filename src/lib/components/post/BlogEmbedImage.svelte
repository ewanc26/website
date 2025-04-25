<script lang="ts">
  import { onMount } from 'svelte';
  import type { Post } from '$lib/parser';
  import { formatDate } from '$lib/dateFormatter';

  export let post: Post;
  export let profile: {
    displayName: string;
    avatar: string;
    handle: string;
  };
  export let width = 1200;
  export let height = 630;
  
  let mounted = false;
  let formattedDate = '';
  
  onMount(() => {
    mounted = true;
    formattedDate = formatDate(post.createdAt);
  });

  // No longer need to truncate title since we'll wrap it

  // Function to encode the SVG to a data URL
  function getSvgUrl(svg: SVGElement): string {
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);
    const encoded = encodeURIComponent(svgString);
    return `data:image/svg+xml,${encoded}`;
  }

  // Function to download the SVG as PNG
  function downloadAsPng() {
    // Show loading indicator or disable button here if needed
    
    // First, preload the avatar image if it exists
    if (profile?.avatar) {
      const preloadAvatar = new Image();
      preloadAvatar.crossOrigin = 'anonymous'; // Try to avoid CORS issues
      
      // Set up success and error handlers for the preload
      preloadAvatar.onload = () => {
        // Avatar loaded successfully, proceed with SVG conversion
        convertSvgToPng(preloadAvatar.src);
      };
      
      preloadAvatar.onerror = () => {
        // Avatar failed to load, proceed with SVG conversion but use fallback
        convertSvgToPng(null);
      };
      
      // Start loading the avatar
      preloadAvatar.src = profile.avatar;
    } else {
      // No avatar to preload, proceed directly
      convertSvgToPng(null);
    }
  }
  
  // Function to handle the actual SVG to PNG conversion
  function convertSvgToPng(avatarSrc: string | null) {
    const svg = document.getElementById('blog-embed-svg') as unknown as SVGElement;
    
    // Create a modified version of the SVG for export
    // This replaces the foreignObject with a regular image element
    const exportSvg = svg.cloneNode(true) as SVGElement;
    
    // If there's an avatar, replace the foreignObject with an image element
    if (avatarSrc) {
      // Find and remove the foreignObject
      const foreignObject = exportSvg.querySelector('foreignObject');
      if (foreignObject) {
        // Create a group to hold both the image and fallback circle
        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        
        // Create a fallback circle first (will be visible if image fails to load)
        const fallbackCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        fallbackCircle.setAttribute('cx', '60');
        fallbackCircle.setAttribute('cy', `${height - 50}`);
        fallbackCircle.setAttribute('r', '30');
        fallbackCircle.setAttribute('fill', '#a0aec0');
        
        // Create an image element to replace the foreignObject
        const imageElement = document.createElementNS('http://www.w3.org/2000/svg', 'image');
        imageElement.setAttribute('x', '30');
        imageElement.setAttribute('y', `${height - 80}`);
        imageElement.setAttribute('width', '60');
        imageElement.setAttribute('height', '60');
        imageElement.setAttribute('href', avatarSrc);
        imageElement.setAttribute('clip-path', 'circle(30px at 30px 30px)');
        imageElement.setAttribute('preserveAspectRatio', 'xMidYMid slice');
        
        // Create a text element for the initials
        const initialsText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        initialsText.setAttribute('x', '60');
        initialsText.setAttribute('y', `${height - 42}`);
        initialsText.setAttribute('font-family', 'system-ui, -apple-system, sans-serif');
        initialsText.setAttribute('font-size', '26');
        initialsText.setAttribute('text-anchor', 'middle');
        initialsText.setAttribute('fill', '#ffffff');
        initialsText.textContent = profile?.displayName?.[0]?.toUpperCase() || '?';
        
        // Add elements to the group in the correct order
        group.appendChild(fallbackCircle);
        group.appendChild(imageElement);
        group.appendChild(initialsText);
        
        // Replace the foreignObject with the group
        foreignObject.parentNode?.replaceChild(group, foreignObject);
      }
    } else {
      // If no avatar or avatar failed to load, add a fallback circle
      const foreignObject = exportSvg.querySelector('foreignObject');
      if (foreignObject) {
        // Create a group for the fallback
        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        
        // Create a fallback circle
        const fallbackCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        fallbackCircle.setAttribute('cx', '60');
        fallbackCircle.setAttribute('cy', `${height - 50}`);
        fallbackCircle.setAttribute('r', '30');
        fallbackCircle.setAttribute('fill', '#a0aec0');
        
        // Create a text element for the initials
        const initialsText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        initialsText.setAttribute('x', '60');
        initialsText.setAttribute('y', `${height - 42}`);
        initialsText.setAttribute('font-family', 'system-ui, -apple-system, sans-serif');
        initialsText.setAttribute('font-size', '26');
        initialsText.setAttribute('text-anchor', 'middle');
        initialsText.setAttribute('fill', '#ffffff');
        initialsText.textContent = profile?.displayName?.[0]?.toUpperCase() || '?';
        
        // Add elements to the group
        group.appendChild(fallbackCircle);
        group.appendChild(initialsText);
        
        // Replace the foreignObject with the group
        foreignObject.parentNode?.replaceChild(group, foreignObject);
      } else {
        // No foreignObject found, try to add fallback to the author section
        const authorSection = exportSvg.querySelector(`rect[y="${height - 100}"]`);
        if (authorSection && authorSection.parentNode) {
          // Create a group for better organization
          const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
          
          // Create a fallback circle
          const fallbackCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          fallbackCircle.setAttribute('cx', '60');
          fallbackCircle.setAttribute('cy', `${height - 50}`);
          fallbackCircle.setAttribute('r', '30');
          fallbackCircle.setAttribute('fill', '#a0aec0');
          
          // Create a text element for the initials
          const initialsText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          initialsText.setAttribute('x', '60');
          initialsText.setAttribute('y', `${height - 42}`);
          initialsText.setAttribute('font-family', 'system-ui, -apple-system, sans-serif');
          initialsText.setAttribute('font-size', '26');
          initialsText.setAttribute('text-anchor', 'middle');
          initialsText.setAttribute('fill', '#ffffff');
          initialsText.textContent = profile?.displayName?.[0]?.toUpperCase() || '?';
          
          // Add elements to the group
          group.appendChild(fallbackCircle);
          group.appendChild(initialsText);
          
          // Insert the group after the author section
          authorSection.parentNode.insertBefore(group, authorSection.nextSibling);
        }
      }
    }
    
    // Get the URL for the modified SVG
    const url = getSvgUrl(exportSvg);
    
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Use the background color from CSS variables if possible
      const bgColor = getComputedStyle(document.documentElement).getPropertyValue('--background-color').trim() || '#121c17';
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0);
      
      const link = document.createElement('a');
      link.download = `${post.rkey}-embed.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    img.src = url;
  }
</script>

<div class="blog-embed-container">
  <svg 
    id="blog-embed-svg"
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 {width} {height}" 
    width={width} 
    height={height}
  >
    <!-- Background -->
    <rect width="100%" height="100%" fill="var(--background-color, #121c17)" />
    
    <!-- Border -->
    <rect 
      x="10" 
      y="10" 
      width={width - 20} 
      height={height - 20} 
      stroke="var(--header-footer-bg, #1e2c23)" 
      stroke-width="2" 
      fill="none" 
    />
    
    <!-- Title with wrapping -->
    <text 
      x="60" 
      y="150" 
      font-family="system-ui, -apple-system, sans-serif" 
      font-size="48" 
      font-weight="bold" 
      fill="var(--text-color, #d8e8d8)"
      width="1080"
    >
      {#if post.title.length > 40}
        {#each (post.title.match(/.{1,40}(\s|$)/g) || [post.title]) as line, i}
          <tspan x="60" dy="{i === 0 ? 0 : 60}">{line}</tspan>
        {/each}
      {:else}
        <tspan>{post.title}</tspan>
      {/if}
    </text>
    
    <!-- Date - position adjusts based on title line count -->
    <text 
      x="60" 
      y={post.title.length > 40 ? 210 + ((post.title.match(/.{1,40}(\s|$)/g) || []).length - 1) * 60 : 210}
      font-family="system-ui, -apple-system, sans-serif" 
      font-size="24" 
      fill="var(--link-hover-color, #8fd0a0)"
    >{mounted ? formattedDate : 'Loading date...'}</text>

    <!-- Bottom section with author info -->
    <rect 
      x="0" 
      y={height - 100} 
      width={width} 
      height="100" 
      fill="var(--header-footer-bg, #1e2c23)" 
    />
    
    {#if profile?.avatar}
      <!-- Avatar image with fallback -->
      <foreignObject 
        x="30" 
        y={height - 80} 
        width="60" 
        height="60"
      >
        <div>
          <img 
            src={profile.avatar} 
            alt="Author avatar"
            style="width: 60px; height: 60px; border-radius: 50%; object-fit: cover;"
            on:error={() => {
      const img = document.currentScript?.parentElement?.querySelector('img');
      const fallback = document.currentScript?.parentElement?.querySelector('div');
      if (img && fallback) {
        img.style.display = 'none';
        fallback.style.display = 'block';
      }
    }}
          />
          <div 
            style="display:none; width:60px; height:60px; border-radius:50%; background:#a0aec0; color:#fff; 
                   font-size:26px; font-family:system-ui; text-align:center; line-height:60px;"
          >
            {profile?.displayName?.[0]?.toUpperCase() || '?'}
          </div>
        </div>
      </foreignObject>
      
      <!-- Author name -->
      <text 
        x="110" 
        y={height - 55} 
        font-family="system-ui, -apple-system, sans-serif" 
        font-size="24" 
        font-weight="bold" 
        fill="var(--text-color, #d8e8d8)"
      >{profile?.displayName || 'Unknown Author'}</text>
      
      <!-- Author handle -->
      <text 
        x="110" 
        y={height - 25} 
        font-family="system-ui, -apple-system, sans-serif" 
        font-size="18" 
        fill="var(--link-hover-color, #8fd0a0)"
      >@{profile?.handle || 'unknown'}</text>
    {:else}
      <!-- Author name (no avatar) -->
      <text 
        x="30" 
        y={height - 55} 
        font-family="system-ui, -apple-system, sans-serif" 
        font-size="24" 
        font-weight="bold" 
        fill="var(--text-color, #d8e8d8)"
      >{profile?.displayName || 'Unknown Author'}</text>
      
      <!-- Author handle (no avatar) -->
      <text 
        x="30" 
        y={height - 25} 
        font-family="system-ui, -apple-system, sans-serif" 
        font-size="18" 
        fill="var(--link-hover-color, #8fd0a0)"
      >@{profile?.handle || 'unknown'}</text>
    {/if}
    
    <!-- Logo or site brand -->
    <text 
      x={width - 60} 
      y={height - 40} 
      font-family="system-ui, -apple-system, sans-serif" 
      font-size="24" 
      font-weight="bold" 
      text-anchor="end" 
      fill="var(--text-color, #d8e8d8)"
    >Ewan's Blog</text>
  </svg>
  
  <div class="controls mt-4">
    <button 
      class="px-4 py-2 bg-[var(--button-bg,#2d4839)] text-[var(--text-color,#d8e8d8)] rounded hover:bg-[var(--button-hover-bg,#3a5847)] transition-colors relative"
      on:click={() => {
        const button = document.querySelector('.controls button') as HTMLButtonElement;
        if (button) {
          button.classList.add('loading');
          button.disabled = true;
          
          // Add a small delay to allow the UI to update
          setTimeout(() => {
            downloadAsPng();
            // Reset button after download completes (with a small delay)
            setTimeout(() => {
              button.classList.remove('loading');
              button.disabled = false;
            }, 500);
          }, 100);
        } else {
          downloadAsPng();
        }
      }}
    >
      <span class="normal-state">Download as PNG</span>
      <span class="loading-state">Processing...</span>
    </button>
  </div>
</div>

<style>
  /* Add to existing styles */
  .controls button {
    position: relative;
    overflow: hidden;
  }
  
  .controls button .loading-state {
    display: none;
  }
  
  :global(.controls button.loading .normal-state) {
    display: none;
  }
  
  :global(.controls button.loading .loading-state) {
    display: inline;
  }
  
  :global(.controls button.loading)::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    height: 2px;
    width: 20%;
    background-color: var(--link-hover-color, #8fd0a0);
    animation: loading-animation 1.5s infinite;
  }
  
  @keyframes loading-animation {
    0% { width: 0%; left: 0; }
    50% { width: 30%; left: 35%; }
    100% { width: 0%; left: 100%; }
  }
  
  .blog-embed-container {
    max-width: 100%;
    overflow: hidden;
  }
  
  svg {
    max-width: 100%;
    height: auto;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  
  .controls {
    display: flex;
    justify-content: center;
  }
</style>