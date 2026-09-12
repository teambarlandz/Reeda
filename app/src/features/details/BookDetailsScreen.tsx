import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAppTheme } from '../../shared/theme/useTheme';
import { typography, spacing, radius } from '../../shared/theme/tokens';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { BookRepository } from '../../data/repositories/BookRepository';
import { ProgressRepository } from '../../data/repositories/ProgressRepository';
import { ShelvesRepository } from '../../data/repositories/ShelvesRepository';
import { FileStorage } from '../../data/files/FileStorage';
import { Button, Card } from '../../shared/ui';
import { ShelvesSheet } from '../library/components/ShelvesSheet';
import FastImage from 'react-native-fast-image';

export function BookDetailsScreen() {
  const t = useAppTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const bookId = route.params?.bookId;
  const queryClient = useQueryClient();
  const [showShelves, setShowShelves] = useState(false);

  const { data: book } = useQuery({
    queryKey: ['book', bookId],
    queryFn: () => BookRepository.get(bookId),
    enabled: !!bookId,
  });

  const { data: progress } = useQuery({
    queryKey: ['progress', bookId],
    queryFn: () => ProgressRepository.getProgress(bookId),
    enabled: !!bookId,
  });

  const { data: shelves } = useQuery({
    queryKey: ['shelves'],
    queryFn: () => ShelvesRepository.list(),
  });

  if (!book) {
    return (
      <View style={[styles.container, { backgroundColor: t.bgPrimary }]}>
        <Text style={[typography.body, { color: t.textSecondary }]}>Loading...</Text>
      </View>
    );
  }

  const percent = Math.round((progress?.progressPercent ?? 0) * 100);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: t.bgPrimary }} contentContainerStyle={{ padding: spacing.xl }}>
      <View style={{ alignItems: 'center' }}>
        <Card style={{ width: 180, aspectRatio: 3 / 4, overflow: 'hidden', borderRadius: radius.lg }}>
          {book.coverPath ? (
            <FastImage source={{ uri: `file://${book.coverPath}` }} style={{ width: '100%', height: '100%' }} resizeMode={FastImage.resizeMode.cover} />
          ) : (
            <View style={{ flex: 1, backgroundColor: t.bgSearch, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={[typography.heading, { color: t.textSecondary }]}>{book.title.slice(0, 2).toUpperCase()}</Text>
            </View>
          )}
        </Card>
        <Text style={[typography.heading, { color: t.textPrimary, marginTop: spacing.lg, textAlign: 'center' }]}>{book.title}</Text>
        <Text style={[typography.body, { color: t.textSecondary, marginTop: spacing.xs }]}>{book.author ?? 'Unknown'}</Text>
        <Text style={[typography.caption, { color: t.textSecondary, marginTop: spacing.xs }]}>{book.format?.toUpperCase()} • {percent}% • {book.isSample ? 'Sample' : ''}</Text>

        <View style={[styles.track, { backgroundColor: t.accentTrack, marginTop: spacing.md, width: '100%' }]}>
          <View style={[styles.fill, { backgroundColor: t.textPrimary, width: `${percent}%` }]} />
        </View>

        <Button title="Open" onPress={() => navigation.navigate('Reader', { bookId })} testID="open-reader" accessibilityLabel={`Open ${book.title}`} />

        <View style={{ marginTop: spacing.xl, width: '100%' }}>
          <Text style={[typography.title, { color: t.textPrimary, marginBottom: spacing.sm }]}>Shelves</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            {(shelves ?? []).map((s: any) => (
              <TouchableOpacity
                key={s.id}
                onPress={async () => {
                  await ShelvesRepository.assign(bookId, s.id);
                  queryClient.invalidateQueries({ queryKey: ['books'] });
                }}
                style={{ backgroundColor: t.bgSearch, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.full }}
                accessibilityLabel={`Assign to ${s.name}`}
                accessibilityRole="button"
              >
                <Text style={[typography.caption, { color: t.textSecondary }]}>{s.name}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              onPress={() => setShowShelves(true)}
              style={{ backgroundColor: t.bgCardDark, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.full }}
              testID="manage-shelves"
              accessibilityLabel="Create new shelf"
              accessibilityRole="button"
            >
              <Text style={[typography.caption, { color: t.textInverse }]}>+ New Shelf</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => {
            Alert.alert(
              `Delete ${book.title}?`,
              'Highlights and notes for this book will also be removed.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: async () => {
                    await BookRepository.delete(bookId);
                    await FileStorage.deleteBookFiles(bookId, book.format);
                    queryClient.invalidateQueries({ queryKey: ['books'] });
                    navigation.goBack();
                  },
                },
              ],
            );
          }}
          style={{ marginTop: spacing.xl, backgroundColor: '#E53935', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderRadius: radius.full }}
          testID="delete-book"
          accessibilityLabel={`Delete ${book.title}`}
          accessibilityRole="button"
        >
          <Text style={[typography.button, { color: '#FFFFFF' }]}>Delete Book</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: spacing.md }} accessibilityLabel="Go back" accessibilityRole="button">
          <Text style={[typography.caption, { color: t.textSecondary }]}>Back</Text>
        </TouchableOpacity>
        <ShelvesSheet visible={showShelves} onClose={() => setShowShelves(false)} bookId={bookId} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  track: { height: 4, borderRadius: 8, overflow: 'hidden' },
  fill: { height: 4 },
});
