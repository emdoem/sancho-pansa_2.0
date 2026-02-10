import { useEffect, useRef } from 'react';
import { useMusicLibraryStore } from './musicLibraryStore';

export const useSearchDebounce = (delay = 300) => {
  const { searchQuery, setDebouncedSearchQuery } = useMusicLibraryStore();
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, delay);

    return () => {
      clearTimeout(timeoutRef.current);
    };
  }, [searchQuery, delay, setDebouncedSearchQuery]);
};
