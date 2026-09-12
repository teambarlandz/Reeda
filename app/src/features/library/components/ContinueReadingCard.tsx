import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import FastImage from 'react-native-fast-image';
import { useAppTheme } from '../../../shared/theme/useTheme';
import { typography, spacing, radius } from '../../../shared/theme/tokens';
import { Card, Button } from '../../../shared/ui';
import type { Book } from '../../../data/repositories/BookRepository';

type Props = { book: Book; progress: number; onResume: () => void };

export function ContinueReadingCard({ book, progress, onResume }: Props) {
  const t = useAppTheme();
  const percent = Math.round(progress * 100);
  return (
    <Card style={[styles.card, { backgroundColor: t.bgCard, padding: spacing.lg }]}>
      <FastImage
        source={book.coverPath ? { uri: `file://${book.coverPath}`, cache: FastImage.cacheControl.immutable } : undefined}
        style={[styles.cover, { backgroundColor: t.bgSearch }]}
      />
      <View style={styles.content}>
        <Text style={[typography.title, { color: t.textPrimary }]} numberOfLines={2}>
          {book.title}
        </Text>
        <Text style={[typography.body, { color: t.textSecondary, marginTop: spacing.xs }]}>{book.author ?? 'Unknown'}</Text>
        <View style={[styles.track, { backgroundColor: t.accentTrack, marginTop: spacing.md }]}>
          <View style={[styles.fill, { backgroundColor: t.textPrimary, width: `${percent}%` }]} />
        </View>
        <Text style={[typography.caption, { color: t.textSecondary, alignSelf: 'flex-end' }]}>{percent}%</Text>
        <Button title="RESUME" onPress={onResume} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', borderRadius: radius.lg, marginHorizontal: spacing.xl, gap: spacing.md },
  cover: { width: 80, height: 110, borderRadius: radius.md },
  content: { flex: 1 },
  track: { height: 4, borderRadius: 8, overflow: 'hidden' },
  fill: { height: 4 },
});
