import "react-tabulator/lib/styles.css";
import "react-tabulator/css/tabulator.min.css";

// Convert milliseconds to hh:mm:ss.ssss format
const formatDuration = (ms) => {
  console.log("Formatting duration input:", ms, typeof ms); // <-- Add this log
  if (!ms && ms !== 0) return "";
  // Check if ms is actually a number before proceeding
  if (typeof ms !== "number" || isNaN(ms)) {
    console.error("formatDuration received invalid input:", ms);
    return "Invalid Duration"; // Or return '00:00:00.000' or ''
  }
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const secondsPart = (ms / 1000) % 60; // Get seconds including fraction
  const formattedSeconds = secondsPart.toFixed(4).padStart(7, "0"); // 7 = 2 digits + decimal + 4 digits

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}:${formattedSeconds}`;
};

export { formatDuration };

// Convert hh:mm:ss.ssss to milliseconds
export const parseDuration = (durationString) => {
  if (typeof durationString !== 'string' || durationString.trim() === '') {
    console.warn("Parsing empty or invalid duration string, returning 0.");
    return 0; // Or return NaN if you prefer to indicate failure
  }

  // Regex to extract parts even if values are out of typical range
  // This will match any digits for hh, mm, ss, and optional decimal for seconds
  const regex = /^(?:(\d+):)?(\d+):(\d+(?:\.\d{1,4})?)$/;
  const matches = durationString.trim().match(regex);

  if (!matches) {
    console.error(`Invalid duration format: "${durationString}". Expected hh:mm:ss.ssss or mm:ss.ssss`);
    return NaN; // Indicate parsing failure for completely wrong format
  }

  // Extract parts (allow any number, we'll normalize next)
  const hours = parseInt(matches[1] || "0", 10); // Default to 0 if hours part is missing
  let minutes = parseInt(matches[2], 10);
  let seconds = parseFloat(matches[3]);

  if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) {
    console.error(`Failed to parse numeric values from duration: "${durationString}"`);
    return NaN;
  }

  // Normalize by rolling over excess values
  // 1. Seconds rollover to minutes
  const extraMinutesFromSeconds = Math.floor(seconds / 60);
  seconds = seconds % 60; // Keep remainder as seconds (will be 0-59.9999)
  minutes += extraMinutesFromSeconds;

  // 2. Minutes rollover to hours
  const extraHoursFromMinutes = Math.floor(minutes / 60);
  minutes = minutes % 60; // Keep remainder as minutes (will be 0-59)
  const totalHours = hours + extraHoursFromMinutes;

  // Log the adjustment if any rollover occurred
  if (extraMinutesFromSeconds > 0 || extraHoursFromMinutes > 0) {
    console.log(`Adjusted "${durationString}" to "${String(totalHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${seconds.toFixed(4).padStart(7, '0')}"`);
  }

  // Calculate total milliseconds
  const totalMilliseconds = (totalHours * 3600 + minutes * 60 + seconds) * 1000;

  // Round to nearest millisecond to avoid floating point artifacts
  const roundedMilliseconds = Math.round(totalMilliseconds);
  console.log(`Parsed "${durationString}" to ${roundedMilliseconds} milliseconds`);
  return roundedMilliseconds;
};

// Custom editor for duration input
const durationEditor = (cell, onRendered, success, cancel, editorParams) => {
  const input = document.createElement("input");
  input.setAttribute("type", "text");
  input.style.width = "100%";
  input.style.boxSizing = "border-box";

  // Display formatted value (from milliseconds)
  input.value = formatDuration(cell.getValue());

  input.addEventListener('blur', () => {
    const value = input.value.trim();
    try {
      const parsedValue = parseDuration(value);
      if (!isNaN(parsedValue)) {
        success(parsedValue); // Pass the parsed milliseconds
      } else {
        cancel(); // Or revert to previous value
      }
    } catch (error) {
      console.error("Parsing failed in editor:", error);
      cancel();
    }
  });  

  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") input.blur();
  });

  onRendered(() => input.focus());
  return input;
};

export { durationEditor };
