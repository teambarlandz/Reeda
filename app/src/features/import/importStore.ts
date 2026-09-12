import { create } from 'zustand';
import type { ImportError } from '../../data/files/FileStorage';

export type ImportItem = {
  id: string;
  fileName: string;
  fileSize?: number;
  status: 'pending' | 'copying' | 'parsing' | 'done' | 'error';
  error?: ImportError;
  existingId?: string;
  uri?: string;
};

type ImportStore = {
  items: ImportItem[];
  setItems: (updater: ImportItem[] | ((prev: ImportItem[]) => ImportItem[])) => void;
  clear: () => void;
};

export const useImportStore = create<ImportStore>(set => ({
  items: [],
  setItems: updater => set(state => ({ items: typeof updater === 'function' ? (updater as any)(state.items) : updater })),
  clear: () => set({ items: [] }),
}));
