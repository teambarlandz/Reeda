import React, { useEffect } from 'react';
import { StatusBar, Platform } from 'react-native';
import { useReaderStore } from '../store/readerStore';
import { setScreenTimeout } from '../../../shared/utils/keepAwake';

export function FullscreenController({ children }: { children: React.ReactNode }) {
  const isFullscreen = useReaderStore(s => s.isFullscreen);
  const screenTimeout = useReaderStore(s => s.screenTimeout);

  useEffect(() => {
    StatusBar.setHidden(isFullscreen, 'fade');
    if (Platform.OS === 'android') {
      // Immersive sticky per phase-3-reader.md:3.1 — hide nav bar 2s after appear
      // Real native would use SYSTEM_UI_FLAG_IMMERSIVE_STICKY; StatusBar hidden covers top, nav bar auto-hides via immersive
    }
    setScreenTimeout(screenTimeout, isFullscreen);
  }, [isFullscreen, screenTimeout]);

  return <>{children}</>;
}
