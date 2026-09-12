import React from 'react';
import { Switch } from 'react-native';
import { useAppTheme } from '../theme/useTheme';

type Props = { value: boolean; onValueChange: (v: boolean) => void; testID?: string; disabled?: boolean };

export function Toggle({ value, onValueChange, testID, disabled }: Props) {
  const t = useAppTheme();
  return <Switch testID={testID} value={value} onValueChange={onValueChange} trackColor={{ false: t.divider, true: t.textPrimary }} thumbColor="#FFFFFF" disabled={disabled} accessibilityLabel={value ? 'Enabled' : 'Disabled'} />;
}
