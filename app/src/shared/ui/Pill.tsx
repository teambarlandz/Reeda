import React from 'react';
import { Text, Pressable } from 'react-native';
import { useAppTheme } from '../theme/useTheme';
import { radius, spacing, typography } from '../theme/tokens';

type Props = { label: string; selected?: boolean; onPress?: () => void };

export function Pill({ label, selected, onPress }: Props) {
  const t = useAppTheme();
  return (
    <Pressable onPress={onPress} style={{ backgroundColor: selected ? t.bgCardDark : t.bgSearch, borderRadius: radius.full, paddingHorizontal: spacing.lg, height: 32, justifyContent: 'center' }} accessibilityLabel={label} accessibilityRole="button" accessibilityState={{ selected }}>
      <Text style={{ ...typography.caption, color: selected ? t.textInverse : t.textSecondary }}>{label}</Text>
    </Pressable>
  );
}
