import { useEffect, useRef, useState } from 'react';
import { useLibraryStore } from '../store/libraryStore';

export function useLibrarySearch() {
  const { searchQuery, setSearchQuery } = useLibraryStore();
  const [local, setLocal] = useState(searchQuery);
  const seqRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce 150ms + stale cancel per phase-2.md:6.1
  const onChange = (text: string) => {
    setLocal(text);
    if (timerRef.current) clearTimeout(timerRef.current);
    const seq = ++seqRef.current;
    timerRef.current = setTimeout(() => {
      // Ignore if newer seq has started (stale)
      if (seq !== seqRef.current) return;
      // Threshold <2 chars → keep recents, don't fire FTS
      if (text.trim().length >= 2 || text.trim().length === 0) {
        setSearchQuery(text);
      } else {
        // Keep searchQuery as is but local shows typing; caller will show recents
        // We still update to allow threshold check in useLibraryBooks
        setSearchQuery(text);
      }
    }, 150);
  };

  useEffect(() => {
    setLocal(searchQuery);
  }, [searchQuery]);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  return { query: local, onChange, committed: searchQuery };
}
