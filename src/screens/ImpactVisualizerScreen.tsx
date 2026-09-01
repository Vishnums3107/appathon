import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share as RNShare,
  Alert,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Colors, Typography, Spacing, Radius, Shadows } from '../theme';
import { useEnergy } from '../context/EnergyContext';
import { formatEnergy, formatCost, formatCO2 } from '../utils/energy';
import { format } from 'date-fns';
import ViewShot from 'react-native-view-shot';

const ImpactVisualizerScreen = () => {
  const {
    dashboardData,
    settings,
    streak,
    generateDailySnapshot,
    saveDailySnapshot,
    snapshots,
    goals,
    activeTimers,
    addCountdownTimer,
    updateTimer,
  } = useEnergy();

  const viewShotRef = useRef<ViewShot>(null);

  useEffect(() => {
    // Update active timers every minute
    const interval = setInterval(() => {
      activeTimers.forEach(timer => {
        if (timer.isActive) {
          updateTimer(timer.id);
        }
      });
    }, 60000);

    return () => clearInterval(interval);
  }, [activeTimers, updateTimer]);

  const handleGenerateSnapshot = async () => {
    try {
      const snapshot = await generateDailySnapshot();
      await saveDailySnapshot(snapshot);
      Alert.alert('Success', 'Daily snapshot saved!');
    } catch {
      Alert.alert('Error', 'Failed to generate snapshot');
    }
  };

  const handleShareSnapshot = async () => {
    try {
      if (!viewShotRef.current || !viewShotRef.current.capture) return;

      const uri = await viewShotRef.current.capture();
      await RNShare.share({
        title: 'My Energy Impact',
        message: `I saved ${dashboardData?.totalEnergyConsumed.toFixed(1)} kWh today! 🌍`,
        url: uri,
      });
    } catch (error) {
      console.error('Error sharing snapshot:', error);
    }
  };

  const handleStartGoalTimer = () => {
    if (goals.length === 0) {
      Alert.alert('No Goals', 'Create a goal first to start a countdown timer!');
      return;
    }

    const goal = goals[0]; // Use first goal for demo
    const hoursToGoal = 24; // Example: 24 hours to achieve goal

    const targetTime = new Date(Date.now() + hoursToGoal * 60 * 60 * 1000).toISOString();

    addCountdownTimer({
      goalId: goal.id,
      goalTitle: goal.type === 'consumption' ? 'Energy Reduction' : 'Cost Savings',
      targetTime,
      currentTime: new Date().toISOString(),
      remainingHours: hoursToGoal,
      remainingMinutes: 0,
      targetValue: goal.target,
      currentValue: goal.currentValue,
      unit: goal.type === 'consumption' ? 'kWh' : '$',
      isActive: true,
    });

    Alert.alert('Timer Started!', `Countdown started for "${goal.type}" goal`);
  };

  if (!dashboardData) {
    return (
      <View style={s.emptyContainer}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.dark} />
        <Text style={s.emptyIcon}>🌍</Text>
        <Text style={s.emptyTitle}>No Data Available</Text>
        <Text style={s.emptyText}>Add appliances to see your energy impact</Text>
      </View>
    );
  }

  const todaySnapshot = snapshots.find(s => s.date === format(new Date(), 'yyyy-MM-dd'));

  return (
    <ScrollView style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.dark} />
      <LinearGradient colors={['#0B1120', '#162032']} style={s.header}>
        <Text style={s.headerLabel}>ENERGY IMPACT</Text>
        <Text style={s.headerTitle}>Impact Visualizer</Text>
      </LinearGradient>

      {/* Animated Impact Visualization */}
      <ViewShot ref={viewShotRef} style={s.snapshotContainer}>
        <View style={s.impactSection}>
          <Text style={s.sectionTitle}>Today's Impact</Text>

          <View style={s.impactCard}>
            <View style={s.impactRow}>
              <View style={s.impactItem}>
                <Text style={s.impactIcon}>⚡</Text>
                <Text style={s.impactValue}>
                  {dashboardData.totalEnergyConsumed.toFixed(1)}
                </Text>
                <Text style={s.impactLabel}>kWh Used</Text>
              </View>

              <View style={s.impactItem}>
                <Text style={s.impactIcon}>🌍</Text>
                <Text style={s.impactValue}>
                  {dashboardData.totalCO2Saved.toFixed(1)}
                </Text>
                <Text style={s.impactLabel}>kg CO₂</Text>
              </View>

              <View style={s.impactItem}>
                <Text style={s.impactIcon}>🌳</Text>
                <Text style={s.impactValue}>
                  {dashboardData.treesEquivalent.toFixed(1)}
                </Text>
                <Text style={s.impactLabel}>Trees Needed</Text>
              </View>
            </View>

            <View style={s.streakBox}>
              <Text style={s.streakIcon}>🔥</Text>
              <Text style={s.streakText}>{streak.currentStreak} Day Streak</Text>
            </View>
          </View>
        </View>

        {/* Mini Visualization Videos (Animated) */}
        <View style={s.videoSection}>
          <Text style={s.sectionTitle}>Impact Visualization</Text>

          <View style={s.videoCard}>
            <Text style={s.videoTitle}>CO₂ to Trees</Text>
            <View style={s.treeAnimation}>
              {[...Array(Math.min(Math.ceil(dashboardData.treesEquivalent), 10))].map((_, i) => (
                <Text key={i} style={s.treeEmoji}>🌳</Text>
              ))}
            </View>
            <Text style={s.videoDesc}>
              {dashboardData.treesEquivalent.toFixed(1)} trees needed to offset your monthly CO₂
            </Text>
          </View>

          <View style={s.videoCard}>
            <Text style={s.videoTitle}>Energy Saved = 💡</Text>
            <View style={s.bulbAnimation}>
              {[...Array(Math.min(Math.ceil(dashboardData.totalEnergyConsumed / 10), 10))].map((_, i) => (
                <Text key={i} style={s.bulbEmoji}>💡</Text>
              ))}
            </View>
            <Text style={s.videoDesc}>
              Equivalent to {Math.floor(dashboardData.totalEnergyConsumed / 0.06)} LED bulbs running for 1 hour
            </Text>
          </View>
        </View>
      </ViewShot>

      {/* Daily Snapshot */}
      <View style={s.snapshotSection}>
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Daily Snapshot</Text>
          <TouchableOpacity style={s.shareButton} onPress={handleShareSnapshot}>
            <LinearGradient
              colors={['#00E676', '#00C853']}
              style={s.shareButtonGradient}
            >
              <Text style={s.shareButtonText}>Share</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {todaySnapshot ? (
          <View style={s.snapshotCard}>
            <Text style={s.snapshotDate}>{format(new Date(), 'EEEE, MMMM dd, yyyy')}</Text>
            <View style={s.snapshotStats}>
              <View style={s.snapshotStat}>
                <Text style={s.snapshotLabel}>Energy</Text>
                <Text style={s.snapshotValue}>{formatEnergy(todaySnapshot.energyConsumed)}</Text>
              </View>
              <View style={s.snapshotStat}>
                <Text style={s.snapshotLabel}>Cost</Text>
                <Text style={s.snapshotValue}>{formatCost(todaySnapshot.moneySaved, settings.currency)}</Text>
              </View>
              <View style={s.snapshotStat}>
                <Text style={s.snapshotLabel}>CO₂</Text>
                <Text style={s.snapshotValue}>{formatCO2(todaySnapshot.co2Avoided)}</Text>
              </View>
            </View>
            <Text style={s.topAction}>🏆 {todaySnapshot.topSavingAction}</Text>
          </View>
        ) : (
          <TouchableOpacity style={s.generateButton} onPress={handleGenerateSnapshot}>
            <LinearGradient
              colors={['#00E676', '#00C853']}
              style={s.generateButtonGradient}
            >
              <Text style={s.generateButtonText}>Generate Today's Snapshot</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>

      {/* Eco Goal Countdown Timers */}
      <View style={s.timerSection}>
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Goal Countdown</Text>
          <TouchableOpacity style={s.addTimerButton} onPress={handleStartGoalTimer}>
            <LinearGradient
              colors={['#00E676', '#00C853']}
              style={s.addTimerGradient}
            >
              <Text style={s.addTimerText}>+ Start</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {activeTimers.length === 0 ? (
          <View style={s.noTimers}>
            <Text style={s.noTimersText}>No active timers. Start one to track your goals!</Text>
          </View>
        ) : (
          activeTimers.map((timer) => (
            <View key={timer.id} style={s.timerCard}>
              <Text style={s.timerTitle}>{timer.goalTitle}</Text>
              <View style={s.timerDisplay}>
                <View style={s.timeBox}>
                  <Text style={s.timeValue}>{timer.remainingHours}</Text>
                  <Text style={s.timeLabel}>Hours</Text>
                </View>
                <Text style={s.timeSeparator}>:</Text>
                <View style={s.timeBox}>
                  <Text style={s.timeValue}>{timer.remainingMinutes}</Text>
                  <Text style={s.timeLabel}>Minutes</Text>
                </View>
              </View>
              <Text style={s.timerGoal}>
                Goal: {timer.targetValue} {timer.unit}
              </Text>
              <View style={s.timerProgress}>
                <View
                  style={[
                    s.timerProgressFill,
                    { width: `${(timer.currentValue / timer.targetValue) * 100}%` },
                  ]}
                />
              </View>
              <Text style={s.timerHint}>
                Keep lights off for {timer.remainingHours}h {timer.remainingMinutes}m more to save {(timer.targetValue - timer.currentValue).toFixed(1)} {timer.unit}
              </Text>
            </View>
          ))
        )}
      </View>

      {/* Recent Snapshots */}
      {snapshots.length > 0 && (
        <View style={s.historySection}>
          <Text style={s.sectionTitle}>Snapshot History</Text>
          {snapshots.slice(-7).reverse().map((snapshot) => (
            <View key={snapshot.id} style={s.historyItem}>
              <Text style={s.historyDate}>{format(new Date(snapshot.date), 'MMM dd')}</Text>
              <View style={s.historyStats}>
                <Text style={s.historyValue}>{formatEnergy(snapshot.energyConsumed)}</Text>
                <Text style={s.historyValue}>{formatCO2(snapshot.co2Avoided)}</Text>
              </View>
              <Text style={s.historyStreak}>🔥 {snapshot.streakDays}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: Colors.background,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: Spacing.page,
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
  snapshotContainer: {
    backgroundColor: Colors.card,
  },
  impactSection: {
    padding: Spacing.page,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  impactCard: {
    backgroundColor: Colors.primarySoft,
    borderRadius: Radius.card,
    padding: Spacing.page,
  },
  impactRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Spacing.page,
  },
  impactItem: {
    alignItems: 'center',
  },
  impactIcon: {
    fontSize: 32,
    marginBottom: Spacing.sm,
  },
  impactValue: {
    ...Typography.stat,
    color: Colors.primaryDeep,
    marginBottom: Spacing.xs,
  },
  impactLabel: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  streakBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.card,
    padding: Spacing.md,
    borderRadius: Radius.sm,
  },
  streakIcon: {
    fontSize: 24,
    marginRight: Spacing.sm,
  },
  streakText: {
    ...Typography.label,
    color: Colors.warning,
  },
  videoSection: {
    padding: Spacing.page,
    paddingTop: 0,
  },
  videoCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.card,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadows.md,
  },
  videoTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  treeAnimation: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    padding: Spacing.sm,
  },
  treeEmoji: {
    fontSize: 28,
    margin: Spacing.xs,
  },
  bulbAnimation: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    padding: Spacing.sm,
  },
  bulbEmoji: {
    fontSize: 28,
    margin: Spacing.xs,
  },
  videoDesc: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  snapshotSection: {
    padding: Spacing.page,
  },
  shareButton: {
    borderRadius: Radius.pill,
    overflow: 'hidden',
  },
  shareButtonGradient: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
  },
  shareButtonText: {
    ...Typography.label,
    color: '#fff',
  },
  snapshotCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.card,
    padding: Spacing.page,
    ...Shadows.md,
  },
  snapshotDate: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  snapshotStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Spacing.lg,
  },
  snapshotStat: {
    alignItems: 'center',
  },
  snapshotLabel: {
    ...Typography.labelSmall,
    color: Colors.textMuted,
    marginBottom: Spacing.xs,
  },
  snapshotValue: {
    ...Typography.statSmall,
    color: Colors.primary,
  },
  topAction: {
    ...Typography.label,
    color: Colors.text,
    textAlign: 'center',
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  generateButton: {
    borderRadius: Radius.card,
    overflow: 'hidden',
  },
  generateButtonGradient: {
    padding: Spacing.lg,
    borderRadius: Radius.card,
    alignItems: 'center',
  },
  generateButtonText: {
    ...Typography.h3,
    color: '#fff',
  },
  timerSection: {
    padding: Spacing.page,
  },
  addTimerButton: {
    borderRadius: Radius.pill,
    overflow: 'hidden',
  },
  addTimerGradient: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
  },
  addTimerText: {
    ...Typography.label,
    color: '#fff',
  },
  noTimers: {
    padding: Spacing.page,
    backgroundColor: Colors.card,
    borderRadius: Radius.card,
    alignItems: 'center',
    ...Shadows.sm,
  },
  noTimersText: {
    ...Typography.bodyMedium,
    color: Colors.textMuted,
  },
  timerCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.card,
    padding: Spacing.page,
    marginBottom: Spacing.lg,
    ...Shadows.md,
  },
  timerTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  timerDisplay: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  timeBox: {
    backgroundColor: Colors.primarySoft,
    borderRadius: Radius.sm,
    padding: Spacing.lg,
    minWidth: 80,
    alignItems: 'center',
  },
  timeValue: {
    ...Typography.displayMedium,
    color: Colors.primaryDeep,
  },
  timeLabel: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  timeSeparator: {
    ...Typography.displayMedium,
    color: Colors.primaryDeep,
    marginHorizontal: Spacing.sm,
  },
  timerGoal: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  timerProgress: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: Spacing.xs,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  timerProgressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: Spacing.xs,
  },
  timerHint: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  historySection: {
    padding: Spacing.page,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    padding: Spacing.lg,
    borderRadius: Radius.sm,
    marginBottom: Spacing.sm,
    ...Shadows.sm,
  },
  historyDate: {
    ...Typography.label,
    color: Colors.text,
    width: 60,
  },
  historyStats: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  historyValue: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  historyStreak: {
    fontSize: 14,
  },
});

export default ImpactVisualizerScreen;
