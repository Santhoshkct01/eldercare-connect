/**
 * Client-Side IST formatting and 12-hour AM/PM utilities
 * Timezone: Asia/Kolkata
 */

export function formatISTTime12(timeStr) {
  if (!timeStr) return '--:--';
  const clean = String(timeStr).trim().toUpperCase();

  // If already contains AM or PM
  if (clean.includes('AM') || clean.includes('PM')) {
    return clean;
  }

  const parts = clean.split(':');
  if (parts.length < 2) return clean;

  let hour = parseInt(parts[0], 10);
  const minute = parts[1].padStart(2, '0').slice(0, 2);

  if (isNaN(hour)) return clean;

  const period = hour >= 12 ? 'PM' : 'AM';
  let hour12 = hour % 12;
  if (hour12 === 0) hour12 = 12;

  return `${String(hour12).padStart(2, '0')}:${minute} ${period}`;
}

export function convert12to24(hour12, minute, period) {
  let h = parseInt(hour12, 10);
  const m = String(minute).padStart(2, '0');
  const p = period.toUpperCase();

  if (p === 'PM' && h !== 12) {
    h += 12;
  } else if (p === 'AM' && h === 12) {
    h = 0;
  }

  return `${String(h).padStart(2, '0')}:${m}`;
}
