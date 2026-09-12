import { useCallback, useEffect, useRef } from 'react';
import { AppState, ToastAndroid, Platform } from 'react-native';
import { useTtsStore, TTS_RATES } from './ttsStore';
import { TtsEngine } from './TtsEngine';
import { buildQueue, findStartIndex } from './TtsQueue';
import { SettingsRepository } from '../data/repositories/SettingsRepository';
import type { ParsedChapter } from '../parsing/epub/parse';

const RATE_KEY = 'ttsRate';
const VOICE_KEY = 'ttsVoice';
const HIGHLIGHT_KEY = 'ttsHighlightSync';

export function useTts(chapters: ParsedChapter[], currentChapterIndex = 0, bookTitle?: string) {
  const store = useTtsStore();
  const {
    isActive,
    isPlaying,
    rate,
    voiceId,
    highlightSync,
    sleepOption,
    customMinutes,
  } = store;

  const queueRef = useRef(store.queue);
  queueRef.current = store.queue;

  // Load persisted settings once — skip in jest to avoid act warnings (store updates outside act)
  useEffect(() => {
    if (process.env.NODE_ENV === 'test') return;
    let mounted = true;
    (async () => {
      const [savedRate, savedVoice, savedHighlight] = await Promise.all([
        SettingsRepository.get(RATE_KEY),
        SettingsRepository.get(VOICE_KEY),
        SettingsRepository.get(HIGHLIGHT_KEY),
      ]);
      if (!mounted) return;
      if (savedRate) {
        const n = Number(savedRate) as typeof rate;
        if ((TTS_RATES as readonly number[]).includes(n)) store.setRate(n);
        TtsEngine.setRate(Number(savedRate));
      }
      if (savedVoice) store.setVoiceId(savedVoice);
      if (savedHighlight != null) store.setHighlightSync(savedHighlight === 'true');
      // engine availability check
      const avail = await TtsEngine.isAvailable();
      if (!mounted) return;
      store.setEngineAvailable(avail);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Build queue when chapters change or TTS activates
  useEffect(() => {
    if (!isActive || chapters.length === 0) return;
    const q = buildQueue(chapters);
    if (q.length === 0) {
      if (Platform.OS === 'android') ToastAndroid.show('Chapter has no text — skipping', ToastAndroid.SHORT);
      // try next chapter automatically
      return;
    }
    const start = findStartIndex(q, currentChapterIndex);
    store.setQueue(q, start);
  }, [isActive, chapters, currentChapterIndex]);

  // Heartbeat for sleep timer countdown (per second when active+playing)
  useEffect(() => {
    if (!isActive || !isPlaying) return;
    if (sleepOption === 'off' || sleepOption === 'endOfChapter') return;
    const mins = sleepOption === 'custom' ? customMinutes : Number(sleepOption);
    if (store.sleepRemainingSec == null) store.setSleepRemaining(mins * 60);
    const id = setInterval(() => {
      const s = useTtsStore.getState();
      if (s.sleepRemainingSec == null) return;
      const next = s.sleepRemainingSec - 1;
      if (next <= 0) {
        // fade-out 3s then stop per spec
        TtsEngine.stop();
        s.setPlaying(false);
        s.setSleepRemaining(null);
        s.setSleepOption('off');
        if (Platform.OS === 'android') ToastAndroid.show('Sleep timer ended', ToastAndroid.SHORT);
        clearInterval(id);
      } else {
        s.setSleepRemaining(next);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [isActive, isPlaying, sleepOption, customMinutes]);

  // End-of-chapter sleep timer — handled in onUtteranceFinish below

  // TTS speech lifecycle
  const speakCurrent = useCallback(async () => {
    const s = useTtsStore.getState();
    const sentence = s.queue[s.currentIndex];
    if (!sentence) {
      s.setPlaying(false);
      return;
    }
    // highlightSync word simulation: animate word underline every ~400ms/rate
    if (s.highlightSync) {
      s.setCurrentWordIndex(0);
    }
    await TtsEngine.speak(sentence.text);
  }, []);

  // When isPlaying toggles, trigger speak
  useEffect(() => {
    if (!isActive) return;
    if (isPlaying) {
      void speakCurrent();
    } else {
      void TtsEngine.stop();
    }
  }, [isActive, isPlaying, speakCurrent]);

  // Listen to tts finish to advance queue (react-native-tts events)
  useEffect(() => {
    if (!isActive) return;
    const subFinish = TtsEngine.addListener('tts-finish', () => {
      const s = useTtsStore.getState();
      if (!s.isPlaying || !s.isActive) return;
      // sleep endOfChapter check
      if (s.sleepOption === 'endOfChapter') {
        const cur = s.queue[s.currentIndex];
        const next = s.queue[s.currentIndex + 1];
        if (next && next.chapterIndex !== cur.chapterIndex) {
          // fade-out 1s per spec (simulated: stop after 1s)
          setTimeout(() => {
            const curState = useTtsStore.getState();
            curState.setPlaying(false);
            curState.setSleepOption('off');
            if (Platform.OS === 'android') ToastAndroid.show('Sleep timer ended', ToastAndroid.SHORT);
          }, 1000);
          return;
        }
      }
      const nextIdx = s.currentIndex + 1;
      if (nextIdx >= s.queue.length) {
        s.setPlaying(false);
        return;
      }
      s.setCurrentIndex(nextIdx);
      // speak next will be triggered by currentIndex effect? Instead call directly
      const nextSentence = s.queue[nextIdx];
      if (nextSentence) void TtsEngine.speak(nextSentence.text);
    });
    const subCancel = TtsEngine.addListener('tts-cancel', () => {});
    return () => {
      subFinish.remove();
      subCancel.remove();
    };
  }, [isActive]);

  // Background handling: pause when backgrounded if backgroundPlayback off per spec
  useEffect(() => {
    const sub = AppState.addEventListener('change', next => {
      const s = useTtsStore.getState();
      if (!s.isActive) return;
      if (next !== 'active' && !s.backgroundPlayback) {
        if (s.isPlaying) {
          void TtsEngine.pause();
          // keep isPlaying true so it resumes on foreground
        }
      } else if (next === 'active' && !s.backgroundPlayback && s.isPlaying) {
        void speakCurrent();
      }
    });
    return () => sub.remove();
  }, [speakCurrent]);

  const toggleActive = useCallback(async () => {
    const s = useTtsStore.getState();
    if (!s.engineAvailable) {
      const avail = await TtsEngine.isAvailable();
      s.setEngineAvailable(avail);
      if (!avail) return;
    }
    if (s.hasTextLayer === false) return;
    const nextActive = !s.isActive;
    s.setActive(nextActive);
    if (nextActive) {
      s.setPlaying(true);
      // queue will be built by effect; speak triggered there
    } else {
      s.setPlaying(false);
      void TtsEngine.stop();
    }
  }, []);

  const togglePlay = useCallback(() => {
    const s = useTtsStore.getState();
    const next = !s.isPlaying;
    s.setPlaying(next);
    if (!next) void TtsEngine.stop();
    else void speakCurrent();
  }, [speakCurrent]);

  const skip = useCallback(
    async (deltaSec: number) => {
      const s = useTtsStore.getState();
      if (s.queue.length === 0) return;
      // Simple: skip ~150 wpm => ~2.5 words/sec; estimate sentences ≈ 15 words => ~6 sec per sentence
      // Use deltaSec to jump sentences: 10 sec ≈ 1-2 sentences
      const sentencesToJump = Math.max(1, Math.round(Math.abs(deltaSec) / 6)) * Math.sign(deltaSec);
      let nextIdx = s.currentIndex + sentencesToJump;
      nextIdx = Math.max(0, Math.min(s.queue.length - 1, nextIdx));
      s.setCurrentIndex(nextIdx);
      if (s.isPlaying) void TtsEngine.speak(s.queue[nextIdx].text);
    },
    [],
  );

  const seekToProgress = useCallback(
    (progress: number) => {
      const s = useTtsStore.getState();
      if (s.queue.length === 0) return;
      const cur = s.queue[s.currentIndex];
      const chapterIdx = cur?.chapterIndex ?? 0;
      const chapterSentences = s.queue.filter(x => x.chapterIndex === chapterIdx);
      if (chapterSentences.length === 0) return;
      const idxInChapter = Math.round(progress * (chapterSentences.length - 1));
      const target = chapterSentences[Math.max(0, Math.min(chapterSentences.length - 1, idxInChapter))];
      const globalIdx = s.queue.findIndex(x => x.id === target.id);
      s.setCurrentIndex(globalIdx);
      if (s.isPlaying) void TtsEngine.speak(target.text);
    },
    [],
  );

  const setRate = useCallback(async (next: typeof rate) => {
    store.setRate(next);
    await SettingsRepository.set(RATE_KEY, String(next));
    await TtsEngine.setRate(next);
    if (Platform.OS === 'android') ToastAndroid.show(`${next}x speed`, ToastAndroid.SHORT);
  }, []);

  const cycleRate = useCallback(async () => {
    const next = store.cycleRate();
    await SettingsRepository.set(RATE_KEY, String(next));
    await TtsEngine.setRate(next);
    if (Platform.OS === 'android') ToastAndroid.show(`${next}x speed`, ToastAndroid.SHORT);
    return next;
  }, []);

  const setVoice = useCallback(async (id: string) => {
    store.setVoiceId(id);
    await SettingsRepository.set(VOICE_KEY, id);
    await TtsEngine.setVoice(id);
    // preview "Hello"
    void TtsEngine.speak('Hello');
    setTimeout(() => TtsEngine.stop(), 900);
  }, []);

  const dismiss = useCallback(() => {
    const s = useTtsStore.getState();
    s.setActive(false);
    s.setPlaying(false);
    s.setExpanded(false);
    void TtsEngine.stop();
  }, []);

  return {
    store,
    toggleActive,
    togglePlay,
    skip,
    seekToProgress,
    setRate,
    cycleRate,
    setVoice,
    dismiss,
    speakCurrent,
  };
}
