import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Share as RNShare,
  Alert,
} from 'react-native';
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

  const [animatedCO2] = useState(new Animated.Value(0));
  const [animatedTrees] = useState(new Animated.Value(0));
  const [animatedEnergy] = useState(new Animated.Value(0));
  const viewShotRef = useRef<ViewShot>(null);

  useEffect(() => {
    // Animate values on mount
    if (dashboardData) {
      Animated.parallel([
        Animated.timing(animatedCO2, {
          toValue: dashboardData.totalCO2Saved,
          duration: 2000,
          useNativeDriver: false,
        }),
        Animated.timing(animatedTrees, {
          toValue: dashboardData.treesEquivalent,
          duration: 2000,
          useNativeDriver: false,
        }),
        Animated.timing(animatedEnergy, {
          toValue: dashboardData.totalEnergyConsumed,
          duration: 2000,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [dashboardData]);

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
  }, [activeTimers]);

  const handleGenerateSnapshot = async () => {
    try {
      const snapshot = await generateDailySnapshot();
      await saveDailySnapshot(snapshot);
      Alert.alert('Success', 'Daily snapshot saved!');
    } catch (error) {
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
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>🌍</Text>
        <Text style={styles.emptyTitle}>No Data Available</Text>
        <Text style={styles.emptyText}>Add appliances to see your energy impact</Text>
      </View>
    );
  }

  const todaySnapshot = snapshots.find(s => s.date === format(new Date(), 'yyyy-MM-dd'));

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🌍 Energy Impact</Text>
        <Text style={styles.subtitle}>Visualize your environmental contribution</Text>
      </View>

      {/* Animated Impact Visualization */}
      <ViewShot ref={viewShotRef} style={styles.snapshotContainer}>
        <View style={styles.impactSection}>
          <Text style={styles.sectionTitle}>📊 Today's Impact</Text>
          
          <View style={styles.impactCard}>
            <View style={styles.impactRow}>
              <View style={styles.impactItem}>
                <Text style={styles.impactIcon}>⚡</Text>
                <Animated.Text style={styles.impactValue}>
                  {animatedEnergy.interpolate({
                    inputRange: [0, dashboardData.totalEnergyConsumed],
                    outputRange: ['0', dashboardData.totalEnergyConsumed.toFixed(1)],
                  })}
                </Animated.Text>
                <Text style={styles.impactLabel}>kWh Used</Text>
              </View>

              <View style={styles.impactItem}>
                <Text style={styles.impactIcon}>🌍</Text>
                <Animated.Text style={styles.impactValue}>
                  {animatedCO2.interpolate({
                    inputRange: [0, dashboardData.totalCO2Saved],
                    outputRange: ['0', dashboardData.totalCO2Saved.toFixed(1)],
                  })}
                </Animated.Text>
                <Text style={styles.impactLabel}>kg CO₂</Text>
              </View>

              <View style={styles.impactItem}>
                <Text style={styles.impactIcon}>🌳</Text>
                <Animated.Text style={styles.impactValue}>
                  {animatedTrees.interpolate({
                    inputRange: [0, dashboardData.treesEquivalent],
                    outputRange: ['0', dashboardData.treesEquivalent.toFixed(1)],
                  })}
                </Animated.Text>
                <Text style={styles.impactLabel}>Trees Needed</Text>
              </View>
            </View>

            <View style={styles.streakBox}>
              <Text style={styles.streakIcon}>🔥</Text>
              <Text style={styles.streakText}>{streak.currentStreak} Day Streak</Text>
            </View>
          </View>
        </View>

        {/* Mini Visualization Videos (Animated) */}
        <View style={styles.videoSection}>
          <Text style={styles.sectionTitle}>🎬 Impact Visualization</Text>
          
          <View style={styles.videoCard}>
            <Text style={styles.videoTitle}>CO₂ to Trees</Text>
            <View style={styles.treeAnimation}>
              {[...Array(Math.min(Math.ceil(dashboardData.treesEquivalent), 10))].map((_, i) => (
                <Text key={i} style={styles.treeEmoji}>🌳</Text>
              ))}
            </View>
            <Text style={styles.videoDesc}>
              {dashboardData.treesEquivalent.toFixed(1)} trees needed to offset your monthly CO₂
            </Text>
          </View>

          <View style={styles.videoCard}>
            <Text style={styles.videoTitle}>Energy Saved = 💡</Text>
            <View style={styles.bulbAnimation}>
              {[...Array(Math.min(Math.ceil(dashboardData.totalEnergyConsumed / 10), 10))].map((_, i) => (
                <Text key={i} style={styles.bulbEmoji}>💡</Text>
              ))}
            </View>
            <Text style={styles.videoDesc}>
              Equivalent to {Math.floor(dashboardData.totalEnergyConsumed / 0.06)} LED bulbs running for 1 hour
            </Text>
          </View>
        </View>
      </ViewShot>

      {/* Daily Snapshot */}
      <View style={styles.snapshotSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>📸 Daily Snapshot</Text>
          <TouchableOpacity style={styles.shareButton} onPress={handleShareSnapshot}>
            <Text style={styles.shareButtonText}>Share</Text>
          </TouchableOpacity>
        </View>

        {todaySnapshot ? (
          <View style={styles.snapshotCard}>
            <Text style={styles.snapshotDate}>{format(new Date(), 'EEEE, MMMM dd, yyyy')}</Text>
            <View style={styles.snapshotStats}>
              <View style={styles.snapshotStat}>
                <Text style={styles.snapshotLabel}>Energy</Text>
                <Text style={styles.snapshotValue}>{formatEnergy(todaySnapshot.energyConsumed)}</Text>
              </View>
              <View style={styles.snapshotStat}>
                <Text style={styles.snapshotLabel}>Cost</Text>
                <Text style={styles.snapshotValue}>{formatCost(todaySnapshot.moneySaved, settings.currency)}</Text>
              </View>
              <View style={styles.snapshotStat}>
                <Text style={styles.snapshotLabel}>CO₂</Text>
                <Text style={styles.snapshotValue}>{formatCO2(todaySnapshot.co2Avoided)}</Text>
              </View>
            </View>
            <Text style={styles.topAction}>🏆 {todaySnapshot.topSavingAction}</Text>
          </View>
        ) : (
          <TouchableOpacity style={styles.generateButton} onPress={handleGenerateSnapshot}>
            <Text style={styles.generateButtonText}>Generate Today's Snapshot</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Eco Goal Countdown Timers */}
      <View style={styles.timerSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>⏰ Goal Countdown</Text>
          <TouchableOpacity style={styles.addTimerButton} onPress={handleStartGoalTimer}>
            <Text style={styles.addTimerText}>+ Start</Text>
          </TouchableOpacity>
        </View>

        {activeTimers.length === 0 ? (
          <View style={styles.noTimers}>
            <Text style={styles.noTimersText}>No active timers. Start one to track your goals!</Text>
          </View>
        ) : (
          activeTimers.map((timer) => (
            <View key={timer.id} style={styles.timerCard}>
              <Text style={styles.timerTitle}>{timer.goalTitle}</Text>
              <View style={styles.timerDisplay}>
                <View style={styles.timeBox}>
                  <Text style={styles.timeValue}>{timer.remainingHours}</Text>
                  <Text style={styles.timeLabel}>Hours</Text>
                </View>
                <Text style={styles.timeSeparator}>:</Text>
                <View style={styles.timeBox}>
                  <Text style={styles.timeValue}>{timer.remainingMinutes}</Text>
                  <Text style={styles.timeLabel}>Minutes</Text>
                </View>
              </View>
              <Text style={styles.timerGoal}>
                Goal: {timer.targetValue} {timer.unit}
              </Text>
              <View style={styles.timerProgress}>
                <View
                  style={[
                    styles.timerProgressFill,
                    { width: `${(timer.currentValue / timer.targetValue) * 100}%` },
                  ]}
                />
              </View>
              <Text style={styles.timerHint}>
                Keep lights off for {timer.remainingHours}h {timer.remainingMinutes}m more to save {(timer.targetValue - timer.currentValue).toFixed(1)} {timer.unit}
              </Text>
            </View>
          ))
        )}
      </View>

      {/* Recent Snapshots */}
      {snapshots.length > 0 && (
        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>📅 Snapshot History</Text>
          {snapshots.slice(-7).reverse().map((snapshot) => (
            <View key={snapshot.id} style={styles.historyItem}>
              <Text style={styles.historyDate}>{format(new Date(snapshot.date), 'MMM dd')}</Text>
              <View style={styles.historyStats}>
                <Text style={styles.historyValue}>{formatEnergy(snapshot.energyConsumed)}</Text>
                <Text style={styles.historyValue}>{formatCO2(snapshot.co2Avoided)}</Text>
              </View>
              <Text style={styles.historyStreak}>🔥 {snapshot.streakDays}</Text>
            </View>
          ))}
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
    backgroundColor: '#00BCD4',
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  snapshotContainer: {
    backgroundColor: '#fff',
  },
  impactSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  impactCard: {
    backgroundColor: '#E0F7FA',
    borderRadius: 12,
    padding: 20,
  },
  impactRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  impactItem: {
    alignItems: 'center',
  },
  impactIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  impactValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00838F',
    marginBottom: 4,
  },
  impactLabel: {
    fontSize: 12,
    color: '#666',
  },
  streakBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
  },
  streakIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  streakText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6F00',
  },
  videoSection: {
    padding: 20,
    paddingTop: 0,
  },
  videoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  treeAnimation: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    padding: 10,
  },
  treeEmoji: {
    fontSize: 28,
    margin: 4,
  },
  bulbAnimation: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    padding: 10,
  },
  bulbEmoji: {
    fontSize: 28,
    margin: 4,
  },
  videoDesc: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
  },
  snapshotSection: {
    padding: 20,
  },
  shareButton: {
    backgroundColor: '#00BCD4',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 16,
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  snapshotCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 3,
  },
  snapshotDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    textAlign: 'center',
  },
  snapshotStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  snapshotStat: {
    alignItems: 'center',
  },
  snapshotLabel: {
    fontSize: 11,
    color: '#999',
    marginBottom: 4,
  },
  snapshotValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00BCD4',
  },
  topAction: {
    fontSize: 13,
    color: '#333',
    textAlign: 'center',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  generateButton: {
    backgroundColor: '#00BCD4',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  timerSection: {
    padding: 20,
  },
  addTimerButton: {
    backgroundColor: '#00BCD4',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 16,
  },
  addTimerText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  noTimers: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
  },
  noTimersText: {
    color: '#999',
    fontSize: 14,
  },
  timerCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    elevation: 3,
  },
  timerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  timerDisplay: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  timeBox: {
    backgroundColor: '#E0F7FA',
    borderRadius: 8,
    padding: 15,
    minWidth: 80,
    alignItems: 'center',
  },
  timeValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#00838F',
  },
  timeLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  timeSeparator: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#00838F',
    marginHorizontal: 10,
  },
  timerGoal: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  timerProgress: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },
  timerProgressFill: {
    height: '100%',
    backgroundColor: '#00BCD4',
  },
  timerHint: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  historySection: {
    padding: 20,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  historyDate: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    width: 60,
  },
  historyStats: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  historyValue: {
    fontSize: 12,
    color: '#666',
  },
  historyStreak: {
    fontSize: 14,
  },
});

export default ImpactVisualizerScreen;
