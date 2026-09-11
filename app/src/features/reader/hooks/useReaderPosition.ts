import { useCallback, useEffect, useRef } from 'react';
import { ProgressRepository } from '../../../data/repositories/ProgressRepository';

export function useReaderPosition(bookId: string) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const savePosition = useCallback(
    (pos: { currentPage?: number; progressPercent?: number; lastPosition?: string }) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        ProgressRepository.updatePosition(bookId, pos);
      }, 500);
    },
    [bookId],
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return { savePosition };
}
