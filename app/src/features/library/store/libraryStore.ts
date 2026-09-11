import { create } from 'zustand';

type LibraryStore = {
  sort: 'recent' | 'title' | 'author';
  filter: string | null;
  searchQuery: string;
  searchFacet: 'all' | 'title' | 'author' | 'genre' | 'shelf';
  setSort: (s: LibraryStore['sort']) => void;
  setFilter: (f: string | null) => void;
  setSearchQuery: (q: string) => void;
  setSearchFacet: (f: LibraryStore['searchFacet']) => void;
};

export const useLibraryStore = create<LibraryStore>(set => ({
  sort: 'recent',
  filter: null,
  searchQuery: '',
  searchFacet: 'all',
  setSort: sort => set({ sort }),
  setFilter: filter => set({ filter }),
  setSearchQuery: searchQuery => set({ searchQuery }),
  setSearchFacet: searchFacet => set({ searchFacet }),
}));
