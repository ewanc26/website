document.addEventListener("DOMContentLoaded", function() {
    // Set up an observer to watch for new posts being added to the DOM
    const postContainer = document.querySelector('post-container');
    
    if (!postContainer) {
      console.warn("Post container not found");
      return;
    }
    
    // Function to add transition classes to posts
    function setupPostTransitions() {
      // Get all posts that don't have the transition class yet
      const posts = document.querySelectorAll('.post:not(.has-transition)');
      
      // Check if animations are enabled
      const animationsEnabled = localStorage.getItem("animations-enabled") !== "false";
      const staggerDelay = animationsEnabled ? 100 : 0; // No stagger if animations disabled
      
      posts.forEach((post, index) => {
        // Mark this post as having transitions
        post.classList.add('has-transition', 'post-transition');
        
        // Set initial state (invisible)
        post.style.opacity = '0';
        post.style.transform = 'translateY(20px)';
        
        // Stagger the appearance of posts
        setTimeout(() => {
          post.style.opacity = '1';
          post.style.transform = 'translateY(0)';
        }, staggerDelay * index); // Stagger each post based on animation preference
      });
    }
    
    // Initial setup for any posts that are already in the DOM
    setupPostTransitions();
    
    // Watch for changes in the post container (new posts being added)
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length > 0) {
          setupPostTransitions();
        }
      });
    });
    
    // Start observing the post container for added posts
    observer.observe(postContainer, { childList: true, subtree: true });
    
    // Handle page navigation (when the user navigates between pages)
    window.addEventListener('hashchange', function() {
      // Fade out all existing posts
      const posts = document.querySelectorAll('.post');
      posts.forEach((post, index) => {
        post.style.opacity = '0';
        post.style.transform = 'translateY(20px)';
      });
      
      // After posts fade out, new ones will be loaded and fade in due to the observer
      setTimeout(setupPostTransitions, 400); // Wait for fade out to complete
    });
  
    // Handle theme changes to reapply transitions
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', function() {
        // Brief delay to allow theme change to process
        setTimeout(setupPostTransitions, 100);
      });
    }
});