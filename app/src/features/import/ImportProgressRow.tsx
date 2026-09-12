import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useAppTheme } from '../../shared/theme/useTheme';
import { typography, spacing } from '../../shared/theme/tokens';

type Props = {
  fileName: string;
  fileSize?: number;
  status: string;
};

export function ImportProgressRow({ fileName, fileSize, status }: Props) {
  const t = useAppTheme();
  return (
    <View style={[styles.row, { backgroundColor: t.bgCard }]} testID={`import-progress-${fileName}`}>
      <ActivityIndicator size="small" color={t.textPrimary} />
      <View style={{ flex: 1, marginLeft: spacing.md }}>
        <Text style={[typography.body, { color: t.textPrimary }]} numberOfLines={1}>
          {fileName}
        </Text>
        {fileSize && <Text style={[typography.caption, { color: t.textSecondary }]}>{(fileSize / 1024 / 1024).toFixed(1)} MB</Text>}
      </View>
      <Text style={[typography.caption, { color: t.textSecondary }]}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, borderRadius: 12, marginBottom: spacing.sm },
});
