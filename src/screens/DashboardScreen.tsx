import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useEnergy } from '../context/EnergyContext';
import { PieChart, BarChart } from 'react-native-chart-kit';
import { formatEnergy, formatCost, formatCO2 } from '../utils/energy';
import { Colors, Typography, Spacing, Radius, Shadows } from '../theme';

const W = Dimensions.get('window').width;

const DashboardScreen = ({ navigation }: any) => {
  const { dashboardData, settings } = useEnergy();
  const [reductionPercent, setReductionPercent] = useState(20);

  if (!dashboardData) {
    return (
      <View style={s.emptyWrap}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
        <View style={s.emptyGlow} />
        <Text style={s.emptyIcon}>⚡</Text>
        <Text style={s.emptyTitle}>Welcome to SaveVolt</Text>
        <Text style={s.emptyBody}>
          Add your first appliance to unlock{'\n'}your personal energy dashboard
        </Text>
        <TouchableOpacity
          style={s.emptyAction}
          onPress={() => navigation.navigate('Track', { screen: 'AddAppliance' })}
          activeOpacity={0.85}
        >
          <Text style={s.emptyActionText}>Add an appliance</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const {
    totalEnergyConsumed, totalCost, totalCO2Saved,
    treesEquivalent, topConsumers, consumptionByCategory,
  } = dashboardData;

  const pieColors = Colors.chart;
  const pieData = consumptionByCategory.map((item, i) => ({
    name: item.category,
    consumption: item.consumption,
    color: pieColors[i % pieColors.length],
    legendFontColor: Colors.textSecondary,
    legendFontSize: 11,
  }));

  const barData = {
    labels: topConsumers.map(c => c.applianceName.length > 8 ? c.applianceName.substring(0, 8) + '..' : c.applianceName),
    datasets: [{ data: topConsumers.length > 0 ? topConsumers.map(c => c.monthlyConsumption) : [0] }],
  };

  return (
    <ScrollView style={s.screen} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.dark} />

      {/* ── Hero Header ── */}
      <LinearGradient colors={['#0B1120', '#162032', '#1A2E40']} style={s.hero}>
        <Text style={s.heroLabel}>MONTHLY OVERVIEW</Text>
        <Text style={s.heroValue}>{formatEnergy(totalEnergyConsumed)}</Text>
        <Text style={s.heroSub}>
          {formatCost(totalCost, settings.currency)} estimated cost
        </Text>

        {/* Glowing metric strip */}
        <View style={s.metricStrip}>
          <View style={s.metricPill}>
            <Text style={s.pillValue}>{formatCO2(totalCO2Saved)}</Text>
            <Text style={s.pillLabel}>CO₂</Text>
          </View>
          <View style={s.metricDivider} />
          <View style={s.metricPill}>
            <Text style={s.pillValue}>{treesEquivalent.toFixed(1)}</Text>
            <Text style={s.pillLabel}>Trees Offset</Text>
          </View>
          <View style={s.metricDivider} />
          <View style={s.metricPill}>
            <Text style={s.pillValue}>{topConsumers.length}</Text>
            <Text style={s.pillLabel}>Appliances</Text>
          </View>
        </View>
      </LinearGradient>

      {/* ── Quick Stats Row ── */}
      <View style={s.statsRow}>
        {[
          { icon: '⚡', label: 'Energy', value: formatEnergy(totalEnergyConsumed), color: '#00E676' },
          { icon: '💰', label: 'Cost', value: formatCost(totalCost, settings.currency), color: '#F59E0B' },
          { icon: '🌍', label: 'CO₂', value: formatCO2(totalCO2Saved), color: '#3B82F6' },
          { icon: '🌳', label: 'Trees', value: `${treesEquivalent.toFixed(1)}`, color: '#10B981' },
        ].map((m) => (
          <View key={m.label} style={s.statCard}>
            <View style={[s.statDot, { backgroundColor: m.color }]} />
            <Text style={s.statValue}>{m.value}</Text>
            <Text style={s.statLabel}>{m.label}</Text>
          </View>
        ))}
      </View>

      {/* ── Top Consumers ── */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>Top Consumers</Text>
        {topConsumers.slice(0, 5).map((consumer, index) => (
          <View key={consumer.applianceId} style={s.consumerRow}>
            <View style={s.consumerLeft}>
              <View style={[s.rankBadge, index === 0 && s.rankBadgeTop]}>
                <Text style={[s.rankText, index === 0 && s.rankTextTop]}>
                  {index + 1}
                </Text>
              </View>
              <View style={s.consumerInfo}>
                <Text style={s.consumerName}>{consumer.applianceName}</Text>
                <Text style={s.consumerPct}>
                  {consumer.percentage.toFixed(1)}% of total
                </Text>
              </View>
            </View>
            <Text style={s.consumerKwh}>{formatEnergy(consumer.monthlyConsumption)}</Text>
          </View>
        ))}
      </View>

      {/* ── Category Pie ── */}
      {consumptionByCategory.length > 0 && (
        <View style={s.section}>
          <Text style={s.sectionTitle}>By Category</Text>
          <View style={s.chartCard}>
            <PieChart
              data={pieData}
              width={W - Spacing.page * 2 - Spacing.lg * 2}
              height={200}
              chartConfig={{
                color: (opacity = 1) => `rgba(0,0,0,${opacity})`,
              }}
              accessor="consumption"
              backgroundColor="transparent"
              paddingLeft="10"
              absolute
            />
          </View>
        </View>
      )}

      {/* ── Bar Chart ── */}
      {topConsumers.length > 0 && (
        <View style={s.section}>
          <Text style={s.sectionTitle}>Consumption Breakdown</Text>
          <View style={s.chartCard}>
            <BarChart
              data={barData}
              width={W - Spacing.page * 2 - Spacing.lg * 2}
              height={210}
              yAxisLabel=""
              yAxisSuffix=" kWh"
              chartConfig={{
                backgroundColor: Colors.card,
                backgroundGradientFrom: Colors.card,
                backgroundGradientTo: Colors.card,
                decimalPlaces: 1,
                color: (opacity = 1) => `rgba(0, 230, 118, ${opacity})`,
                labelColor: () => Colors.textSecondary,
                barPercentage: 0.6,
                propsForLabels: { fontSize: 10 },
                propsForBackgroundLines: { strokeDasharray: '', stroke: Colors.borderLight },
              }}
              style={{ borderRadius: Radius.md }}
              showValuesOnTopOfBars
            />
          </View>
        </View>
      )}

      {/* ── Cost Breakdown ── */}
      <View style={[s.section, s.costSection]}>
        <Text style={s.sectionTitle}>Cost Analysis</Text>
        <View style={s.costCard}>
          {consumptionByCategory.map((cat, i) => (
            <View key={cat.category} style={s.costRow}>
              <View style={[s.costDot, { backgroundColor: pieColors[i % pieColors.length] }]} />
              <Text style={s.costCategory}>{cat.category}</Text>
              <Text style={s.costValue}>{formatCost(cat.cost, settings.currency)}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* ── Eco Insight ── */}
      <View style={[s.section, s.insightSection]}>
        <LinearGradient
          colors={['#0B1120', '#162032']}
          style={s.insightCard}
        >
          <Text style={s.insightEmoji}>🌱</Text>
          <Text style={s.insightTitle}>Savings calculator</Text>
          <View style={s.reductionChoices}>
            {[10, 20, 30].map((percent) => (
              <TouchableOpacity
                key={percent}
                style={[s.reductionChoice, reductionPercent === percent && s.reductionChoiceActive]}
                onPress={() => setReductionPercent(percent)}
                accessibilityLabel={`Calculate ${percent} percent reduction`}
              >
                <Text style={[s.reductionChoiceText, reductionPercent === percent && s.reductionChoiceTextActive]}>{percent}%</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={s.insightBody}>
            Reducing usage by {reductionPercent}% would save{' '}
            <Text style={s.insightHighlight}>{formatEnergy(totalEnergyConsumed * reductionPercent / 100)}</Text>,{' '}
            <Text style={s.insightHighlight}>{formatCost(totalCost * reductionPercent / 100, settings.currency)}</Text>, and{' '}
            <Text style={s.insightHighlight}>{formatCO2(totalCO2Saved * reductionPercent / 100)}</Text> each month.
          </Text>
        </LinearGradient>
      </View>
    </ScrollView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────
const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },

  /* Empty state */
  emptyWrap: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: Colors.background, padding: 40,
  },
  emptyGlow: {
    position: 'absolute', width: 200, height: 200,
    borderRadius: 100, backgroundColor: Colors.primaryLight, opacity: 0.35,
  },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { ...Typography.h1, color: Colors.text, marginBottom: 8 },
  emptyBody: { ...Typography.bodyMedium, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  emptyAction: { marginTop: 22, backgroundColor: Colors.dark, borderRadius: Radius.pill, paddingHorizontal: 20, paddingVertical: 12 },
  emptyActionText: { ...Typography.label, color: Colors.primary },

  /* Hero */
  hero: {
    paddingTop: 54, paddingBottom: 28, paddingHorizontal: Spacing.page, alignItems: 'center',
  },
  heroLabel: { ...Typography.overline, color: Colors.primary, marginBottom: 6 },
  heroValue: { ...Typography.displayLarge, color: '#fff', marginBottom: 4 },
  heroSub: { ...Typography.bodyMedium, color: Colors.textOnDarkSub, marginBottom: 20 },

  metricStrip: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: Radius.pill,
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
  },
  metricPill: { flex: 1, alignItems: 'center' },
  metricDivider: { width: 1, height: 28, backgroundColor: 'rgba(255,255,255,0.12)' },
  pillValue: { ...Typography.statSmall, color: Colors.primary },
  pillLabel: { ...Typography.labelSmall, color: Colors.textOnDarkSub, marginTop: 2 },

  /* Quick Stats */
  statsRow: {
    flexDirection: 'row', paddingHorizontal: Spacing.page,
    marginTop: -16, gap: 10,
  },
  statCard: {
    flex: 1, backgroundColor: Colors.card, borderRadius: Radius.card,
    paddingVertical: 14, alignItems: 'center', ...Shadows.md,
  },
  statDot: { width: 6, height: 6, borderRadius: 3, marginBottom: 6 },
  statValue: { ...Typography.statSmall, color: Colors.text },
  statLabel: { ...Typography.labelSmall, color: Colors.textMuted, marginTop: 2 },

  /* Sections */
  section: { paddingHorizontal: Spacing.page, marginTop: Spacing.section },
  costSection: { marginBottom: 30 },
  insightSection: { marginBottom: 40 },
  sectionTitle: { ...Typography.h2, color: Colors.text, marginBottom: 14 },

  /* Top Consumers */
  consumerRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.card, borderRadius: Radius.md,
    paddingVertical: 14, paddingHorizontal: 16, marginBottom: 8, ...Shadows.sm,
  },
  consumerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  rankBadge: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.borderLight, justifyContent: 'center', alignItems: 'center',
    marginRight: 12,
  },
  rankBadgeTop: { backgroundColor: Colors.primary },
  rankText: { ...Typography.labelSmall, color: Colors.textSecondary },
  rankTextTop: { color: Colors.dark },
  consumerInfo: { flex: 1 },
  consumerName: { ...Typography.label, color: Colors.text },
  consumerPct: { ...Typography.bodySmall, color: Colors.textMuted, marginTop: 1 },
  consumerKwh: { ...Typography.statSmall, color: Colors.primary },

  /* Charts */
  chartCard: {
    backgroundColor: Colors.card, borderRadius: Radius.card,
    padding: Spacing.lg, alignItems: 'center', ...Shadows.md,
  },

  /* Cost */
  costCard: {
    backgroundColor: Colors.card, borderRadius: Radius.card,
    paddingHorizontal: 16, paddingVertical: 8, ...Shadows.md,
  },
  costRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: Colors.divider,
  },
  costDot: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
  costCategory: { flex: 1, ...Typography.bodyMedium, color: Colors.text },
  costValue: { ...Typography.statSmall, color: Colors.primary },

  /* Insight */
  insightCard: {
    borderRadius: Radius.xl, padding: Spacing.xxl, alignItems: 'center',
  },
  insightEmoji: { fontSize: 36, marginBottom: 10 },
  insightTitle: { ...Typography.h3, color: '#fff', marginBottom: 8 },
  reductionChoices: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  reductionChoice: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.22)', borderRadius: Radius.pill, paddingHorizontal: 12, paddingVertical: 6 },
  reductionChoiceActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  reductionChoiceText: { ...Typography.labelSmall, color: Colors.textOnDarkSub },
  reductionChoiceTextActive: { color: Colors.dark },
  insightBody: { ...Typography.bodyMedium, color: Colors.textOnDarkSub, textAlign: 'center', lineHeight: 22 },
  insightHighlight: { color: Colors.primary, fontWeight: '700' },
});

export default DashboardScreen;
