import React from 'react';
import { formatDateLong } from '../utils/date';

/**
 * Wraps a native <input type="date"> so the box visually shows a readable
 * "Jan 01, 2026" instead of the browser's own date text — the native input
 * is still there underneath (transparent text) so clicking anywhere still
 * opens the real calendar picker and keeps full keyboard/accessibility
 * support. Accepts the same props as a plain date input.
 */
export default function DateInput({ id, value, onChange, required = false }) {
  return (
    <div className="date-input-wrap">
      <input
        id={id}
        type="date"
        required={required}
        value={value}
        onChange={onChange}
        className="date-input-native"
      />
      <div className={`date-input-overlay${value ? '' : ' is-empty'}`}>
        {value ? formatDateLong(value) : 'Select a date'}
      </div>
    </div>
  );
}
