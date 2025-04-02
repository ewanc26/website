document.addEventListener('DOMContentLoaded', function() {
  // Initialize page transitions
  initializePageTransitions();
  
  function initializePageTransitions() {
    // Add page transition classes to main content sections
    const mainContent = document.querySelector('main');
    if (mainContent) {
      mainContent.classList.add('page-transition');
    }
    
    // Handle anchor link clicks for smooth transitions
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href').substring(1);
        if (!targetId) return; // Skip if it's just '#'
        
        const targetElement = document.getElementById(targetId);
        if (!targetElement) return; // Skip if target doesn't exist
        
        e.preventDefault();
        
        // Create temporary overlay for transition effect
        const overlay = document.createElement('div');
        overlay.classList.add('page-transition-overlay');
        document.body.appendChild(overlay);
        
        // Activate the overlay
        setTimeout(() => {
          overlay.classList.add('active');
        }, 10);
        
        // After a short delay, scroll to the target and remove overlay
        setTimeout(() => {
          window.scrollTo({
            top: targetElement.offsetTop,
            behavior: 'smooth'
          });
          
          // Remove the overlay after scrolling
          setTimeout(() => {
            overlay.classList.remove('active');
            setTimeout(() => {
              overlay.remove();
            }, 300);
          }, 500);
        }, 300);
      });
    });
    
    // Apply staggered animations to list items
    const applyStaggeredAnimations = () => {
      const staggerItems = document.querySelectorAll('.links a');
      staggerItems.forEach((item, index) => {
        item.classList.add('stagger-item');
        
        // Stagger the animations
        setTimeout(() => {
          item.classList.add('animate');
        }, 100 * index);
      });
    };
    
    // Apply staggered animations on page load
    applyStaggeredAnimations();
    
    // Handle hash changes for section transitions
    window.addEventListener('hashchange', function() {
      const targetId = window.location.hash.substring(1);
      if (!targetId) return;
      
      const targetElement = document.getElementById(targetId);
      if (!targetElement) return;
      
      // Add transition class to target section
      targetElement.classList.add('section-transition', 'active');
      
      // Remove the class after animation completes
      setTimeout(() => {
        targetElement.classList.remove('active');
        
        // Remove the class completely after transition
        setTimeout(() => {
          targetElement.classList.remove('section-transition');
        }, 500);
      }, 500);
    });
  }
});