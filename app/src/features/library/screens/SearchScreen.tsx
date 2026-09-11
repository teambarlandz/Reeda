import React, { useCallback, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, Clock, Trash2 } from '../../../shared/icons';
import { useAppTheme } from '../../../shared/theme/useTheme';
import { typography, spacing } from '../../../shared/theme/tokens';
import { SearchBar } from '../components/SearchBar';
import { FacetChips, Facet } from '../components/FacetChips';
import { BookGrid } from '../components/BookGrid';
import { useLibraryStore } from '../store/libraryStore';
import { useLibraryBooks } from '../hooks/useLibraryBooks';
import { useLibrarySearch } from '../hooks/useLibrarySearch';
import { useQuery } from '@tanstack/react-query';
import { SearchHistoryRepository } from '../../../data/repositories/SearchHistoryRepository';

export function SearchScreen() {
  const t = useAppTheme();
  const navigation = useNavigation<any>();
  const { searchFacet, setSearchFacet } = useLibraryStore();
  const { query, onChange, committed } = useLibrarySearch();
  const { data: books } = useLibraryBooks();

  const { data: recents } = useQuery({
    queryKey: ['search_history'],
    queryFn: () => SearchHistoryRepository.list(),
  });

  const isTypingShort = committed.trim().length > 0 && committed.trim().length < 2;
  const showRecents = committed.trim().length === 0 || isTypingShort;
  const showResults = !showRecents && (books?.length ?? 0) > 0;
  const showEmpty = !showRecents && committed.trim().length >= 2 && (books?.length ?? 0) === 0;

  const highlightTokens = useMemo(() => {
    if (committed.trim().length < 2) return undefined;
    return committed.trim().split(/\s+/).filter(x => x.length >= 2);
  }, [committed]);

  const handleSelectRecent = useCallback(
    (q: string) => {
      onChange(q);
    },
    [onChange],
  );

  const handleFacet = useCallback(
    (f: Facet) => {
      setSearchFacet(f.toLowerCase() as any);
    },
    [setSearchFacet],
  );

  const handleClear = useCallback(() => {
    onChange('');
  }, [onChange]);

  const handleResultPress = useCallback(
    (bookId: string) => {
      navigation.navigate('BookDetails', { bookId });
    },
    [navigation],
  );

  const suggestions = useMemo(() => {
    // Top 8 autocomplete suggestions while typing (simple prefix match on recents + titles)
    if (committed.length < 2) return [];
    const lower = committed.toLowerCase();
    const fromRecents = (recents ?? []).filter(r => r.toLowerCase().includes(lower)).slice(0, 4);
    return fromRecents;
  }, [committed, recents]);

  return (
    <View style={[styles.container, { backgroundColor: t.bgPrimary }]}>
      <View style={[styles.header, { backgroundColor: t.bgPrimary }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12} style={styles.backBtn}>
          <ChevronLeft size={24} color={t.iconTint} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <SearchBar
            value={query}
            onChangeText={onChange}
            onClear={handleClear}
            placeholder="Search"
            autoFocus
            testID="search-header"
            showTitle={false}
          />
        </View>
      </View>

      <FacetChips selected={searchFacet as Facet} onSelect={handleFacet} />

      {showRecents && (
        <View style={{ padding: spacing.xl }}>
          <View style={styles.recentsHeader}>
            <Text style={[typography.heading, { color: t.textPrimary }]}>Recent searches</Text>
            <TouchableOpacity onPress={() => SearchHistoryRepository.clear()}>
              <Trash2 size={16} color={t.iconTint} />
            </TouchableOpacity>
          </View>
          {(recents ?? []).slice(0, 10).map(r => (
            <TouchableOpacity key={r} onPress={() => handleSelectRecent(r)} style={[styles.recentRow, { backgroundColor: t.bgSearch }]}>
              <Clock size={16} color={t.iconTint} />
              <Text style={[typography.body, { color: t.textPrimary, marginLeft: spacing.sm }]}>{r}</Text>
            </TouchableOpacity>
          ))}
          {suggestions.length > 0 && (
            <View style={[styles.suggestions, { backgroundColor: t.bgCard }]}>
              {suggestions.slice(0, 8).map(s => (
                <TouchableOpacity key={s} onPress={() => handleSelectRecent(s)} style={styles.suggestionRow}>
                  <Text style={[typography.body, { color: t.textPrimary }]}>{s}</Text>
                  <Text style={[typography.caption, { color: t.textSecondary }]}>suggestion</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          {(recents ?? []).length === 0 && (
            <Text style={[typography.body, { color: t.textSecondary, marginTop: spacing.md }]}>Try: Atomic Habits, Educated, Dune</Text>
          )}
        </View>
      )}

      {showResults && (
        <View style={{ flex: 1 }}>
          <Text style={[typography.caption, { color: t.textSecondary, paddingHorizontal: spacing.xl, paddingTop: spacing.md }]}>
            {books?.length} results for &quot;{committed}&quot;
          </Text>
          <BookGrid books={books ?? []} onPress={handleResultPress} highlightTokens={highlightTokens} />
        </View>
      )}

      {showEmpty && (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl }}>
          <Text style={[typography.heading, { color: t.textPrimary }]}>No books found for &quot;{committed}&quot;</Text>
          <Text style={[typography.body, { color: t.textSecondary, marginTop: spacing.sm, textAlign: 'center' }]}>
            Check spelling, try author or genre, or
          </Text>
          <TouchableOpacity
            onPress={handleClear}
            style={{ marginTop: spacing.lg, backgroundColor: t.bgCard, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: 9999 }}
          >
            <Text style={[typography.button, { color: t.textPrimary }]}>Clear search</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { height: 56, flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.xl, gap: spacing.md },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  recentsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  recentRow: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, borderRadius: 12, marginTop: spacing.sm },
  suggestions: { borderRadius: 12, marginTop: spacing.md, padding: spacing.sm },
  suggestionRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
});
