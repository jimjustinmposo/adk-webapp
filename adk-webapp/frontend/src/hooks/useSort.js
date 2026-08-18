import { useState } from 'react';

/**
 * Tracks which column a table is sorted by and in which direction.
 * Clicking the same column cycles: ascending -> descending -> unsorted.
 */
export function useSort(initialKey = null, initialDirection = 'asc') {
  const [sort, setSort] = useState({ key: initialKey, direction: initialDirection });

  const toggleSort = (key) => {
    setSort((prev) => {
      if (prev.key !== key) return { key, direction: 'asc' };
      if (prev.direction === 'asc') return { key, direction: 'desc' };
      return { key: null, direction: 'asc' };
    });
  };

  return [sort, toggleSort];
}

/**
 * Sorts a list according to the given sort state. `getValue(row, key)`
 * returns the raw value to compare for a given column key. Numbers sort
 * numerically; everything else sorts as a locale-aware, numeric-aware
 * string comparison so things like "#12" sort after "#2" correctly.
 * Nullish/empty values always sort to the end, regardless of direction.
 */
export function sortRows(rows, sort, getValue) {
  if (!sort.key) return rows;

  const withIndex = rows.map((row, index) => ({ row, index }));

  withIndex.sort((a, b) => {
    const va = getValue(a.row, sort.key);
    const vb = getValue(b.row, sort.key);
    const aEmpty = va === null || va === undefined || va === '';
    const bEmpty = vb === null || vb === undefined || vb === '';

    if (aEmpty && bEmpty) return a.index - b.index;
    if (aEmpty) return 1;
    if (bEmpty) return -1;

    let cmp;
    if (typeof va === 'number' && typeof vb === 'number') {
      cmp = va - vb;
    } else {
      cmp = String(va).localeCompare(String(vb), undefined, { numeric: true, sensitivity: 'base' });
    }
    if (cmp === 0) cmp = a.index - b.index;
    return sort.direction === 'desc' ? -cmp : cmp;
  });

  return withIndex.map((entry) => entry.row);
}
