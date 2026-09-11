import React from 'react';
import { ScrollView, Text, View, StyleSheet } from 'react-native';
import { useReaderStore } from '../store/readerStore';
import { readingThemes } from '../../../shared/theme/tokens';
import type { ParsedChapter } from '../../../parsing/epub/parse';

type Props = {
  chapters: ParsedChapter[];
  onScroll?: (offset: number) => void;
  scrollRef?: React.RefObject<ScrollView>;
};

export function ScrollMode({ chapters, onScroll, scrollRef }: Props) {
  const { fontSize, lineHeight, margins, theme } = useReaderStore();
  const colors = readingThemes[theme];

  return (
    <ScrollView
      ref={scrollRef}
      testID="scroll-mode"
      style={[styles.container, { backgroundColor: colors.bg }]}
      contentContainerStyle={{ padding: margins }}
      onScroll={e => onScroll?.(e.nativeEvent.contentOffset.y)}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={true}
    >
      {chapters.map(ch => (
        <View key={ch.id} style={{ marginBottom: 24 }}>
          <Text style={[styles.chapterTitle, { color: colors.text, fontSize: fontSize + 2, lineHeight: fontSize * 1.6 }]}>{ch.title}</Text>
          <Text style={{ color: colors.text, fontSize, lineHeight: fontSize * lineHeight }}>{ch.rawText}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  chapterTitle: { fontWeight: '600', marginBottom: 12 },
});
