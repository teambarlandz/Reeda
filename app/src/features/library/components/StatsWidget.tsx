import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppTheme } from '../../../shared/theme/useTheme';
import { typography, spacing, radius } from '../../../shared/theme/tokens';
import { Card } from '../../../shared/ui';

type Props = {
  readingGoalMin?: number;
  bookmarks?: { active: number; chapter: number; note: number };
};

export function StatsWidget({ readingGoalMin = 38, bookmarks = { active: 3, chapter: 14, note: 5 } }: Props) {
  const t = useAppTheme();
  return (
    <View style={[styles.row, { paddingHorizontal: spacing.xl, gap: spacing.lg }]}>
      <Card variant="dark" style={[styles.card, { backgroundColor: t.bgCardDark, padding: spacing.lg }]}>
        <Text style={[typography.statLabel, { color: t.textInverse }]}>Reading Goals</Text>
        <Text style={{ marginTop: spacing.sm }}>
          <Text style={[typography.statLarge, { color: t.textInverse }]}>{readingGoalMin}</Text>
          <Text style={[typography.statUnit, { color: t.textInverseSecondary }]}> min/day</Text>
        </Text>
        <View style={[styles.bar, { backgroundColor: '#3A3A3C', marginTop: spacing.md }]}>
          <View style={[styles.fill, { backgroundColor: '#FFFFFF', width: '70%' }]} />
        </View>
      </Card>
      <Card variant="dark" style={[styles.card, { backgroundColor: t.bgCardDark, padding: spacing.lg }]}>
        <Text style={[typography.statLabel, { color: t.textInverse }]}>Bookmarks</Text>
        <View style={styles.kv}>
          <Text style={[typography.body, { color: t.textInverseSecondary }]}>3 active</Text>
          <Text style={[typography.body, { color: t.textInverse }]}>14</Text>
        </View>
        <View style={styles.kv}>
          <Text style={[typography.body, { color: t.textInverseSecondary }]}>Chapter {bookmarks.chapter}</Text>
          <Text style={[typography.body, { color: t.textInverse }]}>212</Text>
        </View>
        <View style={styles.kv}>
          <Text style={[typography.body, { color: t.textInverseSecondary }]}>Note</Text>
          <Text style={[typography.body, { color: t.textInverse }]}>{bookmarks.note}</Text>
        </View>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', marginTop: spacing['3xl'] },
  card: { flex: 1, borderRadius: radius.lg },
  bar: { height: 4, borderRadius: 8, overflow: 'hidden' },
  fill: { height: 4 },
  kv: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
});
