import React, { useMemo } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useEnergy } from '../context/EnergyContext';
import { formatEnergy } from '../utils/energy';
import { Colors, Radius, Shadows, Spacing, Typography } from '../theme';

export type HubArea = 'track' | 'insights' | 'goals' | 'profile';

interface FeatureHubScreenProps {
  area: HubArea;
  navigation: { navigate: (screen: string) => void };
}

interface FeatureTile {
  title: string;
  description: string;
  screen: string;
  accent: string;
  tag?: string;
}

const HUB_COPY: Record<HubArea, { eyebrow: string; title: string; subtitle: string; action: string }> = {
  track: {
    eyebrow: 'ENERGY OPERATIONS',
    title: 'Track your home',
    subtitle: 'Keep every device, room, and daily reading up to date.',
    action: 'Log today’s usage',
  },
  insights: {
    eyebrow: 'ANALYSIS CENTRE',
    title: 'Turn data into savings',
    subtitle: 'Find patterns, act on recommendations, and share the results.',
    action: 'View recommendations',
  },
  goals: {
    eyebrow: 'IMPACT & PROGRESS',
    title: 'Make progress visible',
    subtitle: 'Set clear limits, build habits, and involve your community.',
    action: 'Open my goals',
  },
  profile: {
    eyebrow: 'ACCOUNT & SUPPORT',
    title: 'Your SaveVolt space',
    subtitle: 'Manage alerts, preferences, and get help whenever you need it.',
    action: 'Open settings',
  },
};

const FEATURE_TILES: Record<HubArea, FeatureTile[]> = {
  track: [
    { title: 'Add appliance', description: 'Add a device with power and usage details.', screen: 'AddAppliance', accent: Colors.primary, tag: 'START HERE' },
    { title: 'Live audit', description: 'Compare devices and switch tracking on or off.', screen: 'Audit', accent: Colors.info },
    { title: 'Home energy map', description: 'Assign devices to rooms and spot hotspots.', screen: 'Map', accent: Colors.accent },
  ],
  insights: [
    { title: 'Action plan', description: 'Personal recommendations ranked by savings.', screen: 'Recommendations', accent: Colors.accent, tag: 'SMART' },
    { title: 'Usage trends', description: 'See daily, monthly, and longer-term movement.', screen: 'Trends', accent: Colors.info },
    { title: 'Smart tips', description: 'Practical advice tailored to your energy profile.', screen: 'Tips', accent: Colors.primary },
    { title: 'Reports', description: 'Review, export, and share your energy data.', screen: 'Reports', accent: Colors.warning },
  ],
  goals: [
    { title: 'My goals', description: 'Create monthly energy, cost, and CO2 limits.', screen: 'Progress', accent: Colors.primary, tag: 'CORE' },
    { title: 'Challenges', description: 'Take on focused saving habits and rewards.', screen: 'Challenges', accent: Colors.warning },
    { title: 'Shared goal planner', description: 'Plan a group goal and record local contributions.', screen: 'Community', accent: Colors.info },
    { title: 'Impact', description: 'Translate energy choices into environmental impact.', screen: 'Impact', accent: Colors.success },
    { title: 'Leaderboard preview', description: 'Explore a local preview of ranked progress.', screen: 'Leaderboard', accent: Colors.accent, tag: 'LOCAL' },
  ],
  profile: [
    { title: 'Energy assistant', description: 'Ask questions about your usage and savings.', screen: 'Chat', accent: Colors.accent, tag: 'HELP' },
    { title: 'Reminders', description: 'Plan helpful prompts for devices and habits.', screen: 'Reminders', accent: Colors.warning },
    { title: 'Settings', description: 'Set your local rate, emission factor, and preferences.', screen: 'Settings', accent: Colors.primary },
  ],
};

