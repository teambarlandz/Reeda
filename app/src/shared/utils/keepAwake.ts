// Simple keep-awake helper per phase-3-reader.md:3.1 Fullscreen Mode
import KeepAwake from 'react-native-keep-awake';

let active = false;
let timeout: ReturnType<typeof setTimeout> | null = null;

export function activateKeepAwake() {
  active = true;
  try {
    KeepAwake.activate();
  } catch {}
}

export function deactivateKeepAwake() {
  active = false;
  if (timeout) clearTimeout(timeout);
  try {
    KeepAwake.deactivate();
  } catch {}
}

export function setScreenTimeout(timeoutMode: '1min' | '5min' | '15min' | 'never', isFullscreen: boolean) {
  if (!isFullscreen) {
    deactivateKeepAwake();
    return;
  }
  if (timeoutMode === 'never') {
    activateKeepAwake();
    return;
  }
  // For timed modes, keep awake for duration then allow sleep
  activateKeepAwake();
  const ms = timeoutMode === '1min' ? 60_000 : timeoutMode === '5min' ? 300_000 : 900_000;
  if (timeout) clearTimeout(timeout);
  timeout = setTimeout(() => deactivateKeepAwake(), ms);
}
