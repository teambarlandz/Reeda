import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Pill } from '../../../shared/ui';
import { spacing } from '../../../shared/theme/tokens';

const FACETS = ['All', 'Title', 'Author', 'Genre', 'Shelf'] as const;
export type Facet = (typeof FACETS)[number];

type Props = {
  selected: Facet;
  onSelect: (f: Facet) => void;
};

export function FacetChips({ selected, onSelect }: Props) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row} accessibilityRole="tablist">
      {FACETS.map(f => (
        <View key={f} style={{ marginRight: spacing.sm }} accessibilityRole="tab" accessibilityState={{ selected: selected === f }}>
          <Pill label={f} selected={selected === f} onPress={() => onSelect(f)} />
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { paddingHorizontal: spacing.xl, paddingVertical: spacing.sm, flexDirection: 'row' },
});
