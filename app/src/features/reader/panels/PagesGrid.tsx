import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, FlatList, useWindowDimensions } from 'react-native';
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
  const { width: screenWidth } = useWindowDimensions();
  const pages = useMemo(() => Array.from({ length: totalPages }, (_, i) => i + 1), [totalPages]);
  // Estimated row height for getItemLayout: 3-column grid, thumbs aspectRatio 3/4,
  // overlay padding lg(16)×2 + list padding md(12)×2 + column gaps sm(8)×2, row gap sm(8)
  const rowHeight = useMemo(() => {
    const itemWidth = (screenWidth - spacing.xl * 2 - spacing.md * 2 - spacing.sm * 2) / 3;
    return (itemWidth * 4) / 3 + spacing.sm;
  }, [screenWidth]);
  if (!visible) return null;
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
        windowSize={5}
        maxToRenderPerBatch={9}
        removeClippedSubviews={true}
        getItemLayout={(_, index) => ({
          length: rowHeight,
          offset: Math.floor(index / 3) * rowHeight,
          index,
        })}
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
