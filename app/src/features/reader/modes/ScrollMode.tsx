import React, { useState } from 'react';
import { ScrollView, Text, View, StyleSheet, useWindowDimensions, Pressable } from 'react-native';
import { Pencil } from '../../../shared/icons';
import { useReaderStore } from '../store/readerStore';
import { readingThemes } from '../../../shared/theme/tokens';
import type { ParsedChapter } from '../../../parsing/epub/parse';
import type { Highlight } from '../../../data/repositories/HighlightRepository';
import type { Note } from '../../../data/repositories/NoteRepository';

type Props = {
  chapters: ParsedChapter[];
  highlights?: Highlight[];
  notes?: Note[];
  onScroll?: (offset: number) => void;
  scrollRef?: React.RefObject<ScrollView>;
  onLongPressText?: (text: string) => void;
  onHighlightTap?: (h: Highlight) => void;
  ttsSentence?: string | null;
  ttsWordIndex?: number;
  ttsHighlightSync?: boolean;
};

function HighlightedText({
  rawText,
  highlights,
  isDark,
  onHighlightTap,
  tappedId,
  ttsSentence,
  ttsWordIndex,
  ttsHighlightSync,
}: {
  rawText: string;
  highlights: Highlight[];
  isDark: boolean;
  onHighlightTap?: (h: Highlight) => void;
  tappedId?: string | null;
  ttsSentence?: string | null;
  ttsWordIndex?: number;
  ttsHighlightSync?: boolean;
}) {
  const hasSaved = highlights && highlights.length > 0;
  const hasTts = !!ttsSentence && !!ttsHighlightSync && rawText.includes(ttsSentence);
  if (!hasSaved && !hasTts) {
    return <Text>{rawText}</Text>;
  }
  // Build segments for saved highlights first
  let segments: Array<{ text: string; highlight?: Highlight; isTapped?: boolean; isTts?: boolean }> = [{ text: rawText }];
  if (hasSaved) {
    const sorted = [...highlights].sort((a, b) => a.createdAt - b.createdAt);
    for (const h of sorted) {
      const newSegments: typeof segments = [];
      for (const seg of segments) {
        if (seg.highlight || seg.isTts) {
          newSegments.push(seg);
          continue;
        }
        const idx = seg.text.indexOf(h.text);
        if (idx === -1) {
          newSegments.push(seg);
        } else {
          const before = seg.text.slice(0, idx);
          const match = seg.text.slice(idx, idx + h.text.length);
          const after = seg.text.slice(idx + h.text.length);
          if (before) newSegments.push({ text: before });
          newSegments.push({ text: match, highlight: h, isTapped: tappedId === h.id });
          if (after) newSegments.push({ text: after });
        }
      }
      segments = newSegments;
    }
  }
  // Apply TTS sentence highlight (60% vs saved 85%) — distinct
  if (hasTts && ttsSentence) {
    const newSegments: typeof segments = [];
    for (const seg of segments) {
      if (seg.highlight) {
        // Keep saved highlight as is — TTS underline will be overlaid via word underline below if needed
        newSegments.push(seg);
        continue;
      }
      const idx = seg.text.indexOf(ttsSentence);
      if (idx === -1) {
        newSegments.push(seg);
      } else {
        const before = seg.text.slice(0, idx);
        const match = seg.text.slice(idx, idx + ttsSentence.length);
        const after = seg.text.slice(idx + ttsSentence.length);
        if (before) newSegments.push({ text: before });
        newSegments.push({ text: match, isTts: true });
        if (after) newSegments.push({ text: after });
      }
    }
    segments = newSegments;
  }

  return (
    <Text>
      {segments.map((seg, i) => {
        if (seg.isTts) {
          // TTS sentence highlight at 60% (lighter than saved 85%) per spec
          // Underline the current word within the sentence
          const words = seg.text.split(/(\s+)/);
          const wordCount = words.filter(w => w.trim().length > 0).length;
          let wordPos = -1;
          return (
            <Text key={i} style={{ backgroundColor: '#FFEB3B', opacity: isDark ? 0.45 : 0.6 }} testID="tts-highlight-sentence">
              {words.map((w, wi) => {
                if (w.trim().length === 0) return <Text key={wi}>{w}</Text>;
                wordPos += 1;
                const isCurrentWord = wordPos === (ttsWordIndex ?? 0);
                return (
                  <Text
                    key={wi}
                    style={isCurrentWord ? { textDecorationLine: 'underline', textDecorationColor: '#2C2C2E', textDecorationStyle: 'solid' } : undefined}
                    testID={isCurrentWord ? 'tts-highlight-word' : undefined}
                  >
                    {w}
                  </Text>
                );
              })}
            </Text>
          );
        }
        if (!seg.highlight) return <Text key={i}>{seg.text}</Text>;
        const baseOpacity = isDark ? 0.6 : 0.85;
        const opacity = seg.isTapped ? 1 : baseOpacity;
        return (
          <Text
            key={i}
            onPress={() => onHighlightTap?.(seg.highlight!)}
            onLongPress={() => onHighlightTap?.(seg.highlight!)}
            style={{ backgroundColor: seg.highlight.color, opacity }}
            testID={`highlight-seg-${seg.highlight.id}`}
          >
            {seg.text}
          </Text>
        );
      })}
    </Text>
  );
}

