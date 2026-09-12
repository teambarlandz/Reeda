import React from 'react';
import { View, Text, StyleSheet, Pressable, FlatList } from 'react-native';
import { Sheet } from '../../../shared/ui';
import { useAppTheme } from '../../../shared/theme/useTheme';
import { typography, spacing, radius } from '../../../shared/theme/tokens';
import { useLibraryStore } from '../store/libraryStore';
import { useQuery } from '@tanstack/react-query';
import { ShelvesRepository } from '../../../data/repositories/ShelvesRepository';

type Props = { visible: boolean; onClose: () => void };

export function FilterSheet({ visible, onClose }: Props) {
  const t = useAppTheme();
  const { sort, setSort, filter, setFilter } = useLibraryStore();
  const { data: shelves } = useQuery({ queryKey: ['shelves'], queryFn: () => ShelvesRepository.list(), enabled: visible });
  return (
    <Sheet visible={visible} onClose={onClose} height="60%">
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
        <Text style={[typography.title, { color: t.textPrimary, marginTop: spacing.lg }]}>Filter by Shelf</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm }}>
          <Pressable onPress={() => setFilter(null)} style={{ padding: spacing.sm, backgroundColor: !filter ? t.bgCardDark : t.bgSearch, borderRadius: radius.full }}>
            <Text style={[typography.caption, { color: !filter ? t.textInverse : t.textSecondary }]}>All</Text>
          </Pressable>
          {(shelves ?? []).map((s: any) => (
            <Pressable
              key={s.id}
              onPress={() => setFilter(s.name)}
              style={{ padding: spacing.sm, backgroundColor: filter === s.name ? t.bgCardDark : t.bgSearch, borderRadius: radius.full }}
              testID={`filter-shelf-${s.name}`}
            >
              <Text style={[typography.caption, { color: filter === s.name ? t.textInverse : t.textSecondary }]}>{s.name}</Text>
            </Pressable>
          ))}
        </View>
        {filter && <Text style={[typography.caption, { color: t.textSecondary, marginTop: spacing.lg }]}>Filter: {filter}</Text>}
      </View>
    </Sheet>
  );
}
