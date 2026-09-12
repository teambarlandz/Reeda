import React, { memo } from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions } from 'react-native';
import FastImage from 'react-native-fast-image';
import { useAppTheme } from '../../../shared/theme/useTheme';
import { typography, spacing, radius } from '../../../shared/theme/tokens';
import type { Book } from '../../../data/repositories/BookRepository';

type Props = {
  book: Book;
  onPress: (id: string) => void;
  onLongPress?: (id: string, title: string, format: string) => void;
  progress?: number; // 0..1
  highlight?: string[]; // tokens to bold per phase-2.md:6.1
};

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function HighlightedText({ text, tokens: highlightTokens, style, highlightStyle }: { text: string; tokens?: string[]; style: any; highlightStyle: any }) {
  if (!highlightTokens || highlightTokens.length === 0) {
    return <Text style={style} numberOfLines={2}>{text}</Text>;
  }
  const pattern = new RegExp(`(${highlightTokens.map(escapeRegExp).join('|')})`, 'gi');
  const parts = text.split(pattern);
  return (
    <Text style={style} numberOfLines={2}>
      {parts.map((part, i) => {
        const isMatch = highlightTokens.some(t => t.toLowerCase() === part.toLowerCase());
        return (
          <Text key={i} style={isMatch ? highlightStyle : undefined}>
            {part}
          </Text>
        );
      })}
    </Text>
  );
}

export const BookCard = memo(function BookCard({ book, onPress, onLongPress, progress = 0, highlight }: Props) {
  const t = useAppTheme();
  const percent = Math.round(progress * 100);

  return (
    <Pressable
      testID={`book-card-${book.id}`}
      onPress={() => onPress(book.id)}
      onLongPress={() => onLongPress?.(book.id, book.title, book.format)}
      accessibilityLabel={`${book.title} by ${book.author ?? 'Unknown'}, progress ${percent}%`}
      style={({ pressed }) => [styles.container, pressed && { opacity: 0.9, transform: [{ scale: 0.97 }] }]}
    >
      <View style={[styles.coverWrap, { backgroundColor: t.bgCard, borderRadius: radius.md, shadowColor: t.shadowColor }, { elevation: 2 }]}>
        {book.coverPath ? (
          <FastImage
            source={{ uri: `file://${book.coverPath}`, priority: FastImage.priority.normal }}
            style={styles.cover}
            resizeMode={FastImage.resizeMode.cover}
          />
        ) : (
          <View style={[styles.cover, styles.placeholder, { backgroundColor: t.bgSearch }]}>
            <Text style={[typography.title, { color: t.textSecondary }]} numberOfLines={2}>
              {book.title.slice(0, 2).toUpperCase()}
            </Text>
          </View>
        )}
      </View>
      <HighlightedText
        text={book.title}
        tokens={highlight}
        style={[typography.title, { color: t.textPrimary, marginTop: spacing.sm }]}
        highlightStyle={{ fontWeight: '700', backgroundColor: t.accentTrack }}
      />
      <Text style={[typography.caption, { color: t.textSecondary, marginTop: spacing.xs }]} numberOfLines={1}>
        {book.author ?? 'Unknown'}
      </Text>
      <View style={styles.progressRow}>
        <View style={[styles.track, { backgroundColor: t.accentTrack }]}>
          <View style={[styles.fill, { backgroundColor: t.textPrimary, width: `${percent}%` }]} />
        </View>
        <Text style={[typography.caption, { color: t.textSecondary, marginLeft: spacing.xs }]}>{percent}%</Text>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  coverWrap: { aspectRatio: 3 / 4, overflow: 'hidden' },
  cover: { width: '100%', height: '100%', borderRadius: 12 },
  placeholder: { justifyContent: 'center', alignItems: 'center' },
  progressRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm },
  track: { flex: 1, height: 3, borderRadius: 8, overflow: 'hidden' },
  fill: { height: 3, borderRadius: 8 },
});
