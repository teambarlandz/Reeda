import React, { useState } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { X, Trash2 } from '../../../shared/icons';
import { useAppTheme } from '../../../shared/theme/useTheme';
import { typography, spacing, radius } from '../../../shared/theme/tokens';
import { Highlight, HIGHLIGHT_COLORS } from '../../../data/repositories/HighlightRepository';
import { useQuery } from '@tanstack/react-query';
import { HighlightRepository } from '../../../data/repositories/HighlightRepository';

type Props = {
  visible: boolean;
  bookId: string;
  onClose: () => void;
  onSelect: (h: Highlight) => void;
};

export function HighlightsPanel({ visible, bookId, onClose, onSelect }: Props) {
  const t = useAppTheme();
  const [filter, setFilter] = useState<string | null>(null);

  const { data: highlights } = useQuery({
    queryKey: ['highlights', bookId, filter],
    queryFn: async () => {
      const all = await HighlightRepository.list(bookId);
      return filter ? all.filter(h => h.color === filter) : all;
    },
    enabled: visible,
  });

  if (!visible) return null;

  const grouped = (highlights ?? []).reduce<Record<string, Highlight[]>>((acc, h) => {
    (acc[h.color] = acc[h.color] || []).push(h);
    return acc;
  }, {});

  return (
    <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.4)' }]}>
      <Pressable style={{ flex: 1 }} onPress={onClose} />
      <View style={[styles.panel, { backgroundColor: t.bgCard, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg }]}>
        <View style={styles.header}>
          <Text style={[typography.heading, { color: t.textPrimary }]}>Highlights</Text>
          <Pressable onPress={onClose} testID="highlights-close">
            <X size={24} color={t.iconTint} />
          </Pressable>
        </View>

        <View style={styles.filterRow}>
          {HIGHLIGHT_COLORS.map(c => (
            <Pressable
              key={c}
              onPress={() => setFilter(filter === c ? null : c)}
              style={[styles.dot, { backgroundColor: c, borderWidth: filter === c ? 2 : 0, borderColor: t.textPrimary }]}
            />
          ))}
        </View>

        {(highlights ?? []).length === 0 ? (
          <View style={{ padding: spacing.xl, alignItems: 'center' }}>
            <Text style={[typography.body, { color: t.textSecondary }]}>No highlights yet</Text>
          </View>
        ) : (
          <FlatList
            data={highlights}
            keyExtractor={item => item.id}
            contentContainerStyle={{ padding: spacing.md }}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => onSelect(item)}
                onLongPress={() => {}}
                style={[styles.item, { backgroundColor: t.bgPrimary, borderLeftWidth: 4, borderLeftColor: item.color }]}
                testID={`highlight-${item.id}`}
              >
                <Text style={[typography.body, { color: t.textPrimary }]} numberOfLines={2}>
                  {item.text}
                </Text>
                <Text style={[typography.caption, { color: t.textSecondary, marginTop: 4 }]}>Page {item.page ?? '-'} • {new Date(item.createdAt).toLocaleDateString()}</Text>
                <Pressable onPress={() => HighlightRepository.delete(item.id)} style={{ position: 'absolute', right: 8, top: 8 }}>
                  <Trash2 size={16} color={t.iconTint} />
                </Pressable>
              </Pressable>
            )}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, flexDirection: 'column', justifyContent: 'flex-end', zIndex: 20 },
  panel: { maxHeight: '70%', width: '100%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.lg, height: 56 },
  filterRow: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
  dot: { width: 32, height: 32, borderRadius: 16 },
  item: { padding: spacing.md, borderRadius: radius.md, marginBottom: spacing.sm },
});
