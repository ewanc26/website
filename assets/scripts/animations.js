/**
 * Animation Toggle System for Ewan's Corner
 * Allows users to enable/disable animations site-wide
 */

document.addEventListener("DOMContentLoaded", function() {
  // Check if animations are enabled (default to true if not set)
  const animationsEnabled = localStorage.getItem("animations-enabled") !== "false";
  
  // Apply animation state to body
  if (animationsEnabled) {
    document.body.classList.add("animations-enabled");
  } else {
    document.body.classList.remove("animations-enabled");
  }
  
  // Create animation toggle button
  const animationToggle = document.createElement("button");
  animationToggle.id = "animation-toggle";
  animationToggle.className = "settings-button";
  animationToggle.textContent = animationsEnabled ? "Animations: On" : "Animations: Off";
  animationToggle.setAttribute("aria-label", animationsEnabled ? "Turn animations off" : "Turn animations on");
  
  // Add toggle button after theme toggle
  const themeToggle = document.getElementById("theme-toggle");
  if (themeToggle && themeToggle.parentNode) {
    themeToggle.parentNode.insertBefore(animationToggle, themeToggle.nextSibling);
  }
  
  // Add some spacing between buttons
  const spacer = document.createElement("div");
  spacer.style.height = "10px";
  if (themeToggle && themeToggle.parentNode) {
    themeToggle.parentNode.insertBefore(spacer, animationToggle);
  }
  
  // Toggle animation state when button is clicked
  animationToggle.addEventListener("click", function() {
    const currentState = document.body.classList.contains("animations-enabled");
    const newState = !currentState;
    
    if (newState) {
      document.body.classList.add("animations-enabled");
      animationToggle.textContent = "Animations: On";
      animationToggle.setAttribute("aria-label", "Turn animations off");
    } else {
      document.body.classList.remove("animations-enabled");
      animationToggle.textContent = "Animations: Off";
      animationToggle.setAttribute("aria-label", "Turn animations on");
    }
    
    // Save preference to localStorage
    localStorage.setItem("animations-enabled", newState);
    
    // Apply animations to existing elements if enabled
    if (newState) {
      applyAnimationsToElements();
    }
  });
  
  // Apply initial animations if enabled
  if (animationsEnabled) {
    applyAnimationsToElements();
  }
});

/**
 * Apply animation classes to various elements on the page
 */
function applyAnimationsToElements() {
  // Add animation classes to profile elements with staggered delay
  const profilePicture = document.querySelector('profile-picture');
  const profileUsername = document.querySelector('profile-username');
  const profileDescription = document.querySelector('profile-description');
  
  if (profilePicture) {
    profilePicture.classList.add('animate-fade-in');
  }
  
  if (profileUsername) {
    profileUsername.classList.add('animate-slide-up');
    profileUsername.style.animationDelay = '0.2s';
  }
  
  if (profileDescription) {
    profileDescription.classList.add('animate-slide-up');
    profileDescription.style.animationDelay = '0.3s';
  }
  
  // Add animations to navigation links with staggered delay
  const navLinks = document.querySelectorAll('.links a');
  navLinks.forEach((link, index) => {
    link.classList.add('animate-slide-right');
    link.style.animationDelay = `${0.2 + (index * 0.1)}s`;
  });
  
  // Add subtle animation to posts
  const posts = document.querySelectorAll('.post');
  posts.forEach((post, index) => {
    post.classList.add('animate-fade-in');
    post.style.animationDelay = `${0.2 + (index * 0.1)}s`;
  });
}