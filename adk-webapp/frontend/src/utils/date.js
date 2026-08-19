const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const FULL_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

/**
 * Parses "YYYY-MM-DD" strings as local calendar dates (avoiding the
 * timezone-shift bug you get from `new Date("YYYY-MM-DD")`), while still
 * accepting full ISO timestamps or Date objects. Returns null if the value
 * is missing or invalid.
 */
function parseDate(value) {
  if (!value) return null;

  const datePart = String(value).substring(0, 10);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(datePart);

  const d = match
    ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
    : new Date(value);

  return isNaN(d.getTime()) ? null : d;
}

/**
 * Formats a date as "MMM/DD/YY", e.g. "Aug/18/25". Used throughout tables,
 * view modals, and report exports.
 */
export function formatDate(value) {
  const d = parseDate(value);
  if (!d) return '';
  const mon = MONTHS[d.getMonth()];
  const day = String(d.getDate()).padStart(2, '0');
  const yr = String(d.getFullYear()).slice(-2);
  return `${mon}/${day}/${yr}`;
}

/**
 * Formats a date as "Month D, YYYY", e.g. "August 25, 2026". Used for the
 * typed/confirmed date-field readout.
 */
export function formatDateLong(value) {
  const d = parseDate(value);
  if (!d) return '';
  const mon = FULL_MONTHS[d.getMonth()];
  const day = String(d.getDate()).padStart(2, '0');
  return `${mon} ${day}, ${d.getFullYear()}`;
}
