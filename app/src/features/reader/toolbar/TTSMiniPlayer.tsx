import React, { useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, withTiming, useSharedValue, runOnJS } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Play, Pause, SkipBack, SkipForward, X, VolumeX } from '../../../shared/icons';
import { useAppTheme } from '../../../shared/theme/useTheme';
import { typography, spacing, radius, elevation } from '../../../shared/theme/tokens';
import { useTtsStore } from '../../../tts/ttsStore';
import { getChapterProgress } from '../../../tts/TtsQueue';

type Props = {
  visible: boolean;
  onTogglePlay: () => void;
  onSkipBack: () => void;
  onSkipForward: () => void;
  onDismiss: () => void;
  onCycleRate: () => void;
  onOpenExpanded: () => void;
  onOpenToc: () => void;
  onSeek?: (p: number) => void;
};

export function TTSMiniPlayer({ visible, onTogglePlay, onSkipBack, onSkipForward, onDismiss, onCycleRate, onOpenExpanded, onOpenToc, onSeek }: Props) {
  const t = useAppTheme();
  const { isPlaying, rate, queue, currentIndex, engineAvailable, hasTextLayer } = useTtsStore();
  const width = useSharedValue(0);

  const current = queue[currentIndex];
  const label = current ? `Ch. ${current.chapterIndex + 1}` : '—';
  const progress = getChapterProgress(queue, currentIndex);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: withTiming(visible ? 0 : 64, { duration: 200 }) }],
    opacity: withTiming(visible ? 1 : 0, { duration: 180 }),
  }));

  const disabled = hasTextLayer === false || engineAvailable === false;

  // Keep mounted for animation, hide via style when not visible (combined chrome per spec)
  if (!visible && !disabled) {
    // still render off-screen for smooth slide; avoid early return to keep animation
  }

  const onScrubPress = useCallback(() => {
    if (disabled) return;
    onOpenExpanded();
  }, [disabled, onOpenExpanded]);

  const onSeekJS = useCallback(
    (x: number) => {
      if (disabled || !onSeek) return;
      const p = Math.max(0, Math.min(1, x / (width.value || 1)));
      onSeek(p);
    },
    [disabled, onSeek, width],
  );

  const pan = Gesture.Pan()
    .enabled(!disabled && !!onSeek)
    .onBegin(e => runOnJS(onSeekJS)(e.x))
    .onUpdate(e => runOnJS(onSeekJS)(e.x));

  const handlePlayPress = () => {
    if (disabled) return;
    onTogglePlay();
  };

  return (
    <Animated.View
      testID="tts-mini-player"
      accessibilityLabel="Read aloud controls"
      style={[
        styles.container,
        { backgroundColor: t.bgCard, borderTopColor: t.divider },
        elevation.md,
        animatedStyle,
        !visible ? { pointerEvents: 'none' as const, position: 'absolute' as const } : null,
      ]}
    >
      {/* 1 Play/Pause */}
      <Pressable
        onPress={handlePlayPress}
        style={[styles.playBtn, { backgroundColor: disabled ? t.divider : t.bgCardDark, opacity: disabled ? 0.4 : 1 }]}
        testID="tts-play-pause"
        accessibilityLabel={isPlaying ? 'Pause' : 'Play'}
        accessibilityRole="button"
      >
        {disabled ? (
          <VolumeX size={20} color={t.textInverse} />
        ) : isPlaying ? (
          <Pause size={20} color={t.textInverse} fill={t.textInverse} />
        ) : (
          <Play size={20} color={t.textInverse} fill={t.textInverse} />
        )}
      </Pressable>

      {/* 2 Chapter/Page label — tap opens TOC */}
      <Pressable onPress={onOpenToc} style={styles.labelWrap} testID="tts-label" hitSlop={8} accessibilityLabel={disabled ? 'No readable text' : label} accessibilityRole="button">
        <Text style={[typography.body, { color: t.textPrimary, maxWidth: 100 }]} numberOfLines={1}>
          {disabled ? 'No readable text' : label}
        </Text>
      </Pressable>

      {/* 3 Progress scrubber — fills center, drag to seek within chapter per spec */}
      <View style={styles.scrubberWrap} onLayout={e => (width.value = e.nativeEvent.layout.width)} testID="tts-scrubber" accessibilityLabel={`Read aloud progress: ${Math.round(progress * 100)}%`} accessibilityRole="adjustable">
        <GestureDetector gesture={pan}>
          <View style={[styles.track, { backgroundColor: t.accentTrack }]}>
            <View style={[styles.fill, { backgroundColor: t.textPrimary, width: `${Math.round(progress * 100)}%` }]} />
            {/* Thumb hidden until drag per spec — shown only in expanded; mini shows no thumb */}
            <Pressable onPress={onScrubPress} style={StyleSheet.absoluteFill} testID="tts-scrubber-press" hitSlop={8} />
          </View>
        </GestureDetector>
      </View>

      {/* 4 Speed control — cycles 0.5x … 3x */}
      <Pressable onPress={onCycleRate} style={styles.speedBtn} testID="tts-speed" hitSlop={8} disabled={disabled} accessibilityLabel={`Speed: ${rate}x`} accessibilityRole="button">
        <Text style={[typography.caption, { color: t.textSecondary, opacity: disabled ? 0.4 : 1 }]}>{rate}x</Text>
      </Pressable>

      {/* 5 Skip back */}
      <Pressable onPress={onSkipBack} style={styles.iconBtn} testID="tts-skip-back" hitSlop={8} disabled={disabled} accessibilityLabel="Skip back" accessibilityRole="button">
        <SkipBack size={18} color={t.iconTint} style={{ opacity: disabled ? 0.4 : 1 }} />
      </Pressable>

      {/* 6 Skip forward */}
      <Pressable onPress={onSkipForward} style={styles.iconBtn} testID="tts-skip-forward" hitSlop={8} disabled={disabled} accessibilityLabel="Skip forward" accessibilityRole="button">
        <SkipForward size={18} color={t.iconTint} style={{ opacity: disabled ? 0.4 : 1 }} />
      </Pressable>

      {/* 7 Dismiss */}
      <Pressable onPress={onDismiss} style={styles.iconBtn} testID="tts-dismiss" hitSlop={8} accessibilityLabel="Dismiss read aloud" accessibilityRole="button">
        <X size={18} color={t.iconTint} />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 56, // stacked directly on ReadingToolbar (56dp) — combined chrome per spec
    left: 0,
    right: 0,
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    borderTopWidth: 1,
  },
  playBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  labelWrap: { minWidth: 48, maxWidth: 100 },
  scrubberWrap: { flex: 1, height: 32, justifyContent: 'center' },
  track: { height: 4, borderRadius: 9999, overflow: 'hidden' },
  fill: { height: 4, borderRadius: 9999 },
  speedBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  iconBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
});
