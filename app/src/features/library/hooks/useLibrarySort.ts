import { useLibraryStore } from '../store/libraryStore';

export function useLibrarySort() {
  const { sort, setSort, filter, setFilter } = useLibraryStore();
  return { sort, setSort, filter, setFilter };
}
