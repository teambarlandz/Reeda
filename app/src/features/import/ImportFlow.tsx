import React, { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useAppTheme } from '../../shared/theme/useTheme';
import { typography, spacing } from '../../shared/theme/tokens';
import { Button } from '../../shared/ui';
import { useImport } from './useImport';
import { ImportProgressRow } from './ImportProgressRow';
import { ImportErrorRow } from './ImportErrorRow';
import { useNavigation } from '@react-navigation/native';

type Props = {
  onClose?: () => void;
};

export function ImportFlow({ onClose }: Props) {
  const t = useAppTheme();
  const navigation = useNavigation<any>();
  const { items, importFiles, pickAndImport, importAnyway, clear } = useImport();

  // Share sheet: ReceiveSharingIntent.getReceivedFiles — same pipeline as picker per phase-1.md:6.2
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const ReceiveSharingIntent = require('react-native-receive-sharing-intent');
        const files = await ReceiveSharingIntent.getReceivedFiles();
        if (mounted && files && files.length > 0) {
          const mapped = files.map((f: any) => ({ uri: f.filePath ?? f.uri, name: f.fileName ?? 'shared', size: f.fileSize, type: f.mimeType }));
          await importFiles(mapped);
          ReceiveSharingIntent.clearReceivedFiles();
        }
      } catch {}
    })();
    return () => {
      mounted = false;
    };
  }, [importFiles]);

  const hasItems = items.length > 0;

  return (
    <View style={[styles.container, { backgroundColor: t.bgPrimary }]} testID="import-flow">
      <View style={styles.header}>
        <Text style={[typography.heading, { color: t.textPrimary }]}>Import Books</Text>
        <Text style={[typography.body, { color: t.textSecondary, marginTop: 4 }]}>EPUB, PDF, TXT, MOBI — max 10 at once</Text>
      </View>

      <View style={{ padding: spacing.xl }}>
        <Button title="Choose Files" onPress={pickAndImport} testID="import-pick" />
        {hasItems && <Button title="Clear" onPress={clear} testID="import-clear" />}
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.md }}>
        {items.map(item => {
          if (item.status === 'error' && item.error) {
            return (
              <ImportErrorRow
                key={item.id}
                fileName={item.fileName}
                error={item.error}
                onOpenExisting={() => navigation.navigate('BookDetails', { bookId: item.existingId ?? 'existing' })}
                onImportAnyway={() => importAnyway(item.id)}
                onRetry={pickAndImport}
                onCancel={clear}
              />
            );
          }
          return <ImportProgressRow key={item.id} fileName={item.fileName} fileSize={item.fileSize} status={item.status} />;
        })}
        {!hasItems && <Text style={[typography.body, { color: t.textSecondary, textAlign: 'center', marginTop: spacing.xl }]}>No files yet — tap Choose Files or share a PDF from another app.</Text>}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: spacing.xl, paddingBottom: 0 },
});
