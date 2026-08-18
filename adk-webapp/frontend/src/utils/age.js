/**
 * Computes a human-friendly age from a date of birth, e.g. "2 yrs 3 mos",
 * "7 mos", or "Newborn". Returns null when there's no usable date so
 * callers can decide how to display "unknown" (e.g. "—").
 */
export function formatAge(dob) {
  if (!dob) return null;
  const birth = new Date(dob);
  if (isNaN(birth.getTime())) return null;

  const now = new Date();
  if (birth > now) return null; // guard against bad/future data

  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  if (now.getDate() < birth.getDate()) months -= 1;
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  if (years === 0 && months === 0) return 'Newborn';
  if (years === 0) return `${months} mo${months !== 1 ? 's' : ''}`;
  if (months === 0) return `${years} yr${years !== 1 ? 's' : ''}`;
  return `${years} yr${years !== 1 ? 's' : ''} ${months} mo${months !== 1 ? 's' : ''}`;
}

/**
 * Age expressed in whole days, for accurate numeric sorting (larger =
 * older). Returns null when there's no usable date, so it sorts to the
 * end like other missing values.
 */
export function ageInDays(dob) {
  if (!dob) return null;
  const birth = new Date(dob);
  if (isNaN(birth.getTime())) return null;
  const now = new Date();
  const diff = now.getTime() - birth.getTime();
  if (diff < 0) return null;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}
