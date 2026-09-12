import React from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import { useAppTheme } from '../../../shared/theme/useTheme';
import { typography, spacing } from '../../../shared/theme/tokens';

type Props = {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  collapsed: boolean;
  onPress: () => void;
  testID?: string;
};

export function MenuItem({ icon, label, active, collapsed, onPress, testID }: Props) {
  const t = useAppTheme();
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      style={({ pressed }) => [
        styles.item,
        { opacity: pressed ? 0.8 : 1 },
        active && { backgroundColor: 'rgba(255,255,255,0.12)', borderLeftWidth: 4, borderLeftColor: '#FFFFFF' },
      ]}
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ expanded: active }}
    >
      <View style={[styles.iconWrap, active && { backgroundColor: '#FFFFFF', borderRadius: 12 }]}>
        <View style={{ opacity: active ? 1 : 1 }}>{icon}</View>
      </View>
      {!collapsed && <Text style={[typography.body, { color: t.textInverse, marginLeft: spacing.md }]}>{label}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item: { flexDirection: 'row', alignItems: 'center', height: 48, paddingHorizontal: 12 },
  iconWrap: { width: 24, height: 24, justifyContent: 'center', alignItems: 'center' },
});
