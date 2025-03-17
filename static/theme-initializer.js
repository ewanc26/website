(function() {
    // Check for saved theme preference (dark/light)
    const savedTheme = localStorage.getItem('theme');
    
    // Apply saved theme or detect system preference
    if (savedTheme) {
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    } else {
      // Check system preference
      const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', prefersDarkMode);
    }
    
    // Apply saved color theme if exists
    const savedColorTheme = localStorage.getItem('colorTheme');
    if (savedColorTheme) {
      document.documentElement.classList.add(savedColorTheme);
    }
})();