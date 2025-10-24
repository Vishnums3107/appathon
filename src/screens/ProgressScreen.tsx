import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useEnergy } from '../context/EnergyContext';
import { format } from 'date-fns';

const ProgressScreen = () => {
  const { streak, badges, goals, dashboardData } = useEnergy();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🏆 Progress & Achievements</Text>
        <Text style={styles.subtitle}>Track your energy-saving journey</Text>
      </View>

      {/* Streak Card */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔥 Your Streak</Text>
        <View style={styles.streakCard}>
          <View style={styles.streakMain}>
            <Text style={styles.streakIcon}>🔥</Text>
            <View>
              <Text style={styles.streakNumber}>{streak.currentStreak}</Text>
              <Text style={styles.streakLabel}>Day Streak</Text>
            </View>
          </View>
          <View style={styles.streakStats}>
            <View style={styles.streakStat}>
              <Text style={styles.streakStatValue}>{streak.longestStreak}</Text>
              <Text style={styles.streakStatLabel}>Longest</Text>
            </View>
            <View style={styles.streakDivider} />
            <View style={styles.streakStat}>
              <Text style={styles.streakStatValue}>{streak.totalDaysActive}</Text>
              <Text style={styles.streakStatLabel}>Total Days</Text>
            </View>
          </View>
          {streak.lastActivityDate && (
            <Text style={styles.streakLastActivity}>
              Last activity: {format(new Date(streak.lastActivityDate), 'MMM dd, yyyy')}
            </Text>
          )}
        </View>
      </View>

      {/* Goals */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🎯 Your Goals</Text>
          <TouchableOpacity style={styles.addButton}>
            <Text style={styles.addButtonText}>+ Add Goal</Text>
          </TouchableOpacity>
        </View>

        {goals.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>🎯</Text>
            <Text style={styles.emptyText}>No goals set yet</Text>
            <Text style={styles.emptySubtext}>Set goals to track your progress!</Text>
          </View>
        ) : (
          goals.map((goal) => {
            const progress = goal.target > 0 ? (goal.currentValue / goal.target) * 100 : 0;
            return (
              <View key={goal.id} style={styles.goalCard}>
                <View style={styles.goalHeader}>
                  <Text style={styles.goalType}>
                    {goal.type === 'consumption' ? '⚡ Energy' : goal.type === 'cost' ? '💰 Cost' : '🌍 CO₂'}
                  </Text>
                  {goal.isAchieved && <Text style={styles.achievedBadge}>✅ Achieved!</Text>}
                </View>
                <Text style={styles.goalTarget}>
                  Target: {goal.target} {goal.type === 'consumption' ? 'kWh' : goal.type === 'cost' ? '$' : 'kg CO₂'}
                </Text>
                <View style={styles.goalProgress}>
                  <View style={[styles.goalProgressFill, { width: `${Math.min(progress, 100)}%` }]} />
                </View>
                <Text style={styles.goalProgressText}>
                  {progress.toFixed(0)}% • {goal.currentValue.toFixed(1)} / {goal.target}
                </Text>
                <Text style={styles.goalDeadline}>
                  Deadline: {format(new Date(goal.deadline), 'MMM dd, yyyy')}
                </Text>
              </View>
            );
          })
        )}
      </View>

      {/* Badges */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🏅 Badges</Text>
        <View style={styles.badgesGrid}>
          {badges.map((badge) => (
            <View
              key={badge.id}
              style={[
                styles.badgeCard,
                !badge.isEarned && styles.badgeCardLocked,
              ]}
            >
              <Text style={[styles.badgeIcon, !badge.isEarned && styles.badgeIconLocked]}>
                {badge.icon}
              </Text>
              <Text style={[styles.badgeName, !badge.isEarned && styles.badgeNameLocked]}>
                {badge.name}
              </Text>
              <Text style={[styles.badgeDescription, !badge.isEarned && styles.badgeDescriptionLocked]}>
                {badge.description}
              </Text>
              {badge.isEarned && badge.earnedAt && (
                <Text style={styles.badgeEarnedDate}>
                  Earned {format(new Date(badge.earnedAt), 'MMM dd')}
                </Text>
              )}
            </View>
          ))}
        </View>
      </View>

      {/* Stats Summary */}
      {dashboardData && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Overall Stats</Text>
          <View style={styles.statsCard}>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>⚡ Total Energy Saved</Text>
              <Text style={styles.statValue}>{dashboardData.totalEnergyConsumed.toFixed(2)} kWh</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>💰 Money Saved</Text>
              <Text style={styles.statValue}>${dashboardData.totalCost.toFixed(2)}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>🌍 CO₂ Reduced</Text>
              <Text style={styles.statValue}>{dashboardData.totalCO2Saved.toFixed(2)} kg</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>🌳 Trees Equivalent</Text>
              <Text style={styles.statValue}>{dashboardData.treesEquivalent.toFixed(1)} trees</Text>
            </View>
          </View>
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
    backgroundColor: '#FF5722',
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
  section: {
    padding: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  addButton: {
    backgroundColor: '#FF5722',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  streakCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  streakMain: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  streakIcon: {
    fontSize: 64,
    marginRight: 20,
  },
  streakNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FF5722',
  },
  streakLabel: {
    fontSize: 16,
    color: '#666',
  },
  streakStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  streakStat: {
    alignItems: 'center',
  },
  streakStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  streakStatLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  streakDivider: {
    width: 1,
    backgroundColor: '#e0e0e0',
  },
  streakLastActivity: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 10,
  },
  goalCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  goalType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  achievedBadge: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  goalTarget: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  goalProgress: {
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 8,
  },
  goalProgressFill: {
    height: '100%',
    backgroundColor: '#FF5722',
    borderRadius: 5,
  },
  goalProgressText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 5,
  },
  goalDeadline: {
    fontSize: 12,
    color: '#999',
  },
  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  badgeCard: {
    width: '48%',
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
  badgeCardLocked: {
    opacity: 0.5,
  },
  badgeIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  badgeIconLocked: {
    filter: 'grayscale(100%)',
  },
  badgeName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
    textAlign: 'center',
  },
  badgeNameLocked: {
    color: '#999',
  },
  badgeDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  badgeDescriptionLocked: {
    color: '#ccc',
  },
  badgeEarnedDate: {
    fontSize: 10,
    color: '#4CAF50',
    marginTop: 5,
    fontWeight: '600',
  },
  statsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  statLabel: {
    fontSize: 15,
    color: '#666',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF5722',
  },
});

export default ProgressScreen;
