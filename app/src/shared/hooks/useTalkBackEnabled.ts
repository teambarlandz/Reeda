import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

export function useTalkBackEnabled(): boolean {
  const [talkBackEnabled, setTalkBackEnabled] = useState(false);

  useEffect(() => {
    // Guard: RN jest mock does not implement isScreenReaderEnabled() (returns undefined)
    const initial = AccessibilityInfo.isScreenReaderEnabled() as unknown;
    if (initial && typeof (initial as Promise<boolean>).then === 'function') {
      (initial as Promise<boolean>).then(setTalkBackEnabled);
    }
    const sub = AccessibilityInfo.addEventListener('screenReaderChanged', setTalkBackEnabled);
    return () => sub.remove();
  }, []);

  return talkBackEnabled;
}
