import { useState, useMemo } from 'react';

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc' | null;
}

export function useSort<T>(items: T[], defaultSort?: SortConfig) {
  const [sortConfig, setSortConfig] = useState<SortConfig>(
    defaultSort || { key: '', direction: null }
  );

  const sortedItems = useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction) {
      return items;
    }

    return [...items].sort((a: any, b: any) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      // Gestion spéciale pour les dates
      if (aValue instanceof Date || (typeof aValue === 'string' && !isNaN(Date.parse(aValue)))) {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }
      // Gestion des nombres
      else if (typeof aValue === 'number') {
        // Déjà dans le bon format
      }
      // Gestion des chaînes de caractères
      else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [items, sortConfig]);

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' | null = 'asc';

    if (sortConfig.key === key) {
      if (sortConfig.direction === 'asc') {
        direction = 'desc';
      } else if (sortConfig.direction === 'desc') {
        direction = null;
      }
    }

    setSortConfig({ key, direction });
  };

  return { items: sortedItems, sortConfig, requestSort };
}