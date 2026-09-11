import React from 'react';
import { ScrollView, Text, View, StyleSheet, useWindowDimensions } from 'react-native';
import { useReaderStore } from '../store/readerStore';
import { readingThemes } from '../../../shared/theme/tokens';
import type { ParsedChapter } from '../../../parsing/epub/parse';

type Props = {
  chapters: ParsedChapter[];
  onScroll?: (offset: number) => void;
  scrollRef?: React.RefObject<ScrollView>;
};

export function ScrollMode({ chapters, onScroll, scrollRef }: Props) {
  const { fontSize, lineHeight, margins, theme, twoColumn } = useReaderStore();
  const colors = readingThemes[theme];
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const useTwoColumn = isLandscape && twoColumn;

  // Content inset per phase-3-reader.md:3.1 — two-column spread when landscape + toggle on
  if (useTwoColumn) {
    return (
      <ScrollView
        ref={scrollRef}
        testID="scroll-mode"
        style={[styles.container, { backgroundColor: colors.bg }]}
        contentContainerStyle={{ padding: margins, flexDirection: 'row', gap: margins }}
        onScroll={e => onScroll?.(e.nativeEvent.contentOffset.y)}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={true}
      >
        {/* Split chapters into two columns for landscape */}
        <View style={{ flex: 1 }}>
          {chapters.filter((_, i) => i % 2 === 0).map(ch => (
            <View key={ch.id} style={{ marginBottom: 24 }}>
              <Text style={[styles.chapterTitle, { color: colors.text, fontSize: fontSize + 2, lineHeight: fontSize * 1.6 }]}>{ch.title}</Text>
              <Text style={{ color: colors.text, fontSize, lineHeight: fontSize * lineHeight }}>{ch.rawText}</Text>
            </View>
          ))}
        </View>
        <View style={{ flex: 1 }}>
          {chapters.filter((_, i) => i % 2 === 1).map(ch => (
            <View key={ch.id} style={{ marginBottom: 24 }}>
              <Text style={[styles.chapterTitle, { color: colors.text, fontSize: fontSize + 2, lineHeight: fontSize * 1.6 }]}>{ch.title}</Text>
              <Text style={{ color: colors.text, fontSize, lineHeight: fontSize * lineHeight }}>{ch.rawText}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    );
  }

  // Portrait or single column centered with wider margins when landscape but toggle off per spec
  const singleMargins = isLandscape && !twoColumn ? margins * 1.5 : margins;

  return (
    <ScrollView
      ref={scrollRef}
      testID="scroll-mode"
      style={[styles.container, { backgroundColor: colors.bg }]}
      contentContainerStyle={{ padding: singleMargins, maxWidth: isLandscape && !twoColumn ? 700 : undefined, alignSelf: isLandscape && !twoColumn ? 'center' : undefined, width: '100%' }}
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
