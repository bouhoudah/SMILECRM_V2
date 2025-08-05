import React from 'react';
import { Filter } from 'lucide-react';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterBarProps {
  filters: {
    name: string;
    label: string;
    options: FilterOption[];
    value: string;
  }[];
  onChange: (filterName: string, value: string) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ filters, onChange }) => {
  return (
    <div className="flex items-center space-x-4 py-4">
      <Filter className="h-5 w-5 text-gray-400" />
      {filters.map((filter) => (
        <div key={filter.name} className="flex items-center">
          <label htmlFor={filter.name} className="text-sm font-medium text-gray-700 mr-2">
            {filter.label}
          </label>
          <select
            id={filter.name}
            value={filter.value}
            onChange={(e) => onChange(filter.name, e.target.value)}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="">Tous</option>
            {filter.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
};

export default FilterBar;