import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useEnergy } from '../context/EnergyContext';
import { formatEnergy } from '../utils/energy';

const TipsScreen = () => {
  const { tips, weatherData } = useEnergy();

  const highPriorityTips = tips.filter(t => t.priority === 'high');
  const mediumPriorityTips = tips.filter(t => t.priority === 'medium');
  const lowPriorityTips = tips.filter(t => t.priority === 'low');

  const renderTipSection = (title: string, sectionTips: typeof tips, color: string) => {
    if (sectionTips.length === 0) return null;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{title}</Text>
          <View style={[styles.badge, { backgroundColor: color }]}>
            <Text style={styles.badgeText}>{sectionTips.length}</Text>
          </View>
        </View>
        
        {sectionTips.map((tip) => (
          <View key={tip.id} style={styles.tipCard}>
            <View style={styles.tipHeader}>
              <Text style={styles.tipTitle}>{tip.title}</Text>
              {tip.isPersonalized && (
                <View style={styles.personalizedBadge}>
                  <Text style={styles.personalizedText}>⭐ For You</Text>
                </View>
              )}
            </View>
            <Text style={styles.tipDescription}>{tip.description}</Text>
            <View style={styles.tipFooter}>
              <View style={styles.categoryTag}>
                <Text style={styles.categoryText}>{tip.category}</Text>
              </View>
              <View style={styles.savingsTag}>
                <Text style={styles.savingsText}>
                  💰 Save up to {formatEnergy(tip.potentialSavings)}/month
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>💡 Smart Energy Tips</Text>
        <Text style={styles.subtitle}>Personalized recommendations to save energy</Text>
      </View>

      {/* Weather Widget */}
      {weatherData && (
        <View style={styles.weatherWidget}>
          <View style={styles.weatherLeft}>
            <Text style={styles.weatherIcon}>
              {weatherData.condition === 'Clear' ? '☀️' : weatherData.condition === 'Cloudy' ? '☁️' : '🌤️'}
            </Text>
            <View>
              <Text style={styles.weatherTemp}>{weatherData.temperature}°C</Text>
              <Text style={styles.weatherCondition}>{weatherData.condition}</Text>
            </View>
          </View>
          <View style={styles.weatherRight}>
            <Text style={styles.weatherSeason}>🍂 {weatherData.season}</Text>
            <Text style={styles.weatherHumidity}>💧 {weatherData.humidity}% humidity</Text>
          </View>
        </View>
      )}

      {/* Summary */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>📊 Your Tips Summary</Text>
        <Text style={styles.summaryText}>
          We've generated <Text style={styles.summaryHighlight}>{tips.length} personalized tips</Text> to help you save energy and reduce costs.
        </Text>
        {tips.length > 0 && (
          <Text style={styles.summaryPotential}>
            Total potential savings: <Text style={styles.summaryHighlight}>
              {formatEnergy(tips.reduce((sum, t) => sum + t.potentialSavings, 0))}/month
            </Text>
          </Text>
        )}
      </View>

      {/* Tips by Priority */}
      {renderTipSection('🔴 High Priority', highPriorityTips, '#F44336')}
      {renderTipSection('🟠 Medium Priority', mediumPriorityTips, '#FF9800')}
      {renderTipSection('🟢 Low Priority', lowPriorityTips, '#4CAF50')}

      {tips.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>💡</Text>
          <Text style={styles.emptyTitle}>No Tips Available</Text>
          <Text style={styles.emptyText}>
            Add appliances to get personalized energy-saving tips!
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#9C27B0',
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
  weatherWidget: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#E1BEE7',
    margin: 15,
    padding: 15,
    borderRadius: 12,
  },
  weatherLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weatherIcon: {
    fontSize: 48,
    marginRight: 15,
  },
  weatherTemp: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A148C',
  },
  weatherCondition: {
    fontSize: 14,
    color: '#6A1B9A',
  },
  weatherRight: {
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  weatherSeason: {
    fontSize: 16,
    color: '#4A148C',
    marginBottom: 4,
  },
  weatherHumidity: {
    fontSize: 14,
    color: '#6A1B9A',
  },
  summaryCard: {
    backgroundColor: '#F3E5F5',
    margin: 15,
    padding: 20,
    borderRadius: 12,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A148C',
    marginBottom: 10,
  },
  summaryText: {
    fontSize: 15,
    color: '#6A1B9A',
    lineHeight: 22,
    marginBottom: 8,
  },
  summaryHighlight: {
    fontWeight: 'bold',
    color: '#4A148C',
  },
  summaryPotential: {
    fontSize: 15,
    color: '#6A1B9A',
    marginTop: 5,
  },
  section: {
    padding: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  badge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  tipCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  tipTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  personalizedBadge: {
    backgroundColor: '#FFD700',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  personalizedText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#fff',
  },
  tipDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  tipFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryTag: {
    backgroundColor: '#E8EAF6',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  categoryText: {
    fontSize: 12,
    color: '#3F51B5',
    fontWeight: '600',
  },
  savingsTag: {
    backgroundColor: '#E8F5E9',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  savingsText: {
    fontSize: 12,
    color: '#2E7D32',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 15,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
  },
});

export default TipsScreen;
