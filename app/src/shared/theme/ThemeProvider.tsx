import React, { createContext, useMemo, useState, ReactNode } from 'react';
import { tokens, readingThemes, ThemeMode, ReadingTheme, AppThemeTokens } from './tokens';

type ThemeContextValue = {
  appTheme: ThemeMode;
  setAppTheme: (m: ThemeMode) => void;
  readingTheme: ReadingTheme;
  setReadingTheme: (m: ReadingTheme) => void;
  appTokens: AppThemeTokens;
  readingBg: string;
  readingText: string;
};

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [appTheme, setAppTheme] = useState<ThemeMode>('light');
  const [readingTheme, setReadingTheme] = useState<ReadingTheme>('sepia');

  const value = useMemo<ThemeContextValue>(() => {
    const appTokens = tokens[appTheme] as AppThemeTokens;
    const rt = readingThemes[readingTheme];
    return {
      appTheme,
      setAppTheme,
      readingTheme,
      setReadingTheme,
      appTokens,
      readingBg: rt.bg,
      readingText: rt.text,
    };
  }, [appTheme, readingTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
