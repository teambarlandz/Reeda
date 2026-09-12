import React from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { X, Trash2 } from '../../../shared/icons';
import { useAppTheme } from '../../../shared/theme/useTheme';
import { typography, spacing, radius } from '../../../shared/theme/tokens';
import { useQuery } from '@tanstack/react-query';
import { BookmarkRepository } from '../../../data/repositories/BookmarkRepository';

type Props = {
  visible: boolean;
  bookId: string;
  onClose: () => void;
  onSelect: (b: any) => void;
};

export function BookmarksPanel({ visible, bookId, onClose, onSelect }: Props) {
  const t = useAppTheme();
  const { data: bookmarks } = useQuery({
    queryKey: ['bookmarks', bookId],
    queryFn: () => BookmarkRepository.list(bookId),
    enabled: visible,
  });

  if (!visible) return null;

  return (
    <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.4)' }]}>
      <Pressable style={{ flex: 1 }} onPress={onClose} />
      <View style={[styles.panel, { backgroundColor: t.bgCard, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg }]}>
        <View style={styles.header}>
          <Text style={[typography.heading, { color: t.textPrimary }]}>Bookmarks</Text>
          <Pressable onPress={onClose} testID="bookmarks-close">
            <X size={24} color={t.iconTint} />
          </Pressable>
        </View>

        {(bookmarks ?? []).length === 0 ? (
          <View style={{ padding: spacing.xl, alignItems: 'center' }}>
            <Text style={[typography.body, { color: t.textSecondary }]}>No bookmarks yet</Text>
            <Text style={[typography.caption, { color: t.textSecondary, marginTop: 4 }]}>Tap the bookmark icon while reading</Text>
          </View>
        ) : (
          <FlatList
            data={bookmarks}
            keyExtractor={item => item.id}
            contentContainerStyle={{ padding: spacing.md }}
            renderItem={({ item }) => (
              <Pressable onPress={() => onSelect(item)} style={[styles.item, { backgroundColor: t.bgPrimary }]} testID={`bookmark-${item.id}`}>
                <Text style={[typography.caption, { color: t.textSecondary }]}>Page {item.page} {item.chapterId ? `• ${item.chapterId}` : ''}</Text>
                {item.snippet && (
                  <Text style={[typography.body, { color: t.textPrimary, marginTop: 4 }]} numberOfLines={2}>
                    {item.snippet}
                  </Text>
                )}
                <Text style={[typography.caption, { color: t.textSecondary, marginTop: 4 }]}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                <Pressable onPress={() => BookmarkRepository.delete(item.id)} style={{ position: 'absolute', right: 8, top: 8 }}>
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
  item: { padding: spacing.md, borderRadius: radius.md, marginBottom: spacing.sm },
});
