// /assets/scripts/modules/header.js

document.addEventListener('DOMContentLoaded', function () {
    // Function to load and inject the header HTML
    function injectHeader() {
        fetch('/modules/header.html')
            .then(response => response.text())  // Get the content of header.html
            .then(data => {
                document.body.insertAdjacentHTML('afterbegin', data);  // Insert the header content at the start of the body
            })
            .catch(error => console.error('Error loading header:', error));
    }

    // Call injectHeader to add the header when the page loads
    injectHeader();
});
