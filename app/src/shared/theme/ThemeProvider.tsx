import React, { createContext, useMemo, useState, useEffect, ReactNode } from 'react';
import { tokens, readingThemes, ThemeMode, ReadingTheme, AppThemeTokens } from './tokens';

const STORAGE_KEY = 'appTheme';
const VALID_MODES: ThemeMode[] = ['light', 'neutralDark', 'warmDark'];

async function loadAppTheme(): Promise<ThemeMode | null> {
  try {
    const { SettingsRepository } = await import('../../data/repositories/SettingsRepository');
    const raw = await SettingsRepository.get(STORAGE_KEY);
    if (raw && (VALID_MODES as string[]).includes(raw)) return raw as ThemeMode;
  } catch {}
  return null;
}

async function saveAppTheme(mode: ThemeMode): Promise<void> {
  try {
    const { SettingsRepository } = await import('../../data/repositories/SettingsRepository');
    await SettingsRepository.set(STORAGE_KEY, mode);
  } catch {}
}

type ThemeContextValue = {
  appTheme: ThemeMode;
  setAppTheme: (m: ThemeMode) => Promise<void>;
  readingTheme: ReadingTheme;
  setReadingTheme: (m: ReadingTheme) => void;
  appTokens: AppThemeTokens;
  readingBg: string;
  readingText: string;
};

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [appTheme, setAppThemeState] = useState<ThemeMode>('light');
  const [readingTheme, setReadingTheme] = useState<ReadingTheme>('sepia');

  useEffect(() => {
    if (process.env.NODE_ENV === 'test') return;
    loadAppTheme().then(saved => {
      if (saved) setAppThemeState(saved);
    });
  }, []);

  const setAppTheme = async (mode: ThemeMode) => {
    setAppThemeState(mode);
    await saveAppTheme(mode);
  };

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
