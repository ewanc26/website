document.addEventListener("DOMContentLoaded", function () {
  // Base32 character set and TID functions
  const S32_CHAR = "234567abcdefghijklmnopqrstuvwxyz";
  const TID_RE =
    /^([234567abcdefghij][234567abcdefghijklmnopqrstuvwxyz]{10})([234567abcdefghijklmnopqrstuvwxyz]{2})?$/;

  const s32encode = (i) => {
    let s = "";
    while (i) {
      const c = i % 32;
      i = Math.floor(i / 32);
      s = S32_CHAR.charAt(c) + s;
    }
    return s;
  };

  const s32decode = (s) => {
    let i = 0;
    for (let idx = 0, len = s.length; idx < len; idx++) {
      i = i * 32 + S32_CHAR.indexOf(s[idx]);
    }
    return i;
  };

  const to_tid = (timestamp) => {
    return s32encode(timestamp).padStart(11, "2") + "22";
  };

  // Function to detect if the user is on a mobile device
  function isMobileDevice() {
    return (
      /Mobi|Android|iPhone/i.test(navigator.userAgent) ||
      window.innerWidth <= 768
    );
  }

  if (!isMobileDevice()) {
    // Function to display the current date and time
    function displayDate_Time() {
      // Create a new Date object to get the current date and time
      const date = new Date();

      // Extract hours, minutes, and seconds from the Date object
      let hours = date.getHours();
      let minutes = date.getMinutes();
      let seconds = date.getSeconds();

      // Add leading zeros to single-digit hours, minutes, and seconds
      hours = (hours < 10 ? "0" : "") + hours;
      minutes = (minutes < 10 ? "0" : "") + minutes;
      seconds = (seconds < 10 ? "0" : "") + seconds;

      // Create a time string in the format "HH:MM:SS"
      const time = hours + ":" + minutes + ":" + seconds;

      // Get the current date in a formatted string
      const current_date = date.toLocaleDateString();

      // Display the formatted time in the "clock" element
      document.getElementById("clock").innerHTML = time;

      // Display the formatted date in the "date" element
      document.getElementById("date").innerHTML = current_date;

      // Generate the rkey timestamp using `to_tid`
      const timestamp = Math.floor(date.getTime() / 1000); // Convert milliseconds to seconds
      const rkey = to_tid(timestamp);

      // Display the rkey timestamp in the "rkey" element
      document.getElementById("rkey").innerHTML = rkey;
    }

    // Call the displayDate_Time function every second (1000 milliseconds)
    setInterval(displayDate_Time, 1000);
  }
});
