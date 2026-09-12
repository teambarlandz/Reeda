import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { typography, spacing, radius } from '../../../shared/theme/tokens';
import { useAppTheme } from '../../../shared/theme/useTheme';
import { AppThemeToggle } from '../components/AppThemeToggle';
import { ReadingGoalRow } from '../components/ReadingGoalRow';
import { StorageManagement } from '../components/StorageManagement';
import { ChevronLeft } from '../../../shared/icons';

const { version: APP_VERSION } = require('../../package.json');
const CONTENT_NOTICE = "Only import books you have the right to read. This app does not provide books and does not bypass copy protection.";
const PRIVACY_POLICY = "This app works offline and stores your books and reading data only on your device. We do not collect, upload, or share your books, highlights, notes, or reading progress. Search queries and recent searches are stored only on your device and never uploaded. You can clear them in Search → Recent searches → Clear. If crash reporting is enabled in a future update, this policy will be updated to describe it.";
const TERMS_OF_SERVICE = "This app is a reading tool; you are responsible for having rights to files you import. No warranty for file parsing — corrupt or DRM-protected files may fail to open. Samples are public domain and may be removed by the user. Contact support@reeda.app for takedown or legal inquiries.";
const SUPPORT_EMAIL = 'support@reeda.app';

export function SettingsScreen() {
  const t = useAppTheme();
  const navigation = useNavigation();
  const [expanded, setExpanded] = React.useState<string | null>(null);

  const toggleExpand = (key: string) => setExpanded(expanded === key ? null : key);

  return (
    <ScrollView style={[styles.container, { backgroundColor: t.bgPrimary }]}>
      <View style={[styles.header, { flexDirection: 'row', alignItems: 'center', gap: spacing.md }]}>
        <Pressable onPress={() => navigation.goBack()} testID="settings-back" accessibilityLabel="Go back" accessibilityRole="button">
          <ChevronLeft size={24} color={t.textPrimary} />
        </Pressable>
        <Text style={[typography.heading, { color: t.textPrimary }]}>Settings</Text>
      </View>

      {/* Appearance */}
      <View style={[styles.section, { backgroundColor: t.bgCard, borderRadius: radius.lg, marginHorizontal: spacing.lg, marginTop: spacing.lg }]}>
        <AppThemeToggle />
      </View>

      {/* Reading Goal */}
      <View style={{ marginHorizontal: spacing.lg, marginTop: spacing.lg }}>
        <ReadingGoalRow />
      </View>

      {/* Storage */}
      <View style={{ marginHorizontal: spacing.lg, marginTop: spacing.lg }}>
        <StorageManagement />
      </View>

      {/* About */}
      <View style={[styles.section, { backgroundColor: t.bgCard, borderRadius: radius.lg, marginHorizontal: spacing.lg, marginTop: spacing.lg }]}>
        <Text style={[typography.body, { color: t.textPrimary, padding: spacing.lg, paddingBottom: 0 }]}>About</Text>

        <Pressable onPress={() => toggleExpand('notice')} style={styles.aboutRow} testID="content-notice" accessibilityLabel="Content Notice" accessibilityRole="button" accessibilityState={{ expanded: expanded === 'notice' }}>
          <Text style={[typography.body, { color: t.textPrimary, flex: 1 }]}>Content Notice</Text>
          <Text style={[typography.body, { color: t.textSecondary }]}>{expanded === 'notice' ? '−' : '›'}</Text>
        </Pressable>
        {expanded === 'notice' && (
          <Text style={[typography.caption, { color: t.textSecondary, paddingHorizontal: spacing.lg, paddingBottom: spacing.lg }]}>{CONTENT_NOTICE}</Text>
        )}

        <Pressable onPress={() => toggleExpand('privacy')} style={styles.aboutRow} testID="privacy-policy" accessibilityLabel="Privacy Policy" accessibilityRole="button" accessibilityState={{ expanded: expanded === 'privacy' }}>
          <Text style={[typography.body, { color: t.textPrimary, flex: 1 }]}>Privacy Policy</Text>
          <Text style={[typography.body, { color: t.textSecondary }]}>{expanded === 'privacy' ? '−' : '›'}</Text>
        </Pressable>
        {expanded === 'privacy' && (
          <Text style={[typography.caption, { color: t.textSecondary, paddingHorizontal: spacing.lg, paddingBottom: spacing.lg }]}>{PRIVACY_POLICY}</Text>
        )}

        <Pressable onPress={() => toggleExpand('terms')} style={styles.aboutRow} testID="terms-of-service" accessibilityLabel="Terms of Service" accessibilityRole="button" accessibilityState={{ expanded: expanded === 'terms' }}>
          <Text style={[typography.body, { color: t.textPrimary, flex: 1 }]}>Terms of Service</Text>
          <Text style={[typography.body, { color: t.textSecondary }]}>{expanded === 'terms' ? '−' : '›'}</Text>
        </Pressable>
        {expanded === 'terms' && (
          <Text style={[typography.caption, { color: t.textSecondary, paddingHorizontal: spacing.lg, paddingBottom: spacing.lg }]}>{TERMS_OF_SERVICE}</Text>
        )}

        <View style={[styles.aboutRow, { borderBottomWidth: 0 }]}>
          <Text style={[typography.body, { color: t.textPrimary }]}>Contact / Support</Text>
          <Text style={[typography.caption, { color: t.textPrimary }]}>{SUPPORT_EMAIL}</Text>
        </View>
      </View>

      {/* Version */}
      <View style={{ alignItems: 'center', marginTop: spacing.xl }}>
        <Text style={[typography.caption, { color: t.textSecondary }]}>Reeda v{APP_VERSION}</Text>
      </View>

      <View style={{ height: spacing['4xl'] }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.xl, paddingBottom: spacing.md },
  section: {},
  aboutRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(255,255,255,0.1)' },
});
