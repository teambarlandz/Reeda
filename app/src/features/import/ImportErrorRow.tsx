import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useAppTheme } from '../../shared/theme/useTheme';
import { typography, spacing, radius } from '../../shared/theme/tokens';
import type { ImportError } from '../../data/files/FileStorage';

type Props = {
  fileName: string;
  error: ImportError;
  onRetry?: () => void;
  onOpenExisting?: () => void;
  onImportAnyway?: () => void;
  onCancel?: () => void;
};

export function ImportErrorRow({ fileName, error, onRetry, onOpenExisting, onImportAnyway, onCancel }: Props) {
  const t = useAppTheme();
  return (
    <View style={[styles.card, { backgroundColor: t.bgCard }]} testID={`import-error-${fileName}`} accessibilityLabel={`Import error: ${error.title} for ${fileName}`} accessibilityRole="alert">
      <Text style={[typography.title, { color: t.textPrimary }]}>{error.title}</Text>
      <Text style={[typography.body, { color: t.textSecondary, marginTop: 4 }]}>{error.body}</Text>
      <Text style={[typography.caption, { color: t.textSecondary, marginTop: 4 }]}>{fileName}</Text>
      <View style={styles.actions}>
        {error.case === 'duplicate' && (
          <>
            <Pressable onPress={onOpenExisting} style={[styles.btn, { backgroundColor: t.bgCardDark }]} testID="open-existing" accessibilityLabel="Open existing book" accessibilityRole="button">
              <Text style={[typography.button, { color: t.textInverse }]}>Open Existing</Text>
            </Pressable>
            <Pressable onPress={onImportAnyway} style={[styles.btn, { backgroundColor: t.bgSearch }]} testID="import-anyway" accessibilityLabel="Import duplicate anyway" accessibilityRole="button">
              <Text style={[typography.button, { color: t.textPrimary }]}>Import Anyway</Text>
            </Pressable>
          </>
        )}
        {error.case === 'corrupt' && (
          <>
            <Pressable onPress={onRetry} style={[styles.btn, { backgroundColor: t.bgCardDark }]} testID="retry" accessibilityLabel="Retry import" accessibilityRole="button">
              <Text style={[typography.button, { color: t.textInverse }]}>Retry</Text>
            </Pressable>
            <Pressable onPress={onCancel} style={[styles.btn, { backgroundColor: t.bgSearch }]} testID="cancel" accessibilityLabel="Cancel import" accessibilityRole="button">
              <Text style={[typography.button, { color: t.textPrimary }]}>Cancel</Text>
            </Pressable>
          </>
        )}
        {error.case === 'tooLarge' && (
          <>
            <Pressable onPress={onImportAnyway} style={[styles.btn, { backgroundColor: t.bgCardDark }]} testID="open-anyway" accessibilityLabel="Import large file anyway" accessibilityRole="button">
              <Text style={[typography.button, { color: t.textInverse }]}>Open Anyway</Text>
            </Pressable>
            <Pressable onPress={onCancel} style={[styles.btn, { backgroundColor: t.bgSearch }]} testID="cancel" accessibilityLabel="Cancel import" accessibilityRole="button">
              <Text style={[typography.button, { color: t.textPrimary }]}>Cancel</Text>
            </Pressable>
          </>
        )}
        {error.case === 'unsupported' && (
          <Pressable onPress={onCancel} style={[styles.btn, { backgroundColor: t.bgSearch }]} testID="ok" accessibilityLabel="OK" accessibilityRole="button">
            <Text style={[typography.button, { color: t.textPrimary }]}>OK</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16, borderRadius: 12, marginBottom: 8 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 12 },
  btn: { paddingHorizontal: 16, height: 36, borderRadius: 9999, justifyContent: 'center', alignItems: 'center' },
});
