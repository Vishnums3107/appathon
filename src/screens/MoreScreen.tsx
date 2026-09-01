import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Colors, Typography, Spacing, Radius, Shadows } from '../theme';

interface MenuItem {
  title: string;
  icon: string;
  screen: string;
  desc: string;
  badge?: string;
}

interface Section {
  heading: string;
  icon: string;
  accent: string;
  items: MenuItem[];
}

const SECTIONS: Section[] = [
  {
    heading: 'Analytics & Insights',
    icon: '📊',
    accent: '#3B82F6',
    items: [
      { title: 'Trends', icon: '📈', screen: 'Trends', desc: 'Usage patterns & charts' },
      { title: 'AI Insights', icon: '🧠', screen: 'Recommendations', desc: 'Smart recommendations', badge: 'AI' },
      { title: 'Reports', icon: '📄', screen: 'Reports', desc: 'Export & share reports' },
      { title: 'Energy Map', icon: '🗺️', screen: 'Map', desc: 'Room-by-room breakdown' },
    ],
  },
  {
    heading: 'Community & Compete',
    icon: '🤝',
    accent: '#F59E0B',
    items: [
      { title: 'Challenges', icon: '🎯', screen: 'Challenges', desc: 'Eco targets & rewards' },
      { title: 'Community', icon: '🤝', screen: 'Community', desc: 'Team goals & saving' },
      { title: 'Leaderboard', icon: '🏅', screen: 'Leaderboard', desc: 'Global rankings' },
      { title: 'Impact', icon: '🌍', screen: 'Impact', desc: 'Your eco footprint' },
    ],
  },
  {
    heading: 'Tools & Support',
    icon: '🛠️',
    accent: '#10B981',
    items: [
      { title: 'Energy Tips', icon: '💡', screen: 'Tips', desc: 'Personalized savings advice' },
      { title: 'AI Assistant', icon: '🤖', screen: 'Chat', desc: 'Ask anything about energy', badge: 'AI' },
      { title: 'Settings', icon: '⚙️', screen: 'Settings', desc: 'App preferences' },
    ],
  },
];

const MoreScreen = ({ navigation }: any) => (
  <ScrollView style={s.screen} showsVerticalScrollIndicator={false} bounces={false}>
    <StatusBar barStyle="light-content" backgroundColor={Colors.dark} />

    {/* ── Hero Header ── */}
    <LinearGradient colors={['#0B1120', '#162032', '#1A2E40']} style={s.header}>
      <View style={s.headerLogoWrap}>
        <Text style={s.headerLogo}>⚡</Text>
      </View>
      <Text style={s.headerLabel}>SAVEVOLT</Text>
      <Text style={s.headerTitle}>Explore Features</Text>
      <Text style={s.headerSub}>
        Everything you need to manage, save, and track your energy consumption
      </Text>
    </LinearGradient>

    {/* ── Feature Sections ── */}
    {SECTIONS.map((sec, secIdx) => (
      <View key={sec.heading} style={[s.sectionWrap, secIdx === 0 && s.firstSectionWrap]}>
        {/* Section Header */}
        <View style={s.secHeader}>
          <View style={[s.secIconBadge, { backgroundColor: sec.accent + '18' }]}>
            <Text style={s.secIcon}>{sec.icon}</Text>
          </View>
          <View style={s.secHeaderText}>
            <Text style={s.secHeading}>{sec.heading}</Text>
            <Text style={s.secCount}>{sec.items.length} features</Text>
          </View>
        </View>

        {/* Feature Cards Grid */}
        <View style={s.grid}>
          {sec.items.map((item) => (
            <TouchableOpacity
              key={item.screen}
              style={s.card}
              onPress={() => navigation.navigate(item.screen)}
              activeOpacity={0.7}
            >
              <View style={s.cardTop}>
                <View style={[s.cardIconWrap, { backgroundColor: sec.accent + '12' }]}>
                  <Text style={s.cardIcon}>{item.icon}</Text>
                </View>
                {item.badge && (
                  <View style={[s.badge, { backgroundColor: sec.accent }]}>
                    <Text style={s.badgeText}>{item.badge}</Text>
                  </View>
                )}
              </View>
              <Text style={s.cardTitle}>{item.title}</Text>
              <Text style={s.cardDesc}>{item.desc}</Text>
              <View style={s.cardArrow}>
                <Text style={[s.cardArrowText, { color: sec.accent }]}>→</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    ))}

    {/* ── Footer ── */}
    <View style={s.footer}>
      <View style={s.footerDivider} />
      <Text style={s.footerBrand}>⚡ SaveVolt</Text>
      <Text style={s.footerVersion}>Version 1.0.0</Text>
      <Text style={s.footerTagline}>Smart Energy. Smarter Living.</Text>
    </View>
  </ScrollView>
);

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },

  /* Header */
  header: {
    paddingTop: 56,
    paddingBottom: 36,
    paddingHorizontal: Spacing.page,
    alignItems: 'center',
  },
  headerLogoWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,230,118,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLogo: { fontSize: 24 },
  headerLabel: {
    ...Typography.overline,
    color: Colors.primary,
    marginBottom: 4,
  },
  headerTitle: {
    ...Typography.displaySmall,
    color: '#fff',
    marginBottom: 8,
  },
  headerSub: {
    ...Typography.bodySmall,
    color: Colors.textOnDarkSub,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
  },

  /* Sections */
  sectionWrap: {
    paddingHorizontal: Spacing.page,
    marginTop: 24,
  },
  secHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  firstSectionWrap: { marginTop: -12 },
  secIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  secIcon: { fontSize: 18 },
  secHeaderText: { flex: 1 },
  secHeading: {
    ...Typography.h3,
    color: Colors.text,
  },
  secCount: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    marginTop: 1,
  },

  /* Grid */
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },

  /* Cards */
  card: {
    width: '47.5%' as any,
    backgroundColor: Colors.card,
    borderRadius: Radius.card,
    padding: 16,
    ...Shadows.sm,
    minHeight: 140,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardIcon: { fontSize: 22 },
  badge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    ...Typography.labelSmall,
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
  },
  cardTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: 4,
  },
  cardDesc: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    lineHeight: 16,
    flex: 1,
  },
  cardArrow: {
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  cardArrowText: {
    fontSize: 18,
    fontWeight: '600',
  },

  /* Footer */
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingBottom: 40,
    marginTop: 16,
  },
  footerDivider: {
    width: 40,
    height: 3,
    borderRadius: 2,
    backgroundColor: Colors.borderLight,
    marginBottom: 16,
  },
  footerBrand: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: 4,
  },
  footerVersion: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    marginBottom: 2,
  },
  footerTagline: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
});

export default MoreScreen;
