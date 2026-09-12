import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView } from 'react-native';
import { X, Trash2 } from '../../../shared/icons';
import { useAppTheme } from '../../../shared/theme/useTheme';
import { typography, spacing, radius } from '../../../shared/theme/tokens';
import { Sheet } from '../../../shared/ui';
import { HIGHLIGHT_COLORS } from '../../../data/repositories/HighlightRepository';

type Props = {
  visible: boolean;
  anchorText?: string;
  initialText?: string;
  highlightColor?: string;
  onColorChange?: (c: string) => void;
  onSave: (text: string) => void;
  onDelete?: () => void;
  onClose: () => void;
  isEditing?: boolean;
};

export function NoteSheet({ visible, anchorText, initialText = '', highlightColor, onColorChange, onSave, onDelete, onClose, isEditing }: Props) {
  const t = useAppTheme();
  const [text, setText] = useState(initialText);

  useEffect(() => setText(initialText), [initialText]);

  if (!visible) return null;

  const handleSave = () => {
    if (text.trim().length === 0) return;
    onSave(text.trim());
    onClose();
  };

  return (
    <Sheet visible={visible} onClose={onClose} height="40%">
      <View style={styles.header}>
        <Text style={[typography.heading, { color: t.textPrimary }]}>{isEditing ? 'Edit Note' : 'Add Note'}</Text>
        <Pressable onPress={onClose} testID="note-close">
          <X size={24} color={t.iconTint} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}>
        {anchorText && (
          <View style={[styles.anchor, { backgroundColor: t.bgPrimary }]}>
            <Text style={[typography.body, { color: t.textSecondary, fontStyle: 'italic' }]} numberOfLines={2}>
              “{anchorText}”
            </Text>
          </View>
        )}

        {highlightColor && onColorChange && (
          <View style={styles.colorRow}>
            {HIGHLIGHT_COLORS.map(c => (
              <Pressable
                key={c}
                onPress={() => onColorChange(c)}
                style={[styles.dot, { backgroundColor: c, borderWidth: c === highlightColor ? 2 : 0, borderColor: t.textPrimary }]}
              />
            ))}
          </View>
        )}

        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Type your note..."
          placeholderTextColor={t.textSecondary}
          style={[styles.input, { backgroundColor: t.bgSearch, color: t.textPrimary }]}
          multiline
          autoFocus
          testID="note-input"
        />

        <View style={styles.actions}>
          <Pressable onPress={onClose} testID="note-cancel">
            <Text style={[typography.title, { color: t.textSecondary }]}>Cancel</Text>
          </Pressable>
          <Pressable onPress={handleSave} style={[styles.saveBtn, { backgroundColor: t.buttonPrimaryBg }]} testID="note-save">
            <Text style={[typography.button, { color: t.buttonPrimaryText }]}>Save</Text>
          </Pressable>
        </View>

        {isEditing && onDelete && (
          <Pressable onPress={onDelete} style={{ alignSelf: 'flex-end', marginTop: spacing.md }} testID="note-delete">
            <Trash2 size={20} color={t.iconTint} />
          </Pressable>
        )}
      </ScrollView>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.lg, height: 56 },
  anchor: { padding: spacing.md, borderRadius: radius.md },
  colorRow: { flexDirection: 'row', gap: spacing.sm },
  dot: { width: 24, height: 24, borderRadius: 12 },
  input: { minHeight: 80, maxHeight: 200, borderRadius: radius.md, padding: spacing.md, textAlignVertical: 'top' },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: spacing.md, marginTop: spacing.md },
  saveBtn: { paddingHorizontal: spacing.lg, height: 40, borderRadius: radius.full, justifyContent: 'center', alignItems: 'center' },
});
