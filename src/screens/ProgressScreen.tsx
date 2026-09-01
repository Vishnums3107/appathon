import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Alert, StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useEnergy } from '../context/EnergyContext';
import { format, addDays } from 'date-fns';
import { formatCO2, formatCost, formatEnergy } from '../utils/energy';
import { Colors, Typography, Spacing, Radius, Shadows } from '../theme';

const ProgressScreen = () => {
  const { streak, badges, goals, dashboardData, addGoal, deleteGoal, settings } = useEnergy();
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalType, setGoalType] = useState<'consumption' | 'cost' | 'co2'>('consumption');
  const [goalTarget, setGoalTarget] = useState('');
  const [goalDays, setGoalDays] = useState('30');

  const handleCreateGoal = async () => {
    const target = Number.parseFloat(goalTarget);
    const duration = Number.parseInt(goalDays, 10);
    if (!Number.isFinite(target) || target <= 0) {
      Alert.alert('Check your target', 'Enter a monthly limit greater than zero.');
      return;
    }
    if (!Number.isFinite(duration) || duration < 1) {
      Alert.alert('Check the duration', 'Enter a whole number of at least one day.');
      return;
    }
    await addGoal({
      type: goalType, target,
      deadline: addDays(new Date(), duration).toISOString(),
    });
    setShowGoalModal(false); setGoalTarget(''); setGoalDays('30');
    Alert.alert('Goal Created!', 'Track your progress below.');
  };

  const getSuggestedTarget = () => {
    if (!dashboardData) return goalType === 'cost' ? 25 : 50;
    const current = goalType === 'consumption'
      ? dashboardData.totalEnergyConsumed
      : goalType === 'cost'
        ? dashboardData.totalCost
        : dashboardData.totalCO2Saved;
    return Math.max(0.1, current * 0.9);
  };

  const useSuggestedTarget = () => setGoalTarget(getSuggestedTarget().toFixed(1));

  return (
    <ScrollView style={s.screen} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.dark} />
      <LinearGradient colors={['#0B1120', '#162032', '#1A2E40']} style={s.header}>
        <Text style={s.headerLabel}>YOUR JOURNEY</Text>
        <Text style={s.headerTitle}>Progress</Text>
      </LinearGradient>

      {/* Streak Hero */}
      <View style={s.streakCard}>
        <View style={s.streakMain}>
          <Text style={s.streakNum}>{streak.currentStreak}</Text>
          <Text style={s.streakUnit}>day streak</Text>
        </View>
        <View style={s.streakRow}>
          <View style={s.streakStat}>
            <Text style={s.streakStatVal}>{streak.longestStreak}</Text>
            <Text style={s.streakStatLbl}>Best</Text>
          </View>
          <View style={s.streakDivider} />
          <View style={s.streakStat}>
            <Text style={s.streakStatVal}>{streak.totalDaysActive}</Text>
            <Text style={s.streakStatLbl}>Total Days</Text>
          </View>
        </View>
        {streak.lastActivityDate && (
          <Text style={s.lastAct}>Last activity: {format(new Date(streak.lastActivityDate), 'MMM dd, yyyy')}</Text>
        )}
      </View>

      {/* Goals */}
      <View style={s.section}>
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Goals</Text>
          <TouchableOpacity style={s.addBtn} onPress={() => setShowGoalModal(true)}>
            <Text style={s.addBtnTxt}>+ New</Text>
          </TouchableOpacity>
        </View>
        <Text style={s.sectionCaption}>Goals are monthly limits. Progress updates as your energy profile changes.</Text>
        {goals.length === 0 ? (
          <View style={s.emptyCard}>
            <Text style={s.emptyIcon}>🎯</Text>
            <Text style={s.emptyTitle}>No goals set</Text>
            <Text style={s.emptyBody}>Create a goal to track your progress</Text>
          </View>
        ) : goals.map((goal) => {
          const pct = goal.target > 0 ? (goal.currentValue / goal.target) * 100 : 0;
          const value = goal.type === 'consumption'
            ? formatEnergy(goal.currentValue)
            : goal.type === 'cost'
              ? formatCost(goal.currentValue, settings.currency)
              : formatCO2(goal.currentValue);
          const targetValue = goal.type === 'consumption'
            ? formatEnergy(goal.target)
            : goal.type === 'cost'
              ? formatCost(goal.target, settings.currency)
              : formatCO2(goal.target);
          return (
            <View key={goal.id} style={s.goalCard}>
              <View style={s.goalTop}>
                <Text style={s.goalType}>
                  {goal.type === 'consumption' ? '⚡ Energy' : goal.type === 'cost' ? '💰 Cost' : '🌍 CO₂'}
                </Text>
                {goal.isAchieved && <View style={s.achievedBadge}><Text style={s.achievedTxt}>ACHIEVED</Text></View>}
              </View>
              <Text style={s.goalTargetTxt}>Monthly limit: {targetValue}</Text>
              <View style={s.progressBg}>
                <View style={[s.progressFill, { width: `${Math.min(pct, 100)}%` }]} />
              </View>
              <View style={s.goalFooter}>
                <Text style={s.goalPct}>{value} used</Text>
                <Text style={s.goalDeadline}>Due {format(new Date(goal.deadline), 'MMM dd')}</Text>
              </View>
              <TouchableOpacity style={s.goalDel} onPress={() =>
                Alert.alert('Delete Goal', `Remove this ${goal.type} goal?`, [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Delete', style: 'destructive', onPress: () => deleteGoal(goal.id) },
                ])}>
                <Text style={s.goalDelTxt}>Remove</Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>

      {/* Badges */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>Badges</Text>
        <View style={s.badgeGrid}>
          {badges.map((badge) => (
            <View key={badge.id} style={[s.badgeCard, !badge.isEarned && s.badgeLocked]}>
              <Text style={[s.badgeIcon, !badge.isEarned && s.badgeIconLocked]}>{badge.icon}</Text>
              <Text style={[s.badgeName, !badge.isEarned && s.badgeNameLocked]}>{badge.name}</Text>
              <Text style={[s.badgeDesc, !badge.isEarned && s.badgeDescLocked]}>{badge.description}</Text>
              {badge.isEarned && badge.earnedAt && (
                <Text style={s.badgeDate}>Earned {format(new Date(badge.earnedAt), 'MMM dd')}</Text>
              )}
            </View>
          ))}
        </View>
      </View>

      {/* Stats */}
      {dashboardData && (
        <View style={[s.section, s.statsSection]}>
          <Text style={s.sectionTitle}>Overall Stats</Text>
          <View style={s.statsCard}>
            {[
              { icon: '⚡', l: 'Total Energy', v: `${dashboardData.totalEnergyConsumed.toFixed(2)} kWh` },
              { icon: '💰', l: 'Total Cost', v: `$${dashboardData.totalCost.toFixed(2)}` },
              { icon: '🌍', l: 'CO₂ Generated', v: `${dashboardData.totalCO2Saved.toFixed(2)} kg` },
              { icon: '🌳', l: 'Trees Equivalent', v: `${dashboardData.treesEquivalent.toFixed(1)}` },
            ].map((st, i) => (
              <View key={st.l} style={[s.statRow, i < 3 && s.statRowBorder]}>
                <Text style={s.statIcon}>{st.icon}</Text>
                <Text style={s.statLabel}>{st.l}</Text>
                <Text style={s.statVal}>{st.v}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Goal Modal */}
      <Modal visible={showGoalModal} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <Text style={s.modalTitle}>Create Goal</Text>
            <Text style={s.modalLabel}>Type</Text>
            <View style={s.typeRow}>
              {(['consumption', 'cost', 'co2'] as const).map((t) => (
                <TouchableOpacity key={t} style={[s.typeBtn, goalType === t && s.typeBtnActive]} onPress={() => setGoalType(t)}>
                  <Text style={[s.typeBtnTxt, goalType === t && s.typeBtnTxtActive]}>
                    {t === 'consumption' ? 'Energy' : t === 'cost' ? 'Cost' : 'CO₂'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={s.modalLabel}>Target ({goalType === 'consumption' ? 'kWh' : goalType === 'cost' ? '$' : 'kg'})</Text>
            <TextInput style={s.modalInput} value={goalTarget} onChangeText={setGoalTarget}
              keyboardType="decimal-pad" placeholder="e.g., 50" placeholderTextColor={Colors.textMuted} />
            <TouchableOpacity style={s.suggestionButton} onPress={useSuggestedTarget}>
              <Text style={s.suggestionText}>Use a 10% reduction target: {getSuggestedTarget().toFixed(1)}</Text>
            </TouchableOpacity>
            <Text style={s.modalLabel}>Duration (days)</Text>
            <TextInput style={s.modalInput} value={goalDays} onChangeText={setGoalDays}
              keyboardType="number-pad" placeholder="30" placeholderTextColor={Colors.textMuted} />
            <View style={s.modalBtns}>
              <TouchableOpacity style={s.cancelBtn} onPress={() => setShowGoalModal(false)}>
                <Text style={s.cancelTxt}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleCreateGoal}>
                <LinearGradient colors={['#00E676', '#00C853']} style={s.createBtn}>
                  <Text style={s.createTxt}>Create</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  header: { paddingTop: 54, paddingBottom: 28, paddingHorizontal: Spacing.page, alignItems: 'center' },
  headerLabel: { ...Typography.overline, color: Colors.primary, marginBottom: 4 },
  headerTitle: { ...Typography.displaySmall, color: '#fff' },

  streakCard: { marginHorizontal: Spacing.page, marginTop: -10, backgroundColor: Colors.card, borderRadius: Radius.xl, padding: Spacing.xxl, alignItems: 'center', ...Shadows.lg },
  streakMain: { alignItems: 'center', marginBottom: 16 },
  streakNum: { ...Typography.displayLarge, color: Colors.primary, fontSize: 56 },
  streakUnit: { ...Typography.label, color: Colors.textSecondary },
  streakRow: { flexDirection: 'row', width: '100%', justifyContent: 'space-around', paddingTop: 16, borderTopWidth: 1, borderTopColor: Colors.divider },
  streakStat: { alignItems: 'center' },
  streakStatVal: { ...Typography.stat, color: Colors.text },
  streakStatLbl: { ...Typography.labelSmall, color: Colors.textMuted, marginTop: 2 },
  streakDivider: { width: 1, height: 32, backgroundColor: Colors.divider },
  lastAct: { ...Typography.bodySmall, color: Colors.textMuted, marginTop: 12 },

  section: { paddingHorizontal: Spacing.page, marginTop: Spacing.section },
  statsSection: { marginBottom: 30 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { ...Typography.h2, color: Colors.text, marginBottom: 14 },
  sectionCaption: { ...Typography.bodySmall, color: Colors.textMuted, lineHeight: 18, marginTop: -8, marginBottom: 12 },
  addBtn: { backgroundColor: Colors.primary, borderRadius: Radius.pill, paddingHorizontal: 16, paddingVertical: 8 },
  addBtnTxt: { ...Typography.labelSmall, color: Colors.dark },

  emptyCard: { backgroundColor: Colors.card, borderRadius: Radius.card, padding: 32, alignItems: 'center', ...Shadows.sm },
  emptyIcon: { fontSize: 40, marginBottom: 10 },
  emptyTitle: { ...Typography.h3, color: Colors.text, marginBottom: 4 },
  emptyBody: { ...Typography.bodySmall, color: Colors.textSecondary },

  goalCard: { backgroundColor: Colors.card, borderRadius: Radius.card, padding: Spacing.lg, marginBottom: 12, ...Shadows.sm },
  goalTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  goalType: { ...Typography.h3, color: Colors.text },
  achievedBadge: { backgroundColor: Colors.primarySoft, borderRadius: Radius.pill, paddingHorizontal: 10, paddingVertical: 3 },
  achievedTxt: { ...Typography.overline, color: Colors.primaryDark, fontSize: 9 },
  goalTargetTxt: { ...Typography.bodySmall, color: Colors.textSecondary, marginBottom: 10 },
  progressBg: { height: 8, backgroundColor: Colors.borderLight, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 4 },
  goalFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  goalPct: { ...Typography.label, color: Colors.primary },
  goalDeadline: { ...Typography.bodySmall, color: Colors.textMuted },
  goalDel: { marginTop: 10, paddingVertical: 8, alignItems: 'center', backgroundColor: '#FEF2F2', borderRadius: Radius.sm },
  goalDelTxt: { ...Typography.labelSmall, color: Colors.danger },

  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  badgeCard: { width: '47%', backgroundColor: Colors.card, borderRadius: Radius.card, padding: 16, alignItems: 'center', ...Shadows.sm },
  badgeLocked: { opacity: 0.5 },
  badgeIcon: { fontSize: 40, marginBottom: 8 },
  badgeIconLocked: { opacity: 0.3 },
  badgeName: { ...Typography.label, color: Colors.text, textAlign: 'center', marginBottom: 4 },
  badgeNameLocked: { color: Colors.textMuted },
  badgeDesc: { ...Typography.bodySmall, color: Colors.textSecondary, textAlign: 'center' },
  badgeDescLocked: { color: Colors.border },
  badgeDate: { ...Typography.labelSmall, color: Colors.primary, marginTop: 6 },

  statsCard: { backgroundColor: Colors.card, borderRadius: Radius.card, ...Shadows.md, overflow: 'hidden' },
  statRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16 },
  statRowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.divider },
  statIcon: { fontSize: 20, marginRight: 12 },
  statLabel: { flex: 1, ...Typography.bodyMedium, color: Colors.textSecondary },
  statVal: { ...Typography.statSmall, color: Colors.primary },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: Colors.card, borderRadius: Radius.xl, padding: 24, width: '88%', maxWidth: 400 },
  modalTitle: { ...Typography.h1, color: Colors.text, textAlign: 'center', marginBottom: 20 },
  modalLabel: { ...Typography.label, color: Colors.textSecondary, marginTop: 14, marginBottom: 6 },
  typeRow: { flexDirection: 'row', gap: 8 },
  typeBtn: { flex: 1, paddingVertical: 10, borderRadius: Radius.sm, borderWidth: 1.5, borderColor: Colors.border, alignItems: 'center' },
  typeBtnActive: { borderColor: Colors.primary, backgroundColor: Colors.primarySoft },
  typeBtnTxt: { ...Typography.label, color: Colors.textSecondary },
  typeBtnTxtActive: { color: Colors.primaryDark },
  modalInput: { backgroundColor: Colors.background, borderRadius: Radius.sm, padding: 14, ...Typography.bodyLarge, color: Colors.text, borderWidth: 1, borderColor: Colors.border },
  suggestionButton: { alignSelf: 'flex-start', paddingVertical: 6, marginBottom: 4 },
  suggestionText: { ...Typography.labelSmall, color: Colors.primaryDark },
  modalBtns: { flexDirection: 'row', gap: 12, marginTop: 24 },
  cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: Radius.sm, backgroundColor: Colors.background, alignItems: 'center' },
  cancelTxt: { ...Typography.label, color: Colors.textSecondary },
  createBtn: { flex: 1, paddingVertical: 14, borderRadius: Radius.sm, alignItems: 'center', minWidth: 130 },
  createTxt: { ...Typography.label, color: Colors.dark },
});

export default ProgressScreen;
