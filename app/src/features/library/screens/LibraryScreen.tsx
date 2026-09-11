import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppTheme } from '../../../shared/theme/useTheme';
import { typography, spacing } from '../../../shared/theme/tokens';
import { SlidersHorizontal } from '../../../shared/icons';
import { Button } from '../../../shared/ui';
import { BookGrid } from '../components/BookGrid';
import { SearchBar } from '../components/SearchBar';
import { ContinueReadingCard } from '../components/ContinueReadingCard';
import { StatsWidget } from '../components/StatsWidget';
import { FilterSheet } from '../components/FilterSheet';
import { useLibraryBooks } from '../hooks/useLibraryBooks';
import { useLibrarySearch } from '../hooks/useLibrarySearch';
import { BookRepository } from '../../../data/repositories/BookRepository';
import { ProgressRepository } from '../../../data/repositories/ProgressRepository';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export function LibraryScreen() {
  const t = useAppTheme();
  const navigation = useNavigation<any>();
  const { data: books, isLoading } = useLibraryBooks();
  const { query, onChange } = useLibrarySearch();
  const [showFilter, setShowFilter] = useState(false);
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});
  const queryClient = useQueryClient();
  const hasSeededRef = React.useRef(false);

  // Seed samples on first launch if empty — per phase-4.md M2 (guard with ref to avoid infinite loop)
  useEffect(() => {
    if (hasSeededRef.current) return;
    if (!isLoading && (books?.length ?? 0) === 0) {
      hasSeededRef.current = true;
      (async () => {
        const count = await BookRepository.count();
        if (count === 0) {
          const now = Date.now();
          const samples = [
            { id: 'sample-alice', title: "Alice's Adventures in Wonderland", author: 'Lewis Carroll', filePath: 'assets/samples/alice.epub', originalFileName: 'alice.epub', format: 'epub', addedAt: now - 3000, isSample: 1 },
            { id: 'sample-devotion', title: 'Daily Devotion — Sample', author: 'Public Domain', filePath: 'assets/samples/sample-devotion.epub', originalFileName: 'sample-devotion.epub', format: 'epub', addedAt: now - 2000, isSample: 1 },
            { id: 'sample-pride', title: 'Pride and Prejudice — Excerpt', author: 'Jane Austen', filePath: 'assets/samples/pride-prejudice-excerpt.epub', originalFileName: 'pride-prejudice-excerpt.epub', format: 'epub', addedAt: now - 1000, isSample: 1 },
          ];
          for (const s of samples) {
            // eslint-disable-next-line no-await-in-loop
            await BookRepository.upsert(s as any);
            // Give each a fake progress for Continue Reading demo
            // eslint-disable-next-line no-await-in-loop
            await ProgressRepository.updatePosition(s.id, { progressPercent: s.id === 'sample-alice' ? 0.43 : s.id === 'sample-pride' ? 0.12 : 0.07 });
          }
          queryClient.invalidateQueries({ queryKey: ['books'] });
        }
      })();
    }
  }, [isLoading, books, queryClient]);

  // Load progress map — stable key to avoid Maximum update depth
  const bookIdsKey = (books ?? []).map(b => b.id).join(',');
  useEffect(() => {
    if (!books || books.length === 0) return;
    let cancelled = false;
    (async () => {
      const map: Record<string, number> = {};
      for (const b of books) {
        // eslint-disable-next-line no-await-in-loop
        const p = await ProgressRepository.getProgress(b.id);
        map[b.id] = p?.progressPercent ?? 0;
      }
      if (!cancelled) {
        setProgressMap(prev => {
          const keys = Object.keys(map);
          const prevKeys = Object.keys(prev);
          if (keys.length !== prevKeys.length) return map;
          for (const k of keys) if (prev[k] !== map[k]) return map;
          return prev;
        });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [bookIdsKey]);

  const handleBookPress = useCallback(
    (bookId: string) => navigation.navigate('BookDetails', { bookId }),
    [navigation],
  );

  const handleSearchFocus = useCallback(() => {
    navigation.navigate('Search');
  }, [navigation]);

  const handleImportPress = useCallback(() => {
    navigation.navigate('Reader', { bookId: 'placeholder' });
  }, [navigation]);

  const continueBook = books?.find(b => (progressMap[b.id] ?? 0) > 0 && (progressMap[b.id] ?? 0) < 1) ?? books?.[0];

  if (!books || books.length === 0) {
    if (isLoading) {
      return (
        <View style={[styles.container, { backgroundColor: t.bgPrimary, justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={[typography.body, { color: t.textSecondary }]}>Loading...</Text>
        </View>
      );
    }
    return (
      <View style={[styles.container, { backgroundColor: t.bgPrimary }]}>
        <View style={[styles.topNav, { backgroundColor: t.bgPrimary }]}>
          <SearchBar value={query} onChangeText={onChange} onSubmit={handleSearchFocus} testID="search-pill" />
          <TouchableOpacity onPress={() => setShowFilter(true)} style={styles.iconBtn}>
            <SlidersHorizontal size={24} color={t.iconTint} />
          </TouchableOpacity>
          <View style={[styles.avatar, { backgroundColor: t.avatarBg }]}>
            <Text style={{ color: t.textInverse }}>S</Text>
          </View>
        </View>
        <View style={styles.emptyWrap}>
          <Text style={[typography.heading, { color: t.textPrimary, marginBottom: spacing.sm }]}>Your shelf is empty</Text>
          <Text style={[typography.body, { color: t.textSecondary, marginBottom: spacing.xl, textAlign: 'center' }]}>Import a book to get started</Text>
          <Button title="Import a book" onPress={handleImportPress} testID="import-cta" />
          <TouchableOpacity onPress={handleImportPress} style={{ marginTop: spacing.lg }} testID="nav-reader-debug">
            <Text style={[typography.caption, { color: t.textSecondary }]}>Open Reader (debug)</Text>
          </TouchableOpacity>
        </View>
        <FilterSheet visible={showFilter} onClose={() => setShowFilter(false)} />
      </View>
    );
  }

  // Derive highlight tokens from committed query for bold
  const highlightTokens = query.trim().length >= 2 ? query.trim().split(/\s+/).filter(x => x.length >= 2) : undefined;

  return (
    <View style={[styles.container, { backgroundColor: t.bgPrimary }]}>
      <View style={[styles.topNav, { backgroundColor: t.bgPrimary }]}>
        <TouchableOpacity style={{ flex: 1 }} onPress={handleSearchFocus} activeOpacity={0.7}>
          <View pointerEvents="none">
            <SearchBar value={query} onChangeText={onChange} onSubmit={handleSearchFocus} testID="search-pill" />
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setShowFilter(true)} style={styles.iconBtn} testID="filter-btn">
          <SlidersHorizontal size={24} color={t.iconTint} />
        </TouchableOpacity>
        <View style={[styles.avatar, { backgroundColor: t.avatarBg }]}>
          <Text style={{ color: t.textInverse }}>S</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xl }}>
        {continueBook && (
          <View style={{ marginTop: spacing['2xl'] }}>
            <Text style={[typography.heading, { color: t.textPrimary, paddingHorizontal: spacing.xl, marginBottom: spacing.md }]}>Continue Reading</Text>
            <ContinueReadingCard book={continueBook} progress={progressMap[continueBook.id] ?? 0} onResume={() => handleBookPress(continueBook.id)} />
          </View>
        )}

        <View style={[styles.sectionHeader, { marginTop: spacing['3xl'] }]}>
          <Text style={[typography.heading, { color: t.textPrimary }]}>Book Collection</Text>
          <Text style={[typography.caption, { color: t.textSecondary }]}>5 columns</Text>
        </View>

        <BookGrid books={books} onPress={handleBookPress} progressMap={progressMap} highlightTokens={highlightTokens} numColumns={5} />

        <StatsWidget />

        <View style={[styles.sectionHeader, { marginTop: spacing['3xl'] }]}>
          <Text style={[typography.heading, { color: t.textPrimary }]}>Recently Added</Text>
          <Text style={[typography.body, { color: t.textSecondary }]} onPress={() => setShowFilter(true)}>
            All
          </Text>
        </View>
        <BookGrid books={[...books].sort((a, b) => b.addedAt - a.addedAt).slice(0, 5)} onPress={handleBookPress} progressMap={progressMap} numColumns={5} />
      </ScrollView>

      <FilterSheet visible={showFilter} onClose={() => setShowFilter(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topNav: { height: 56, flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.xl, gap: spacing.md },
  iconBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  avatar: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  emptyWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.xl, marginBottom: spacing.md },
});
