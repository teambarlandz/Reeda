import React from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Copy, Highlighter, Pencil, Languages, Share2, MoreHorizontal } from '../../../shared/icons';
import { typography, radius, elevation } from '../../../shared/theme/tokens';

type Props = {
  visible: boolean;
  onCopy: () => void;
  onHighlight: () => void;
  onNote: () => void;
  onDefine: () => void;
  onShare: () => void;
};

export function SelectionToolbar({ visible, onCopy, onHighlight, onNote, onDefine, onShare }: Props) {
  const [showOverflow, setShowOverflow] = React.useState(false);
  const { width } = require('react-native').useWindowDimensions();
  const isNarrow = width < 360;
  if (!visible) return null;
  // Overflow per 3.4.2: narrow screen shows first 4 + MoreHorizontal
  if (isNarrow && !showOverflow) {
    return (
      <Animated.View entering={FadeIn.duration(150)} exiting={FadeOut.duration(120)} style={[styles.container, elevation.lg]} testID="selection-toolbar">
        <Pressable onPress={onCopy} style={styles.btn} testID="sel-copy">
          <Copy size={20} color="#FFFFFF" />
          <Text style={[typography.caption, { color: '#FFFFFF', marginLeft: 4 }]}>Copy</Text>
        </Pressable>
        <Pressable onPress={onHighlight} style={styles.btn} testID="sel-highlight">
          <Highlighter size={20} color="#FFFFFF" />
        </Pressable>
        <Pressable onPress={onNote} style={styles.btn} testID="sel-note">
          <Pencil size={20} color="#FFFFFF" />
        </Pressable>
        <Pressable onPress={onDefine} style={styles.btn} testID="sel-define">
          <Languages size={20} color="#FFFFFF" />
        </Pressable>
        <Pressable onPress={() => setShowOverflow(true)} style={styles.btn} testID="sel-more">
          <MoreHorizontal size={20} color="#FFFFFF" />
        </Pressable>
      </Animated.View>
    );
  }
  return (
    <Animated.View entering={FadeIn.duration(150)} exiting={FadeOut.duration(120)} style={[styles.container, elevation.lg]} testID="selection-toolbar">
      <Pressable onPress={onCopy} style={styles.btn} testID="sel-copy">
        <Copy size={20} color="#FFFFFF" />
        <Text style={[typography.caption, { color: '#FFFFFF', marginLeft: 4 }]}>Copy</Text>
      </Pressable>
      <Pressable onPress={onHighlight} style={styles.btn} testID="sel-highlight">
        <Highlighter size={20} color="#FFFFFF" />
      </Pressable>
      <Pressable onPress={onNote} style={styles.btn} testID="sel-note">
        <Pencil size={20} color="#FFFFFF" />
        <Text style={[typography.caption, { color: '#FFFFFF', marginLeft: 4 }]}>Note</Text>
      </Pressable>
      <Pressable onPress={onDefine} style={styles.btn} testID="sel-define">
        <Languages size={20} color="#FFFFFF" />
        <Text style={[typography.caption, { color: '#FFFFFF', marginLeft: 4 }]}>Define</Text>
      </Pressable>
      <Pressable onPress={onShare} style={styles.btn} testID="sel-share">
        <Share2 size={20} color="#FFFFFF" />
      </Pressable>
      {isNarrow && showOverflow && (
        <Pressable onPress={() => setShowOverflow(false)} style={styles.btn} testID="sel-less">
          <MoreHorizontal size={20} color="#FFFFFF" />
        </Pressable>
      )}
    </Animated.View>
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
    gap: 4,
    zIndex: 15,
  },
  btn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, height: 40, borderRadius: radius.full },
});
