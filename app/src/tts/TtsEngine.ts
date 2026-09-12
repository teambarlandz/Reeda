// Thin wrapper over react-native-tts to keep UI decoupled and testable
// Falls back to no-op when engine unavailable (jest / emulator without TTS)

type TtsVoice = { id: string; name: string; language: string };

let ttsModule: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  ttsModule = require('react-native-tts');
  if (ttsModule?.default) ttsModule = ttsModule.default;
} catch {
  ttsModule = null;
}

const FALLBACK_VOICES: TtsVoice[] = [
  { id: 'fallback-en', name: 'System Default', language: 'en-US' },
  { id: 'fallback-en-gb', name: 'English (UK)', language: 'en-GB' },
];

export const TtsEngine = {
  async init(): Promise<boolean> {
    if (!ttsModule) return false;
    try {
      // react-native-tts init is implicit; check getInitStatus if available
      if (typeof ttsModule.getInitStatus === 'function') {
        await ttsModule.getInitStatus();
      }
      return true;
    } catch {
      return false;
    }
  },

  async getVoices(): Promise<TtsVoice[]> {
    if (!ttsModule?.voices) return FALLBACK_VOICES;
    try {
      const voices = await ttsModule.voices();
      if (!voices || voices.length === 0) return FALLBACK_VOICES;
      return voices.map((v: any) => ({
        id: v.id ?? v.name,
        name: v.name ?? v.id,
        language: v.language ?? v.locale ?? 'en-US',
      }));
    } catch {
      return FALLBACK_VOICES;
    }
  },

  async setRate(rate: number): Promise<void> {
    if (!ttsModule?.setDefaultRate) return;
    try {
      await ttsModule.setDefaultRate(rate, true);
    } catch {}
  },

  async setVoice(voiceId: string): Promise<void> {
    if (!ttsModule?.setDefaultVoice) return;
    try {
      await ttsModule.setDefaultVoice(voiceId);
    } catch {}
  },

  async setLanguage(lang: string): Promise<void> {
    if (!ttsModule?.setDefaultLanguage) return;
    try {
      await ttsModule.setDefaultLanguage(lang);
    } catch {}
  },

  async speak(text: string): Promise<void> {
    if (!ttsModule?.speak) return;
    try {
      // Stop any ongoing speech then speak
      if (ttsModule.stop) await ttsModule.stop();
      await ttsModule.speak(text);
    } catch {}
  },

  async stop(): Promise<void> {
    if (!ttsModule?.stop) return;
    try {
      await ttsModule.stop();
    } catch {}
  },

  async pause(): Promise<void> {
    // react-native-tts has no pause; emulate with stop — caller retains index to resume
    await TtsEngine.stop();
  },

  addListener(event: string, handler: (...args: any[]) => void): { remove: () => void } {
    if (!ttsModule?.addEventListener) return { remove: () => {} };
    try {
      const sub = ttsModule.addEventListener(event, handler);
      return { remove: () => sub?.remove?.() };
    } catch {
      return { remove: () => {} };
    }
  },

  async isAvailable(): Promise<boolean> {
    if (!ttsModule) return false;
    try {
      if (ttsModule.getInitStatus) {
        await ttsModule.getInitStatus();
        return true;
      }
      return true;
    } catch {
      return false;
    }
  },

  async openInstall(): Promise<void> {
    try {
      const { Linking } = require('react-native');
      await Linking.openURL('market://details?id=com.google.android.tts');
    } catch {}
  },
};

export type { TtsVoice };
