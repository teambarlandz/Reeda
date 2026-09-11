import { useQuery } from '@tanstack/react-query';
import { ProgressRepository } from '../../../data/repositories/ProgressRepository';

export function useProgress(bookId: string) {
  return useQuery({
    queryKey: ['progress', bookId],
    queryFn: () => ProgressRepository.getProgress(bookId),
    enabled: !!bookId,
  });
}
