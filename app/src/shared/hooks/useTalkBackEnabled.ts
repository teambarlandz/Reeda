import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

export function useTalkBackEnabled(): boolean {
  const [talkBackEnabled, setTalkBackEnabled] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isScreenReaderEnabled().then(setTalkBackEnabled);
    const sub = AccessibilityInfo.addEventListener('screenReaderChanged', setTalkBackEnabled);
    return () => sub.remove();
  }, []);

  return talkBackEnabled;
}
