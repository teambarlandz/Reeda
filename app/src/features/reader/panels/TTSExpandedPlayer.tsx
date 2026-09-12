import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, TextInput } from 'react-native';
import Animated, { useSharedValue, runOnJS } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { X, Play, Pause, SkipBack, SkipForward } from '../../../shared/icons';
import { useAppTheme } from '../../../shared/theme/useTheme';
import { typography, spacing, radius, elevation } from '../../../shared/theme/tokens';
import { Toggle, SegmentedControl } from '../../../shared/ui';
import { useTtsStore, TTS_RATES, SleepOption } from '../../../tts/ttsStore';
import { TtsEngine, TtsVoice } from '../../../tts/TtsEngine';
import { getChapterProgress } from '../../../tts/TtsQueue';

type Props = {
  visible: boolean;
  onClose: () => void;
  onTogglePlay: () => void;
  onSkipBack: () => void;
  onSkipForward: () => void;
  onSeek: (p: number) => void;
  onSetRate: (r: (typeof TTS_RATES)[number]) => void;
  onSetVoice: (id: string) => void;
  bookTitle?: string;
};

const SLEEP_OPTIONS: Array<{ label: string; value: SleepOption }> = [
  { label: 'Off', value: 'off' },
  { label: 'End of chapter', value: 'endOfChapter' },
  { label: '15 min', value: '15' },
  { label: '30 min', value: '30' },
  { label: '60 min', value: '60' },
  { label: 'Custom', value: 'custom' },
];

