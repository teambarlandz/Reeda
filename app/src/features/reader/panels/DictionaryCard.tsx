import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { X, Clock } from '../../../shared/icons';
import { useAppTheme } from '../../../shared/theme/useTheme';
import { typography, spacing, radius, elevation } from '../../../shared/theme/tokens';
import { useQuery } from '@tanstack/react-query';
import { DictionaryHistoryRepository } from '../../../data/repositories/DictionaryHistoryRepository';

type Props = {
  visible: boolean;
  word?: string;
  definition?: string;
  partOfSpeech?: string;
  example?: string;
  onClose: () => void;
};

export function DictionaryCard({ visible, word, definition, partOfSpeech, example, onClose }: Props) {
  const t = useAppTheme();
  const [showHistory, setShowHistory] = React.useState(false);
  const { data: history } = useQuery({ queryKey: ['dict-history'], queryFn: () => DictionaryHistoryRepository.list(), enabled: visible });

  if (!visible || !word) return null;

  return (
    <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.3)' }]}>
      <Pressable style={{ flex: 1 }} onPress={onClose} />
      <View style={[styles.card, { backgroundColor: t.bgCard, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg }, elevation.md]}>
        <View style={styles.header}>
          <View>
            <Text style={[typography.title, { color: t.textPrimary, fontSize: 18 }]} accessibilityRole="header">{word}</Text>
            {partOfSpeech && <Text style={[typography.caption, { color: t.textSecondary }]}>{partOfSpeech}</Text>}
          </View>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Pressable onPress={() => setShowHistory(v => !v)} testID="dict-history-clock">
              <Clock size={20} color={t.iconTint} />
            </Pressable>
            <Pressable onPress={onClose} testID="dict-close">
              <X size={24} color={t.iconTint} />
            </Pressable>
          </View>
        </View>
        <ScrollView style={{ maxHeight: 200 }} contentContainerStyle={{ padding: spacing.lg }}>
          <Text style={[typography.body, { color: t.textPrimary }]}>{definition ?? 'No definition found.'}</Text>
          {example && <Text style={[typography.body, { color: t.textSecondary, fontStyle: 'italic', marginTop: spacing.md }]}>{example}</Text>}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: spacing.lg }}>
            <Clock size={16} color={t.iconTint} />
            <Text style={[typography.caption, { color: t.textSecondary, marginLeft: spacing.sm }]}>History: {(history ?? []).slice(0, 3).map(h => h.word).join(', ')}</Text>
          </View>
          {showHistory && (
            <View style={{ marginTop: spacing.md, padding: spacing.md, backgroundColor: t.bgPrimary, borderRadius: radius.md }}>
              {(history ?? []).slice(0, 50).map(h => (
                <Text key={h.word} style={[typography.caption, { color: t.textSecondary, paddingVertical: 2 }]}>
                  {h.word} — {h.definition.slice(0, 40)}
                </Text>
              ))}
              {(history ?? []).length === 0 && <Text style={[typography.caption, { color: t.textSecondary }]}>No history yet</Text>}
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, flexDirection: 'column', justifyContent: 'flex-end', zIndex: 22 },
  card: { maxHeight: '50%', width: '100%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: spacing.lg },
});
