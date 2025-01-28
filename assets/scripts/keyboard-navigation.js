document.addEventListener('DOMContentLoaded', () => {
    const dropdownBtn = document.querySelector('.dropbtn');
    const dropdownContent = document.querySelector('.dropdown-content');
    
    if (!dropdownBtn) {
        console.error('Dropdown button (.dropbtn) not found!');
    }
    if (!dropdownContent) {
        console.error('Dropdown content (.dropdown-content) not found!');
    }

    const focusableElements = dropdownContent.querySelectorAll('a');
    
    if (focusableElements.length === 0) {
        console.warn('No focusable elements found in the dropdown content!');
    }

    let currentIndex = 0;

    // Show dropdown menu when Tab or Enter is pressed on the dropdown button
    dropdownBtn.addEventListener('keydown', (event) => {
        console.log('Dropdown button keydown:', event.key);

        if (event.key === 'Enter') {
            console.log('Enter pressed. Showing dropdown menu.');
            dropdownContent.style.display = 'block';
            focusableElements[currentIndex].focus();  // Focus first element
            event.preventDefault();
        }
    });

    // Handle Tab and Enter keys within the dropdown menu
    dropdownContent.addEventListener('keydown', (event) => {
        console.log('Dropdown content keydown:', event.key);

        switch (event.key) {
            case 'Tab':
                // Handle Tab navigation through the dropdown items
                if (event.shiftKey) {
                    // Shift + Tab (move backward)
                    currentIndex = (currentIndex - 1 + focusableElements.length) % focusableElements.length;
                    console.log('Shift + Tab pressed. Focus element:', focusableElements[currentIndex]);
                } else {
                    // Tab (move forward)
                    currentIndex = (currentIndex + 1) % focusableElements.length;
                    console.log('Tab pressed. Focus element:', focusableElements[currentIndex]);
                }
                focusableElements[currentIndex].focus();
                event.preventDefault();
                break;

            case 'Enter':
                // Handle Enter key to select an item
                console.log('Enter pressed. Selecting element:', focusableElements[currentIndex]);
                dropdownContent.style.display = 'none'; // Close the dropdown on selection
                dropdownBtn.focus(); // Return focus to the button
                event.preventDefault();
                break;

            default:
                console.log('Unhandled key:', event.key);
                break;
        }
    });

    document.addEventListener('click', (event) => {
        if (!dropdownBtn.contains(event.target) && !dropdownContent.contains(event.target)) {
            console.log('Click outside detected. Closing dropdown.');
            dropdownContent.style.display = 'none';
        }
    });

    // Debugging: Check if dropdown menu is hidden on initial load
    console.log('Initial dropdown state:', dropdownContent.style.display);
});