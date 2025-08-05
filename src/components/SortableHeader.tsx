import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

interface SortableHeaderProps {
  label: string;
  sortKey: string;
  currentSort: {
    key: string;
    direction: 'asc' | 'desc' | null;
  };
  onSort: (key: string) => void;
}

const SortableHeader: React.FC<SortableHeaderProps> = ({
  label,
  sortKey,
  currentSort,
  onSort,
}) => {
  const isActive = currentSort.key === sortKey;

  return (
    <button
      onClick={() => onSort(sortKey)}
      className="group flex items-center space-x-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
    >
      <span>{label}</span>
      <span className="inline-flex">
        {isActive ? (
          currentSort.direction === 'asc' ? (
            <ArrowUp className="h-4 w-4" />
          ) : (
            <ArrowDown className="h-4 w-4" />
          )
        ) : (
          <ArrowUpDown className="h-4 w-4 opacity-0 group-hover:opacity-100" />
        )}
      </span>
    </button>
  );
};

export default SortableHeader;