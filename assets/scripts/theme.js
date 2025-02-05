document.addEventListener("DOMContentLoaded", function () {
  const themeToggleButton = document.getElementById("theme-toggle");
  // Reordered themes list by colour spectrum – "default" is green.
  const themes = ["red", "orange", "yellow", "default", "blue", "indigo", "violet", "monochrome"];
  let currentTheme = localStorage.getItem("theme") || "default";

  // Apply saved theme and update button text
  document.documentElement.className = currentTheme;
  themeToggleButton.textContent = `Theme: ${currentTheme}`;
  themeToggleButton.setAttribute("aria-label", `Switch theme (Current: ${currentTheme})`);

  // Update favicon and Open Graph image based on theme
  updateFavicon(currentTheme);
  updateOgImage(currentTheme);

  themeToggleButton.addEventListener("click", function () {
    const nextTheme = themes[(themes.indexOf(currentTheme) + 1) % themes.length];

    // Apply the new theme
    document.documentElement.className = nextTheme;
    localStorage.setItem("theme", nextTheme);
    currentTheme = nextTheme;

    // Update button text and accessibility label
    themeToggleButton.textContent = `Theme: ${nextTheme}`;
    themeToggleButton.setAttribute("aria-label", `Switch theme (Current: ${nextTheme})`);

    // Update the favicon and Open Graph image dynamically
    updateFavicon(nextTheme);
    updateOgImage(nextTheme);
  });

  function updateFavicon(theme) {
    const faviconSrc = "/assets/images/favicon/favicon-32x32.png"; // Use a PNG version for canvas manipulation
    // Updated hue mapping with reordered themes:
    const hueValues = {
      default: 0, // Green
      red: 120,
      orange: 30,
      yellow: 60,
      blue: 240,
      indigo: 270,
      violet: 330,
      monochrome: null // Special case for grayscale
    };

    const hueRotate = hueValues[theme];

    const img = new Image();
    img.crossOrigin = "anonymous"; // Ensures it can be used in a canvas
    img.src = faviconSrc;

    img.onload = function () {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw the original favicon first
      ctx.drawImage(img, 0, 0);

      if (hueRotate !== null) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        applyHueRotation(imageData, hueRotate);
        ctx.putImageData(imageData, 0, 0);
      } else {
        // For monochrome, apply a grayscale filter
        ctx.filter = "grayscale(100%)";
        ctx.drawImage(img, 0, 0);
      }

      const newFavicon = canvas.toDataURL("image/png");
      replaceFavicon(newFavicon);
    };
  }

  function updateOgImage(theme) {
    const ogImageSrc = "/assets/images/embed-preview.png"; // Use a single source for the Open Graph image

    const hueValues = {
      default: 0, // Green
      red: 120,
      orange: 30,
      yellow: 60,
      blue: 240,
      indigo: 270,
      violet: 330,
      monochrome: null // Special case for grayscale
    };

    const hueRotate = hueValues[theme];

    const img = new Image();
    img.crossOrigin = "anonymous"; // Ensures it can be used in a canvas
    img.src = ogImageSrc;

    img.onload = function () {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = img.width;
      canvas.height = img.height;

      ctx.drawImage(img, 0, 0);

      if (hueRotate !== null) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        applyHueRotation(imageData, hueRotate);
        ctx.putImageData(imageData, 0, 0);
      } else {
        ctx.filter = "grayscale(100%)";
        ctx.drawImage(img, 0, 0);
      }

      const newOgImage = canvas.toDataURL("image/png");
      replaceOgImage(newOgImage);
    };
  }

  // Functions remain unchanged
  function applyHueRotation(imageData, degrees) {
    const data = imageData.data;
    const angle = (degrees * Math.PI) / 180;
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);

    for (let i = 0; i < data.length; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];

      // Apply the hue rotation matrix to each pixel.
      data[i] = r * (cosA + (1.0 - cosA) / 3) +
                g * (1.0 / 3 - cosA / 3 - sinA / Math.sqrt(3)) +
                b * (1.0 / 3 - cosA / 3 + sinA / Math.sqrt(3));
      data[i + 1] = r * (1.0 / 3 - cosA / 3 + sinA / Math.sqrt(3)) +
                    g * (cosA + (1.0 - cosA) / 3) +
                    b * (1.0 / 3 - cosA / 3 - sinA / Math.sqrt(3));
      data[i + 2] = r * (1.0 / 3 - cosA / 3 - sinA / Math.sqrt(3)) +
                    g * (1.0 / 3 - cosA / 3 + sinA / Math.sqrt(3)) +
                    b * (cosA + (1.0 - cosA) / 3);
    }
  }

  function replaceFavicon(newHref) {
    let link = document.querySelector("link[rel='icon']") || document.createElement("link");
    link.rel = "icon";
    link.href = newHref;
    document.head.appendChild(link);
  }

  function replaceOgImage(newHref) {
    let ogImageTag = document.querySelector('meta[property="og:image"]');

    if (ogImageTag) {
      ogImageTag.setAttribute("content", newHref);
    } else {
      ogImageTag = document.createElement("meta");
      ogImageTag.setAttribute("property", "og:image");
      ogImageTag.setAttribute("content", newHref);
      document.head.appendChild(ogImageTag);
    }
  }
});