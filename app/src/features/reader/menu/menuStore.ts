import { create } from 'zustand';

type ActivePanel = 'toc' | 'bookmarks' | 'highlights' | 'notes' | 'search' | 'font' | 'pages' | 'progress' | 'dictionary' | 'settings' | null;

type MenuStore = {
  isCollapsed: boolean;
  activePanel: ActivePanel;
  activeItem: string | null;
  toggle: () => void;
  setActivePanel: (p: ActivePanel) => void;
};

export const useMenuStore = create<MenuStore>(set => ({
  isCollapsed: true,
  activePanel: null,
  activeItem: null,
  toggle: () => set(s => ({ isCollapsed: !s.isCollapsed })),
  setActivePanel: activePanel => set({ activePanel, isCollapsed: activePanel ? false : true }),
}));
