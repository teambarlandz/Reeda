import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, runOnJS } from 'react-native-reanimated';
import { useAppTheme } from '../../../shared/theme/useTheme';
import { typography, spacing } from '../../../shared/theme/tokens';

type Props = {
  progress: number; // 0..1
  totalPages: number;
  currentPage: number;
  chapters: Array<{ pageStart?: number; title: string }>;
  onScrub: (progress: number) => void;
  onDetailPress: () => void;
};

export function ProgressStrip({ progress, totalPages, currentPage, chapters, onScrub, onDetailPress }: Props) {
  const t = useAppTheme();
  const [expanded, setExpanded] = useState(false);
  const width = useSharedValue(0);

  const onUpdate = (x: number) => {
    const p = Math.max(0, Math.min(1, x / (width.value || 1)));
    runOnJS(onScrub)(p);
  };

  const pan = Gesture.Pan()
    .onBegin(e => onUpdate(e.x))
    .onUpdate(e => onUpdate(e.x));

  const heightStyle = useAnimatedStyle(() => ({
    height: expanded ? 32 : 2,
  }));

  return (
    <View style={styles.container} testID="progress-strip">
      <Pressable onLongPress={() => setExpanded(!expanded)} onPress={onDetailPress} style={{ flex: 1 }}>
        <View
          onLayout={e => (width.value = e.nativeEvent.layout.width)}
          style={[styles.track, { backgroundColor: t.accentTrack }]}
        >
          <Animated.View style={[{ backgroundColor: t.textPrimary, height: '100%', width: `${progress * 100}%` }, heightStyle]} />
          {/* chapter ticks */}
          {chapters.map((c, i) => {
            const left = ((c.pageStart ?? 1) / totalPages) * 100;
            return <View key={i} style={[styles.tick, { left: `${left}%`, backgroundColor: t.textPrimary, opacity: 0.4 }]} />;
          })}
        </View>
        {expanded && (
          <Text style={[typography.caption, { color: t.textSecondary, textAlign: 'center', marginTop: spacing.xs }]}>
            {currentPage} / {totalPages}
          </Text>
        )}
      </Pressable>
      {expanded && (
        <GestureDetector gesture={pan}>
          <Animated.View style={[styles.scrubber, { backgroundColor: t.bgCard }]} />
        </GestureDetector>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'absolute', bottom: 56, left: 0, right: 0, paddingHorizontal: spacing.xl, paddingBottom: spacing.sm },
  track: { height: 2, borderRadius: 8, overflow: 'hidden', flexDirection: 'row' },
  tick: { position: 'absolute', top: 0, bottom: 0, width: 2 },
  scrubber: { height: 32, borderRadius: 8, marginTop: 4 },
});
