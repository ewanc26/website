document.addEventListener("DOMContentLoaded", function () {
  const themeToggleButton = document.getElementById("theme-toggle");
  const themes = ["default", "red", "blue", "yellow", "monochrome"];
  let currentTheme = localStorage.getItem("theme") || "default";

  // Apply saved theme and update button text
  document.documentElement.className = currentTheme;
  themeToggleButton.textContent = `Theme: ${currentTheme}`;
  themeToggleButton.setAttribute("aria-label", `Switch theme (Current: ${currentTheme})`);

  themeToggleButton.addEventListener("click", function () {
    const nextTheme = themes[(themes.indexOf(currentTheme) + 1) % themes.length];

    // Apply the new theme
    document.documentElement.className = nextTheme;
    localStorage.setItem("theme", nextTheme);
    currentTheme = nextTheme;

    // Update button text and accessibility label
    themeToggleButton.textContent = `Theme: ${nextTheme}`;
    themeToggleButton.setAttribute("aria-label", `Switch theme (Current: ${nextTheme})`);
  });
});