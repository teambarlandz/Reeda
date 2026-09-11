import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { useAppTheme } from '../theme/useTheme';
import { radius, elevation } from '../theme/tokens';

type Props = { children: React.ReactNode; style?: StyleProp<ViewStyle>; testID?: string; variant?: 'default' | 'dark' };

export function Card({ children, style, testID, variant = 'default' }: Props) {
  const t = useAppTheme();
  const bg = variant === 'dark' ? t.bgCardDark : t.bgCard;
  return (
    <View testID={testID} style={[{ backgroundColor: bg, borderRadius: radius.lg }, elevation.sm, style]}>
      {children}
    </View>
  );
}