export function ScrollMode({ chapters, highlights = [], notes = [], onScroll, scrollRef, onLongPressText, onHighlightTap, ttsSentence = null, ttsWordIndex = 0, ttsHighlightSync = false }: Props) {
  const safeHighlights = highlights ?? [];
  const safeNotes = notes ?? [];
  const { fontSize, lineHeight, margins, theme, twoColumn } = useReaderStore();
  const colors = readingThemes[theme];
  const isDark = theme === 'dark' || theme === 'midnight';
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const useTwoColumn = isLandscape && twoColumn;
  const [tappedId, setTappedId] = useState<string | null>(null);

  const handleHighlightTap = (h: Highlight) => {
    setTappedId(h.id);
    setTimeout(() => setTappedId(null), 300);
    onHighlightTap?.(h);
  };

  const renderChapter = (ch: ParsedChapter) => {
    const chHighlights = safeHighlights.filter(h => h.text && ch.rawText.includes(h.text));
    const chNotes = safeNotes.filter(n => n.chapterId === ch.id || (n.text && ch.rawText.includes(n.text.slice(0, 20))));
    const isTtsChapter = ttsHighlightSync && ttsSentence != null && ch.rawText.includes(ttsSentence);
    return (
      <View key={ch.id} style={{ marginBottom: 24, flexDirection: 'row' }}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.chapterTitle, { color: colors.text, fontSize: fontSize + 2, lineHeight: fontSize * 1.6 }]} accessibilityRole="header">{ch.title}</Text>
          <Pressable onLongPress={() => onLongPressText?.(ch.rawText.slice(0, 80))} delayLongPress={400} testID={`selectable-${ch.id}`} accessible accessibilityRole="text">
            <Text style={{ color: colors.text, fontSize, lineHeight: fontSize * lineHeight }}>
              <HighlightedText rawText={ch.rawText} highlights={chHighlights} isDark={isDark} onHighlightTap={handleHighlightTap} tappedId={tappedId} ttsSentence={isTtsChapter ? ttsSentence : null} ttsWordIndex={ttsWordIndex} ttsHighlightSync={ttsHighlightSync} />
            </Text>
          </Pressable>
        </View>
        {/* Note margin indicator per 3.4.4 */}
        <View style={{ width: 20, marginLeft: 8, alignItems: 'center' }}>
          {chNotes.map(n => (
            <View key={n.id} style={{ marginBottom: 8, opacity: isDark ? 0.6 : 1 }}>
              <Pencil size={12} color={chHighlights.find(h => h.id === n.highlightId)?.color ?? colors.text} />
            </View>
          ))}
        </View>
      </View>
    );
  };

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
        <View style={{ flex: 1 }}>{chapters.filter((_, i) => i % 2 === 0).map(renderChapter)}</View>
        <View style={{ flex: 1 }}>{chapters.filter((_, i) => i % 2 === 1).map(renderChapter)}</View>
      </ScrollView>
    );
  }

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
      {chapters.map(renderChapter)}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  chapterTitle: { fontWeight: '600', marginBottom: 12 },
});
