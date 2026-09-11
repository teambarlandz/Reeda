import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { initDb } from '../../data/db';
import { useAppTheme } from '../../shared/theme/useTheme';

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const tokens = useAppTheme();

  useEffect(() => {
    initDb()
      .then(() => setReady(true))
      .catch(e => setError(String(e)));
  }, []);

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: tokens.bgPrimary, padding: 24 }}>
        <Text style={{ color: tokens.textPrimary }}>Database failed to initialize: {error}</Text>
      </View>
    );
  }

  if (!ready) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: tokens.bgPrimary }}>
        <ActivityIndicator color={tokens.textPrimary} />
      </View>
    );
  }

  return <>{children}</>;
}
