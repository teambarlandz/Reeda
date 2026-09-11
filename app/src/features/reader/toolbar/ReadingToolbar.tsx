import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useAppTheme } from '../../../shared/theme/useTheme';
import { radius, spacing, typography, elevation } from '../../../shared/theme/tokens';
import { Bookmark, PanelLeft } from '../../../shared/icons';

type Props = {
  visible: boolean;
  page: number | string;
  chapterName: string;
  isBookmarked: boolean;
  highlightColor: string;
  onPagePress: () => void;
  onChapterPress: () => void;
  onBookmarkPress: () => void;
  onColorPress: () => void;
  onMenuPress: () => void;
};

export function ReadingToolbar({ visible, page, chapterName, isBookmarked, highlightColor, onPagePress, onChapterPress, onBookmarkPress, onColorPress, onMenuPress }: Props) {
  const t = useAppTheme();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: withTiming(visible ? 0 : 100, { duration: 250 }) }],
    opacity: withTiming(visible ? 1 : 0, { duration: 200 }),
  }));

  return (
    <Animated.View
      testID="reading-toolbar"
      style={[
        styles.container,
        { backgroundColor: t.bgCard, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg },
        elevation.md,
        animatedStyle,
      ]}
    >
      <Pressable onPress={onPagePress} style={styles.leftGroup} testID="toolbar-page">
        <Text style={[typography.title, { color: t.textPrimary }]}>{page}</Text>
        <View style={[styles.dot, { backgroundColor: t.textSecondary }]} />
        <Text style={[typography.caption, { color: t.textSecondary }]} numberOfLines={1}>
          {chapterName}
        </Text>
      </Pressable>

      <View style={styles.centerGroup}>
        <Pressable onPress={onBookmarkPress} hitSlop={8} testID="toolbar-bookmark">
          <Bookmark size={20} color={isBookmarked ? t.textPrimary : t.iconTint} fill={isBookmarked ? t.textPrimary : 'none'} />
        </Pressable>
        <Pressable onPress={onColorPress} testID="toolbar-color" style={[styles.colorDot, { backgroundColor: highlightColor }]} />
      </View>

      <Pressable onPress={onMenuPress} hitSlop={8} testID="toolbar-menu">
        <PanelLeft size={20} color={t.iconTint} />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    justifyContent: 'space-between',
  },
  leftGroup: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 },
  dot: { width: 4, height: 4, borderRadius: 2 },
  centerGroup: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginHorizontal: spacing.lg },
  colorDot: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#FFFFFF' },
});
