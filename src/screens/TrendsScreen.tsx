import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, StatusBar } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useEnergy } from '../context/EnergyContext';
import { LineChart } from 'react-native-chart-kit';
import { generateTrendData, formatEnergy, formatCost } from '../utils/energy';
import { format } from 'date-fns';
import { Colors, Typography, Spacing, Radius, Shadows } from '../theme';

const W = Dimensions.get('window').width;
type Period = 'daily' | 'weekly' | 'monthly';

const TrendsScreen = () => {
  const { usageRecords, dashboardData, settings } = useEnergy();
  const [period, setPeriod] = useState<Period>('weekly');

  if (!dashboardData) {
    return (
      <View style={s.emptyWrap}>
        <StatusBar barStyle="dark-content" />
        <Text style={s.emptyIcon}>📈</Text>
        <Text style={s.emptyTitle}>No Trend Data</Text>
        <Text style={s.emptyBody}>Add appliances and track usage to see trends</Text>
      </View>
    );
  }

  const days = period === 'daily' ? 7 : period === 'weekly' ? 28 : 90;
  const trend = generateTrendData(usageRecords, days, settings.electricityRate);
  const hasRecords = usageRecords.length > 0;

  const chartData = {
    labels: trend.map((d, i) => {
      if (period === 'daily') return format(new Date(d.date), 'dd');
      if (period === 'weekly') return i % 7 === 0 ? format(new Date(d.date), 'MMM dd') : '';
      return i % 30 === 0 ? format(new Date(d.date), 'MMM') : '';
    }),
    datasets: [{ data: trend.map(d => d.consumption || 0.01) }],
  };

  const avg = trend.reduce((s, d) => s + d.consumption, 0) / trend.length;
  const avgCost = trend.reduce((s, d) => s + d.cost, 0) / trend.length;
  const avgCO2 = trend.reduce((s, d) => s + d.co2, 0) / trend.length;
  const cur = trend.slice(-Math.floor(days / 2));
  const prev = trend.slice(0, Math.floor(days / 2));
  const curAvg = cur.reduce((s, d) => s + d.consumption, 0) / cur.length;
  const prevAvg = prev.reduce((s, d) => s + d.consumption, 0) / prev.length;
  const pctChange = prevAvg > 0 ? ((curAvg - prevAvg) / prevAvg) * 100 : 0;
  const improved = curAvg < prevAvg;

  return (
    <ScrollView style={s.screen} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.dark} />
      <LinearGradient colors={['#0B1120', '#162032']} style={s.header}>
        <Text style={s.headerLabel}>ENERGY TRENDS</Text>
        <Text style={s.headerTitle}>Usage Patterns</Text>
      </LinearGradient>

      {/* Period selector */}
      <View style={s.pillRow}>
        {([['daily', '7D'], ['weekly', '4W'], ['monthly', '3M']] as const).map(([k, l]) => (
          <TouchableOpacity key={k} style={[s.pill, period === k && s.pillActive]} onPress={() => setPeriod(k as Period)}>
            <Text style={[s.pillTxt, period === k && s.pillTxtActive]}>{l}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {!hasRecords ? (
        <View style={s.noDataCard}>
          <Text style={s.noDataIcon}>📊</Text>
          <Text style={s.noDataTitle}>No Usage Data Yet</Text>
          <Text style={s.noDataBody}>Start logging daily energy usage to see trends here.</Text>
        </View>
      ) : (
        <>
          {/* Comparison */}
          <View style={s.pad}>
            <View style={[s.compareCard, improved ? s.compareGood : s.compareBad]}>
              <Text style={s.compareNum}>{Math.abs(pctChange).toFixed(1)}%</Text>
              <Text style={s.compareLbl}>{improved ? 'decrease' : 'increase'} vs previous period</Text>
            </View>
          </View>

          {/* Chart */}
          <View style={s.pad}>
            <View style={s.chartCard}>
              <LineChart
                data={chartData} width={W - 60} height={200}
                chartConfig={{
                  backgroundColor: Colors.card, backgroundGradientFrom: Colors.card,
                  backgroundGradientTo: Colors.card, decimalPlaces: 1,
                  color: (o = 1) => `rgba(0, 230, 118, ${o})`,
                  labelColor: () => Colors.textMuted,
                  propsForDots: { r: '3', strokeWidth: '1', stroke: Colors.primary },
                  propsForBackgroundLines: { strokeDasharray: '', stroke: Colors.borderLight },
                }}
                bezier style={{ borderRadius: Radius.md }}
              />
            </View>
          </View>

          {/* Averages */}
          <View style={s.avgRow}>
            {[
              { l: 'Energy/day', v: formatEnergy(avg) },
              { l: 'Cost/day', v: formatCost(avgCost, settings.currency) },
              { l: 'CO₂/day', v: `${avgCO2.toFixed(1)} kg` },
            ].map(a => (
              <View key={a.l} style={s.avgCard}>
                <Text style={s.avgVal}>{a.v}</Text>
                <Text style={s.avgLbl}>{a.l}</Text>
              </View>
            ))}
          </View>

          <View style={s.pad}>
            <View style={s.insightCard}>
              <Text style={s.insightTitle}>What to do next</Text>
              <Text style={s.insightText}>
                {prevAvg === 0
                  ? 'Keep logging daily usage to unlock a period-over-period comparison.'
                  : improved
                    ? `Your recent average is ${Math.abs(pctChange).toFixed(1)}% lower. Keep the habits that created this reduction.`
                    : `Your recent average is ${Math.abs(pctChange).toFixed(1)}% higher. Review your top consumer and try a focused usage reduction.`}
              </Text>
            </View>
          </View>
        </>
      )}

      {/* Top consumers */}
      <View style={[s.pad, s.topConsumersSection]}>
        <Text style={s.sectionTitle}>Top Consumers</Text>
        {dashboardData.topConsumers.slice(0, 3).map((c, i) => (
          <View key={c.applianceId} style={s.consumerRow}>
            <Text style={s.medal}>{['🥇', '🥈', '🥉'][i]}</Text>
            <View style={s.consumerInfo}>
              <Text style={s.consumerName}>{c.applianceName}</Text>
              <Text style={s.consumerVal}>{formatEnergy(c.monthlyConsumption)}/mo</Text>
            </View>
            <View style={s.pctBadge}>
              <Text style={s.pctTxt}>{c.percentage.toFixed(0)}%</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  emptyWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background, padding: 40 },
  emptyIcon: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { ...Typography.h1, color: Colors.text, marginBottom: 8 },
  emptyBody: { ...Typography.bodyMedium, color: Colors.textSecondary, textAlign: 'center' },
  header: { paddingTop: 54, paddingBottom: 28, paddingHorizontal: Spacing.page, alignItems: 'center' },
  headerLabel: { ...Typography.overline, color: Colors.primary, marginBottom: 4 },
  headerTitle: { ...Typography.displaySmall, color: '#fff' },
  pillRow: { flexDirection: 'row', paddingHorizontal: Spacing.page, marginTop: 16, gap: 8 },
  pill: { flex: 1, paddingVertical: 10, borderRadius: Radius.pill, backgroundColor: Colors.card, alignItems: 'center', ...Shadows.sm },
  pillActive: { backgroundColor: Colors.primary },
  pillTxt: { ...Typography.label, color: Colors.textSecondary },
  pillTxtActive: { color: Colors.dark },
  pad: { paddingHorizontal: Spacing.page, marginTop: 16 },
  topConsumersSection: { marginBottom: 30 },
  noDataCard: { margin: Spacing.page, backgroundColor: Colors.card, borderRadius: Radius.card, padding: 32, alignItems: 'center', ...Shadows.md },
  noDataIcon: { fontSize: 40, marginBottom: 10 },
  noDataTitle: { ...Typography.h3, color: Colors.text, marginBottom: 6 },
  noDataBody: { ...Typography.bodySmall, color: Colors.textSecondary, textAlign: 'center' },
  compareCard: { borderRadius: Radius.card, padding: 20, alignItems: 'center', ...Shadows.sm },
  compareGood: { backgroundColor: '#ECFDF5' },
  compareBad: { backgroundColor: '#FEF2F2' },
  compareNum: { ...Typography.displayMedium, color: Colors.primary },
  compareLbl: { ...Typography.bodySmall, color: Colors.textSecondary, marginTop: 4 },
  chartCard: { backgroundColor: Colors.card, borderRadius: Radius.card, padding: Spacing.md, alignItems: 'center', ...Shadows.md },
  avgRow: { flexDirection: 'row', gap: 10, paddingHorizontal: Spacing.page, marginTop: 16 },
  avgCard: { flex: 1, backgroundColor: Colors.card, borderRadius: Radius.card, padding: 16, alignItems: 'center', ...Shadows.sm },
  avgVal: { ...Typography.statSmall, color: Colors.primary, textAlign: 'center' },
  avgLbl: { ...Typography.labelSmall, color: Colors.textMuted, marginTop: 4 },
  insightCard: { backgroundColor: Colors.primarySoft, borderRadius: Radius.card, padding: 16 },
  insightTitle: { ...Typography.h3, color: Colors.primaryDark, marginBottom: 5 },
  insightText: { ...Typography.bodySmall, color: Colors.textSecondary, lineHeight: 18 },
  sectionTitle: { ...Typography.h2, color: Colors.text, marginBottom: 14 },
  consumerRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card, borderRadius: Radius.md, padding: 14, marginBottom: 8, ...Shadows.sm },
  medal: { fontSize: 24, marginRight: 12 },
  consumerInfo: { flex: 1 },
  consumerName: { ...Typography.label, color: Colors.text },
  consumerVal: { ...Typography.bodySmall, color: Colors.textMuted, marginTop: 1 },
  pctBadge: { backgroundColor: Colors.primarySoft, borderRadius: Radius.sm, paddingHorizontal: 10, paddingVertical: 4 },
  pctTxt: { ...Typography.label, color: Colors.primaryDark },
});

export default TrendsScreen;
