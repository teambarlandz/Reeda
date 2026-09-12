import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useAppTheme } from '../theme/useTheme';
import { typography, radius, spacing } from '../theme/tokens';

type Props = {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  testID?: string;
};

export function Button({ title, onPress, variant = 'primary', disabled, testID }: Props) {
  const t = useAppTheme();
  const containerStyle: ViewStyle = {
    backgroundColor: variant === 'primary' ? t.buttonPrimaryBg : variant === 'secondary' ? t.bgSearch : 'transparent',
    borderRadius: radius.full,
    paddingHorizontal: spacing.lg,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: disabled ? 0.5 : 1,
  };
  const textStyle: TextStyle = {
    ...typography.button,
    color: variant === 'ghost' ? t.textSecondary : t.buttonPrimaryText,
  };
  return (
    <Pressable testID={testID} onPress={onPress} disabled={disabled} style={({ pressed }) => [containerStyle, pressed && { opacity: 0.9, transform: [{ scale: 0.97 }] }]} accessibilityLabel={title} accessibilityRole="button">
      <Text style={textStyle}>{title}</Text>
    </Pressable>
  );
}
