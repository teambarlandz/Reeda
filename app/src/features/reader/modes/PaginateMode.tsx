import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import { useReaderStore } from '../store/readerStore';
import { readingThemes } from '../../../shared/theme/tokens';
import type { ParsedChapter } from '../../../parsing/epub/parse';
import { paginateChapters } from '../../../parsing/epub/parse';

type Props = {
  chapters: ParsedChapter[];
  initialPage?: number;
  onPageChange?: (page: number) => void;
};

export function PaginateMode({ chapters, initialPage = 1, onPageChange }: Props) {
  const { fontSize, lineHeight, margins, theme, pageTransition, twoColumn } = useReaderStore();
  const colors = readingThemes[theme];
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const viewportHeight = height - 120; // approx
  const pages = useMemo(() => paginateChapters(chapters, viewportHeight, 1200), [chapters, viewportHeight]);
  const total = pages.length;
  const [page, setPage] = useState(initialPage);

  const current = pages[page - 1];
  const chap = chapters[current?.chapterIndex ?? 0];
  const textSlice = chap ? chap.rawText.slice(current.offset, current.offset + 1200) : '';
  // PDF two-page spread when landscape + twoColumn on per spec
  const useTwoPage = isLandscape && twoColumn;

  const go = useCallback(
    (dir: 1 | -1) => {
      const next = Math.min(total, Math.max(1, page + dir));
      setPage(next);
      onPageChange?.(next);
    },
    [page, total, onPageChange],
  );

  // Landscape two-page spread: show current + next side by side
  if (useTwoPage && page < total) {
    const next = pages[page];
    const nextChap = chapters[next?.chapterIndex ?? 0];
    const nextSlice = nextChap ? nextChap.rawText.slice(next.offset, next.offset + 1200) : '';
    return (
      <View testID="paginate-mode" style={[styles.container, { backgroundColor: colors.bg, padding: margins, flexDirection: 'row', gap: margins }]}>
        <View style={styles.content}>
        <Text style={{ color: colors.text, fontSize, lineHeight: fontSize * lineHeight }} accessible accessibilityRole="text">{textSlice}</Text>
        </View>
        <View style={[styles.content, { borderLeftWidth: 1, borderLeftColor: colors.text + '20', paddingLeft: margins }]}>
          <Text style={{ color: colors.text, fontSize, lineHeight: fontSize * lineHeight }}>{nextSlice}</Text>
        </View>
        <View style={[styles.navRow, { position: 'absolute', bottom: 12, left: margins, right: margins }]}>
          <Pressable onPress={() => go(-1)} testID="paginate-prev" style={styles.navBtn}>
            <Text style={{ color: colors.text }}>‹ Prev</Text>
          </Pressable>
          <Text style={{ color: colors.text }}>
            {page} / {total}
          </Text>
          <Pressable onPress={() => go(1)} testID="paginate-next" style={styles.navBtn}>
            <Text style={{ color: colors.text }}>Next ›</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View testID="paginate-mode" style={[styles.container, { backgroundColor: colors.bg, padding: margins }]}>
      <View style={styles.content}>
        <Text style={{ color: colors.text, fontSize, lineHeight: fontSize * lineHeight }} accessible accessibilityRole="text">{textSlice}</Text>
      </View>
      <View style={styles.navRow}>
        <Pressable onPress={() => go(-1)} testID="paginate-prev" style={styles.navBtn}>
          <Text style={{ color: colors.text }}>‹ Prev</Text>
        </Pressable>
        <Text style={{ color: colors.text }}>
          {page} / {total}
        </Text>
        <Pressable onPress={() => go(1)} testID="paginate-next" style={styles.navBtn}>
          <Text style={{ color: colors.text }}>Next ›</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
  navRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  navBtn: { padding: 12 },
});
