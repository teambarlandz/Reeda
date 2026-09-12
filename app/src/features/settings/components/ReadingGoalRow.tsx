import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { SettingsRepository } from '../../../data/repositories/SettingsRepository';
import { useAppTheme } from '../../../shared/theme/useTheme';
import { typography, spacing, radius } from '../../../shared/theme/tokens';

export function ReadingGoalRow() {
  const t = useAppTheme();
  const [editing, setEditing] = React.useState(false);
  const { data: goalStr, refetch } = useQuery({
    queryKey: ['settings-dailyGoal'],
    queryFn: () => SettingsRepository.get('dailyReadingGoal'),
  });
  const dailyGoal = goalStr ? Number(goalStr) : 30;

  const handleSetGoal = async (val: number) => {
    await SettingsRepository.set('dailyReadingGoal', String(val));
    setEditing(false);
    refetch();
  };

  return (
    <View style={[styles.card, { backgroundColor: t.bgCardDark }]}>
      <View style={styles.header}>
        <View>
          <Text style={[typography.body, { color: t.textInverse }]}>Daily Reading Goal</Text>
          <Text style={[typography.caption, { color: t.textInverseSecondary, marginTop: spacing.xs }]}>{dailyGoal} min/day</Text>
        </View>
        <Pressable onPress={() => setEditing(!editing)} style={styles.editBtn} testID="edit-goal" accessibilityLabel={editing ? 'Cancel change goal' : 'Change daily reading goal'} accessibilityRole="button">
          <Text style={[typography.caption, { color: t.textInverseSecondary, textDecorationLine: 'underline' }]}>
            {editing ? 'Cancel' : 'Change'}
          </Text>
        </Pressable>
      </View>
      {editing && (
        <View style={styles.pickerRow}>
          {[15, 30, 45, 60].map(v => (
            <Pressable
              key={v}
              onPress={() => handleSetGoal(v)}
              style={[styles.pill, { backgroundColor: dailyGoal === v ? '#FFFFFF' : '#3A3A3C' }]}
              testID={`goal-${v}`}
              accessibilityLabel={`Set goal to ${v} minutes`}
              accessibilityRole="button"
              accessibilityState={{ selected: dailyGoal === v }}
            >
              <Text style={[typography.caption, { color: dailyGoal === v ? '#1C1C1E' : t.textInverseSecondary }]}>{v}m</Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.lg, padding: spacing.lg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  editBtn: { padding: spacing.xs },
  pickerRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  pill: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.full },
});
