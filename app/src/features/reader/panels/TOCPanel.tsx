import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, FlatList, TextInput } from 'react-native';
import { X, Search, ChevronRight } from '../../../shared/icons';
import { useAppTheme } from '../../../shared/theme/useTheme';
import { typography, spacing, radius } from '../../../shared/theme/tokens';
import type { Chapter } from '../../../data/repositories/ChapterRepository';

type Props = {
  visible: boolean;
  chapters: Chapter[];
  currentChapterId?: string;
  onClose: () => void;
  onSelect: (chapter: Chapter) => void;
};

export function TOCPanel({ visible, chapters, currentChapterId, onClose, onSelect }: Props) {
  const t = useAppTheme();
  const [query, setQuery] = useState('');
  if (!visible) return null;

  const filtered = chapters.filter(c => c.title.toLowerCase().includes(query.toLowerCase()));

  return (
    <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.4)' }]}>
      <Pressable style={styles.dim} onPress={onClose} />
      <View style={[styles.panel, { backgroundColor: t.bgCard, borderTopRightRadius: radius.lg, borderBottomRightRadius: radius.lg }]}>
        <View style={styles.header}>
          <Text style={[typography.heading, { color: t.textPrimary }]} accessibilityRole="header">Table of Contents</Text>
          <Pressable onPress={onClose} hitSlop={8} testID="toc-close">
            <X size={24} color={t.iconTint} />
          </Pressable>
        </View>

        <View style={[styles.search, { backgroundColor: t.bgSearch }]}>
          <Search size={16} color={t.iconTint} />
          <TextInput
            placeholder="Find chapter..."
            placeholderTextColor={t.textSecondary}
            value={query}
            onChangeText={setQuery}
            style={[typography.body, { color: t.textPrimary, flex: 1, marginLeft: spacing.sm, paddingVertical: 0 }]}
          />
        </View>

        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={({ item }) => {
            const isCurrent = item.id === currentChapterId;
            return (
              <Pressable
                onPress={() => onSelect(item)}
                style={[
                  styles.item,
                  isCurrent && { backgroundColor: t.bgPrimary, borderLeftWidth: 4, borderLeftColor: t.textPrimary, borderRadius: radius.md },
                ]}
                testID={`toc-${item.id}`}
              >
                <Text style={[typography.caption, { color: t.textSecondary, width: 28, textAlign: 'right' }]}>{String(item.ordering).padStart(2, '0')}</Text>
                <Text
                  style={[
                    isCurrent ? typography.title : typography.body,
                    { color: isCurrent ? t.textPrimary : t.textSecondary, flex: 1, marginLeft: spacing.md },
                  ]}
                  numberOfLines={2}
                >
                  {item.title}
                </Text>
                <Text style={[typography.caption, { color: t.textSecondary }]}>p. {item.pageStart ?? '-'}</Text>
                <ChevronRight size={16} color={t.iconTint} />
              </Pressable>
            );
          }}
        />

        <View style={[styles.footer, { borderTopColor: t.divider }]}>
          <Text style={[typography.caption, { color: t.textSecondary, textAlign: 'center' }]}>{chapters.length} chapters</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, flexDirection: 'row', zIndex: 20 },
  dim: { flex: 1 },
  panel: { width: 300, height: '100%', padding: spacing.lg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: 56 },
  search: { flexDirection: 'row', alignItems: 'center', height: 40, borderRadius: 9999, paddingHorizontal: spacing.md, marginBottom: spacing.md },
  item: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, paddingHorizontal: spacing.sm, gap: spacing.sm },
  footer: { borderTopWidth: 1, paddingTop: spacing.md, marginTop: spacing.md },
});
