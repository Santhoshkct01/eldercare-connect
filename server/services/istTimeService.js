/**
 * Utility functions for unambiguous Indian Standard Time (IST) formatting,
 * 12-hour AM/PM conversion, and validation.
 * Timezone: Asia/Kolkata (UTC+05:30)
 */

/**
 * Get current date and time formatted in Indian Standard Time (Asia/Kolkata).
 * @param {Date} [dateObj=new Date()]
 * @returns {{ dateStr: string, timeStr: string, hours: string, minutes: string, fullIST: string }}
 */
function getISTDateTime(dateObj = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(dateObj);
  const map = {};
  for (const p of parts) {
    map[p.type] = p.value;
  }

  // Handle case where midnight in 24h might format as '24' in some node versions
  let hr = map.hour;
  if (hr === '24') hr = '00';

  const dateStr = `${map.year}-${map.month}-${map.day}`;
  const timeStr = `${hr}:${map.minute}`;

  return {
    dateStr,
    timeStr,
    hours: hr,
    minutes: map.minute,
    fullIST: `${dateStr} ${timeStr}:${map.second}`,
  };
}

/**
 * Converts 12-hour AM/PM format (e.g. "10:00 AM", "08:30 PM", "12:00 AM", "12:00 PM")
 * to standard 24-hour HH:mm (e.g. "10:00", "20:30", "00:00", "12:00").
 * @param {string} time12
 * @returns {string} HH:mm
 */
function convert12to24(time12) {
  if (!time12 || typeof time12 !== 'string') return '08:00';
  const clean = time12.trim().toUpperCase();

  // If already in 24h HH:mm format without AM/PM
  const match24 = clean.match(/^([01]?[0-9]|2[0-3]):([0-5][0-9])$/);
  if (match24) {
    const h = match24[1].padStart(2, '0');
    const m = match24[2];
    return `${h}:${m}`;
  }

  const match12 = clean.match(/^([0]?[1-9]|1[0-2]):([0-5][0-9])\s*(AM|PM)$/);
  if (!match12) {
    // Fallback safe normalization
    return '08:00';
  }

  let hour = parseInt(match12[1], 10);
  const minute = match12[2];
  const period = match12[3];

  if (period === 'PM' && hour !== 12) {
    hour += 12;
  } else if (period === 'AM' && hour === 12) {
    hour = 0;
  }

  return `${String(hour).padStart(2, '0')}:${minute}`;
}

/**
 * Converts standard 24-hour HH:mm (e.g. "10:00", "22:04", "08:00", "00:00")
 * to 12-hour AM/PM (e.g. "10:00 AM", "10:04 PM", "08:00 AM", "12:00 AM").
 * Maintains strict backward compatibility so "22:04" never becomes "10:04 AM".
 * @param {string} time24
 * @returns {string}
 */
function convert24to12(time24) {
  if (!time24 || typeof time24 !== 'string') return '08:00 AM';
  const clean = time24.trim().toUpperCase();

  // If already formatted with AM/PM
  if (clean.includes('AM') || clean.includes('PM')) {
    return clean;
  }

  const parts = clean.split(':');
  if (parts.length < 2) return '08:00 AM';

  let hour = parseInt(parts[0], 10);
  const minute = parts[1].padStart(2, '0').slice(0, 2);

  if (isNaN(hour) || hour < 0 || hour > 23) {
    return '08:00 AM';
  }

  const period = hour >= 12 ? 'PM' : 'AM';
  let hour12 = hour % 12;
  if (hour12 === 0) hour12 = 12;

  return `${String(hour12).padStart(2, '0')}:${minute} ${period}`;
}

/**
 * Computes difference in minutes between two IST 24-hour time strings (HH:mm).
 * Returns positive number of minutes (t2 - t1).
 */
function diffMinutes(timeEarlier, timeLater) {
  const [h1, m1] = timeEarlier.split(':').map(Number);
  const [h2, m2] = timeLater.split(':').map(Number);
  return h2 * 60 + m2 - (h1 * 60 + m1);
}

module.exports = {
  getISTDateTime,
  convert12to24,
  convert24to12,
  diffMinutes,
};
