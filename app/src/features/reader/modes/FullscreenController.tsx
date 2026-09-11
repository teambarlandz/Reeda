import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { useReaderStore } from '../store/readerStore';

export function FullscreenController({ children }: { children: React.ReactNode }) {
  const isFullscreen = useReaderStore(s => s.isFullscreen);

  useEffect(() => {
    StatusBar.setHidden(isFullscreen, 'fade');
  }, [isFullscreen]);

  return <>{children}</>;
}