const FeatureHubScreen = ({ area, navigation }: FeatureHubScreenProps) => {
  const {
    appliances,
    dashboardData,
    tips,
    usageRecords,
    goals,
    badges,
    streak,
    reminders,
    settings,
    saveUsageRecord,
  } = useEnergy();
  const copy = HUB_COPY[area];

  const metrics = useMemo(() => {
    switch (area) {
      case 'track':
        return [
          { value: String(appliances.length), label: 'devices' },
          { value: String(appliances.filter((item) => item.isActive).length), label: 'active' },
          { value: dashboardData ? formatEnergy(dashboardData.totalEnergyConsumed) : '—', label: 'this month' },
        ];
      case 'insights':
        return [
          { value: String(tips.length), label: 'tips ready' },
          { value: String(usageRecords.length), label: 'daily logs' },
          { value: dashboardData ? formatEnergy(dashboardData.totalEnergyConsumed) : '—', label: 'analysed' },
        ];
      case 'goals':
        return [
          { value: String(goals.length), label: 'active goals' },
          { value: String(streak.currentStreak), label: 'day streak' },
          { value: String(badges.filter((badge) => badge.isEarned).length), label: 'badges' },
        ];
      default:
        return [
          { value: settings.notificationsEnabled ? 'On' : 'Off', label: 'alerts' },
          { value: String(reminders.filter((reminder) => reminder.isActive).length), label: 'reminders' },
          { value: settings.voiceEnabled ? 'On' : 'Off', label: 'voice tips' },
        ];
    }
  }, [area, appliances, badges, dashboardData, goals, reminders, settings, streak, tips, usageRecords]);

  const handlePrimaryAction = async () => {
    if (area === 'track') {
      if (appliances.length === 0) {
        navigation.navigate('AddAppliance');
        return;
      }
      await saveUsageRecord();
      Alert.alert('Usage logged', 'Today’s energy snapshot is ready in Trends and Reports.');
      return;
    }

    navigation.navigate(area === 'insights' ? 'Recommendations' : area === 'goals' ? 'Progress' : 'Settings');
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.dark} />
      <LinearGradient colors={[Colors.dark, '#162032', '#1A2E40']} style={styles.hero}>
        <Image source={require('../assets/branding/savevolt-logo.png')} style={styles.logo} accessibilityLabel="SaveVolt logo" />
        <Text style={styles.eyebrow}>{copy.eyebrow}</Text>
        <Text style={styles.title}>{copy.title}</Text>
        <Text style={styles.subtitle}>{copy.subtitle}</Text>
        <View style={styles.metricRow}>
          {metrics.map((metric, index) => (
            <React.Fragment key={metric.label}>
              {index > 0 && <View style={styles.metricDivider} />}
              <View style={styles.metric}>
                <Text style={styles.metricValue} numberOfLines={1}>{metric.value}</Text>
                <Text style={styles.metricLabel}>{metric.label}</Text>
              </View>
            </React.Fragment>
          ))}
        </View>
      </LinearGradient>

      <TouchableOpacity style={styles.primaryAction} activeOpacity={0.86} onPress={handlePrimaryAction}>
        <LinearGradient colors={[Colors.primary, Colors.primaryDark]} style={styles.primaryActionGradient}>
          <Text style={styles.primaryActionText}>{copy.action}</Text>
          <Text style={styles.primaryActionArrow}>→</Text>
        </LinearGradient>
      </TouchableOpacity>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Explore {area === 'profile' ? 'your workspace' : 'tools'}</Text>
        <Text style={styles.sectionSubtitle}>Everything in this area</Text>
      </View>

      <View style={styles.grid}>
        {FEATURE_TILES[area].map((tile) => (
          <TouchableOpacity
            key={tile.screen}
            activeOpacity={0.75}
            style={styles.tile}
            onPress={() => navigation.navigate(tile.screen)}
          >
            <View style={styles.tileTop}>
              <View style={[styles.tileAccent, { backgroundColor: tile.accent }]} />
              {tile.tag && <Text style={[styles.tileTag, { color: tile.accent }]}>{tile.tag}</Text>}
            </View>
            <Text style={styles.tileTitle}>{tile.title}</Text>
            <Text style={styles.tileDescription}>{tile.description}</Text>
            <Text style={[styles.tileArrow, { color: tile.accent }]}>Open →</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.footer}>SaveVolt keeps your local energy data private on this device.</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: 36 },
  hero: { paddingTop: 56, paddingHorizontal: Spacing.page, paddingBottom: 40 },
  logo: { width: 44, height: 44, borderRadius: 12, marginBottom: 14 },
  eyebrow: { ...Typography.overline, color: Colors.primary, marginBottom: 6 },
  title: { ...Typography.displaySmall, color: Colors.textOnDark, marginBottom: 8 },
  subtitle: { ...Typography.bodyMedium, color: Colors.textOnDarkSub, lineHeight: 21, maxWidth: 330 },
  metricRow: {
    flexDirection: 'row', alignItems: 'center', marginTop: 24, paddingVertical: 13,
    paddingHorizontal: 8, borderRadius: Radius.md, backgroundColor: 'rgba(255,255,255,0.07)',
  },
  metric: { flex: 1, alignItems: 'center' },
  metricDivider: { width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.16)' },
  metricValue: { ...Typography.statSmall, color: Colors.primary, maxWidth: 96 },
  metricLabel: { ...Typography.labelSmall, color: Colors.textOnDarkSub, marginTop: 3, textTransform: 'uppercase' },
  primaryAction: { marginHorizontal: Spacing.page, marginTop: -20, borderRadius: Radius.md, overflow: 'hidden', ...Shadows.lg },
  primaryActionGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, paddingHorizontal: 18 },
  primaryActionText: { ...Typography.h3, color: Colors.dark },
  primaryActionArrow: { fontSize: 22, fontWeight: '700', color: Colors.dark },
  sectionHeader: { marginTop: 28, paddingHorizontal: Spacing.page, marginBottom: 12 },
  sectionTitle: { ...Typography.h2, color: Colors.text },
  sectionSubtitle: { ...Typography.bodySmall, color: Colors.textMuted, marginTop: 3 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingHorizontal: Spacing.page },
  tile: { width: '48%' as any, minHeight: 164, backgroundColor: Colors.card, borderRadius: Radius.card, padding: 16, ...Shadows.sm },
  tileTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 },
  tileAccent: { width: 34, height: 7, borderRadius: Radius.pill },
  tileTag: { ...Typography.overline, fontSize: 9 },
  tileTitle: { ...Typography.h3, color: Colors.text, marginBottom: 5 },
  tileDescription: { ...Typography.bodySmall, color: Colors.textSecondary, lineHeight: 17, flex: 1 },
  tileArrow: { ...Typography.labelSmall, marginTop: 12 },
  footer: { ...Typography.bodySmall, color: Colors.textMuted, textAlign: 'center', paddingHorizontal: 36, marginTop: 28, lineHeight: 18 },
});

export default FeatureHubScreen;
