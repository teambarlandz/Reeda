import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Bookmark } from '../../../shared/icons';
import { useAppTheme } from '../../../shared/theme/useTheme';

type Props = {
  isBookmarked: boolean;
  onToggle: () => void;
  visible?: boolean;
};

export function BookmarkButton({ isBookmarked, onToggle, visible = true }: Props) {
  const t = useAppTheme();
  const scale = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(isBookmarked ? 1.1 : 1, { damping: 10 }) }],
  }));

  if (!visible) return null;

  return (
    <Pressable
      onPress={onToggle}
      style={({ pressed }) => [styles.btn, pressed && { opacity: 0.7 }]}
      testID="bookmark-button"
      accessibilityLabel={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
      accessibilityRole="button"
    >
      <Animated.View style={scale}>
        <Bookmark size={20} color={isBookmarked ? t.textPrimary : t.iconTint} fill={isBookmarked ? t.textPrimary : 'none'} />
      </Animated.View>
      {isBookmarked && <View style={[styles.filledBg, { backgroundColor: t.bgCardDark, opacity: 0.1 }]} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  filledBg: { ...StyleSheet.absoluteFillObject, borderRadius: 20 },
});
