document.addEventListener('DOMContentLoaded', function () {
    // Function to display the current date and time
    function displayDate_Time() {
      // Create a new Date object to get the current date and time
      var date = new Date();
  
      // Extract hours, minutes, and seconds from the Date object
      var hours = date.getHours();
      var minutes = date.getMinutes();
      var seconds = date.getSeconds();
  
      // Add leading zeros to single-digit hours, minutes, and seconds
      hours = (hours < 10 ? "0" : "") + hours;
      minutes = (minutes < 10 ? "0" : "") + minutes;
      seconds = (seconds < 10 ? "0" : "") + seconds;
  
      // Create a time string in the format "HH:MM:SS"
      var time = hours + ":" + minutes + ":" + seconds;
    
      // Get the current date in a formatted string
      var current_date = date.toLocaleDateString();
  
      // Display the formatted time in the "clock" element
      document.getElementById("clock").innerHTML = time;

      // Display the formmated date in the "date" element
      document.getElementById("date").innerHTML = current_date;
    }
  
    // Call the displayDate_Time function every second (1000 milliseconds)
    setInterval(displayDate_Time, 1000);
  });