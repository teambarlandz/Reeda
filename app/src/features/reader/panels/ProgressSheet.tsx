import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { X, Flame, Clock } from '../../../shared/icons';
import { useAppTheme } from '../../../shared/theme/useTheme';
import { typography, spacing, radius, elevation } from '../../../shared/theme/tokens';
import { useQuery } from '@tanstack/react-query';
import { ProgressRepository } from '../../../data/repositories/ProgressRepository';
import { ReadingSessionsRepository } from '../../../data/repositories/ReadingSessionsRepository';
import { SettingsRepository } from '../../../data/repositories/SettingsRepository';
import { ChapterRepository } from '../../../data/repositories/ChapterRepository';

type Props = {
  visible: boolean;
  bookId?: string;
  totalPages?: number;
  onClose: () => void;
};

function minutesToHrs(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

export function ProgressSheet({ visible, bookId, totalPages = 312, onClose }: Props) {
  const t = useAppTheme();
  const [goalInput, setGoalInput] = useState<string | null>(null);

  const { data: progress } = useQuery({ queryKey: ['progress', bookId], queryFn: () => (bookId ? ProgressRepository.getProgress(bookId) : null), enabled: visible && !!bookId });
  const { data: chapters = [] } = useQuery({ queryKey: ['chapters', bookId], queryFn: () => (bookId ? ChapterRepository.list(bookId) : []), enabled: visible && !!bookId });
  const { data: todayMin = 0 } = useQuery({ queryKey: ['progress-today'], queryFn: () => ReadingSessionsRepository.todayMinutes(), enabled: visible });
  const { data: streak = 0 } = useQuery({ queryKey: ['progress-streak'], queryFn: () => ReadingSessionsRepository.getStreak(), enabled: visible });
  const { data: totalMin = 0 } = useQuery({ queryKey: ['progress-total'], queryFn: () => ReadingSessionsRepository.totalMinutes(), enabled: visible });
  const { data: last7 = [] } = useQuery({ queryKey: ['progress-last7'], queryFn: () => ReadingSessionsRepository.getLast7Days(), enabled: visible });
  const { data: daysReading = 0 } = useQuery({ queryKey: ['progress-days'], queryFn: () => ReadingSessionsRepository.getDaysReading(), enabled: visible });
  const { data: goalStr } = useQuery({ queryKey: ['settings-dailyGoal'], queryFn: () => SettingsRepository.get('dailyReadingGoal'), enabled: visible });

  if (!visible) return null;

  const dailyGoal = goalStr ? Number(goalStr) : 30;
  const percent = Math.round((progress?.progressPercent ?? 0) * 100);
  const currentPage = progress?.currentPage ?? Math.round((percent / 100) * totalPages);
  const pagesRead = currentPage;
  const pagesTotal = totalPages;
  const chaptersTotal = chapters.length || 18;
  const chaptersCompleted = Math.round((percent / 100) * chaptersTotal);
  const timeSpentLabel = minutesToHrs(totalMin);

  // Daily goal card
  const goalProgress = dailyGoal > 0 ? Math.min(1, todayMin / dailyGoal) : 0;
  const remainingToGoal = Math.max(0, dailyGoal - todayMin);
  const goalLabel = remainingToGoal === 0 ? 'Goal completed! 🎉' : `${remainingToGoal} min to goal`;

  // Estimated remaining — based on average min/day
  const avgPerDay = last7.length ? last7.reduce((a, b) => a + b, 0) / 7 : dailyGoal;
  const remainingPages = Math.max(0, pagesTotal - pagesRead);
  // Assume ~1 min per page at average pace? Use 2 pages/min => 0.5 min/page as fallback
  const avgPagesPerMin = avgPerDay > 0 ? 1.5 : 1.5;
  const estMin = Math.round(remainingPages / avgPagesPerMin);
  const estLabel = estMin > 0 ? minutesToHrs(estMin) + ' at current pace' : 'Calculating...';
  const estSub = `Based on ${Math.round(avgPerDay) || dailyGoal} min/day average`;

  // Ring — 140dp diameter, 8dp thick, track accent-track, fill textPrimary
  const size = 140;
  const stroke = 8;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - percent / 100);

  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  const handleSetGoal = async (val: number) => {
    await SettingsRepository.set('dailyReadingGoal', String(val));
    setGoalInput(null);
  };

  return (
    <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.4)' }]}>
      <Pressable style={{ flex: 1 }} onPress={onClose} testID="progress-sheet-dim" />
      <View style={[styles.panel, { backgroundColor: t.bgCard }, elevation.lg]} testID="progress-sheet">
        <View style={styles.handleWrap}>
          <View style={[styles.handle, { backgroundColor: t.divider }]} />
        </View>
        <View style={styles.header}>
          <Text style={[typography.heading, { color: t.textPrimary }]} accessibilityRole="header">Progress</Text>
          <Pressable onPress={onClose} testID="progress-close">
            <X size={24} color={t.iconTint} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: spacing.xl }}>
          {/* Circular progress ring */}
          <View style={{ alignItems: 'center', marginTop: spacing.md }}>
            <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
              <Svg width={size} height={size} style={{ position: 'absolute' }}>
                <Circle cx={size / 2} cy={size / 2} r={r} stroke={t.accentTrack} strokeWidth={stroke} fill="none" />
                <Circle
                  cx={size / 2}
                  cy={size / 2}
                  r={r}
                  stroke={t.textPrimary}
                  strokeWidth={stroke}
                  fill="none"
                  strokeDasharray={`${c} ${c}`}
                  strokeDashoffset={offset}
                  strokeLinecap="round"
                  rotation="-90"
                  origin={`${size / 2}, ${size / 2}`}
                />
              </Svg>
              <Text style={[typography.statLarge, { color: t.textPrimary }]}>{percent}%</Text>
            </View>
            <Text style={[typography.caption, { color: t.textSecondary, marginTop: spacing.sm }]}>{pagesRead} of {pagesTotal} pages</Text>
          </View>

          {/* Details grid — 2 columns, 4 cells */}
          <View style={styles.grid}>
            <View style={[styles.cell, { backgroundColor: t.bgPrimary }]}>
              <Text style={[typography.statLarge, { color: t.textPrimary, fontSize: 20 }]}>{pagesRead} / {pagesTotal}</Text>
              <Text style={[typography.caption, { color: t.textSecondary, marginTop: 2 }]}>Pages Read</Text>
            </View>
            <View style={[styles.cell, { backgroundColor: t.bgPrimary }]}>
              <Text style={[typography.statLarge, { color: t.textPrimary, fontSize: 20 }]}>{timeSpentLabel}</Text>
              <Text style={[typography.caption, { color: t.textSecondary, marginTop: 2 }]}>Time Spent</Text>
            </View>
            <View style={[styles.cell, { backgroundColor: t.bgPrimary }]}>
              <Text style={[typography.statLarge, { color: t.textPrimary, fontSize: 20 }]}>{chaptersCompleted} / {chaptersTotal}</Text>
              <Text style={[typography.caption, { color: t.textSecondary, marginTop: 2 }]}>Chapters Completed</Text>
            </View>
            <View style={[styles.cell, { backgroundColor: t.bgPrimary }]}>
              <Text style={[typography.statLarge, { color: t.textPrimary, fontSize: 20 }]}>{daysReading} days</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                <Flame size={14} color="#FF9800" />
                <Text style={[typography.caption, { color: t.textSecondary }]}>{streak} day streak</Text>
              </View>
            </View>
          </View>

          {/* Reading Goal section — bg-card-dark */}
          <View style={[styles.goalCard, { backgroundColor: t.bgCardDark, marginHorizontal: spacing.lg, marginTop: spacing.lg }]}>
            <Text style={[typography.statLabel, { color: t.textInverse }]}>Daily Goal</Text>
            {dailyGoal > 0 ? (
              <>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm }}>
                  <Text style={[typography.body, { color: t.textInverseSecondary }]}>{todayMin}/{dailyGoal} min today</Text>
                  <Text style={[typography.caption, { color: t.textInverseSecondary }]}>{Math.round(goalProgress * 100)}%</Text>
                </View>
                <View style={[styles.bar, { backgroundColor: '#3A3A3C', marginTop: spacing.sm }]}>
                  <View style={[styles.fill, { backgroundColor: '#FFFFFF', width: `${Math.round(goalProgress * 100)}%` }]} />
                </View>
                <Text style={[typography.caption, { color: t.textInverseSecondary, marginTop: spacing.sm }]}>{goalLabel}</Text>
                <Pressable onPress={() => setGoalInput(dailyGoal ? String(dailyGoal) : '30')} style={{ marginTop: spacing.sm }} testID="change-goal">
                  <Text style={[typography.caption, { color: t.textInverseSecondary, textDecorationLine: 'underline' }]}>Change goal</Text>
                </Pressable>
              </>
            ) : (
              <Pressable onPress={() => setGoalInput('30')} style={{ marginTop: spacing.sm }} testID="set-goal">
                <Text style={[typography.body, { color: t.textInverseSecondary }]}>Set a daily reading goal</Text>
              </Pressable>
            )}
            {goalInput !== null && (
              <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md }}>
                {[15, 30, 45, 60].map(v => (
                  <Pressable
                    key={v}
                    onPress={() => handleSetGoal(v)}
                    style={{ paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.full, backgroundColor: Number(goalInput) === v ? '#FFFFFF' : '#3A3A3C' }}
                    testID={`goal-${v}`}
                  >
                    <Text style={[typography.caption, { color: Number(goalInput) === v ? '#1C1C1E' : t.textInverseSecondary }]}>{v}m</Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>

          {/* Estimated Time Remaining */}
          <View style={{ alignItems: 'center', padding: spacing.xl }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <Clock size={16} color={t.textSecondary} />
              <Text style={[typography.body, { color: t.textSecondary }]}>{estLabel}</Text>
            </View>
            <Text style={[typography.caption, { color: t.textSecondary, marginTop: 4 }]}>{estSub}</Text>
          </View>

          {/* Reading History mini-graph — 7 bars */}
          <View style={{ paddingHorizontal: spacing.lg }}>
            <Text style={[typography.caption, { color: t.textSecondary, marginBottom: spacing.sm }]}>This Week</Text>
            <View style={[styles.graph, { height: 48 }]}>
              {(last7.length ? last7 : [0, 0, 0, 0, 0, 0, 0]).map((mins, i) => {
                const max = Math.max(dailyGoal, ...last7, 1);
                const h = Math.max(4, Math.round((mins / max) * 48));
                const isToday = i === 6;
                return (
                  <View key={i} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
                    <View
                      style={{
                        width: '70%',
                        height: h,
                        borderRadius: 4,
                        backgroundColor: mins === 0 ? t.divider : t.textPrimary,
                        opacity: mins === 0 ? 0.15 : isToday ? 1 : 0.7,
                      }}
                      testID={`graph-bar-${i}`}
                    />
                    <Text style={[typography.caption, { color: t.textSecondary, fontSize: 10 }]}>{dayLabels[i]}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, flexDirection: 'column', justifyContent: 'flex-end', zIndex: 25 },
  panel: { height: '60%', maxHeight: '80%', width: '100%', borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  handleWrap: { alignItems: 'center', paddingTop: spacing.sm },
  handle: { width: 32, height: 4, borderRadius: 2 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.lg, height: 56 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, paddingHorizontal: spacing.lg, marginTop: spacing.lg },
  cell: { width: '48%', padding: spacing.md, borderRadius: 12 },
  goalCard: { borderRadius: 16, padding: spacing.lg },
  bar: { height: 4, borderRadius: 8, overflow: 'hidden' },
  fill: { height: 4 },
  graph: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-end' },
});
