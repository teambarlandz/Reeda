import React from 'react';
import { View, StyleSheet, ScrollView, Pressable, Text } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useMenuStore } from './menuStore';
import { useAppTheme } from '../../../shared/theme/useTheme';
import { radius, elevation } from '../../../shared/theme/tokens';
import { MenuItem } from './MenuItem';
import {
  BookOpen,
  Bookmark,
  Highlighter,
  Pencil,
  Volume2,
  VolumeX,
  Search,
  Type,
  Rows3,
  BarChart3,
  Share2,
  Languages,
  Settings,
  ChevronLeft,
  ChevronRight,
} from '../../../shared/icons';

type Props = {
  onSelect: (item: string) => void;
  ttsActive?: boolean;
  ttsDisabled?: boolean;
  reducedMotion?: boolean;
};

const ITEMS: Array<{ key: string; label: string; icon: any; disabledIcon?: any }> = [
  { key: 'chapters', label: 'Chapters', icon: BookOpen },
  { key: 'bookmarks', label: 'Bookmarks', icon: Bookmark },
  { key: 'highlights', label: 'Highlights', icon: Highlighter },
  { key: 'notes', label: 'Notes', icon: Pencil },
  { key: 'readAloud', label: 'Read Aloud', icon: Volume2, disabledIcon: VolumeX },
  { key: 'search', label: 'Search', icon: Search },
  { key: 'font', label: 'Font', icon: Type },
  { key: 'pages', label: 'Pages', icon: Rows3 },
  { key: 'progress', label: 'Progress', icon: BarChart3 },
  { key: 'share', label: 'Share', icon: Share2 },
  { key: 'dictionary', label: 'Dictionary', icon: Languages },
  { key: 'settings', label: 'Settings', icon: Settings },
];

export function RectangularMenu({ onSelect, ttsActive = false, ttsDisabled = false, reducedMotion = false }: Props) {
  const { isCollapsed, toggle, activePanel } = useMenuStore();
  const t = useAppTheme();
  const width = isCollapsed ? 56 : 220;

  const animatedStyle = useAnimatedStyle(() => ({
    width: withTiming(width, { duration: reducedMotion ? 0 : 250 }),
  }));

  return (
    <Animated.View
      testID="rectangular-menu"
      style={[
        styles.container,
        { backgroundColor: t.bgCardDark, borderTopRightRadius: radius.md, borderBottomRightRadius: radius.md },
        elevation.md,
        animatedStyle,
      ]}
    >
      <Pressable onPress={toggle} style={styles.toggle} testID="menu-toggle">
        {isCollapsed ? <ChevronRight size={20} color={t.textInverse} /> : <ChevronLeft size={20} color={t.textInverse} />}
      </Pressable>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 12 }}>
        {ITEMS.map(item => {
          const isReadAloud = item.key === 'readAloud';
          const Icon = isReadAloud && ttsDisabled && item.disabledIcon ? item.disabledIcon : item.icon;
          const isActive = isReadAloud ? ttsActive || activePanel === 'ttsSettings' : activePanel === item.key;
          const disabled = isReadAloud && ttsDisabled;
          return (
            <MenuItem
              key={item.key}
              collapsed={isCollapsed}
              label={item.label}
              active={!!isActive}
              onPress={() => onSelect(item.key)}
              testID={`menu-${item.key}`}
              icon={<Icon size={24} color={isActive ? t.bgCardDark : t.textInverse} style={disabled ? { opacity: 0.4 } : undefined} />}
            />
          );
        })}
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { height: '100%', zIndex: 10, overflow: 'hidden' },
  toggle: { height: 48, justifyContent: 'center', alignItems: 'center' },
});
