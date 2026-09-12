import { create } from 'zustand';
import type { TtsSentence } from './TtsQueue';

export const TTS_RATES = [0.5, 0.75, 1, 1.25, 1.5, 2, 3] as const;
export type TtsRate = (typeof TTS_RATES)[number];
export type SleepOption = 'off' | 'endOfChapter' | '15' | '30' | '60' | 'custom';

type TTSStore = {
  isActive: boolean;
  isPlaying: boolean;
  rate: TtsRate;
  voiceId: string | null;
  highlightSync: boolean;
  backgroundPlayback: boolean; // toggle exists but disabled per spec Dead Code note
  sleepOption: SleepOption;
  customMinutes: number;
  sleepRemainingSec: number | null;
  // Queue state
  queue: TtsSentence[];
  currentIndex: number;
  currentWordIndex: number;
  // Engine availability
  engineAvailable: boolean | null; // null = unknown, false = needs install
  hasTextLayer: boolean; // set per book; when false disables controls
  // Expanded player
  isExpanded: boolean;

  setActive: (v: boolean) => void;
  setPlaying: (v: boolean) => void;
  setRate: (r: TtsRate) => void;
  cycleRate: () => TtsRate;
  setVoiceId: (id: string | null) => void;
  setHighlightSync: (v: boolean) => void;
  setBackgroundPlayback: (v: boolean) => void;
  setSleepOption: (o: SleepOption) => void;
  setCustomMinutes: (m: number) => void;
  setSleepRemaining: (sec: number | null) => void;
  setQueue: (q: TtsSentence[], startIndex?: number) => void;
  setCurrentIndex: (i: number) => void;
  setCurrentWordIndex: (i: number) => void;
  setEngineAvailable: (v: boolean | null) => void;
  setHasTextLayer: (v: boolean) => void;
  setExpanded: (v: boolean) => void;
  reset: () => void;
};

const initial: Omit<TTSStore, 'setActive' | 'setPlaying' | 'setRate' | 'cycleRate' | 'setVoiceId' | 'setHighlightSync' | 'setBackgroundPlayback' | 'setSleepOption' | 'setCustomMinutes' | 'setSleepRemaining' | 'setQueue' | 'setCurrentIndex' | 'setCurrentWordIndex' | 'setEngineAvailable' | 'setHasTextLayer' | 'setExpanded' | 'reset'> = {
  isActive: false,
  isPlaying: false,
  rate: 1,
  voiceId: null,
  highlightSync: true,
  backgroundPlayback: false,
  sleepOption: 'off',
  customMinutes: 30,
  sleepRemainingSec: null,
  queue: [],
  currentIndex: 0,
  currentWordIndex: 0,
  engineAvailable: null,
  hasTextLayer: true,
  isExpanded: false,
};

export const useTtsStore = create<TTSStore>((set, get) => ({
  ...initial,
  setActive: isActive => set({ isActive, isExpanded: isActive ? get().isExpanded : false, isPlaying: isActive ? get().isPlaying : false }),
  setPlaying: isPlaying => set({ isPlaying }),
  setRate: rate => set({ rate }),
  cycleRate: () => {
    const cur = get().rate;
    const idx = TTS_RATES.indexOf(cur);
    const next = TTS_RATES[(idx + 1) % TTS_RATES.length];
    set({ rate: next });
    return next;
  },
  setVoiceId: voiceId => set({ voiceId }),
  setHighlightSync: highlightSync => set({ highlightSync }),
  setBackgroundPlayback: backgroundPlayback => set({ backgroundPlayback }),
  setSleepOption: sleepOption => set({ sleepOption, sleepRemainingSec: sleepOption === 'off' ? null : get().sleepRemainingSec }),
  setCustomMinutes: customMinutes => set({ customMinutes }),
  setSleepRemaining: sleepRemainingSec => set({ sleepRemainingSec }),
  setQueue: (queue, startIndex = 0) => set({ queue, currentIndex: startIndex, currentWordIndex: 0 }),
  setCurrentIndex: currentIndex => set({ currentIndex, currentWordIndex: 0 }),
  setCurrentWordIndex: currentWordIndex => set({ currentWordIndex }),
  setEngineAvailable: engineAvailable => set({ engineAvailable }),
  setHasTextLayer: hasTextLayer => set({ hasTextLayer }),
  setExpanded: isExpanded => set({ isExpanded }),
  reset: () => set({ ...initial }),
}));
