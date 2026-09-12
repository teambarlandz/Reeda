import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

export function useReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    // Guard: RN jest mock does not implement isReduceMotionEnabled() (returns undefined)
    const initial = AccessibilityInfo.isReduceMotionEnabled() as unknown;
    if (initial && typeof (initial as Promise<boolean>).then === 'function') {
      (initial as Promise<boolean>).then(setReducedMotion);
    }
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReducedMotion);
    return () => sub.remove();
  }, []);

  return reducedMotion;
}
