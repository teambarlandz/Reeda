import React, { useCallback } from 'react';
import { FlatList, Dimensions } from 'react-native';
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
};

const SCREEN_PADDING = spacing.xl * 2; // 20*2 = 40
const GAP = spacing.md; // 12

export function BookGrid({ books, onPress, onLongPress, progressMap, highlightTokens, numColumns = 5 }: Props) {
  const screenWidth = Dimensions.get('window').width;
  const available = screenWidth - SCREEN_PADDING - (numColumns - 1) * GAP;
  const columnWidth = available / numColumns;

  const getItemLayout = useCallback(
    (_: any, index: number) => {
      const row = Math.floor(index / numColumns);
      const cardHeight = columnWidth * (4 / 3) + 60; // cover + text + progress
      const length = cardHeight + GAP;
      return { length, offset: length * row, index };
    },
    [columnWidth, numColumns],
  );

  return (
    <FlatList
      data={books}
      keyExtractor={item => item.id}
      numColumns={numColumns}
      columnWrapperStyle={{ gap: GAP, paddingHorizontal: spacing.xl }}
      contentContainerStyle={{ paddingBottom: spacing.xl, gap: GAP }}
      getItemLayout={getItemLayout}
      windowSize={7}
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      updateCellsBatchingPeriod={50}
      removeClippedSubviews={true}
      renderItem={({ item }) => (
        <BookCard
          book={item}
          onPress={onPress}
          onLongPress={onLongPress}
          progress={progressMap?.[item.id] ?? 0}
          highlight={highlightTokens}
        />
      )}
    />
  );
}
