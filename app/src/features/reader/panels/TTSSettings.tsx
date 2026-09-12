import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { X } from '../../../shared/icons';
import { useAppTheme } from '../../../shared/theme/useTheme';
import { typography, spacing, radius, elevation } from '../../../shared/theme/tokens';
import { Toggle } from '../../../shared/ui';
import { useTtsStore } from '../../../tts/ttsStore';
import { TtsEngine, TtsVoice } from '../../../tts/TtsEngine';

type Props = { visible: boolean; onClose: () => void };

export function TTSSettings({ visible, onClose }: Props) {
  const t = useAppTheme();
  const { voiceId, highlightSync, backgroundPlayback } = useTtsStore();
  const [voices, setVoices] = useState<TtsVoice[]>([]);

  useEffect(() => {
    if (!visible) return;
    TtsEngine.getVoices().then(setVoices);
  }, [visible]);

  if (!visible) return null;

  const onSelectVoice = async (id: string) => {
    useTtsStore.getState().setVoiceId(id);
    await TtsEngine.setVoice(id);
    // Preview "Hello"
    void TtsEngine.speak('Hello');
    setTimeout(() => TtsEngine.stop(), 900);
    const { SettingsRepository } = await import('../../../data/repositories/SettingsRepository');
    await SettingsRepository.set('ttsVoice', id);
  };

  const onToggleHighlight = async (v: boolean) => {
    useTtsStore.getState().setHighlightSync(v);
    const { SettingsRepository } = await import('../../../data/repositories/SettingsRepository');
    await SettingsRepository.set('ttsHighlightSync', String(v));
  };

  // Background playback per spec Dead Code note: toggle exists but disabled with helper text
  // "Background playback coming soon" until foreground service is fully implemented
  const onToggleBackground = (_v: boolean) => {
    // intentionally no-op — disabled per spec
  };

  return (
    <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.4)' }]}>
      <Pressable style={{ flex: 1 }} onPress={onClose} testID="tts-settings-dim" />
      <View style={[styles.panel, { backgroundColor: t.bgCard }, elevation.lg]} testID="tts-settings">
        <View style={styles.header}>
          <Text style={[typography.heading, { color: t.textPrimary }]}>Read Aloud Settings</Text>
          <Pressable onPress={onClose} testID="tts-settings-close">
            <X size={24} color={t.iconTint} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.xl }}>
          {/* Voice selection — dropdown / list grouped by language */}
          <View>
            <Text style={[typography.title, { color: t.textPrimary }]}>Voice</Text>
            <Text style={[typography.caption, { color: t.textSecondary, marginTop: 4 }]}>Tap to select. Preview: "Hello" spoken.</Text>
            <View style={{ marginTop: spacing.md, gap: spacing.sm }}>
              {voices.slice(0, 10).map(v => (
                <Pressable
                  key={v.id}
                  onPress={() => onSelectVoice(v.id)}
                  style={[styles.voiceRow, { backgroundColor: voiceId === v.id ? t.bgCardDark : t.bgSearch, borderColor: voiceId === v.id ? t.textPrimary : 'transparent' }]}
                  testID={`tts-settings-voice-${v.id}`}
                >
                  <View>
                    <Text style={[typography.body, { color: voiceId === v.id ? t.textInverse : t.textPrimary }]}>{v.name}</Text>
                    <Text style={[typography.caption, { color: voiceId === v.id ? t.textInverseSecondary : t.textSecondary }]}>{v.language}</Text>
                  </View>
                  {voiceId === v.id && <Text style={[typography.caption, { color: t.textInverse }]}>Selected</Text>}
                </Pressable>
              ))}
              {voices.length === 0 && <Text style={[typography.caption, { color: t.textSecondary }]}>Loading voices…</Text>}
            </View>
          </View>

          {/* Highlight spoken word toggle */}
          <View style={[styles.rowCard, { backgroundColor: t.bgSearch }]}>
            <View style={{ flex: 1 }}>
              <Text style={[typography.body, { color: t.textPrimary }]}>Highlight spoken word</Text>
              <Text style={[typography.caption, { color: t.textSecondary, marginTop: 2 }]}>Sentence highlight + word underline + auto-scroll</Text>
            </View>
            <Toggle value={highlightSync} onValueChange={onToggleHighlight} testID="tts-highlight-sync-toggle" />
          </View>

          {/* Background playback toggle — disabled per M6 Dead Code guardrail */}
          <View style={[styles.rowCard, { backgroundColor: t.bgSearch, opacity: 0.6 }]}>
            <View style={{ flex: 1 }}>
              <Text style={[typography.body, { color: t.textPrimary }]}>Background playback</Text>
              <Text style={[typography.caption, { color: t.textSecondary, marginTop: 2 }]}>
                Background playback coming soon — when enabled, notification shows book title, chapter, play/pause, skip, dismiss.
              </Text>
            </View>
            <Toggle value={backgroundPlayback} onValueChange={onToggleBackground} testID="tts-background-toggle" disabled />
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, flexDirection: 'column', justifyContent: 'flex-end', zIndex: 28 },
  panel: { maxHeight: '70%', width: '100%', borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.lg, height: 56 },
  voiceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.md, borderRadius: 12, borderWidth: 1 },
  rowCard: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, borderRadius: 12, gap: spacing.md },
});
