import React from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

export default function SortableTh({ label, sortKey, sort, onSort, style }) {
  const isActive = sort.key === sortKey;
  const Icon = isActive ? (sort.direction === 'asc' ? ChevronUp : ChevronDown) : ChevronsUpDown;

  return (
    <th
      className={`sortable-th${isActive ? ' active-sort' : ''}`}
      style={style}
      onClick={() => onSort(sortKey)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSort(sortKey);
        }
      }}
      aria-sort={isActive ? (sort.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
    >
      <span className="sortable-th-inner">
        {label}
        <Icon className="sortable-th-icon" />
      </span>
    </th>
  );
}
