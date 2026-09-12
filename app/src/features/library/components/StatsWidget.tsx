import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Flame } from '../../../shared/icons';
import { useAppTheme } from '../../../shared/theme/useTheme';
import { typography, spacing, radius } from '../../../shared/theme/tokens';
import { Card } from '../../../shared/ui';
import { useQuery } from '@tanstack/react-query';
import { ReadingSessionsRepository } from '../../../data/repositories/ReadingSessionsRepository';
import { BookmarkRepository } from '../../../data/repositories/BookmarkRepository';
import { HighlightRepository } from '../../../data/repositories/HighlightRepository';
import { NoteRepository } from '../../../data/repositories/NoteRepository';
import { SettingsRepository } from '../../../data/repositories/SettingsRepository';

export function StatsWidget() {
  const t = useAppTheme();
  const { data: todayMin = 0 } = useQuery({ queryKey: ['stats-today'], queryFn: () => ReadingSessionsRepository.todayMinutes() });
  const { data: streak = 0 } = useQuery({ queryKey: ['stats-streak'], queryFn: () => ReadingSessionsRepository.getStreak() });
  const { data: bookmarks = [] } = useQuery({ queryKey: ['bookmarks-all'], queryFn: () => BookmarkRepository.listAll() });
  const { data: highlights = [] } = useQuery({ queryKey: ['highlights-all'], queryFn: () => HighlightRepository.listAll() });
  const { data: notes = [] } = useQuery({ queryKey: ['notes-all'], queryFn: () => NoteRepository.listAll() });
  const { data: goalStr } = useQuery({ queryKey: ['settings-dailyGoal'], queryFn: () => SettingsRepository.get('dailyReadingGoal') });
  const dailyGoal = goalStr ? Number(goalStr) : 30;
  const goalProgress = dailyGoal > 0 ? Math.min(1, todayMin / dailyGoal) : 0;
  const activeBookmarks = Array.isArray(bookmarks) ? bookmarks.length : 0;

  return (
    <View style={[styles.row, { paddingHorizontal: spacing.xl, gap: spacing.lg }]} testID="stats-widget">
      <Card variant="dark" style={[styles.card, { backgroundColor: t.bgCardDark, padding: spacing.lg }]}>
        <Text style={[typography.statLabel, { color: t.textInverse }]}>Reading Goals</Text>
        <Text style={{ marginTop: spacing.sm }} testID="stats-today">
          <Text style={[typography.statLarge, { color: t.textInverse }]}>{todayMin}</Text>
          <Text style={[typography.statUnit, { color: t.textInverseSecondary }]}> min today</Text>
        </Text>
        <Text style={[typography.caption, { color: t.textInverseSecondary, marginTop: 2 }]}>{dailyGoal} min/day goal</Text>
        <View style={[styles.bar, { backgroundColor: '#3A3A3C', marginTop: spacing.md }]}>
          <View style={[styles.fill, { backgroundColor: '#FFFFFF', width: `${Math.round(goalProgress * 100)}%` }]} testID="stats-goal-bar" />
        </View>
        {streak > 0 && (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm, gap: 4 }}>
            <Flame size={14} color="#FF9800" />
            <Text style={[typography.caption, { color: t.textInverseSecondary }]}>{streak} day streak</Text>
          </View>
        )}
      </Card>
      <Card variant="dark" style={[styles.card, { backgroundColor: t.bgCardDark, padding: spacing.lg }]}>
        <Text style={[typography.statLabel, { color: t.textInverse }]}>Bookmarks</Text>
        <View style={styles.kv}>
          <Text style={[typography.body, { color: t.textInverseSecondary }]}>{activeBookmarks} active</Text>
          <Text style={[typography.body, { color: t.textInverse }]}>{activeBookmarks}</Text>
        </View>
        <View style={styles.kv}>
          <Text style={[typography.body, { color: t.textInverseSecondary }]}>Chapter</Text>
          <Text style={[typography.body, { color: t.textInverse }]}>{highlights.length}</Text>
        </View>
        <View style={styles.kv}>
          <Text style={[typography.body, { color: t.textInverseSecondary }]}>Note</Text>
          <Text style={[typography.body, { color: t.textInverse }]}>{notes.length}</Text>
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
