import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useEnergy } from '../context/EnergyContext';
import { LineChart } from 'react-native-chart-kit';
import { generateTrendData, formatEnergy, formatCost } from '../utils/energy';
import { subDays, format } from 'date-fns';

const screenWidth = Dimensions.get('window').width;

type Period = 'daily' | 'weekly' | 'monthly';

const TrendsScreen = () => {
  const { usageRecords, dashboardData, settings } = useEnergy();
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('weekly');

  if (!dashboardData) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📈</Text>
        <Text style={styles.emptyTitle}>No Trend Data</Text>
        <Text style={styles.emptyText}>
          Add appliances and track usage to see trends
        </Text>
      </View>
    );
  }

  // Generate trend data based on selected period
  const getDays = () => {
    switch (selectedPeriod) {
      case 'daily':
        return 7;
      case 'weekly':
        return 28;
      case 'monthly':
        return 90;
    }
  };

  const days = getDays();
  const trendData = generateTrendData(usageRecords, days, settings.electricityRate);

  // Prepare chart data
  const chartData = {
    labels: trendData.map((d, i) => {
      if (selectedPeriod === 'daily') {
        return format(new Date(d.date), 'MMM dd');
      } else if (selectedPeriod === 'weekly') {
        return i % 7 === 0 ? format(new Date(d.date), 'MMM dd') : '';
      } else {
        return i % 30 === 0 ? format(new Date(d.date), 'MMM') : '';
      }
    }),
    datasets: [
      {
        data: trendData.map(d => d.consumption || 0.01), // Avoid zero for chart
      },
    ],
  };

  // Calculate averages
  const avgConsumption = trendData.reduce((sum, d) => sum + d.consumption, 0) / trendData.length;
  const avgCost = trendData.reduce((sum, d) => sum + d.cost, 0) / trendData.length;
  const avgCO2 = trendData.reduce((sum, d) => sum + d.co2, 0) / trendData.length;

  // Calculate comparison with previous period
  const currentPeriodData = trendData.slice(-Math.floor(days / 2));
  const previousPeriodData = trendData.slice(0, Math.floor(days / 2));
  
  const currentAvg = currentPeriodData.reduce((sum, d) => sum + d.consumption, 0) / currentPeriodData.length;
  const previousAvg = previousPeriodData.reduce((sum, d) => sum + d.consumption, 0) / previousPeriodData.length;
  
  const percentageChange = previousAvg > 0 ? ((currentAvg - previousAvg) / previousAvg) * 100 : 0;
  const isImprovement = currentAvg < previousAvg;

  const { topConsumers } = dashboardData;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📈 Energy Trends</Text>
        <Text style={styles.subtitle}>Track your consumption patterns</Text>
      </View>

      {/* Period Selector */}
      <View style={styles.periodSelector}>
        <TouchableOpacity
          style={[styles.periodButton, selectedPeriod === 'daily' && styles.periodButtonActive]}
          onPress={() => setSelectedPeriod('daily')}
        >
          <Text style={[styles.periodButtonText, selectedPeriod === 'daily' && styles.periodButtonTextActive]}>
            7 Days
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.periodButton, selectedPeriod === 'weekly' && styles.periodButtonActive]}
          onPress={() => setSelectedPeriod('weekly')}
        >
          <Text style={[styles.periodButtonText, selectedPeriod === 'weekly' && styles.periodButtonTextActive]}>
            4 Weeks
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.periodButton, selectedPeriod === 'monthly' && styles.periodButtonActive]}
          onPress={() => setSelectedPeriod('monthly')}
        >
          <Text style={[styles.periodButtonText, selectedPeriod === 'monthly' && styles.periodButtonTextActive]}>
            3 Months
          </Text>
        </TouchableOpacity>
      </View>

      {/* Comparison Card */}
      <View style={styles.section}>
        <View style={[styles.comparisonCard, isImprovement ? styles.improvementCard : styles.increaseCard]}>
          <Text style={styles.comparisonIcon}>{isImprovement ? '✅' : '⚠️'}</Text>
          <Text style={styles.comparisonTitle}>
            {isImprovement ? 'Great Progress!' : 'Usage Increased'}
          </Text>
          <Text style={styles.comparisonValue}>
            {Math.abs(percentageChange).toFixed(1)}% {isImprovement ? 'decrease' : 'increase'}
          </Text>
          <Text style={styles.comparisonSubtext}>
            Compared to previous period
          </Text>
        </View>
      </View>

      {/* Trend Chart */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Consumption Trend</Text>
        <View style={styles.chartContainer}>
          <LineChart
            data={chartData}
            width={screenWidth - 40}
            height={220}
            chartConfig={{
              backgroundColor: '#fff',
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              decimalPlaces: 1,
              color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: '4',
                strokeWidth: '2',
                stroke: '#2196F3',
              },
            }}
            bezier
            style={styles.chart}
          />
        </View>
      </View>

      {/* Averages */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Period Averages</Text>
        <View style={styles.averagesContainer}>
          <View style={styles.averageCard}>
            <Text style={styles.averageIcon}>⚡</Text>
            <Text style={styles.averageLabel}>Avg Energy/Day</Text>
            <Text style={styles.averageValue}>{formatEnergy(avgConsumption)}</Text>
          </View>
          <View style={styles.averageCard}>
            <Text style={styles.averageIcon}>💰</Text>
            <Text style={styles.averageLabel}>Avg Cost/Day</Text>
            <Text style={styles.averageValue}>{formatCost(avgCost, settings.currency)}</Text>
          </View>
          <View style={styles.averageCard}>
            <Text style={styles.averageIcon}>🌍</Text>
            <Text style={styles.averageLabel}>Avg CO₂/Day</Text>
            <Text style={styles.averageValue}>{avgCO2.toFixed(2)} kg</Text>
          </View>
        </View>
      </View>

      {/* Top 3 Consumers */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔥 Top 3 Energy Consumers</Text>
        {topConsumers.slice(0, 3).map((consumer, index) => (
          <View key={consumer.applianceId} style={styles.topConsumerCard}>
            <View style={styles.medal}>
              <Text style={styles.medalText}>
                {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
              </Text>
            </View>
            <View style={styles.topConsumerInfo}>
              <Text style={styles.topConsumerName}>{consumer.applianceName}</Text>
              <Text style={styles.topConsumerValue}>
                {formatEnergy(consumer.monthlyConsumption)}/month
              </Text>
            </View>
            <View style={styles.topConsumerPercent}>
              <Text style={styles.percentText}>{consumer.percentage.toFixed(0)}%</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Insights */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💡 Insights</Text>
        <View style={styles.insightCard}>
          <Text style={styles.insightText}>
            {isImprovement
              ? `You're doing great! You've reduced your energy consumption by ${Math.abs(percentageChange).toFixed(1)}% compared to the previous period.`
              : `Your energy usage has increased by ${percentageChange.toFixed(1)}%. Check your top consumers and consider our energy-saving tips.`}
          </Text>
          {!isImprovement && (
            <Text style={styles.insightTip}>
              💡 Tip: Small changes like turning off unused appliances can make a big difference!
            </Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#f5f5f5',
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  header: {
    padding: 20,
    backgroundColor: '#2196F3',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  periodSelector: {
    flexDirection: 'row',
    padding: 15,
    gap: 10,
  },
  periodButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  periodButtonActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  periodButtonTextActive: {
    color: '#fff',
  },
  section: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  comparisonCard: {
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  improvementCard: {
    backgroundColor: '#E8F5E9',
  },
  increaseCard: {
    backgroundColor: '#FFF3E0',
  },
  comparisonIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  comparisonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  comparisonValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 5,
  },
  comparisonSubtext: {
    fontSize: 14,
    color: '#666',
  },
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  averagesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  averageCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  averageIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  averageLabel: {
    fontSize: 11,
    color: '#666',
    marginBottom: 5,
    textAlign: 'center',
  },
  averageValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  topConsumerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  medal: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  medalText: {
    fontSize: 32,
  },
  topConsumerInfo: {
    flex: 1,
    marginLeft: 10,
  },
  topConsumerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  topConsumerValue: {
    fontSize: 14,
    color: '#666',
  },
  topConsumerPercent: {
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    padding: 8,
  },
  percentText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  insightCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  insightText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
    marginBottom: 10,
  },
  insightTip: {
    fontSize: 14,
    color: '#FF9800',
    fontStyle: 'italic',
  },
});

export default TrendsScreen;
