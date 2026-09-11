// Design tokens — single source of truth per docs/phase-3.md:2 + phase-3.md:8
// App chrome vs reading-content scopes are separate keys in ThemeProvider.
// No hardcoded hex outside this file.

export type ThemeMode = 'light' | 'neutralDark' | 'warmDark';
export type ReadingTheme = 'light' | 'sepia' | 'dark' | 'midnight' | 'custom';

export const tokens = {
  light: {
    bgPrimary: '#F0EDE6',
    bgCard: '#FFFFFF',
    bgCardDark: '#1C1C1E',
    bgSearch: '#E8E4DC',
    bgOverlay: 'rgba(0,0,0,0.4)',
    textPrimary: '#2C2C2E',
    textSecondary: '#8B8680',
    textInverse: '#FFFFFF',
    textInverseSecondary: '#A1A1A6',
    accentProgress: '#FFFFFF',
    accentProgressDark: '#FFFFFF',
    accentTrack: '#D9D4CC',
    buttonPrimaryBg: '#FFFFFF',
    buttonPrimaryText: '#2C2C2E',
    divider: '#D9D4CC',
    iconTint: '#8B8680',
    iconTintInverse: '#FFFFFF',
    avatarBg: '#8B8680',
    shadowColor: '#000000',
  },
  neutralDark: {
    bgPrimary: '#121214',
    bgCard: '#1E1E20',
    bgCardDark: '#0A0A0C',
    bgSearch: '#2A2A2E',
    bgOverlay: 'rgba(0,0,0,0.6)',
    textPrimary: '#E8E8EA',
    textSecondary: '#6E6E74',
    textInverse: '#E8E8EA',
    textInverseSecondary: '#A1A1A6',
    accentProgress: '#FFFFFF',
    accentProgressDark: '#FFFFFF',
    accentTrack: '#3A3A3C',
    buttonPrimaryBg: '#2A2A2E',
    buttonPrimaryText: '#E8E8EA',
    divider: '#3A3A3C',
    iconTint: '#6E6E74',
    iconTintInverse: '#E8E8EA',
    avatarBg: '#3A3A3C',
    shadowColor: '#000000',
  },
  warmDark: {
    bgPrimary: '#1E1814',
    bgCard: '#221C18',
    bgCardDark: '#0F0C0A',
    bgSearch: '#2E241E',
    bgOverlay: 'rgba(30,24,20,0.6)',
    textPrimary: '#E8DCC8',
    textSecondary: '#8B7E6E',
    textInverse: '#E8DCC8',
    textInverseSecondary: '#8B7E6E',
    accentProgress: '#E8DCC8',
    accentProgressDark: '#E8DCC8',
    accentTrack: '#3A332E',
    buttonPrimaryBg: '#2E241E',
    buttonPrimaryText: '#E8DCC8',
    divider: '#3A332E',
    iconTint: '#8B7E6E',
    iconTintInverse: '#E8DCC8',
    avatarBg: '#3A332E',
    shadowColor: '#000000',
  },
} as const;

export type AppThemeTokens = typeof tokens.light;

// Reading-content themes — independent from app chrome per phase-3.md:8 note + phase-3-reader.md:3.8 D
export const readingThemes: Record<ReadingTheme, { bg: string; text: string }> = {
  light: { bg: '#FFFFFF', text: '#2C2C2E' },
  sepia: { bg: '#F0EDE6', text: '#2C2C2E' },
  dark: { bg: '#1C1C1E', text: '#E8E8EA' },
  midnight: { bg: '#1A1A2E', text: '#E0E0E0' },
  custom: { bg: '#FFFFFF', text: '#2C2C2E' }, // overridden by user picker
};

// Typography per phase-3.md:2.2 — sp units
export const typography = {
  display: { fontFamily: 'System', fontSize: 22, fontWeight: '600' as const, lineHeight: 28 },
  heading: { fontFamily: 'System', fontSize: 18, fontWeight: '600' as const, lineHeight: 24 },
  title: { fontFamily: 'System', fontSize: 14, fontWeight: '600' as const, lineHeight: 18 },
  body: { fontFamily: 'System', fontSize: 13, fontWeight: '400' as const, lineHeight: 17 },
  caption: { fontFamily: 'System', fontSize: 11, fontWeight: '400' as const, lineHeight: 14 },
  button: { fontFamily: 'System', fontSize: 13, fontWeight: '600' as const, lineHeight: 16 },
  statLarge: { fontFamily: 'System', fontSize: 28, fontWeight: '700' as const, lineHeight: 34 },
  statLabel: { fontFamily: 'System', fontSize: 14, fontWeight: '600' as const, lineHeight: 18 },
  statUnit: { fontFamily: 'System', fontSize: 14, fontWeight: '400' as const, lineHeight: 18 },
} as const;

// Spacing
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 48,
} as const;

// Radius
export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  full: 9999,
} as const;

// Elevation
export const elevation = {
  xs: { shadowColor: '#000000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3, elevation: 1 },
  sm: { shadowColor: '#000000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 2 },
  md: { shadowColor: '#000000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 16, elevation: 4 },
  lg: { shadowColor: '#000000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.16, shadowRadius: 32, elevation: 8 },
} as const;

// Icon spec per phase-3.md:2.6
export const iconSpec = {
  strokeWidth: 1.5,
  defaultSize: 20,
  largeSize: 24,
} as const;
