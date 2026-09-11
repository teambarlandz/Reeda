// Simple keep-awake helper per phase-3-reader.md:3.1 Fullscreen Mode
// Real native is react-native-keep-awake; fallback to no-op in JS/Tests
let active = false;
let timeout: ReturnType<typeof setTimeout> | null = null;

export function activateKeepAwake() {
  active = true;
  try {
    // Try native module if available
    const KeepAwake = require('react-native-keep-awake');
    if (KeepAwake?.activateKeepAwake) KeepAwake.activateKeepAwake();
  } catch {}
}

export function deactivateKeepAwake() {
  active = false;
  if (timeout) clearTimeout(timeout);
  try {
    const KeepAwake = require('react-native-keep-awake');
    if (KeepAwake?.deactivateKeepAwake) KeepAwake.deactivateKeepAwake();
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
