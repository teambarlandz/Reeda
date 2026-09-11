import { tokens, typography, spacing } from '../src/shared/theme/tokens';

describe('tokens', () => {
  it('has 3 palettes with required keys', () => {
    expect(tokens.light.bgPrimary).toBe('#F0EDE6');
    expect(tokens.neutralDark.bgPrimary).toBe('#121214');
    expect(tokens.warmDark.bgPrimary).toBe('#1E1814');
    for (const mode of ['light', 'neutralDark', 'warmDark'] as const) {
      expect(tokens[mode].bgCard).toBeDefined();
      expect(tokens[mode].textPrimary).toBeDefined();
      expect(tokens[mode].iconTint).toBeDefined();
    }
  });

  it('no hardcoded hex outside tokens — smoke check', () => {
    // Verify that LibraryScreen imports from useTheme, not hardcoded
    const fs = require('fs');
    const path = require('path');
    const lib = fs.readFileSync(path.join(__dirname, '../src/features/library/screens/LibraryScreen.tsx'), 'utf8');
    // Should contain useAppTheme or tokens reference
    expect(lib).toMatch(/useAppTheme|tokens/);
    // Should not contain hardcoded #F0EDE6 directly outside import (allow token file)
    // This is a lightweight check; real CI greps
    expect(lib).not.toMatch(/#F0EDE6/);
  });

  it('typography has required scales', () => {
    expect(typography.display.fontSize).toBe(22);
    expect(typography.caption.fontSize).toBe(11);
    expect(spacing.xl).toBe(20);
  });
});
