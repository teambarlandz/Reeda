import React from 'react';
import { View, Text } from 'react-native';
import { useAppTheme } from '../theme/useTheme';
import { typography } from '../theme/tokens';

type Props = { label: string; value: number; min: number; max: number; onValueChange?: (v: number) => void };

export function Slider({ label, value }: Props) {
  const t = useAppTheme();
  // Minimal placeholder — replaced by native slider when library linked
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 }}>
      <Text style={{ ...typography.body, color: t.textPrimary }}>{label}</Text>
      <Text style={{ ...typography.caption, color: t.textSecondary }}>{value}</Text>
    </View>
  );
}
