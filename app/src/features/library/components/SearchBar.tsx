import React from 'react';
import { View, TextInput, Text, Pressable, StyleSheet } from 'react-native';
import { Search, X } from '../../../shared/icons';
import { useAppTheme } from '../../../shared/theme/useTheme';
import { typography, spacing, radius } from '../../../shared/theme/tokens';

type Props = {
  value: string;
  onChangeText: (t: string) => void;
  onSubmit?: () => void;
  onClear?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
  testID?: string;
  showTitle?: boolean; // true in Library pill per phase-3.md:3.3
};

export function SearchBar({ value, onChangeText, onSubmit, onClear, placeholder = 'Search', autoFocus, testID, showTitle = true }: Props) {
  const t = useAppTheme();
  return (
    <View style={[styles.pill, { backgroundColor: t.bgSearch }]}>
      <Search size={20} color={t.iconTint} />
      <TextInput
        testID={testID}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        placeholder={placeholder}
        placeholderTextColor={t.textSecondary}
        style={[typography.caption, styles.input, { color: t.textPrimary }]}
        returnKeyType="search"
        autoCorrect={true}
        autoCapitalize="none"
        autoFocus={autoFocus}
        accessibilityLabel="Search books by title, author, genre or shelf"
        accessibilityRole="search"
      />
      {value.length > 0 && (
        <Pressable onPress={onClear} hitSlop={8} testID={`${testID}-clear`} accessibilityLabel="Clear search" accessibilityRole="button">
          <X size={20} color={t.iconTint} />
        </Pressable>
      )}
      {showTitle && (
        <Text style={[typography.display, styles.title, { color: t.textPrimary }]}>My Library</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flex: 1,
    height: 40,
    borderRadius: radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  input: { flex: 1, paddingVertical: 0, marginLeft: spacing.sm },
  title: { position: 'absolute', left: 0, right: 0, textAlign: 'center', pointerEvents: 'none' } as any,
});
