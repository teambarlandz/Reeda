import { create } from 'zustand';

type ReaderStore = {
  // Theme per-book per keep-separate decision
  theme: 'light' | 'sepia' | 'dark' | 'midnight' | 'custom';
  fontFamily: 'system' | 'serif' | 'sans' | 'monospace' | 'dyslexic';
  fontSize: number; // 12..48
  lineHeight: number; // 1.0..3.0
  margins: number; // 8..48
  readingMode: 'scroll' | 'paginate';
  isFullscreen: boolean;
  pageTransition: 'slide' | 'fade' | 'curl' | 'none';
  setTheme: (t: ReaderStore['theme']) => void;
  setFontSize: (s: number) => void;
  setFontFamily: (f: ReaderStore['fontFamily']) => void;
  setReadingMode: (m: ReaderStore['readingMode']) => void;
  setFullscreen: (b: boolean) => void;
  setPageTransition: (t: ReaderStore['pageTransition']) => void;
};

export const useReaderStore = create<ReaderStore>(set => ({
  theme: 'sepia',
  fontFamily: 'system',
  fontSize: 16,
  lineHeight: 1.5,
  margins: 24,
  readingMode: 'scroll',
  isFullscreen: false,
  pageTransition: 'slide',
  setTheme: theme => set({ theme }),
  setFontSize: fontSize => set({ fontSize }),
  setFontFamily: fontFamily => set({ fontFamily }),
  setReadingMode: readingMode => set({ readingMode }),
  setFullscreen: isFullscreen => set({ isFullscreen }),
  setPageTransition: pageTransition => set({ pageTransition }),
}));
