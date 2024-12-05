// footer.js

// Function to load and inject the footer HTML
function injectFooter() {
    fetch('/modules/footer.html')
      .then(response => response.text()) // Read the HTML content of footer.html
      .then(data => {
        document.body.insertAdjacentHTML('beforeend', data); // Inject the footer HTML into the body
        updateCopyrightYear(); // Update the copyright year dynamically
      })
      .catch(error => console.error('Error loading footer:', error));
  }
  
  // Function to update the copyright year
  function updateCopyrightYear() {
    const currentYear = new Date().getFullYear(); // Get the current year
    const copyrightYearElement = document.getElementById('copyright-year'); // Get the span with ID "copyright-year"
    if (copyrightYearElement) {
      copyrightYearElement.textContent = currentYear; // Update the year in the footer
    }
  }
  
  // Call the function to inject the footer when the page loads
  document.addEventListener('DOMContentLoaded', injectFooter);
  