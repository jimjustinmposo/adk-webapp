const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Formats a date as "MMM/DD/YY", e.g. "Aug/18/25". Accepts plain
 * "YYYY-MM-DD" strings (parsed as local calendar dates, avoiding the
 * timezone-shift bug you get from `new Date("YYYY-MM-DD")`), full ISO
 * timestamps, or Date objects. Returns '' for anything missing/invalid.
 */
export function formatDate(value) {
  if (!value) return '';

  const datePart = String(value).substring(0, 10);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(datePart);

  let d;
  if (match) {
    d = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  } else {
    d = new Date(value);
  }

  if (isNaN(d.getTime())) return '';

  const mon = MONTHS[d.getMonth()];
  const day = String(d.getDate()).padStart(2, '0');
  const yr = String(d.getFullYear()).slice(-2);
  return `${mon}/${day}/${yr}`;
}
