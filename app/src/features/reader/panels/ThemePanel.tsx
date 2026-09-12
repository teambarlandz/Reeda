import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { X, Sun, Moon } from '../../../shared/icons';
import { useAppTheme } from '../../../shared/theme/useTheme';
import { typography, spacing, radius } from '../../../shared/theme/tokens';
import { useReaderStore } from '../store/readerStore';
import { Toggle } from '../../../shared/ui';

type Props = { visible: boolean; onClose: () => void };

export function ThemePanel({ visible, onClose }: Props) {
  const t = useAppTheme();
  const {
    theme,
    setTheme,
    fontSize,
    setFontSize,
    fontFamily,
    setFontFamily,
    readingMode,
    setReadingMode,
    pdfDarkMode,
    setPdfDarkMode,
    orientation,
    setOrientation,
    twoColumn,
    setTwoColumn,
    screenTimeout,
    setScreenTimeout,
  } = useReaderStore();
  if (!visible) return null;

  return (
    <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.4)' }]}>
      <Pressable style={{ flex: 1 }} onPress={onClose} />
      <View style={[styles.panel, { backgroundColor: t.bgCard, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg }]}>
        <View style={styles.header}>
          <Text style={[typography.heading, { color: t.textPrimary }]} accessibilityRole="header">Font & Theme</Text>
          <Pressable onPress={onClose} testID="theme-close">
            <X size={24} color={t.iconTint} />
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.xl }}>
          <View>
            <Text style={[typography.title, { color: t.textPrimary }]}>Theme</Text>
            <View style={styles.row}>
              {(['light', 'sepia', 'dark', 'midnight'] as const).map(th => (
                <Pressable
                  key={th}
                  onPress={() => setTheme(th)}
                  style={[
                    styles.swatch,
                    { backgroundColor: th === 'light' ? '#FFFFFF' : th === 'sepia' ? '#F0EDE6' : th === 'dark' ? '#1C1C1E' : '#1A1A2E', borderColor: theme === th ? t.textPrimary : 'transparent', borderWidth: 2 },
                  ]}
                  testID={`theme-${th}`}
                >
                  <Text style={{ color: th === 'light' || th === 'sepia' ? '#2C2C2E' : '#FFFFFF', fontSize: 10 }}>{th}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View>
            <Text style={[typography.title, { color: t.textPrimary }]}>Font</Text>
            <View style={styles.row}>
              {(['system', 'serif', 'sans', 'monospace'] as const).map(f => (
                <Pressable key={f} onPress={() => setFontFamily(f)} style={[styles.pill, { backgroundColor: fontFamily === f ? t.bgCardDark : t.bgSearch }]}>
                  <Text style={[typography.caption, { color: fontFamily === f ? t.textInverse : t.textSecondary }]}>{f}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View>
            <Text style={[typography.title, { color: t.textPrimary }]}>Size {fontSize}sp</Text>
            <View style={styles.row}>
              <Pressable onPress={() => setFontSize(Math.max(12, fontSize - 1))} style={styles.btn}>
                <Text style={{ color: t.textPrimary }}>-</Text>
              </Pressable>
              <View style={[styles.slider, { backgroundColor: t.accentTrack }]}>
                <View style={{ width: `${((fontSize - 12) / 36) * 100}%`, height: 4, backgroundColor: t.textPrimary }} />
              </View>
              <Pressable onPress={() => setFontSize(Math.min(48, fontSize + 1))} style={styles.btn}>
                <Text style={{ color: t.textPrimary }}>+</Text>
              </Pressable>
            </View>
          </View>

          <View>
            <Text style={[typography.title, { color: t.textPrimary }]}>Mode</Text>
            <View style={styles.row}>
              <Pressable onPress={() => setReadingMode('scroll')} style={[styles.pill, { backgroundColor: readingMode === 'scroll' ? t.bgCardDark : t.bgSearch }]}>
                <Text style={[typography.caption, { color: readingMode === 'scroll' ? t.textInverse : t.textSecondary }]}>Scroll</Text>
              </Pressable>
              <Pressable onPress={() => setReadingMode('paginate')} style={[styles.pill, { backgroundColor: readingMode === 'paginate' ? t.bgCardDark : t.bgSearch }]}>
                <Text style={[typography.caption, { color: readingMode === 'paginate' ? t.textInverse : t.textSecondary }]}>Paginate</Text>
              </Pressable>
            </View>
          </View>

          <View>
            <Text style={[typography.title, { color: t.textPrimary }]}>PDF Dark Mode (Option A)</Text>
            <View style={styles.row}>
              <Toggle value={pdfDarkMode} onValueChange={setPdfDarkMode} testID="pdf-dark-toggle" />
              <Text style={[typography.body, { color: t.textSecondary, marginLeft: spacing.sm, flex: 1 }]}>
                Dark mode for PDFs — simple invert. Images may appear inverted. Turn off if photos look wrong.
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm }}>
              <Moon size={16} color={t.iconTint} />
              <Text style={[typography.caption, { color: t.textSecondary, marginLeft: 4 }]}>Applies only when dark theme selected</Text>
            </View>
          </View>

          <View>
            <Text style={[typography.title, { color: t.textPrimary }]}>Orientation</Text>
            <View style={styles.row}>
              {(['auto', 'portrait', 'landscape'] as const).map(o => (
                <Pressable key={o} onPress={() => setOrientation(o)} style={[styles.pill, { backgroundColor: orientation === o ? t.bgCardDark : t.bgSearch }]}>
                  <Text style={[typography.caption, { color: orientation === o ? t.textInverse : t.textSecondary }]}>{o}</Text>
                </Pressable>
              ))}
            </View>
            <View style={styles.row}>
              <Text style={[typography.caption, { color: t.textSecondary }]}>Two-column in landscape</Text>
              <Toggle value={twoColumn} onValueChange={setTwoColumn} testID="two-column-toggle" />
            </View>
          </View>

          <View>
            <Text style={[typography.title, { color: t.textPrimary }]}>Screen Timeout (Fullscreen)</Text>
            <View style={styles.row}>
              {(['1min', '5min', '15min', 'never'] as const).map(v => (
                <Pressable key={v} onPress={() => setScreenTimeout(v)} style={[styles.pill, { backgroundColor: screenTimeout === v ? t.bgCardDark : t.bgSearch }]}>
                  <Text style={[typography.caption, { color: screenTimeout === v ? t.textInverse : t.textSecondary }]}>{v}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <Pressable onPress={onClose} style={[styles.doneBtn, { backgroundColor: t.textPrimary }]} testID="theme-done">
            <Text style={[typography.button, { color: t.bgCard }]}>Done</Text>
          </Pressable>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, flexDirection: 'column', justifyContent: 'flex-end', zIndex: 25 },
  panel: { maxHeight: '80%', width: '100%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.lg, height: 56 },
  row: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm, flexWrap: 'wrap', alignItems: 'center' },
  swatch: { width: 56, height: 40, borderRadius: radius.md, justifyContent: 'center', alignItems: 'center' },
  pill: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.full },
  btn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#D9D4CC' },
  slider: { flex: 1, height: 4, borderRadius: 8, alignSelf: 'center' },
  doneBtn: { marginTop: spacing.xl, height: 40, borderRadius: radius.full, justifyContent: 'center', alignItems: 'center' },
});
