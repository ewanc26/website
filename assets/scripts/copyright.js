document.addEventListener("DOMContentLoaded", function () {
    console.debug("Initialising copyright year update...");
  
    function updateCopyrightYear() {
      const currentYear = new Date().getFullYear();
      const copyrightElement = document.getElementById("copyright-year");
  
      if (copyrightElement) {
        copyrightElement.textContent = currentYear;
        console.debug(`Copyright year updated to ${currentYear}`);
      } else {
        console.warn("Copyright year element not found.");
      }
    }
  
    // Update the copyright year on page load
    updateCopyrightYear();
  });  