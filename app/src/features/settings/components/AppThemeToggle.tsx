import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../../shared/theme/useTheme';
import { typography, spacing, radius } from '../../../shared/theme/tokens';
import { SegmentedControl } from '../../../shared/ui/SegmentedControl';

const THEME_LABELS = ['Light', 'Neutral Dark', 'Warm Dark'] as const;
const LABEL_TO_MODE = { Light: 'light', 'Neutral Dark': 'neutralDark', 'Warm Dark': 'warmDark' } as const;
const MODE_TO_LABEL = { light: 'Light', neutralDark: 'Neutral Dark', warmDark: 'Warm Dark' } as const;

export function AppThemeToggle() {
  const { appTheme, setAppTheme } = useTheme();
  return (
    <View style={styles.row}>
      <View style={styles.labelWrap}>
        <Text style={typography.body}>Appearance</Text>
        <Text style={[typography.caption, { color: 'rgba(255,255,255,0.5)' }]}>App-wide chrome theme</Text>
      </View>
      <SegmentedControl
        options={[...THEME_LABELS]}
        selected={MODE_TO_LABEL[appTheme]}
        onSelect={(label: string) => {
          const mode = LABEL_TO_MODE[label as keyof typeof LABEL_TO_MODE];
          if (mode) setAppTheme(mode);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { padding: spacing.lg, gap: spacing.md },
  labelWrap: { gap: spacing.xs },
});