export function TTSExpandedPlayer({ visible, onClose, onTogglePlay, onSkipBack, onSkipForward, onSeek, onSetRate, onSetVoice, bookTitle }: Props) {
  const t = useAppTheme();
  const { isPlaying, rate, queue, currentIndex, sleepOption, customMinutes, sleepRemainingSec, highlightSync, voiceId } = useTtsStore();
  const [voices, setVoices] = useState<TtsVoice[]>([]);
  const [customInput, setCustomInput] = useState(String(customMinutes));
  const width = useSharedValue(0);

  useEffect(() => {
    if (!visible) return;
    TtsEngine.getVoices().then(setVoices);
  }, [visible]);

  if (!visible) return null;

  const current = queue[currentIndex];
  const progress = getChapterProgress(queue, currentIndex);
  const sleepLabel = sleepRemainingSec != null ? `Sleep in ${Math.floor(sleepRemainingSec / 60)}:${String(sleepRemainingSec % 60).padStart(2, '0')}` : null;

  const onSeekJS = (x: number) => {
    const p = Math.max(0, Math.min(1, x / (width.value || 1)));
    onSeek(p);
  };
  const pan = Gesture.Pan()
    .onBegin(e => runOnJS(onSeekJS)(e.x))
    .onUpdate(e => runOnJS(onSeekJS)(e.x));

  const chapterTranscript = current ? queue.filter(s => s.chapterIndex === current.chapterIndex) : [];

  return (
    <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.4)' }]}>
      <Pressable style={{ flex: 1 }} onPress={onClose} testID="tts-expanded-dim" />
      <View style={[styles.panel, { backgroundColor: t.bgCard }, elevation.lg]} testID="tts-expanded">
        <View style={styles.header}>
          <Text style={[typography.heading, { color: t.textPrimary }]} accessibilityRole="header">Read Aloud</Text>
          <Pressable onPress={onClose} testID="tts-expanded-close">
            <X size={24} color={t.iconTint} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.xl }}>
          {/* Larger scrubber — 8dp bar, thumb always visible 20dp, draggable */}
          <View onLayout={e => (width.value = e.nativeEvent.layout.width)} testID="tts-expanded-scrubber">
            <GestureDetector gesture={pan}>
              <Animated.View style={[styles.expandedTrack, { backgroundColor: t.accentTrack }]}>
                <View style={[styles.expandedFill, { backgroundColor: t.textPrimary, width: `${Math.round(progress * 100)}%` }]} />
                <View style={[styles.thumb, { left: `${Math.round(progress * 100)}%`, backgroundColor: '#FFFFFF', borderColor: t.textPrimary }]} />
              </Animated.View>
            </GestureDetector>
            {sleepLabel && <Text style={[typography.caption, { color: t.textSecondary, marginTop: spacing.sm }]}>{sleepLabel}</Text>}
            <Pressable
              onPress={() => onSeek(Math.max(0, Math.min(1, progress - 0.1)))}
              style={{ marginTop: spacing.sm }}
              testID="tts-expanded-scrub-hint"
            >
              <Text style={[typography.caption, { color: t.textSecondary }]}>Tap scrubber label or drag thumb to seek</Text>
            </Pressable>
          </View>

          {/* Play / Skip row — 56dp play centered, 48dp skip each side */}
          <View style={styles.controlsRow}>
            <Pressable onPress={onSkipBack} style={[styles.skipBtn, { borderColor: t.divider }]} testID="tts-expanded-skip-back">
              <SkipBack size={22} color={t.iconTint} />
            </Pressable>
            <Pressable onPress={onTogglePlay} style={[styles.playLarge, { backgroundColor: t.bgCardDark }]} testID="tts-expanded-play">
              {isPlaying ? <Pause size={28} color={t.textInverse} fill={t.textInverse} /> : <Play size={28} color={t.textInverse} fill={t.textInverse} />}
            </Pressable>
            <Pressable onPress={onSkipForward} style={[styles.skipBtn, { borderColor: t.divider }]} testID="tts-expanded-skip-forward">
              <SkipForward size={22} color={t.iconTint} />
            </Pressable>
          </View>

          {/* Speed selector — segmented control (not cycle) */}
          <View>
            <Text style={[typography.title, { color: t.textPrimary }]}>Speed</Text>
            <View style={{ marginTop: spacing.sm }}>
              <SegmentedControl
                options={TTS_RATES.map(r => `${r}x`)}
                selected={`${rate}x`}
                onSelect={v => onSetRate(Number(v.replace('x', '')) as any)}
              />
            </View>
          </View>

          {/* Voice picker — dropdown of installed voices */}
          <View>
            <Text style={[typography.title, { color: t.textPrimary }]}>Voice</Text>
            <View style={{ marginTop: spacing.sm, gap: spacing.sm }}>
              {voices.slice(0, 8).map(v => (
                <Pressable
                  key={v.id}
                  onPress={() => onSetVoice(v.id)}
                  style={[styles.voiceRow, { backgroundColor: voiceId === v.id ? t.bgCardDark : t.bgSearch, borderColor: voiceId === v.id ? t.textPrimary : 'transparent' }]}
                  testID={`voice-${v.id}`}
                >
                  <Text style={[typography.body, { color: voiceId === v.id ? t.textInverse : t.textPrimary }]}>{v.name}</Text>
                  <Text style={[typography.caption, { color: voiceId === v.id ? t.textInverseSecondary : t.textSecondary }]}>{v.language}</Text>
                </Pressable>
              ))}
              {voices.length === 0 && <Text style={[typography.caption, { color: t.textSecondary }]}>Loading voices…</Text>}
            </View>
          </View>

          {/* Sleep timer */}
          <View>
            <Text style={[typography.title, { color: t.textPrimary }]}>Sleep Timer</Text>
            <View style={[styles.sleepGrid, { marginTop: spacing.sm }]}>
              {SLEEP_OPTIONS.map(o => (
                <Pressable
                  key={o.value}
                  onPress={() => useTtsStore.getState().setSleepOption(o.value)}
                  style={[styles.sleepPill, { backgroundColor: sleepOption === o.value ? t.bgCardDark : t.bgSearch }]}
                  testID={`sleep-${o.value}`}
                >
                  <Text style={[typography.caption, { color: sleepOption === o.value ? t.textInverse : t.textSecondary }]}>{o.label}</Text>
                </Pressable>
              ))}
            </View>
            {sleepOption === 'custom' && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.md }}>
                <TextInput
                  value={customInput}
                  onChangeText={setCustomInput}
                  keyboardType="number-pad"
                  placeholder="30"
                  style={[styles.customInput, { backgroundColor: t.bgSearch, color: t.textPrimary, borderColor: t.divider }]}
                  testID="sleep-custom-input"
                />
                <Text style={[typography.caption, { color: t.textSecondary }]}>minutes (1–180)</Text>
                <Pressable
                  onPress={() => {
                    const n = Math.max(1, Math.min(180, Number(customInput) || 30));
                    useTtsStore.getState().setCustomMinutes(n);
                    useTtsStore.getState().setSleepRemaining(n * 60);
                  }}
                  style={[styles.miniBtn, { backgroundColor: t.bgCardDark }]}
                  testID="sleep-custom-apply"
                >
                  <Text style={[typography.caption, { color: t.textInverse }]}>Apply</Text>
                </Pressable>
              </View>
            )}
          </View>

          {/* Highlight-sync toggle */}
          <View style={[styles.toggleRow, { backgroundColor: t.bgSearch }]}>
            <Text style={[typography.body, { color: t.textPrimary, flex: 1 }]}>Highlight spoken word</Text>
            <Toggle value={highlightSync} onValueChange={v => useTtsStore.getState().setHighlightSync(v)} testID="tts-highlight-toggle" />
          </View>

          {/* Transcript — current chapter with current sentence bold+highlighted */}
          <View>
            <Text style={[typography.title, { color: t.textPrimary }]}>Transcript — {current?.chapterTitle ?? bookTitle ?? 'Chapter'}</Text>
            <View style={[styles.transcript, { backgroundColor: t.bgPrimary, marginTop: spacing.sm }]}>
              {chapterTranscript.map(s => {
                const isCurrent = s.id === current?.id;
                return (
                  <Text
                    key={s.id}
                    style={[
                      typography.body,
                      { color: t.textPrimary, backgroundColor: isCurrent && highlightSync ? '#FFEB3B' : 'transparent', opacity: isCurrent && highlightSync ? 0.6 : 1, fontWeight: isCurrent ? '600' : '400' as any },
                    ]}
                    testID={isCurrent ? 'tts-transcript-current' : undefined}
                  >
                    {s.text}{' '}
                  </Text>
                );
              })}
              {chapterTranscript.length === 0 && <Text style={[typography.caption, { color: t.textSecondary }]}>No transcript</Text>}
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, flexDirection: 'column', justifyContent: 'flex-end', zIndex: 30 },
  panel: { height: '50%', maxHeight: '70%', width: '100%', borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.lg, height: 56 },
  expandedTrack: { height: 8, borderRadius: 9999, overflow: 'visible', justifyContent: 'center' },
  expandedFill: { height: 8, borderRadius: 9999, position: 'absolute', left: 0, top: 0, bottom: 0 },
  thumb: { position: 'absolute', width: 20, height: 20, borderRadius: 10, borderWidth: 2, marginLeft: -10, top: -6, elevation: 2 },
  controlsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.lg },
  playLarge: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
  skipBtn: { width: 48, height: 48, borderRadius: 24, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  voiceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.md, borderRadius: 12, borderWidth: 1 },
  sleepGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  sleepPill: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: 9999 },
  customInput: { width: 72, height: 36, borderRadius: 12, borderWidth: 1, textAlign: 'center', paddingHorizontal: spacing.sm },
  miniBtn: { paddingHorizontal: spacing.md, height: 32, borderRadius: 9999, justifyContent: 'center', alignItems: 'center' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, borderRadius: 12 },
  transcript: { padding: spacing.md, borderRadius: 12, flexDirection: 'row', flexWrap: 'wrap' },
});
