import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, FlatList, StyleSheet } from 'react-native';
import { X, Plus, Trash2 } from '../../../shared/icons';
import { useAppTheme } from '../../../shared/theme/useTheme';
import { typography, spacing, radius } from '../../../shared/theme/tokens';
import { Sheet } from '../../../shared/ui';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ShelvesRepository } from '../../../data/repositories/ShelvesRepository';
import { BookRepository } from '../../../data/repositories/BookRepository';

type Props = {
  visible: boolean;
  onClose: () => void;
  bookId?: string; // if provided, shows assign/remove toggles for that book
};

export function ShelvesSheet({ visible, onClose, bookId }: Props) {
  const t = useAppTheme();
  const queryClient = useQueryClient();
  const [newName, setNewName] = useState('');

  const { data: shelves } = useQuery({ queryKey: ['shelves'], queryFn: () => ShelvesRepository.list(), enabled: visible });
  const { data: book } = useQuery({ queryKey: ['book', bookId], queryFn: () => BookRepository.get(bookId!), enabled: !!bookId && visible });

  const handleCreate = async () => {
    const name = newName.trim();
    if (!name) return;
    await ShelvesRepository.create(name);
    setNewName('');
    queryClient.invalidateQueries({ queryKey: ['shelves'] });
    queryClient.invalidateQueries({ queryKey: ['books'] });
  };

  const handleRemove = async (shelfId: string) => {
    if (!bookId) return;
    await ShelvesRepository.remove(bookId, shelfId);
    queryClient.invalidateQueries({ queryKey: ['books'] });
  };

  if (!visible) return null;

  return (
    <Sheet visible={visible} onClose={onClose} height="50%">
      <View style={styles.header}>
        <Text style={[typography.heading, { color: t.textPrimary }]} accessibilityRole="header">Shelves</Text>
        <Pressable onPress={onClose} testID="shelves-close" accessibilityLabel="Close shelves" accessibilityRole="button">
          <X size={24} color={t.iconTint} />
        </Pressable>
      </View>
      <View style={{ padding: spacing.lg, gap: spacing.md }}>
        <View style={[styles.inputRow, { backgroundColor: t.bgSearch }]}>
          <TextInput
            placeholder="New shelf name"
            placeholderTextColor={t.textSecondary}
            value={newName}
            onChangeText={setNewName}
            style={[typography.body, { color: t.textPrimary, flex: 1, paddingVertical: 0 }]}
            testID="shelf-input"
            accessibilityLabel="New shelf name"
            returnKeyType="done"
          />
          <Pressable onPress={handleCreate} style={[styles.addBtn, { backgroundColor: t.bgCardDark }]} testID="shelf-create" accessibilityLabel="Create shelf" accessibilityRole="button">
            <Plus size={16} color={t.textInverse} />
          </Pressable>
        </View>
        <FlatList
          data={shelves ?? []}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={[styles.shelfRow, { backgroundColor: t.bgPrimary }]} testID={`shelf-${item.id}`}>
              <Text style={[typography.body, { color: t.textPrimary }]}>{item.name}</Text>
              {bookId && (
                <>
                  <Pressable
                    onPress={async () => {
                      await ShelvesRepository.assign(bookId, item.id);
                      queryClient.invalidateQueries({ queryKey: ['books'] });
                    }}
                    style={[styles.assignBtn, { backgroundColor: t.bgCard }]}
                    accessibilityLabel={`Assign to ${item.name}`}
                    accessibilityRole="button"
                  >
                    <Text style={[typography.caption, { color: t.textSecondary }]}>Assign</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => handleRemove(item.id)}
                    style={[styles.removeBtn, { backgroundColor: t.bgCard }]}
                    testID={`shelf-remove-${item.id}`}
                    accessibilityLabel={`Remove from ${item.name}`}
                    accessibilityRole="button"
                  >
                    <Trash2 size={14} color={t.textSecondary} />
                  </Pressable>
                </>
              )}
            </View>
          )}
          ListEmptyComponent={<Text style={[typography.body, { color: t.textSecondary, textAlign: 'center' }]}>No shelves yet — create one.</Text>}
        />
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.lg, height: 56 },
  inputRow: { flexDirection: 'row', alignItems: 'center', height: 48, borderRadius: radius.full, paddingHorizontal: spacing.md, gap: spacing.sm },
  addBtn: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  shelfRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.md, borderRadius: radius.md, marginBottom: spacing.sm },
  assignBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.full },
  removeBtn: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginLeft: spacing.sm },
});
