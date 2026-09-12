import React from 'react';
import { View, Text, Pressable, StyleSheet, FlatList } from 'react-native';
import { X } from '../../../shared/icons';
import { useAppTheme } from '../../../shared/theme/useTheme';
import { typography, spacing, radius } from '../../../shared/theme/tokens';

type Props = {
  visible: boolean;
  totalPages: number;
  currentPage: number;
  onClose: () => void;
  onSelect: (page: number) => void;
};

export function PagesGrid({ visible, totalPages, currentPage, onClose, onSelect }: Props) {
  const t = useAppTheme();
  if (!visible) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  return (
    <View style={[styles.overlay, { backgroundColor: t.bgPrimary }]} accessibilityElementsHidden={!visible} importantForAccessibility={visible ? 'auto' : 'no-hide-descendants'}>
      <View style={styles.header}>
        <Text style={[typography.heading, { color: t.textPrimary }]} accessibilityRole="header">Pages</Text>
        <Pressable onPress={onClose} testID="pages-close" accessibilityLabel="Close pages" accessibilityRole="button">
          <X size={24} color={t.iconTint} />
        </Pressable>
      </View>
      <FlatList
        data={pages}
        numColumns={3}
        keyExtractor={item => String(item)}
        contentContainerStyle={{ padding: spacing.md, gap: spacing.sm }}
        columnWrapperStyle={{ gap: spacing.sm }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => onSelect(item)}
            style={[
              styles.thumb,
              { backgroundColor: t.bgCard, borderColor: item === currentPage ? t.textPrimary : 'transparent', borderWidth: item === currentPage ? 2 : 0 },
            ]}
            testID={`page-${item}`}
          >
            <Text style={[typography.caption, { color: t.textSecondary }]}>{item}</Text>
          </Pressable>
        )}
      />
      <Text style={[typography.caption, { color: t.textSecondary, textAlign: 'center', padding: spacing.md }]}>
        Page {currentPage} of {totalPages}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, zIndex: 15, padding: spacing.lg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  thumb: { flex: 1, aspectRatio: 3 / 4, borderRadius: radius.md, justifyContent: 'center', alignItems: 'center' },
});
