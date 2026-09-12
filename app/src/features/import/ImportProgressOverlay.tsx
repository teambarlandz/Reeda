import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useImportStore } from './importStore';
import { useAppTheme } from '../../shared/theme/useTheme';
import { typography, spacing, radius } from '../../shared/theme/tokens';
import { ImportProgressRow } from './ImportProgressRow';
import { ImportErrorRow } from './ImportErrorRow';
import { useNavigation } from '@react-navigation/native';
import { useImport } from './useImport';

export function ImportProgressOverlay() {
  const t = useAppTheme();
  const navigation = useNavigation<any>();
  const { items } = useImportStore();
  const { importAnyway, clear, pickAndImport } = useImport();

  if (items.length === 0) return null;

  const hasActive = items.some(i => i.status === 'pending' || i.status === 'copying' || i.status === 'parsing');
  const hasErrors = items.some(i => i.status === 'error');

  return (
    <View style={[styles.container, { backgroundColor: t.bgCard, borderColor: t.divider }]} testID="import-overlay">
      <View style={styles.header}>
        <Text style={[typography.title, { color: t.textPrimary }]}>Importing… {hasActive ? '' : hasErrors ? '— review' : '— done'}</Text>
        <Text style={[typography.caption, { color: t.textSecondary }]} onPress={clear}>
          Clear
        </Text>
      </View>
      <ScrollView horizontal={false} style={{ maxHeight: 160 }} contentContainerStyle={{ gap: spacing.sm }}>
        {items.map(item => {
          if (item.status === 'error' && item.error) {
            return (
              <ImportErrorRow
                key={item.id}
                fileName={item.fileName}
                error={item.error}
                onOpenExisting={() => navigation.navigate('BookDetails', { bookId: item.existingId ?? '' })}
                onImportAnyway={() => importAnyway(item.id)}
                onRetry={pickAndImport}
                onCancel={clear}
              />
            );
          }
          return <ImportProgressRow key={item.id} fileName={item.fileName} fileSize={item.fileSize} status={item.status} />;
        })}
      </ScrollView>
      {hasActive && <Text style={[typography.caption, { color: t.textSecondary, marginTop: spacing.sm }]}>You can continue browsing — import runs in background.</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginHorizontal: spacing.xl, marginTop: spacing.md, padding: spacing.md, borderRadius: radius.lg, borderWidth: 1, maxHeight: 220 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
});
