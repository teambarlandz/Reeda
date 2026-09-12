import React from 'react';
import { View, Pressable, StyleSheet, Text } from 'react-native';
import { Check, Trash2, Copy, Pencil } from '../../../shared/icons';
import { HIGHLIGHT_COLORS } from '../../../data/repositories/HighlightRepository';
import { radius, elevation, spacing } from '../../../shared/theme/tokens';
import { typography } from '../../../shared/theme/tokens';

type Props = {
  visible: boolean;
  selectedColor?: string;
  onSelect: (color: string) => void;
  onRemove?: () => void;
  showRemove?: boolean;
  onCopy?: () => void;
  onAddNote?: () => void;
};

export function HighlightPicker({ visible, selectedColor = '#FFEB3B', onSelect, onRemove, showRemove, onCopy, onAddNote }: Props) {
  if (!visible) return null;
  // When editing existing highlight, show mini toolbar per 3.4.3: Copy, Change color (picker), Remove, Add note
  if (showRemove) {
    return (
      <View style={[styles.container, elevation.lg]} testID="highlight-picker">
        {onCopy && (
          <Pressable onPress={onCopy} style={styles.miniBtn} testID="highlight-copy">
            <Copy size={16} color="#FFFFFF" />
            <Text style={[typography.caption, { color: '#FFFFFF', marginLeft: 4 }]}>Copy</Text>
          </Pressable>
        )}
        {HIGHLIGHT_COLORS.map(color => {
          const isSelected = color === selectedColor;
          return (
            <Pressable
              key={color}
              onPress={() => onSelect(color)}
              style={[styles.circle, { backgroundColor: color, borderWidth: isSelected ? 2 : 0, borderColor: '#FFFFFF' }]}
              testID={`color-${color}`}
            >
              {isSelected && <Check size={14} color="#FFFFFF" />}
            </Pressable>
          );
        })}
        <Pressable onPress={onRemove} style={[styles.circle, { backgroundColor: '#1C1C1E' }]} testID="highlight-remove">
          <Trash2 size={16} color="#FFFFFF" />
        </Pressable>
        {onAddNote && (
          <Pressable onPress={onAddNote} style={styles.miniBtn} testID="highlight-add-note">
            <Pencil size={16} color="#FFFFFF" />
            <Text style={[typography.caption, { color: '#FFFFFF', marginLeft: 4 }]}>Note</Text>
          </Pressable>
        )}
      </View>
    );
  }
  return (
    <View style={[styles.container, elevation.lg]} testID="highlight-picker">
      {HIGHLIGHT_COLORS.map(color => {
        const isSelected = color === selectedColor;
        return (
          <Pressable
            key={color}
            onPress={() => onSelect(color)}
            style={[styles.circle, { backgroundColor: color, borderWidth: isSelected ? 2 : 0, borderColor: '#FFFFFF' }]}
            testID={`color-${color}`}
          >
            {isSelected && <Check size={14} color="#FFFFFF" />}
          </Pressable>
        );
      })}
      {showRemove && (
        <Pressable onPress={onRemove} style={[styles.circle, { backgroundColor: '#1C1C1E' }]} testID="highlight-remove">
          <Trash2 size={16} color="#FFFFFF" />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: -56,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: radius.full,
    height: 48,
    paddingHorizontal: 8,
    gap: 8,
    zIndex: 16,
  },
  circle: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  miniBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, height: 32, borderRadius: radius.full },
});
