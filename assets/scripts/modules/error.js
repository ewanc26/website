document.addEventListener("DOMContentLoaded", function () {
  console.debug("Page loaded. Starting error page setup...");

  function setErrorPage(errorCode, errorMessage) {
    console.debug(`Setting up error page for code: ${errorCode}, message: ${errorMessage}`);
    
    const errorCodeElement = document.getElementById("error_code");
    if (errorCodeElement) {
      errorCodeElement.innerText = `Error ${errorCode}`;
    } else {
      console.warn("Error code element not found.");
    }

    const errorMessageElement = document.getElementById("error_message");
    if (errorMessageElement) {
      errorMessageElement.innerText = errorMessage;
    } else {
      console.warn("Error message element not found.");
    }

    document.title = `Error ${errorCode} - Something went wrong | Ewan's Corner`;

    const backHomeLink = document.getElementById("back_home_link");
    if (backHomeLink) {
      backHomeLink.innerText = errorCode === 404 ? "Here is a link to go back home" : "Return to safety";
    } else {
      console.warn("Back home link element not found.");
    }
  }

  function handleError() {
    console.debug("Handling error...");
    
    const urlParams = new URLSearchParams(window.location.search);
    const errorCode = urlParams.get("error") || 500;
    const errorMessage = urlParams.get("message") || "An unexpected error occurred. Please try again later.";

    console.debug(`Error code: ${errorCode}, Error message: ${errorMessage}`);
    
    switch (errorCode) {
      case "400":
        setErrorPage(400, "Bad Request: The server could not understand your request. Please check the URL or try again.");
        break;
      case "401":
        setErrorPage(401, "Unauthorized: You need to log in to access this page.");
        break;
      case "403":
        setErrorPage(403, "Forbidden: You do not have permission to access this page.");
        break;
      case "404":
        setErrorPage(404, "Oops! The page you requested could not be found. It might be a broken link or a typo.");
        break;
      case "500":
        setErrorPage(500, "Internal Server Error: Something went wrong on our end. Please try again later.");
        break;
      case "502":
        setErrorPage(502, "Bad Gateway: The server received an invalid response from the upstream server. Please try again later.");
        break;
      case "503":
        setErrorPage(503, "Service Unavailable: The server is currently unavailable. Please try again later.");
        break;
      case "504":
        setErrorPage(504, "Gateway Timeout: The server took too long to respond. Please try again later.");
        break;
      default:
        setErrorPage(errorCode, errorMessage);
        break;
    }
  }

  handleError();
});