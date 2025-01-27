document.addEventListener('DOMContentLoaded', function () {
    console.debug("Starting header injection...");
  
    function injectHeader() {
      console.debug("Fetching header HTML...");
      
      fetch('/modules/header.html')
        .then(response => {
          if (!response.ok) {
            throw new Error(`Failed to load header: ${response.statusText}`);
          }
          console.debug("Header HTML fetched successfully.");
          return response.text();
        })
        .then(data => {
          document.body.insertAdjacentHTML('afterbegin', data);
          console.debug("Header injected successfully.");
        })
        .catch(error => console.error('Header injection failed:', error));
    }
  
    injectHeader();
  });  