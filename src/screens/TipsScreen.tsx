import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, StatusBar } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useEnergy } from '../context/EnergyContext';
import { formatEnergy } from '../utils/energy';
import { speakEnergyTip, stopSpeaking } from '../utils/voice';
import { Colors, Typography, Spacing, Radius, Shadows } from '../theme';

const PRIORITY_COLORS: Record<string, string> = { high: '#EF4444', medium: '#F59E0B', low: '#10B981' };

const TipsScreen = () => {
  const { tips, weatherData, settings } = useEnergy();
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const handleSpeak = async (tip: typeof tips[0]) => {
    if (!settings.voiceEnabled) { Alert.alert('Voice Disabled', 'Enable voice in Settings'); return; }
    if (speakingId === tip.id) { await stopSpeaking(); setSpeakingId(null); }
    else { setSpeakingId(tip.id); await speakEnergyTip(tip.title, tip.description, tip.potentialSavings); setSpeakingId(null); }
  };

  const groups: [string, string, typeof tips][] = [
    ['High Priority', 'high', tips.filter(t => t.priority === 'high')],
    ['Medium Priority', 'medium', tips.filter(t => t.priority === 'medium')],
    ['Low Priority', 'low', tips.filter(t => t.priority === 'low')],
  ];

  return (
    <ScrollView style={s.screen} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.dark} />
      <LinearGradient colors={['#0B1120', '#162032']} style={s.header}>
        <Text style={s.headerLabel}>ENERGY TIPS</Text>
        <Text style={s.headerTitle}>Smart Savings</Text>
      </LinearGradient>

      <View style={s.body}>
        {/* Weather */}
        {weatherData && (
          <View style={s.weatherCard}>
            <View style={s.weatherLeft}>
              <Text style={s.weatherIcon}>
                {weatherData.condition === 'Clear' ? '☀️' : weatherData.condition === 'Cloudy' ? '☁️' : '🌤️'}
              </Text>
              <View>
                <Text style={s.weatherTemp}>{weatherData.temperature}°C</Text>
                <Text style={s.weatherCond}>{weatherData.condition}</Text>
              </View>
            </View>
            <View style={s.weatherMetaWrap}>
              <Text style={s.weatherMeta}>{weatherData.location}</Text>
              <Text style={s.weatherMeta}>{weatherData.humidity}% humidity</Text>
              <Text style={s.weatherSource}>{weatherData.source === 'live' ? 'Live weather' : 'Offline seasonal estimate'}</Text>
            </View>
          </View>
        )}

        {/* Summary */}
        <View style={s.summaryCard}>
          <Text style={s.summaryVal}>{tips.length}</Text>
          <Text style={s.summaryLbl}>tips available</Text>
          {tips.length > 0 && (
            <Text style={s.summaryPot}>
              Save up to {formatEnergy(tips.reduce((s, t) => s + t.potentialSavings, 0))}/mo
            </Text>
          )}
        </View>

        {/* Tips */}
        {groups.map(([title, priority, items]) =>
          items.length > 0 ? (
            <View key={priority} style={s.section}>
              <View style={s.secHeader}>
                <View style={[s.priorityDot, { backgroundColor: PRIORITY_COLORS[priority] }]} />
                <Text style={s.secTitle}>{title}</Text>
                <View style={s.countBadge}>
                  <Text style={s.countTxt}>{items.length}</Text>
                </View>
              </View>
              {items.map(tip => (
                <View key={tip.id} style={s.tipCard}>
                  <View style={s.tipTop}>
                    <Text style={s.tipTitle}>{tip.title}</Text>
                    <View style={s.tipActions}>
                      {tip.isPersonalized && (
                        <View style={s.forYou}><Text style={s.forYouTxt}>For You</Text></View>
                      )}
                      <TouchableOpacity onPress={() => handleSpeak(tip)} style={s.voiceBtn}>
                        <Text style={s.voiceIcon}>{speakingId === tip.id ? '🔊' : '🔈'}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <Text style={s.tipDesc}>{tip.description}</Text>
                  <View style={s.tipFooter}>
                    <View style={s.catTag}><Text style={s.catTxt}>{tip.category}</Text></View>
                    <Text style={s.saveTxt}>Save {formatEnergy(tip.potentialSavings)}/mo</Text>
                  </View>
                </View>
              ))}
            </View>
          ) : null
        )}

        {tips.length === 0 && (
          <View style={s.emptyCard}>
            <Text style={s.emptyIcon}>💡</Text>
            <Text style={s.emptyTitle}>No Tips Yet</Text>
            <Text style={s.emptyBody}>Add appliances for personalized tips</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  header: { paddingTop: 54, paddingBottom: 28, paddingHorizontal: Spacing.page, alignItems: 'center' },
  headerLabel: { ...Typography.overline, color: Colors.primary, marginBottom: 4 },
  headerTitle: { ...Typography.displaySmall, color: '#fff' },
  body: { padding: Spacing.page },
  weatherCard: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: Colors.card, borderRadius: Radius.card, padding: 16, marginBottom: 14, ...Shadows.sm },
  weatherLeft: { flexDirection: 'row', alignItems: 'center' },
  weatherIcon: { fontSize: 40, marginRight: 12 },
  weatherTemp: { ...Typography.h1, color: Colors.text },
  weatherCond: { ...Typography.bodySmall, color: Colors.textSecondary },
  weatherMeta: { ...Typography.bodySmall, color: Colors.textMuted, marginBottom: 2 },
  weatherMetaWrap: { alignItems: 'flex-end' },
  weatherSource: { ...Typography.labelSmall, color: Colors.primaryDark, marginTop: 3 },
  summaryCard: { backgroundColor: Colors.card, borderRadius: Radius.card, padding: 20, alignItems: 'center', ...Shadows.md, marginBottom: 20 },
  summaryVal: { ...Typography.displayMedium, color: Colors.primary },
  summaryLbl: { ...Typography.label, color: Colors.textSecondary, marginTop: 2 },
  summaryPot: { ...Typography.bodySmall, color: Colors.textMuted, marginTop: 8 },
  section: { marginBottom: 10 },
  secHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  priorityDot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  secTitle: { ...Typography.h3, color: Colors.text, flex: 1 },
  countBadge: { width: 26, height: 26, borderRadius: 13, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' },
  countTxt: { ...Typography.labelSmall, color: Colors.textSecondary },
  tipCard: { backgroundColor: Colors.card, borderRadius: Radius.card, padding: 16, marginBottom: 10, ...Shadows.sm },
  tipTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  tipTitle: { ...Typography.h3, color: Colors.text, flex: 1, marginRight: 8 },
  tipActions: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  forYou: { backgroundColor: '#FEF3C7', borderRadius: Radius.pill, paddingHorizontal: 8, paddingVertical: 3 },
  forYouTxt: { ...Typography.labelSmall, color: '#92400E' },
  voiceBtn: { padding: 4 },
  voiceIcon: { fontSize: 18 },
  tipDesc: { ...Typography.bodyMedium, color: Colors.textSecondary, lineHeight: 20, marginBottom: 10 },
  tipFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  catTag: { backgroundColor: Colors.background, borderRadius: Radius.sm, paddingHorizontal: 10, paddingVertical: 4 },
  catTxt: { ...Typography.labelSmall, color: Colors.textSecondary },
  saveTxt: { ...Typography.labelSmall, color: Colors.primaryDark },
  emptyCard: { alignItems: 'center', padding: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { ...Typography.h2, color: Colors.text, marginBottom: 6 },
  emptyBody: { ...Typography.bodyMedium, color: Colors.textSecondary },
});

export default TipsScreen;
