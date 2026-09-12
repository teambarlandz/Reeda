import React from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { X, Plus, Trash2 } from '../../../shared/icons';
import { useAppTheme } from '../../../shared/theme/useTheme';
import { typography, spacing, radius } from '../../../shared/theme/tokens';
import { useQuery } from '@tanstack/react-query';
import { NoteRepository } from '../../../data/repositories/NoteRepository';

type Props = {
  visible: boolean;
  bookId: string;
  onClose: () => void;
  onSelect: (note: any) => void;
  onNew: () => void;
};

export function NotesPanel({ visible, bookId, onClose, onSelect, onNew }: Props) {
  const t = useAppTheme();
  const { data: notes } = useQuery({
    queryKey: ['notes', bookId],
    queryFn: () => NoteRepository.list(bookId),
    enabled: visible,
  });

  if (!visible) return null;

  return (
    <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.4)' }]}>
      <Pressable style={{ flex: 1 }} onPress={onClose} />
      <View style={[styles.panel, { backgroundColor: t.bgCard, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg }]}>
        <View style={styles.header}>
          <Text style={[typography.heading, { color: t.textPrimary }]} accessibilityRole="header">Notes</Text>
          <Pressable onPress={onClose} testID="notes-close">
            <X size={24} color={t.iconTint} />
          </Pressable>
        </View>

        {(notes ?? []).length === 0 ? (
          <View style={{ padding: spacing.xl, alignItems: 'center' }}>
            <Text style={[typography.body, { color: t.textSecondary }]}>No notes yet</Text>
          </View>
        ) : (
          <FlatList
            data={notes}
            keyExtractor={item => item.id}
            contentContainerStyle={{ padding: spacing.md }}
            renderItem={({ item }) => (
              <Pressable onPress={() => onSelect(item)} style={[styles.item, { backgroundColor: t.bgPrimary }]} testID={`note-${item.id}`}>
                <Text style={[typography.caption, { color: t.textSecondary }]}>Page {item.page ?? '-'} • {new Date(item.createdAt).toLocaleDateString()}</Text>
                <Text style={[typography.body, { color: t.textPrimary, marginTop: 4 }]} numberOfLines={2}>
                  {item.text}
                </Text>
                {item.highlightId && <Text style={[typography.caption, { color: t.textSecondary, marginTop: 4, fontStyle: 'italic' }]}>Attached to highlight</Text>}
                <Pressable onPress={() => NoteRepository.delete(item.id)} style={{ position: 'absolute', right: 8, top: 8 }}>
                  <Trash2 size={16} color={t.iconTint} />
                </Pressable>
              </Pressable>
            )}
          />
        )}

        <Pressable onPress={onNew} style={[styles.fab, { backgroundColor: t.bgPrimary }]} testID="notes-fab">
          <Plus size={24} color={t.textPrimary} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, flexDirection: 'column', justifyContent: 'flex-end', zIndex: 20 },
  panel: { maxHeight: '70%', width: '100%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.lg, height: 56 },
  item: { padding: spacing.md, borderRadius: radius.md, marginBottom: spacing.sm },
  fab: { position: 'absolute', bottom: spacing.lg, right: spacing.lg, width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', elevation: 4 },
});
