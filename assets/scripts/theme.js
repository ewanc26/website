document.addEventListener("DOMContentLoaded", function () {
    const themeToggleButton = document.getElementById("theme-toggle");
    const currentTheme = localStorage.getItem("theme") || "default";

    // Apply the saved theme on page load
    document.documentElement.className = currentTheme;

    themeToggleButton.addEventListener("click", function () {
      let newTheme;
      switch (document.documentElement.className) {
        case "default":
          newTheme = "red";
          break;
        case "red":
          newTheme = "blue";
          break;
        case "blue":
          newTheme = "yellow";
          break;
        case "yellow":
          newTheme = "monochrome";
          break;
        default:
          newTheme = "default";
      }
      document.documentElement.className = newTheme;
      localStorage.setItem("theme", newTheme);
    });
  });