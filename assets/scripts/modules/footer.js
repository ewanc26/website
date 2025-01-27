// Function to load and inject the footer HTML
function injectFooter() {
  console.debug("Injecting footer...");
  
  fetch('/modules/footer.html')
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to load footer: ${response.statusText}`);
      }
      console.debug("Footer HTML fetched successfully.");
      return response.text();
    })
    .then(data => {
      document.body.insertAdjacentHTML('beforeend', data);
      console.debug("Footer injected successfully.");
      updateCopyrightYear();
    })
    .catch(error => console.error('Footer injection failed:', error));
}

// Function to update the copyright year
function updateCopyrightYear() {
  console.debug("Updating copyright year...");
  
  const currentYear = new Date().getFullYear();
  const copyrightYearElement = document.getElementById('copyright-year');
  if (copyrightYearElement) {
    copyrightYearElement.textContent = currentYear;
    console.debug(`Copyright year updated to ${currentYear}.`);
  } else {
    console.warn("Copyright year element not found.");
  }
}

document.addEventListener('DOMContentLoaded', injectFooter);