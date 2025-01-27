document.addEventListener("DOMContentLoaded", function () {
  console.debug("Initialising clock and date script...");

  function isMobileDevice() {
    const isMobile = /Mobi|Android|iPhone/i.test(navigator.userAgent) || window.innerWidth <= 768;
    console.debug(`Is mobile device: ${isMobile}`);
    return isMobile;
  }

  if (!isMobileDevice()) {
    console.debug("Device is not mobile. Enabling clock and date display...");

    function displayDate_Time() {
      const date = new Date();

      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      const time = `${hours}:${minutes}:${seconds}`;
      const currentDate = date.toLocaleDateString();

      const clockElement = document.getElementById("clock");
      const dateElement = document.getElementById("date");

      if (clockElement) {
        clockElement.innerHTML = time;
      } else {
        console.warn("Clock element not found.");
      }

      if (dateElement) {
        dateElement.innerHTML = currentDate;
      } else {
        console.warn("Date element not found.");
      }
    }

    setInterval(displayDate_Time, 1000);
    console.debug("Clock and date update interval set.");
  } else {
    console.info("Clock and date display disabled on mobile devices.");
  }
});
