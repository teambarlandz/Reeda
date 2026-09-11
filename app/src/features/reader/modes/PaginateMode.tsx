import React, { useState, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions } from 'react-native';
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
  const { fontSize, lineHeight, margins, theme, pageTransition } = useReaderStore();
  const colors = readingThemes[theme];
  const viewportHeight = Dimensions.get('window').height - 120; // approx
  const pages = paginateChapters(chapters, viewportHeight, 1200);
  const total = pages.length;
  const [page, setPage] = useState(initialPage);

  const current = pages[page - 1];
  const chap = chapters[current?.chapterIndex ?? 0];
  const textSlice = chap ? chap.rawText.slice(current.offset, current.offset + 1200) : '';

  const go = useCallback(
    (dir: 1 | -1) => {
      const next = Math.min(total, Math.max(1, page + dir));
      setPage(next);
      onPageChange?.(next);
    },
    [page, total, onPageChange],
  );

  return (
    <View testID="paginate-mode" style={[styles.container, { backgroundColor: colors.bg, padding: margins }]}>
      <View style={styles.content}>
        <Text style={{ color: colors.text, fontSize, lineHeight: fontSize * lineHeight }}>{textSlice}</Text>
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
