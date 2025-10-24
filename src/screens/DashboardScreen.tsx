import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useEnergy } from '../context/EnergyContext';
import { PieChart, BarChart } from 'react-native-chart-kit';
import { formatEnergy, formatCost, formatCO2 } from '../utils/energy';

const screenWidth = Dimensions.get('window').width;

const DashboardScreen = () => {
  const { dashboardData, settings } = useEnergy();

  if (!dashboardData) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📊</Text>
        <Text style={styles.emptyTitle}>No Data Available</Text>
        <Text style={styles.emptyText}>
          Add appliances to see your energy dashboard
        </Text>
      </View>
    );
  }

  const { totalEnergyConsumed, totalCost, totalCO2Saved, treesEquivalent, topConsumers, consumptionByCategory } = dashboardData;

  // Prepare chart data
  const chartColors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'];
  
  const pieChartData = consumptionByCategory.map((item, index) => ({
    name: item.category,
    consumption: item.consumption,
    color: chartColors[index % chartColors.length],
    legendFontColor: '#333',
    legendFontSize: 12,
  }));

  const barChartData = {
    labels: topConsumers.map(c => c.applianceName.substring(0, 10)),
    datasets: [{
      data: topConsumers.map(c => c.monthlyConsumption),
    }],
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📊 Eco-Savings Dashboard</Text>
        <Text style={styles.subtitle}>Your energy impact at a glance</Text>
      </View>

      {/* Key Metrics */}
      <View style={styles.metricsContainer}>
        <View style={styles.metricCard}>
          <Text style={styles.metricIcon}>⚡</Text>
          <Text style={styles.metricLabel}>Monthly Energy</Text>
          <Text style={styles.metricValue}>{formatEnergy(totalEnergyConsumed)}</Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricIcon}>💰</Text>
          <Text style={styles.metricLabel}>Monthly Cost</Text>
          <Text style={styles.metricValue}>{formatCost(totalCost, settings.currency)}</Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricIcon}>🌍</Text>
          <Text style={styles.metricLabel}>CO₂ Emissions</Text>
          <Text style={styles.metricValue}>{formatCO2(totalCO2Saved)}</Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricIcon}>🌳</Text>
          <Text style={styles.metricLabel}>Tree Equivalent</Text>
          <Text style={styles.metricValue}>{treesEquivalent.toFixed(1)} trees</Text>
        </View>
      </View>

      {/* Environmental Impact */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🌱 Environmental Impact</Text>
        <View style={styles.impactCard}>
          <Text style={styles.impactText}>
            Your monthly energy usage generates <Text style={styles.highlight}>{formatCO2(totalCO2Saved)}</Text> of CO₂ emissions.
          </Text>
          <Text style={styles.impactText}>
            That's equivalent to <Text style={styles.highlight}>{treesEquivalent.toFixed(1)} trees</Text> needed to offset your carbon footprint!
          </Text>
          <View style={styles.impactTip}>
            <Text style={styles.impactTipText}>
              💡 Reducing usage by 20% would save {formatCO2(totalCO2Saved * 0.2)} of CO₂
            </Text>
          </View>
        </View>
      </View>

      {/* Top Consumers */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔥 Top Energy Consumers</Text>
        {topConsumers.map((consumer, index) => (
          <View key={consumer.applianceId} style={styles.consumerCard}>
            <View style={styles.consumerHeader}>
              <Text style={styles.consumerRank}>#{index + 1}</Text>
              <View style={styles.consumerInfo}>
                <Text style={styles.consumerName}>{consumer.applianceName}</Text>
                <Text style={styles.consumerPercent}>{consumer.percentage.toFixed(1)}% of total</Text>
              </View>
              <Text style={styles.consumerValue}>{formatEnergy(consumer.monthlyConsumption)}</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${consumer.percentage}%` }]} />
            </View>
          </View>
        ))}
      </View>

      {/* Category Breakdown - Pie Chart */}
      {consumptionByCategory.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📈 Consumption by Category</Text>
          <View style={styles.chartContainer}>
            <PieChart
              data={pieChartData}
              width={screenWidth - 40}
              height={220}
              chartConfig={{
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              }}
              accessor="consumption"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
          </View>
        </View>
      )}

      {/* Top Consumers - Bar Chart */}
      {topConsumers.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Monthly Consumption Breakdown</Text>
          <View style={styles.chartContainer}>
            <BarChart
              data={barChartData}
              width={screenWidth - 40}
              height={220}
              yAxisLabel=""
              yAxisSuffix=" kWh"
              chartConfig={{
                backgroundColor: '#fff',
                backgroundGradientFrom: '#fff',
                backgroundGradientTo: '#fff',
                decimalPlaces: 1,
                color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                propsForLabels: {
                  fontSize: 10,
                },
              }}
              style={styles.chart}
              showValuesOnTopOfBars
            />
          </View>
        </View>
      )}

      {/* Cost Breakdown */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💸 Cost Analysis</Text>
        {consumptionByCategory.map((category, index) => (
          <View key={category.category} style={styles.costRow}>
            <View style={[styles.colorDot, { backgroundColor: chartColors[index % chartColors.length] }]} />
            <Text style={styles.costCategory}>{category.category}</Text>
            <Text style={styles.costValue}>{formatCost(category.cost, settings.currency)}</Text>
          </View>
        ))}
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
    backgroundColor: '#4CAF50',
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
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
  },
  metricCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    margin: '1%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metricIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  impactCard: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 15,
  },
  impactText: {
    fontSize: 15,
    color: '#2E7D32',
    marginBottom: 10,
    lineHeight: 22,
  },
  highlight: {
    fontWeight: 'bold',
    color: '#1B5E20',
  },
  impactTip: {
    backgroundColor: '#C8E6C9',
    borderRadius: 8,
    padding: 12,
    marginTop: 5,
  },
  impactTipText: {
    fontSize: 13,
    color: '#1B5E20',
  },
  consumerCard: {
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
  consumerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  consumerRank: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF9800',
    width: 40,
  },
  consumerInfo: {
    flex: 1,
  },
  consumerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  consumerPercent: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  consumerValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
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
  costRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 8,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  costCategory: {
    flex: 1,
    fontSize: 15,
    color: '#333',
  },
  costValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
});

export default DashboardScreen;
