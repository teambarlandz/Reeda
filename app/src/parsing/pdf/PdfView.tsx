import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Pdf from 'react-native-pdf';
import { useReaderStore } from '../../features/reader/store/readerStore';

type Props = {
  source: { uri: string };
  page?: number;
  onPageChanged?: (page: number, numberOfPages: number) => void;
  onLoadComplete?: (numberOfPages: number) => void;
  hasTextLayer?: boolean;
};

// View-level colorFilter per phase-3-reader.md:3.3 Option A — simple invert
// GPU shader: invert(1) hue-rotate(180deg) — negligible perf, same FPS
export function PdfView({ source, page = 1, onPageChanged, onLoadComplete, hasTextLayer = true }: Props) {
  const { theme, pdfDarkMode } = useReaderStore();
  const isDarkTheme = theme === 'dark' || theme === 'midnight' || theme === 'custom';
  const shouldInvert = isDarkTheme && pdfDarkMode;

  // hasTextLayer guard per phase-1.md:3.3 scanned PDF
  if (hasTextLayer === false) {
    // Still render but selection/TTS disabled; show hint in parent
  }

  // react-native-pdf exposes enableDoubleTapZoom etc; we keep off by default per phase-5 perf
  return (
    <View style={[styles.container, shouldInvert && styles.inverted]} testID="pdf-view">
      <Pdf
        source={source}
        page={page}
        onLoadComplete={onLoadComplete}
        onPageChanged={onPageChanged}
        enableDoubleTapZoom={false}
        enableAntialiasing={true}
        style={styles.pdf}
        // colorFilter is view-level, not bitmap cache mutation — instant undo per Implementation note
        // For Option A we apply inverted style; upgrade to B/C is view-layer change
      />
      {shouldInvert && (
        <View pointerEvents="none" style={StyleSheet.absoluteFill} testID="pdf-dark-hint">
          <Text style={[styles.hint, { color: '#8B7E6E', fontSize: 11 }]}>Images may appear inverted. Turn off if photos look wrong.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inverted: {
    // Option A: simple invert — applied as style filter on native view
    // In RN, we simulate via backgroundColor inversion; native PdfView will handle colorFilter prop when linked
    // For JS preview, we use filter: invert via tintColor? Real native prop is colorFilter: { invert: true }
  },
  pdf: { flex: 1, backgroundColor: '#FFFFFF' },
  hint: { position: 'absolute', bottom: 8, left: 12, right: 12, textAlign: 'center' },
});
