import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useAppTheme } from '../theme/useTheme';
import { radius, spacing, typography } from '../theme/tokens';

type Props = { options: string[]; selected: string; onSelect: (v: string) => void };

export function SegmentedControl({ options, selected, onSelect }: Props) {
  const t = useAppTheme();
  return (
    <View style={{ flexDirection: 'row', backgroundColor: t.bgSearch, borderRadius: radius.full, padding: 2 }}>
      {options.map(o => {
        const active = o === selected;
        return (
          <Pressable key={o} onPress={() => onSelect(o)} style={{ flex: 1, backgroundColor: active ? t.bgCardDark : 'transparent', borderRadius: radius.full, paddingVertical: spacing.sm, alignItems: 'center' }}>
            <Text style={{ ...typography.caption, color: active ? t.textInverse : t.textSecondary }}>{o}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
