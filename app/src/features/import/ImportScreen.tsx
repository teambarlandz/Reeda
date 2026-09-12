import React from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { X } from '../../shared/icons';
import { useAppTheme } from '../../shared/theme/useTheme';
import { ImportFlow } from './ImportFlow';
import { spacing } from '../../shared/theme/tokens';

export function ImportScreen() {
  const navigation = useNavigation<any>();
  const t = useAppTheme();
  return (
    <View style={[styles.container, { backgroundColor: t.bgPrimary }]}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} testID="import-close">
          <X size={24} color={t.iconTint} />
        </Pressable>
      </View>
      <ImportFlow onClose={() => navigation.goBack()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { height: 56, justifyContent: 'center', paddingHorizontal: spacing.xl },
});
