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
  pdfDarkMode: boolean; // Option A per phase-3-reader.md:3.3 table
  orientation: 'auto' | 'portrait' | 'landscape';
  twoColumn: boolean;
  screenTimeout: '1min' | '5min' | '15min' | 'never';
  setTheme: (t: ReaderStore['theme']) => void;
  setFontSize: (s: number) => void;
  setFontFamily: (f: ReaderStore['fontFamily']) => void;
  setReadingMode: (m: ReaderStore['readingMode']) => void;
  setFullscreen: (b: boolean) => void;
  setPageTransition: (t: ReaderStore['pageTransition']) => void;
  setPdfDarkMode: (b: boolean) => void;
  setOrientation: (o: ReaderStore['orientation']) => void;
  setTwoColumn: (b: boolean) => void;
  setScreenTimeout: (t: ReaderStore['screenTimeout']) => void;
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
  pdfDarkMode: false,
  orientation: 'auto',
  twoColumn: false,
  screenTimeout: 'never',
  setTheme: theme => set({ theme }),
  setFontSize: fontSize => set({ fontSize }),
  setFontFamily: fontFamily => set({ fontFamily }),
  setReadingMode: readingMode => set({ readingMode }),
  setFullscreen: isFullscreen => set({ isFullscreen }),
  setPageTransition: pageTransition => set({ pageTransition }),
  setPdfDarkMode: pdfDarkMode => set({ pdfDarkMode }),
  setOrientation: orientation => set({ orientation }),
  setTwoColumn: twoColumn => set({ twoColumn }),
  setScreenTimeout: screenTimeout => set({ screenTimeout }),
}));
