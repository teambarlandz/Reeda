import { useQuery } from '@tanstack/react-query';
import { BookRepository } from '../../../data/repositories/BookRepository';
import { useLibraryStore } from '../store/libraryStore';

export function useLibraryBooks() {
  const { sort, filter, searchQuery, searchFacet } = useLibraryStore();

  return useQuery({
    queryKey: ['books', sort, filter, searchQuery, searchFacet],
    queryFn: async () => {
      if (searchQuery.trim().length >= 2) {
        // FTS path per phase-2.md:5.1.1 with facet
        const facetMap: Record<string, 'all' | 'title' | 'author' | 'genre' | 'shelf'> = {
          All: 'all',
          Title: 'title',
          Author: 'author',
          Genre: 'genre',
          Shelf: 'shelf',
        };
        const facet = facetMap[searchFacet] ?? 'all';
        return BookRepository.search(searchQuery, facet);
      }
      // Empty search → list + client sort/filter (M2 minimal)
      let books = await BookRepository.list();
      if (filter) {
        books = books.filter(b => (b as any).shelfIds?.includes(filter));
      }
      if (sort === 'title') books.sort((a, b) => a.title.localeCompare(b.title));
      else if (sort === 'author') books.sort((a, b) => (a.author ?? '').localeCompare(b.author ?? ''));
      else books.sort((a, b) => (b.lastOpenedAt ?? b.addedAt) - (a.lastOpenedAt ?? a.addedAt));
      return books;
    },
  });
}
