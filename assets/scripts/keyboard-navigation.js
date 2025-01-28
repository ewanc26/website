document.addEventListener('DOMContentLoaded', () => {
    const dropdownBtn = document.querySelector('.dropbtn');
    const dropdownContent = document.querySelector('.dropdown-content');
    
    // If dropdown elements exist, initialise dropdown-specific navigation
    if (dropdownBtn && dropdownContent) {
        const focusableElements = dropdownContent.querySelectorAll('a');
        if (focusableElements.length === 0) {
            console.warn('No focusable elements found in the dropdown content!');
        }

        let currentIndex = 0;

        // Show dropdown menu when Tab or Enter is pressed on the dropdown button
        dropdownBtn.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                dropdownContent.style.display = 'block';
                if (focusableElements.length > 0) {
                    focusableElements[currentIndex].focus(); // Focus first element
                }
                event.preventDefault();
            }
        });

        // Handle Tab and Enter keys within the dropdown menu
        dropdownContent.addEventListener('keydown', (event) => {
            switch (event.key) {
                case 'Tab':
                    if (focusableElements.length > 0) {
                        // Handle Tab navigation through the dropdown items
                        if (event.shiftKey) {
                            currentIndex = (currentIndex - 1 + focusableElements.length) % focusableElements.length;
                        } else {
                            currentIndex = (currentIndex + 1) % focusableElements.length;
                        }
                        focusableElements[currentIndex].focus();
                        event.preventDefault();
                    }
                    break;

                case 'Enter':
                    if (focusableElements.length > 0) {
                        dropdownContent.style.display = 'none'; // Close the dropdown on selection
                        dropdownBtn.focus(); // Return focus to the button
                        event.preventDefault();
                    }
                    break;

                default:
                    break;
            }
        });

        // Close dropdown if clicked outside
        document.addEventListener('click', (event) => {
            if (!dropdownBtn.contains(event.target) && !dropdownContent.contains(event.target)) {
                dropdownContent.style.display = 'none';
            }
        });
    }

    // General keyboard navigation (for the entire website)
    const focusableSelectors = 'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])';
    
    // Prevent default handling for Tab navigation
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Tab') {
            // Ensure Tab works for the entire page
            const focusableElements = document.querySelectorAll(focusableSelectors);
            const focusedElement = document.activeElement;

            // Check if the focused element is in the list of focusable elements
            if (focusedElement && focusableElements.length > 0) {
                const currentIndex = Array.from(focusableElements).indexOf(focusedElement);

                // Handle Tab navigation across the whole document
                if (currentIndex === -1) return; // Not focusable

                const nextIndex = (currentIndex + (event.shiftKey ? -1 : 1) + focusableElements.length) % focusableElements.length;
                focusableElements[nextIndex].focus();
                event.preventDefault();
            }
        }

        // You can add custom handling for other keys here if needed (like for accessibility features)
    });

    // Debugging: Check if dropdown menu is hidden on initial load
    console.debug('Initial dropdown state:', dropdownContent ? dropdownContent.style.display : 'not present');
});