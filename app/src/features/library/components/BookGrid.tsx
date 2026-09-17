import React, { useMemo } from 'react';
import { View, Dimensions } from 'react-native';
import { spacing } from '../../../shared/theme/tokens';
import { BookCard } from './BookCard';
import type { Book } from '../../../data/repositories/BookRepository';

type Props = {
  books: Book[];
  onPress: (id: string) => void;
  onLongPress?: (id: string, title: string, format: string) => void;
  progressMap?: Record<string, number>;
  highlightTokens?: string[];
  numColumns?: number;
  showFileSize?: boolean;
};

const SCREEN_PADDING = spacing.xl * 2;
const GAP = spacing.md;

export function BookGrid({ books, onPress, onLongPress, progressMap, highlightTokens, numColumns = 5, showFileSize }: Props) {
  const screenWidth = Dimensions.get('window').width;
  const available = screenWidth - SCREEN_PADDING - (numColumns - 1) * GAP;
  const columnWidth = available / numColumns;

  const rows = useMemo(() => {
    const result: Book[][] = [];
    for (let i = 0; i < books.length; i += numColumns) {
      result.push(books.slice(i, i + numColumns));
    }
    return result;
  }, [books, numColumns]);

  return (
    <View style={{ paddingHorizontal: spacing.xl, gap: GAP }}>
      {rows.map((row, rowIdx) => (
        <View key={rowIdx} style={{ flexDirection: 'row', gap: GAP }}>
          {row.map((book) => (
            <View key={book.id} style={{ width: columnWidth }}>
              <BookCard
                book={book}
                onPress={onPress}
                onLongPress={onLongPress}
                progress={progressMap?.[book.id] ?? 0}
                highlight={highlightTokens}
                showFileSize={showFileSize}
              />
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}
