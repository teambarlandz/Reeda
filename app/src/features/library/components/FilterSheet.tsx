import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Sheet } from '../../../shared/ui';
import { useAppTheme } from '../../../shared/theme/useTheme';
import { typography, spacing } from '../../../shared/theme/tokens';
import { useLibraryStore } from '../store/libraryStore';

type Props = { visible: boolean; onClose: () => void };

export function FilterSheet({ visible, onClose }: Props) {
  const t = useAppTheme();
  const { sort, setSort, filter } = useLibraryStore();
  return (
    <Sheet visible={visible} onClose={onClose} height="50%">
      <View style={{ padding: spacing.xl }}>
        <Text style={[typography.heading, { color: t.textPrimary, marginBottom: spacing.lg }]}>Sort & Filter</Text>
        <Text style={[typography.title, { color: t.textPrimary }]}>Sort by</Text>
        <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm }}>
          {(['recent', 'title', 'author'] as const).map(s => (
            <Text
              key={s}
              onPress={() => setSort(s)}
              style={[typography.body, { color: sort === s ? t.textPrimary : t.textSecondary, padding: spacing.sm, backgroundColor: sort === s ? t.bgSearch : 'transparent', borderRadius: 8 }]}
            >
              {s}
            </Text>
          ))}
        </View>
        {filter && <Text style={[typography.caption, { color: t.textSecondary, marginTop: spacing.lg }]}>Filter: {filter}</Text>}
      </View>
    </Sheet>
  );
}
