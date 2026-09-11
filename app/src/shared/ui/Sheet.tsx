import React from 'react';
import { Modal, View, StyleSheet, Pressable, Dimensions } from 'react-native';
import { useAppTheme } from '../theme/useTheme';
import { radius } from '../theme/tokens';

type Props = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  height?: string | number;
};

export function Sheet({ visible, onClose, children, height = '70%' }: Props) {
  const t = useAppTheme();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={[styles.overlay, { backgroundColor: t.bgOverlay }]} onPress={onClose} />
      <View style={[styles.sheet, { backgroundColor: t.bgCard, height: height as any, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg }]}>
        <View style={[styles.handle, { backgroundColor: t.divider }]} />
        {children}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1 },
  sheet: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingTop: 8 },
  handle: { width: 32, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 8 },
});
