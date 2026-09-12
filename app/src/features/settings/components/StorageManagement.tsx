import React, { useCallback, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import RNFS from 'react-native-fs';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAppTheme } from '../../../shared/theme/useTheme';
import { typography, spacing, radius } from '../../../shared/theme/tokens';
import { BookRepository } from '../../../data/repositories/BookRepository';
import { SearchHistoryRepository } from '../../../data/repositories/SearchHistoryRepository';
import { FileStorage } from '../../../data/files/FileStorage';

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function StorageManagement() {
  const t = useAppTheme();
  const queryClient = useQueryClient();
  const [clearing, setClearing] = useState(false);

  const { data: bookCount } = useQuery({
    queryKey: ['book-count'],
    queryFn: () => BookRepository.count(),
  });

  const { data: storageInfo } = useQuery({
    queryKey: ['storage-info'],
    queryFn: async () => {
      const all = await BookRepository.list();
      const counts: Record<string, number> = {};
      let totalSize = 0;
      let unknownSize = 0;
      for (const b of all) {
        counts[b.format] = (counts[b.format] ?? 0) + 1;
        if (b.fileSize) {
          totalSize += b.fileSize;
        } else {
          unknownSize++;
        }
      }
      // Cover cache size (informational only)
      let coverSize = 0;
      try {
        const coverDir = FileStorage.getCoverDir();
        const exists = await RNFS.exists(coverDir);
        if (exists) {
          const files = await RNFS.readDir(coverDir);
          for (const f of files) {
            if (f.name.endsWith('.jpg')) coverSize += f.size;
          }
        }
      } catch {}
      return { counts, totalSize, unknownSize, coverSize, bookCount: all.length };
    },
  });

  const handleClearHistory = useCallback(() => {
    Alert.alert('Clear search history', 'Remove all recent searches? Book files and covers are not affected.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          setClearing(true);
          await SearchHistoryRepository.clear();
          queryClient.invalidateQueries({ queryKey: ['search_history'] });
          setClearing(false);
        },
      },
    ]);
  }, [queryClient]);

  const formats = storageInfo ? Object.entries(storageInfo.counts).filter(([, c]) => c > 0) : [];

  return (
    <View style={[styles.card, { backgroundColor: t.bgCardDark }]}>
      <Text style={[typography.body, { color: t.textInverse, marginBottom: spacing.md }]}>Storage</Text>

      <View style={styles.row}>
        <Text style={[typography.caption, { color: t.textInverseSecondary }]}>Books on device</Text>
        <Text style={[typography.caption, { color: t.textInverse }]}>{bookCount ?? 0}</Text>
      </View>

      {storageInfo && storageInfo.totalSize > 0 && (
        <View style={styles.row}>
          <Text style={[typography.caption, { color: t.textInverseSecondary }]}>Book files</Text>
          <Text style={[typography.caption, { color: t.textInverse }]}>
            {formatBytes(storageInfo.totalSize)}
            {storageInfo.unknownSize > 0 ? ` (+ ${storageInfo.unknownSize} unknown)` : ''}
          </Text>
        </View>
      )}

      {storageInfo && storageInfo.coverSize > 0 && (
        <View style={styles.row}>
          <Text style={[typography.caption, { color: t.textInverseSecondary }]}>Cover cache</Text>
          <Text style={[typography.caption, { color: t.textInverse }]}>{formatBytes(storageInfo.coverSize)}</Text>
        </View>
      )}

      {formats.length > 0 && (
        <View style={styles.formatRow}>
          {formats.map(([fmt, count]) => (
            <View key={fmt} style={styles.formatBadge}>
              <Text style={[typography.caption, { color: t.textInverseSecondary, textTransform: 'uppercase' }]}>{fmt}</Text>
              <Text style={[typography.caption, { color: t.textInverse }]}>{count}</Text>
            </View>
          ))}
        </View>
      )}

      <Pressable
        onPress={handleClearHistory}
        style={[styles.clearBtn, clearing && { opacity: 0.5 }]}
        disabled={clearing}
        accessibilityLabel="Clear search history"
        accessibilityRole="button"
        testID="clear-search-history"
      >
        <Text style={[typography.caption, { color: t.textPrimary }]}>{clearing ? 'Clearing...' : 'Clear search history'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.lg, padding: spacing.lg },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  formatRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  formatBadge: { flexDirection: 'row', gap: spacing.xs, backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.full },
  clearBtn: { marginTop: spacing.sm, paddingVertical: spacing.sm },
});
