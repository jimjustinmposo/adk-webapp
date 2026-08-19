import React, { useState, useEffect, useRef } from 'react';
import { Calendar } from 'lucide-react';
import { formatDateLong } from '../utils/date';

// 'YYYY-MM-DD' -> 'MM.DD.YY'
function isoToTyped(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || ''));
  if (!m) return '';
  return `${m[2]}.${m[3]}.${m[1].slice(-2)}`;
}

// 'MM.DD.YY' (or M.D.YY) -> 'YYYY-MM-DD', or null if not a real date.
// Two-digit years are always read as 20YY, since this app only deals with
// recent dates (dog birthdates, sale/adoption dates).
function typedToIso(typed) {
  const m = /^(\d{1,2})\.(\d{1,2})\.(\d{2})$/.exec(typed.trim());
  if (!m) return null;

  const mm = m[1].padStart(2, '0');
  const dd = m[2].padStart(2, '0');
  const year = 2000 + Number(m[3]);
  const monthNum = Number(mm);
  const dayNum = Number(dd);
  if (monthNum < 1 || monthNum > 12) return null;

  // Round-trip through Date to catch invalid combos like Feb 30, which JS
  // would otherwise silently roll over into March.
  const candidate = new Date(year, monthNum - 1, dayNum);
  const valid =
    candidate.getFullYear() === year &&
    candidate.getMonth() === monthNum - 1 &&
    candidate.getDate() === dayNum;

  return valid ? `${year}-${mm}-${dd}` : null;
}

/**
 * A date field you can type into directly as "MM.DD.YY" (e.g. "08.18.25"),
 * with a small calendar-icon button as a fallback for picking a date the
 * normal way. Either method updates the same underlying value. Shows a
 * "Aug 18, 2025"-style confirmation once a valid date is understood, or an
 * inline error if what's typed isn't a real date yet.
 */
export default function DateInput({ id, value, onChange, required = false }) {
  const [typedValue, setTypedValue] = useState(() => isoToTyped(value));
  const [isInvalid, setIsInvalid] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const pickerRef = useRef(null);

  // Keep the typed text in sync if the underlying value changes from
  // outside (e.g. loading an existing record, or the calendar picker).
  useEffect(() => {
    setTypedValue(isoToTyped(value));
    setIsInvalid(false);
  }, [value]);

  const emitChange = (isoValue) => {
    onChange({ target: { id, value: isoValue } });
  };

  const handleTextChange = (e) => {
    setTypedValue(e.target.value);
  };

  const handleTextFocus = () => {
    setIsFocused(true);
  };

  const handleTextBlur = () => {
    setIsFocused(false);
    const trimmed = typedValue.trim();
    if (!trimmed) {
      setIsInvalid(false);
      emitChange('');
      return;
    }
    const iso = typedToIso(trimmed);
    if (iso) {
      setIsInvalid(false);
      emitChange(iso);
    } else {
      setIsInvalid(true);
    }
  };

  const handlePickerChange = (e) => {
    const iso = e.target.value;
    setTypedValue(isoToTyped(iso));
    setIsInvalid(false);
    emitChange(iso);
  };

  const openPicker = () => {
    const el = pickerRef.current;
    if (!el) return;
    if (typeof el.showPicker === 'function') el.showPicker();
    else el.click();
  };

  // While typing, show the raw editable text. Once you click away, if it's
  // a valid date, show both together in the same box: "01.01.26 - January 01, 2026".
  const confirmedText = !isInvalid && value ? formatDateLong(value) : '';
  const displayValue = isFocused || !confirmedText
    ? typedValue
    : `${typedValue} - ${confirmedText}`;

  return (
    <div className="date-input-wrap">
      <input
        type="text"
        id={id}
        inputMode="numeric"
        placeholder="MM.DD.YY"
        autoComplete="off"
        value={displayValue}
        onChange={handleTextChange}
        onFocus={handleTextFocus}
        onBlur={handleTextBlur}
        required={required}
        className={`date-input-text${isInvalid ? ' is-invalid' : ''}`}
      />
      <button
        type="button"
        className="date-input-calendar-btn"
        aria-label="Open calendar"
        onClick={openPicker}
      >
        <Calendar style={{ width: 16, height: 16 }} />
      </button>
      <input
        ref={pickerRef}
        type="date"
        tabIndex={-1}
        aria-hidden="true"
        className="date-input-hidden-picker"
        value={value || ''}
        onChange={handlePickerChange}
      />
      {isInvalid && (
        <div className="date-input-hint is-error">Enter a valid date as MM.DD.YY</div>
      )}
    </div>
  );
}
