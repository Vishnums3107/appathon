import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Colors, Typography, Spacing, Radius, Shadows } from '../theme';
import { useEnergy } from '../context/EnergyContext';
import AIRecommendationEngine, { AIRecommendation } from '../services/AIRecommendationEngine';
import { formatEnergy, formatCost } from '../utils/energy';

const RecommendationsScreen = () => {
  const { appliances, usageRecords, settings } = useEnergy();
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'high' | 'savings' | 'behavior'>('all');

  const loadRecommendations = useCallback(async () => {
    setLoading(true);
    await AIRecommendationEngine.refreshRecommendations(
      appliances,
      usageRecords,
      settings.electricityRate,
      settings.currency,
    );
    setRecommendations(AIRecommendationEngine.getRecommendations());
    setLoading(false);
  }, [appliances, settings.currency, settings.electricityRate, usageRecords]);

  useEffect(() => {
    loadRecommendations().catch((error: unknown) => {
      console.error('Failed to load recommendations:', error);
      setLoading(false);
    });
  }, [loadRecommendations]);

  const handleDismiss = async (id: string) => {
    await AIRecommendationEngine.markAsActioned(id);
    setRecommendations(AIRecommendationEngine.getRecommendations());
  };

  const filteredRecommendations = recommendations.filter((rec) => {
    if (filter === 'all') return true;
    if (filter === 'high') return rec.priority === 'high';
    return rec.category === filter;
  });

  const savings = AIRecommendationEngine.getTotalPotentialSavings();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return Colors.danger;
      case 'medium': return Colors.warning;
      default: return Colors.success;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'savings': return '💰';
      case 'efficiency': return '⚡';
      case 'behavior': return '🧠';
      case 'upgrade': return '🔧';
      case 'schedule': return '🕐';
      default: return '💡';
    }
  };

  if (loading) {
    return (
      <View style={s.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.dark} />
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={s.loadingText}>Analyzing your energy usage...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.dark} />
      <LinearGradient colors={['#0B1120', '#162032']} style={s.header}>
        <Text style={s.headerLabel}>SMART INSIGHTS</Text>
        <Text style={s.headerTitle}>Recommendations</Text>
      </LinearGradient>

      <View style={s.content}>
        {/* Savings Summary */}
        <View style={s.savingsCard}>
          <Text style={s.savingsTitle}>Potential Monthly Savings</Text>
          <View style={s.savingsRow}>
            <View style={s.savingItem}>
              <Text style={s.savingValue}>{formatEnergy(savings.energy)}</Text>
              <Text style={s.savingLabel}>Energy</Text>
            </View>
            <View style={s.savingItem}>
              <Text style={s.savingValue}>{formatCost(savings.cost, settings.currency)}</Text>
              <Text style={s.savingLabel}>Cost</Text>
            </View>
          </View>
        </View>

        {/* Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterRow}>
          {(['all', 'high', 'savings', 'behavior'] as const).map((f) => (
            <TouchableOpacity
              key={f}
              style={[s.filterChip, filter === f && s.filterChipActive]}
              onPress={() => setFilter(f)}
            >
              <Text style={[s.filterText, filter === f && s.filterTextActive]}>
                {f === 'all' ? 'All' : f === 'high' ? 'High Priority' : f === 'savings' ? 'Savings' : 'Behavior'}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {filteredRecommendations.length === 0 ? (
          <View style={s.emptyCard}>
            <Text style={s.emptyIcon}>🎉</Text>
            <Text style={s.emptyTitle}>
              {appliances.length === 0
                ? 'Add Appliances First'
                : 'No Recommendations'}
            </Text>
            <Text style={s.emptyText}>
              {appliances.length === 0
                ? 'Add your appliances to get personalized recommendations.'
                : 'You\'re already doing great! Check back after more usage data.'}
            </Text>
          </View>
        ) : (
          filteredRecommendations.map((rec) => (
            <View key={rec.id} style={s.recCard}>
              <View style={s.recHeader}>
                <Text style={s.recIcon}>{getCategoryIcon(rec.category)}</Text>
                <View style={s.recHeaderInfo}>
                  <Text style={s.recTitle}>{rec.title}</Text>
                  <View style={[s.priorityBadge, { backgroundColor: getPriorityColor(rec.priority) }]}>
                    <Text style={s.priorityText}>{rec.priority.toUpperCase()}</Text>
                  </View>
                </View>
              </View>

              <Text style={s.recDescription}>{rec.description}</Text>

              <View style={s.recStats}>
                <View style={s.recStat}>
                  <Text style={s.recStatLabel}>Save up to</Text>
                  <Text style={s.recStatValue}>{formatEnergy(rec.potentialSavings)}/mo</Text>
                </View>
                <View style={s.recStat}>
                  <Text style={s.recStatLabel}>Cost saved</Text>
                  <Text style={s.recStatValue}>{formatCost(rec.potentialCostSavings, settings.currency)}/mo</Text>
                </View>
                <View style={s.recStat}>
                  <Text style={s.recStatLabel}>Confidence</Text>
                  <Text style={s.recStatValue}>{(rec.confidence * 100).toFixed(0)}%</Text>
                </View>
              </View>

              {rec.action && (
                <View style={s.actionBox}>
                  <Text style={s.actionLabel}>Suggested Action:</Text>
                  <Text style={s.actionText}>{rec.action}</Text>
                </View>
              )}

              <TouchableOpacity
                style={s.dismissBtn}
                onPress={() =>
                  Alert.alert('Dismiss', 'Mark this recommendation as done?', [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Done', onPress: () => handleDismiss(rec.id) },
                  ])
                }
              >
                <Text style={s.dismissBtnText}>Mark as Done</Text>
              </TouchableOpacity>
            </View>
          ))
        )}

        {/* Refresh */}
        <TouchableOpacity style={s.refreshBtn} onPress={loadRecommendations}>
          <LinearGradient
            colors={['#00E676', '#00C853']}
            style={s.refreshBtnGradient}
          >
            <Text style={s.refreshBtnText}>Refresh Recommendations</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    ...Typography.bodyLarge,
    color: Colors.textSecondary,
    marginTop: Spacing.lg,
  },
  header: {
    paddingTop: 54,
    paddingBottom: 28,
    paddingHorizontal: Spacing.page,
    alignItems: 'center',
  },
  headerLabel: {
    ...Typography.overline,
    color: Colors.primary,
    marginBottom: 4,
  },
  headerTitle: {
    ...Typography.displaySmall,
    color: '#fff',
  },
  content: {
    padding: Spacing.lg,
  },
  savingsCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.card,
    padding: Spacing.page,
    marginBottom: Spacing.lg,
    ...Shadows.md,
  },
  savingsTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  savingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  savingItem: {
    alignItems: 'center',
  },
  savingValue: {
    ...Typography.stat,
    color: Colors.primary,
  },
  savingLabel: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  filterRow: {
    marginBottom: Spacing.lg,
  },
  filterChip: {
    backgroundColor: Colors.card,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    marginRight: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: {
    ...Typography.label,
    color: Colors.textSecondary,
  },
  filterTextActive: {
    color: '#fff',
  },
  emptyCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.card,
    padding: Spacing.xxxl,
    alignItems: 'center',
    ...Shadows.sm,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: Spacing.sm,
  },
  emptyTitle: {
    ...Typography.h2,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  recCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.card,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.md,
  },
  recHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  recIcon: {
    fontSize: 32,
    marginRight: Spacing.md,
  },
  recHeaderInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recTitle: {
    ...Typography.h3,
    color: Colors.text,
    flex: 1,
    marginRight: Spacing.sm,
  },
  priorityBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.pill,
  },
  priorityText: {
    ...Typography.overline,
    color: '#fff',
    letterSpacing: 0.8,
  },
  recDescription: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  recStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: Colors.background,
    borderRadius: Radius.sm,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  recStat: {
    alignItems: 'center',
  },
  recStatLabel: {
    ...Typography.overline,
    color: Colors.textMuted,
    marginBottom: 3,
  },
  recStatValue: {
    ...Typography.label,
    color: Colors.primary,
  },
  actionBox: {
    backgroundColor: Colors.primarySoft,
    borderRadius: Radius.sm,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  actionLabel: {
    ...Typography.labelSmall,
    color: Colors.primaryDeep,
    marginBottom: 3,
  },
  actionText: {
    ...Typography.bodyMedium,
    color: Colors.primaryDark,
  },
  dismissBtn: {
    backgroundColor: Colors.background,
    borderRadius: Radius.sm,
    padding: Spacing.sm,
    alignItems: 'center',
  },
  dismissBtnText: {
    ...Typography.label,
    color: Colors.textSecondary,
  },
  refreshBtn: {
    borderRadius: Radius.card,
    overflow: 'hidden',
    marginTop: Spacing.sm,
    marginBottom: Spacing.xxxl,
  },
  refreshBtnGradient: {
    borderRadius: Radius.card,
    padding: Spacing.lg,
    alignItems: 'center',
  },
  refreshBtnText: {
    ...Typography.h3,
    color: '#fff',
  },
});

export default RecommendationsScreen;
