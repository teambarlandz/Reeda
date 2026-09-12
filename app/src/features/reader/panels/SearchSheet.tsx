import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, Pressable, StyleSheet } from 'react-native';
import { X, Search } from '../../../shared/icons';
import { useAppTheme } from '../../../shared/theme/useTheme';
import { typography, spacing, radius } from '../../../shared/theme/tokens';

type Props = {
  visible: boolean;
  bookTitle?: string;
  rawTextPerChapter: string[];
  onClose: () => void;
  onSelect: (chapterIndex: number, offset: number) => void;
};

export function SearchSheet({ visible, bookTitle, rawTextPerChapter, onClose, onSelect }: Props) {
  const t = useAppTheme();
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [wholeWords, setWholeWords] = useState(false);

  // Debounce 300ms per phase-3-reader.md:Item6
  React.useEffect(() => {
    const timer = setTimeout(() => setDebounced(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  if (!visible) return null;

  const results: Array<{ snippet: string; chapterIndex: number; offset: number }> = [];
  if (debounced.trim().length >= 2) {
    // Case-insensitive, whole words option
    const pattern = wholeWords ? `\\b${debounced.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b` : debounced.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(pattern, 'gi');
    rawTextPerChapter.forEach((text, ci) => {
      let match: RegExpExecArray | null;
      // Reset lastIndex
      regex.lastIndex = 0;
      while ((match = regex.exec(text)) !== null) {
        const idx = match.index;
        const start = Math.max(0, idx - 40);
        const end = Math.min(text.length, idx + match[0].length + 40);
        const snippet = text.slice(start, end);
        results.push({ snippet, chapterIndex: ci, offset: idx });
        if (results.length >= 20) break;
        // Avoid infinite loop for zero-length matches
        if (match[0].length === 0) regex.lastIndex++;
      }
    });
  }

  return (
    <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.4)' }]}>
      <Pressable style={{ flex: 1 }} onPress={onClose} />
      <View style={[styles.panel, { backgroundColor: t.bgCard, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg }]}>
        <View style={styles.header}>
          <View style={[styles.searchBar, { backgroundColor: t.bgSearch }]}>
            <Search size={16} color={t.iconTint} />
            <TextInput
              placeholder={`Search in ${bookTitle ?? 'book'}`}
              placeholderTextColor={t.textSecondary}
              value={query}
              onChangeText={setQuery}
              style={[typography.body, { color: t.textPrimary, flex: 1, marginLeft: spacing.sm, paddingVertical: 0 }]}
              autoFocus
              testID="search-in-book"
            />
            {query.length > 0 && (
              <Pressable onPress={() => setQuery('')}>
                <X size={16} color={t.iconTint} />
              </Pressable>
            )}
          </View>
          <Pressable onPress={onClose} testID="search-sheet-close">
            <X size={24} color={t.iconTint} />
          </Pressable>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, gap: spacing.sm }}>
          <Pressable
            onPress={() => setWholeWords(v => !v)}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 4, padding: spacing.sm, backgroundColor: wholeWords ? t.bgCardDark : t.bgSearch, borderRadius: radius.full }}
            testID="whole-words-toggle"
          >
            <Text style={[typography.caption, { color: wholeWords ? t.textInverse : t.textSecondary }]}>Whole words</Text>
          </Pressable>
          <Text style={[typography.caption, { color: t.textSecondary }]}>Case-insensitive • 300ms debounce</Text>
        </View>

        <FlatList
          data={results}
          keyExtractor={(_, i) => String(i)}
          contentContainerStyle={{ padding: spacing.md }}
          ListHeaderComponent={<Text style={[typography.heading, { color: t.textPrimary, padding: spacing.md }]}>Results {results.length > 0 ? `(${results.length})` : ''}</Text>}
          renderItem={({ item }) => (
            <Pressable onPress={() => onSelect(item.chapterIndex, item.offset)} style={[styles.result, { backgroundColor: t.bgPrimary }]} testID={`search-result-${item.chapterIndex}`}>
              <Text style={[typography.body, { color: t.textPrimary }]} numberOfLines={2}>
                {item.snippet.replace(new RegExp(query, 'gi'), match => `**${match}**`)}
              </Text>
              <Text style={[typography.caption, { color: t.textSecondary, marginTop: 4 }]}>Chapter {item.chapterIndex + 1}</Text>
            </Pressable>
          )}
          ListEmptyComponent={
            query.length >= 2 ? (
              <View style={{ padding: spacing.xl, alignItems: 'center' }}>
                <Text style={[typography.body, { color: t.textSecondary }]}>No results for “{query}”</Text>
              </View>
            ) : (
              <View style={{ padding: spacing.xl, alignItems: 'center' }}>
                <Text style={[typography.body, { color: t.textSecondary }]}>Type to search</Text>
              </View>
            )
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, flexDirection: 'column', justifyContent: 'flex-end', zIndex: 21 },
  panel: { height: '50%', width: '100%' },
  header: { flexDirection: 'row', alignItems: 'center', padding: spacing.lg, gap: spacing.md },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', height: 48, borderRadius: radius.full, paddingHorizontal: spacing.md },
  result: { padding: spacing.md, borderRadius: radius.md, marginBottom: spacing.sm },
});
