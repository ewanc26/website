document.addEventListener("DOMContentLoaded", function () {
  // This function sets the error code, message, and title dynamically
  function setErrorPage(errorCode, errorMessage) {
    // Inject the error code (e.g., "404 Error")
    document.getElementById("error_code").innerText = `Error ${errorCode}`;

    // Inject the error message (e.g., a description of the error)
    document.getElementById("error_message").innerText = errorMessage;

    // Set the page title dynamically based on the error code
    document.title = `Error ${errorCode} - Something went wrong | Ewan's Corner`;

    // Customize the "Go back to Home" link based on the error
    const backHomeLink = document.getElementById("back_home_link");
    if (errorCode === 404) {
      backHomeLink.innerText = "Here is a link to go back home";
    } else {
      backHomeLink.innerText = "Return to safety";
    }
  }

  // Function to fetch the error code and message dynamically
  function handleError() {
    // Fetch the error code from the URL or other external source
    const urlParams = new URLSearchParams(window.location.search);
    const errorCode = urlParams.get("error") || 500; // Default to 500 if no error code is provided
    const errorMessage =
      urlParams.get("message") ||
      "An unexpected error occurred. Please try again later.";

    // Set the error page dynamically based on the error code and message
    switch (errorCode) {
      case "400":
        setErrorPage(
          400,
          "Bad Request: The server could not understand your request. Please check the URL or try again."
        );
        break;
      case "401":
        setErrorPage(
          401,
          "Unauthorized: You need to log in to access this page."
        );
        break;
      case "403":
        setErrorPage(
          403,
          "Forbidden: You do not have permission to access this page."
        );
        break;
      case "404":
        setErrorPage(
          404,
          "Oops! The page you requested could not be found. It might be a broken link or a typo."
        );
        break;
      case "500":
        setErrorPage(
          500,
          "Internal Server Error: Something went wrong on our end. Please try again later."
        );
        break;
      case "502":
        setErrorPage(
          502,
          "Bad Gateway: The server received an invalid response from the upstream server. Please try again later."
        );
        break;
      case "503":
        setErrorPage(
          503,
          "Service Unavailable: The server is currently unavailable. Please try again later."
        );
        break;
      case "504":
        setErrorPage(
          504,
          "Gateway Timeout: The server took too long to respond. Please try again later."
        );
        break;
      default:
        setErrorPage(errorCode, errorMessage);
        break;
    }
  }

  // Call the handleError function when the page loads
  handleError();
});
