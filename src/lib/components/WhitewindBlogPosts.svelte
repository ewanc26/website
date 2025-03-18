<script>
    import { onMount } from 'svelte';
  
    // Component props
    export let did = ''; // The DID of the user
    export let pds = 'bsky.social'; // Default PDS server
    export let postsPerPage = 10;
    export let showDrafts = false;
    export let readMoreThreshold = 3; // After how many paragraphs to add "Read more"
  
    // Internal state
    let posts = [];
    let loading = true;
    let error = null;
    let cursor = '';
    let reachedEnd = false;
  
    // Initialize markdown renderer if available
    let md;
    
    onMount(() => {
      if (window.markdownit) {
        md = window.markdownit();
      } else {
        // Fallback if markdown parser isn't available
        md = {
          render: (markdown) => {
            const p = document.createElement('p');
            p.innerText = markdown;
            return p.outerHTML;
          }
        };
      }
      
      loadPosts();
    });
  
    // Function to fetch user profile if needed
    async function fetchUserProfile(userDid) {
      try {
        const response = await fetch(`https://${pds}/xrpc/com.atproto.repo.getRecord?repo=${userDid}&collection=app.bsky.actor.profile&rkey=self`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch profile: ${response.status}`);
        }
        
        const data = await response.json();
        return {
          username: data.value.displayName,
          description: data.value.description,
          pfp: data.value.avatar
        };
      } catch (err) {
        console.error("Error fetching profile:", err);
        return {
          username: `User ${userDid}`,
          description: '',
          pfp: ''
        };
      }
    }
  
    // Function to fetch blog posts
    async function fetchRecords() {
      try {
        let url = `https://${pds}/xrpc/com.atproto.repo.listRecords?repo=${did}&collection=com.whtwnd.blog.entry&limit=${postsPerPage}`;
        
        if (cursor) {
          url += `&cursor=${cursor}`;
        }
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch posts: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Update cursor for pagination
        cursor = data.cursor;
        
        if (!data.cursor || data.records.length < postsPerPage) {
          reachedEnd = true;
        }
        
        // Filter records based on visibility if needed
        let records = data.records;
        if (!showDrafts) {
          records = records.filter(record => record.value.visibility === 'public');
        }
        
        // Add author info to records
        const userProfile = await fetchUserProfile(did);
        records.forEach(record => {
          record.author = {
            DID: did,
            profile: userProfile
          };
        });
        
        return records;
      } catch (err) {
        throw new Error(`Error fetching posts: ${err.message}`);
      }
    }
  
    // Load posts
    async function loadPosts() {
      loading = true;
      error = null;
      
      try {
        const records = await fetchRecords();
        posts = [...posts, ...records];
      } catch (err) {
        error = err.message;
      } finally {
        loading = false;
      }
    }
  
    // Load more posts
    async function loadMore() {
      if (!reachedEnd && !loading) {
        loading = true;
        
        try {
          const records = await fetchRecords();
          posts = [...posts, ...records];
        } catch (err) {
          error = err.message;
        } finally {
          loading = false;
        }
      }
    }
  
    // Parse URI
    function parseURI(uri) {
      const components = uri.split('/');
      return {
        DID: components[2],
        collection: components[3],
        rkey: components[4]
      };
    }
  
    // Format date
    function formatDate(dateString) {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    }
  
    // Handle markdown with read more functionality
    function renderMarkdown(markdown) {
      if (!md) return markdown;
      
      const rendered = md.render(markdown);
      
      if (!readMoreThreshold) return rendered;
      
      // Create a temporary div to count paragraphs
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = rendered;
      
      const paragraphs = tempDiv.querySelectorAll('p, h1, h2, h3, h4, h5, h6, ul, ol, blockquote');
      
      if (paragraphs.length <= readMoreThreshold) {
        return rendered;
      }
      
      // Split content at the threshold
      const visibleContent = document.createElement('div');
      const hiddenContent = document.createElement('div');
      
      Array.from(paragraphs).forEach((el, index) => {
        if (index < readMoreThreshold) {
          visibleContent.appendChild(el.cloneNode(true));
        } else {
          hiddenContent.appendChild(el.cloneNode(true));
        }
      });
      
      return `
        ${visibleContent.innerHTML}
        <details>
          <summary>Read more</summary>
          ${hiddenContent.innerHTML}
        </details>
      `;
    }
  </script>
  
  <div class="whitewind-blog">
    {#if error}
      <div class="error">
        <p>Error loading posts: {error}</p>
      </div>
    {/if}
    
    {#if posts.length === 0 && !loading && !error}
      <div class="no-posts">
        <p>No posts found.</p>
      </div>
    {/if}
    
    {#each posts as post}
      {@const info = parseURI(post.uri)}
      <div class="blog-post">
        <div class="post-header">
          <h2 class="post-title">{post.value.title}</h2>
          <div class="post-meta">
            <span class="post-date">{formatDate(post.value.createdAt)}</span>
            {#if post.value.visibility && post.value.visibility !== 'public'}
              <span class="post-visibility">{post.value.visibility}</span>
            {/if}
          </div>
        </div>
        
        <div class="post-content">
          {@html renderMarkdown(post.value.content)}
        </div>
        
        <div class="post-footer">
          <a href={`https://whtwnd.com/${info.DID}/${info.rkey}`} target="_blank" rel="noopener noreferrer" class="remote-link">
            View on WhiteWind
          </a>
        </div>
      </div>
    {/each}
    
    {#if loading}
      <div class="loading">
        <p>Loading posts...</p>
      </div>
    {/if}
    
    {#if !reachedEnd && !loading}
      <button class="load-more" on:click={loadMore}>
        Load more posts
      </button>
    {/if}
  </div>
  
  <style>
    .whitewind-blog {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 1rem;
    }
    
    .blog-post {
      margin-bottom: 2rem;
      padding: 1.5rem;
      border-radius: 8px;
      background-color: #fff;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    
    .post-header {
      margin-bottom: 1rem;
    }
    
    .post-title {
      margin: 0 0 0.5rem 0;
      font-size: 1.8rem;
      line-height: 1.2;
    }
    
    .post-meta {
      display: flex;
      gap: 1rem;
      font-size: 0.9rem;
      color: #666;
    }
    
    .post-visibility {
      background-color: #f0f0f0;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      font-size: 0.8rem;
    }
    
    .post-content {
      line-height: 1.6;
      margin-bottom: 1.5rem;
    }
    
    .post-content :global(h1),
    .post-content :global(h2),
    .post-content :global(h3),
    .post-content :global(h4),
    .post-content :global(h5),
    .post-content :global(h6) {
      margin-top: 1.5rem;
      margin-bottom: 0.75rem;
    }
    
    .post-content :global(p) {
      margin-bottom: 1rem;
    }
    
    .post-content :global(ul),
    .post-content :global(ol) {
      margin-bottom: 1rem;
      padding-left: 1.5rem;
    }
    
    .post-content :global(li) {
      margin-bottom: 0.5rem;
    }
    
    .post-content :global(img) {
      max-width: 100%;
      height: auto;
      border-radius: 4px;
    }
    
    .post-content :global(blockquote) {
      border-left: 4px solid #ddd;
      padding-left: 1rem;
      margin-left: 0;
      color: #555;
    }
    
    .post-content :global(pre) {
      background-color: #f5f5f5;
      padding: 1rem;
      border-radius: 4px;
      overflow-x: auto;
    }
    
    .post-content :global(code) {
      font-family: monospace;
      background-color: #f5f5f5;
      padding: 0.2rem 0.4rem;
      border-radius: 3px;
      font-size: 0.9em;
    }
    
    .post-content :global(details) {
      background-color: #f9f9f9;
      border-radius: 4px;
      padding: 0.5rem;
      margin-bottom: 1rem;
    }
    
    .post-content :global(summary) {
      cursor: pointer;
      font-weight: 600;
      color: #555;
      padding: 0.5rem;
    }
    
    .post-footer {
      display: flex;
      justify-content: flex-end;
      padding-top: 1rem;
      border-top: 1px solid #eee;
    }
    
    .remote-link {
      text-decoration: none;
      background-color: #f5f5f5;
      color: #333;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      font-size: 0.9rem;
      transition: background-color 0.2s;
    }
    
    .remote-link:hover {
      background-color: #e5e5e5;
    }
    
    .load-more {
      display: block;
      width: 100%;
      padding: 0.75rem;
      background-color: #f5f5f5;
      border: none;
      border-radius: 4px;
      font-size: 1rem;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    
    .load-more:hover {
      background-color: #e5e5e5;
    }
    
    .error {
      padding: 1rem;
      background-color: #fff0f0;
      border-left: 4px solid #ff5555;
      margin-bottom: 1rem;
    }
    
    .loading {
      text-align: center;
      color: #666;
      padding: 1rem;
    }
    
    .no-posts {
      text-align: center;
      color: #666;
      padding: 2rem;
      background-color: #f9f9f9;
      border-radius: 8px;
    }
</style>