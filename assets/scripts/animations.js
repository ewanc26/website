document.addEventListener('DOMContentLoaded', function() {
  // Initialize all animations
  initializeSidebarAnimations();
  initializeScrollAnimations();
  initializeHoverEffects();
  initializePageTransitions();

  // Sidebar animations - fade in elements sequentially
  function initializeSidebarAnimations() {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;

    const profilePicture = document.querySelector('profile-picture');
    const profileUsername = document.querySelector('profile-username');
    const profileDescription = document.querySelector('profile-description');
    const navLinks = document.querySelectorAll('.links a');
    const credit = document.querySelector('.credit');
    const themeToggle = document.getElementById('theme-toggle');

    // Set initial opacity to 0
    [profilePicture, profileUsername, profileDescription, credit, themeToggle].forEach(el => {
      if (el) el.style.opacity = '0';
    });

    navLinks.forEach(link => {
      if (link) link.style.opacity = '0';
      if (link) link.style.transform = 'translateX(-20px)';
    });

    // Animate elements sequentially
    if (profilePicture) {
      setTimeout(() => {
        profilePicture.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        profilePicture.style.opacity = '1';
        profilePicture.style.transform = 'scale(1)';
      }, 100);
    }

    if (profileUsername) {
      setTimeout(() => {
        profileUsername.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        profileUsername.style.opacity = '1';
      }, 300);
    }

    if (profileDescription) {
      setTimeout(() => {
        profileDescription.style.transition = 'opacity 0.8s ease';
        profileDescription.style.opacity = '1';
      }, 500);
    }

    // Animate nav links with a staggered delay
    navLinks.forEach((link, index) => {
      setTimeout(() => {
        link.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        link.style.opacity = '1';
        link.style.transform = 'translateX(0)';
      }, 700 + (index * 100));
    });

    // Animate credit and theme toggle
    if (credit) {
      setTimeout(() => {
        credit.style.transition = 'opacity 0.8s ease';
        credit.style.opacity = '0.7'; // Match the original opacity
      }, 1200);
    }

    if (themeToggle) {
      setTimeout(() => {
        themeToggle.style.transition = 'opacity 0.8s ease, transform 0.5s ease';
        themeToggle.style.opacity = '1';
      }, 1400);
    }
  }

  // Smooth scrolling for anchor links
  function initializeScrollAnimations() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href').substring(1);
        if (targetId) {
          const targetElement = document.getElementById(targetId);
          if (targetElement) {
            e.preventDefault();
            window.scrollTo({
              top: targetElement.offsetTop,
              behavior: 'smooth'
            });
          }
        }
      });
    });
  }

  // Enhanced hover effects
  function initializeHoverEffects() {
    // Profile picture hover effect
    const profilePicture = document.querySelector('profile-picture img');
    if (profilePicture) {
      profilePicture.addEventListener('mouseenter', () => {
        profilePicture.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';
        profilePicture.style.transform = 'scale(1.05)';
        profilePicture.style.boxShadow = `0 0 15px 5px var(--link-color)`;
      });

      profilePicture.addEventListener('mouseleave', () => {
        profilePicture.style.transform = 'scale(1)';
        profilePicture.style.boxShadow = `0 0 10px 3px var(--link-color)`;
      });
    }

    // Theme toggle button pulse effect
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        themeToggle.style.transition = 'transform 0.3s ease';
        themeToggle.style.transform = 'scale(1.1)';
        setTimeout(() => {
          themeToggle.style.transform = 'scale(1)';
        }, 300);
      });
    }
  }

  // Page transitions
  function initializePageTransitions() {
    // Handle hash changes for smooth transitions between sections
    window.addEventListener('hashchange', function() {
      // Add a subtle fade effect to the main content
      const mainContent = document.querySelector('main');
      if (mainContent) {
        mainContent.style.opacity = '0.8';
        mainContent.style.transition = 'opacity 0.3s ease';
        
        setTimeout(() => {
          mainContent.style.opacity = '1';
        }, 300);
      }
    });
  }
});