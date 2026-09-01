import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Colors, Typography, Spacing, Radius, Shadows } from '../theme';
import { useEnergy } from '../context/EnergyContext';
import { format, addDays } from 'date-fns';

const ChallengesScreen = () => {
  const { challenges, addChallenge, updateChallenge, completeChallenge, deleteChallenge } = useEnergy();
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'energy' | 'cost' | 'streak' | 'custom'>('energy');
  const [target, setTarget] = useState('');
  const [duration, setDuration] = useState('7');

  const handleCreateChallenge = async () => {
    if (!title.trim() || !target) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const durationDays = parseInt(duration, 10);
    const now = new Date();

    await addChallenge({
      title: title.trim(),
      description: description.trim(),
      type,
      target: parseFloat(target),
      duration: durationDays,
      startDate: now.toISOString(),
      endDate: addDays(now, durationDays).toISOString(),
      createdBy: 'self',
      reward: `${durationDays}-day ${type} challenge badge`,
    });

    setShowModal(false);
    resetForm();
    Alert.alert('Success', 'Challenge created! Track your progress below.');
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setType('energy');
    setTarget('');
    setDuration('7');
  };

  const handleProgressUpdate = (challengeId: string, progress: number) => {
    const challenge = challenges.find(c => c.id === challengeId);
    if (!challenge) return;

    const newProgress = Math.min(challenge.currentProgress + progress, challenge.target);

    updateChallenge(challengeId, {
      currentProgress: newProgress,
    });

    if (newProgress >= challenge.target && !challenge.isCompleted) {
      completeChallenge(challengeId);
      Alert.alert(
        '🎉 Challenge Completed!',
        `Congratulations! You've completed "${challenge.title}"!\n\nReward: ${challenge.reward || 'Achievement unlocked!'}`,
      );
    }
  };

  const getChallengeIcon = (challengeType: string) => {
    switch (challengeType) {
      case 'energy': return '⚡';
      case 'cost': return '💰';
      case 'streak': return '🔥';
      default: return '🎯';
    }
  };

  const getChallengeUnit = (challengeType: string) => {
    switch (challengeType) {
      case 'energy': return 'kWh';
      case 'cost': return '$';
      case 'streak': return 'days';
      default: return 'points';
    }
  };

  const activeChallenges = challenges.filter(c => !c.isCompleted);
  const completedChallenges = challenges.filter(c => c.isCompleted);

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.dark} />
      <LinearGradient colors={['#0B1120', '#162032']} style={s.header}>
        <Text style={s.headerLabel}>CHALLENGES</Text>
        <Text style={s.headerTitle}>Energy Challenges</Text>
      </LinearGradient>

      <ScrollView style={s.content}>
        {/* Active Challenges */}
        {activeChallenges.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Active Challenges</Text>
            {activeChallenges.map((challenge) => {
              const progress = (challenge.currentProgress / challenge.target) * 100;
              const daysLeft = Math.ceil(
                (new Date(challenge.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
              );
              const isExpired = daysLeft < 0;

              return (
                <View key={challenge.id} style={s.challengeCard}>
                  <View style={s.challengeHeader}>
                    <Text style={s.challengeIcon}>{getChallengeIcon(challenge.type)}</Text>
                    <View style={s.challengeInfo}>
                      <Text style={s.challengeTitle}>{challenge.title}</Text>
                      <Text style={s.challengeType}>{challenge.type.toUpperCase()}</Text>
                    </View>
                  </View>

                  {challenge.description ? (
                    <Text style={s.challengeDescription}>{challenge.description}</Text>
                  ) : null}

                  <View style={s.targetBox}>
                    <Text style={s.targetLabel}>Target:</Text>
                    <Text style={s.targetValue}>
                      {challenge.target} {getChallengeUnit(challenge.type)}
                    </Text>
                  </View>

                  <View style={s.progressContainer}>
                    <View style={s.progressHeader}>
                      <Text style={s.progressLabel}>Progress</Text>
                      <Text style={s.progressValue}>
                        {challenge.currentProgress.toFixed(1)} / {challenge.target} {getChallengeUnit(challenge.type)}
                      </Text>
                    </View>
                    <View style={s.progressBar}>
                      <View
                        style={[
                          s.progressFill,
                          { width: `${Math.min(progress, 100)}%` },
                        ]}
                      />
                    </View>
                    <Text style={s.progressPercentage}>{progress.toFixed(0)}%</Text>
                  </View>

                  <View style={s.challengeFooter}>
                    <View style={[s.timeLeft, isExpired && s.timeExpired]}>
                      <Text style={[s.timeText, isExpired && s.timeExpiredText]}>
                        ⏰ {isExpired ? 'Expired' : `${daysLeft} days left`}
                      </Text>
                    </View>
                    {isExpired ? (
                      <TouchableOpacity
                        style={s.deleteButton}
                        onPress={() =>
                          Alert.alert('Remove Challenge', `Delete "${challenge.title}"?`, [
                            { text: 'Cancel', style: 'cancel' },
                            { text: 'Delete', style: 'destructive', onPress: () => deleteChallenge(challenge.id) },
                          ])
                        }
                      >
                        <Text style={s.deleteButtonText}>Remove</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        onPress={() => {
                          const unit = getChallengeUnit(challenge.type);
                          Alert.alert(
                            'Update Progress',
                            `How much progress? (${unit})`,
                            [
                              { text: 'Cancel', style: 'cancel' },
                              { text: `+1 ${unit}`, onPress: () => handleProgressUpdate(challenge.id, 1) },
                              { text: `+5 ${unit}`, onPress: () => handleProgressUpdate(challenge.id, 5) },
                              { text: `+10 ${unit}`, onPress: () => handleProgressUpdate(challenge.id, 10) },
                            ]
                          );
                        }}
                      >
                        <LinearGradient
                          colors={['#00E676', '#00C853']}
                          style={s.updateButton}
                        >
                          <Text style={s.updateButtonText}>+ Update</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    )}
                  </View>

                  {challenge.reward && (
                    <View style={s.rewardBox}>
                      <Text style={s.rewardText}>🏆 Reward: {challenge.reward}</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* Completed Challenges */}
        {completedChallenges.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Completed</Text>
            {completedChallenges.map((challenge) => (
              <View key={challenge.id} style={[s.challengeCard, s.completedCard]}>
                <View style={s.completedBadge}>
                  <Text style={s.completedBadgeText}>COMPLETED</Text>
                </View>
                <View style={s.challengeHeader}>
                  <Text style={s.challengeIcon}>{getChallengeIcon(challenge.type)}</Text>
                  <View style={s.challengeInfo}>
                    <Text style={s.challengeTitle}>{challenge.title}</Text>
                    <Text style={s.completedDate}>
                      Completed {format(new Date(challenge.endDate), 'MMM dd, yyyy')}
                    </Text>
                  </View>
                </View>
                {challenge.reward && (
                  <View style={s.rewardEarned}>
                    <Text style={s.rewardEarnedText}>🏆 {challenge.reward}</Text>
                  </View>
                )}
                <TouchableOpacity
                  style={s.deleteCompletedBtn}
                  onPress={() =>
                    Alert.alert('Remove Challenge', `Delete "${challenge.title}"?`, [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Delete', style: 'destructive', onPress: () => deleteChallenge(challenge.id) },
                    ])
                  }
                >
                  <Text style={s.deleteCompletedBtnText}>Remove</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Empty State */}
        {challenges.length === 0 && (
          <View style={s.emptyContainer}>
            <Text style={s.emptyIcon}>🎯</Text>
            <Text style={s.emptyTitle}>No Challenges Yet</Text>
            <Text style={s.emptyText}>
              Create your first challenge and start achieving energy-saving goals!
            </Text>
          </View>
        )}

        {/* Challenge Templates */}
        <View style={s.templatesSection}>
          <Text style={s.templatesTitle}>Quick Challenge Templates</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={s.templateCard}
              onPress={() => {
                setType('energy');
                setTitle('Save 10 kWh in a Week');
                setTarget('10');
                setDuration('7');
                setShowModal(true);
              }}
            >
              <Text style={s.templateIcon}>⚡</Text>
              <Text style={s.templateTitle}>Energy Saver</Text>
              <Text style={s.templateDesc}>Save 10 kWh in 7 days</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={s.templateCard}
              onPress={() => {
                setType('cost');
                setTitle('Reduce Bill by $10');
                setTarget('10');
                setDuration('30');
                setShowModal(true);
              }}
            >
              <Text style={s.templateIcon}>💰</Text>
              <Text style={s.templateTitle}>Bill Reducer</Text>
              <Text style={s.templateDesc}>Save $10 in 30 days</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={s.templateCard}
              onPress={() => {
                setType('streak');
                setTitle('14-Day Eco Streak');
                setTarget('14');
                setDuration('14');
                setShowModal(true);
              }}
            >
              <Text style={s.templateIcon}>🔥</Text>
              <Text style={s.templateTitle}>Streak Master</Text>
              <Text style={s.templateDesc}>14-day streak</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </ScrollView>

      <TouchableOpacity onPress={() => setShowModal(true)}>
        <LinearGradient colors={['#00E676', '#00C853']} style={s.fab}>
          <Text style={s.fabText}>+ New Challenge</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Create Challenge Modal */}
      <Modal visible={showModal} animationType="slide" transparent={true}>
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Create Challenge</Text>
              <TouchableOpacity onPress={() => { setShowModal(false); resetForm(); }}>
                <Text style={s.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={s.modalBody}>
              <Text style={s.label}>Challenge Title*</Text>
              <TextInput
                style={s.input}
                value={title}
                onChangeText={setTitle}
                placeholder="e.g., Save 20 kWh this week"
                placeholderTextColor={Colors.textMuted}
              />

              <Text style={s.label}>Description</Text>
              <TextInput
                style={[s.input, s.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Add details about this challenge..."
                placeholderTextColor={Colors.textMuted}
                multiline
                numberOfLines={2}
              />

              <Text style={s.label}>Challenge Type*</Text>
              <View style={s.typeSelector}>
                {(['energy', 'cost', 'streak', 'custom'] as const).map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[s.typeButton, type === t && s.typeButtonActive]}
                    onPress={() => setType(t)}
                  >
                    <Text style={[s.typeButtonText, type === t && s.typeButtonTextActive]}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={s.label}>Target ({getChallengeUnit(type)})*</Text>
              <TextInput
                style={s.input}
                value={target}
                onChangeText={setTarget}
                placeholder="e.g., 20"
                keyboardType="decimal-pad"
                placeholderTextColor={Colors.textMuted}
              />

              <Text style={s.label}>Duration (days)*</Text>
              <TextInput
                style={s.input}
                value={duration}
                onChangeText={setDuration}
                placeholder="7"
                keyboardType="number-pad"
                placeholderTextColor={Colors.textMuted}
              />
            </ScrollView>

            <View style={s.modalFooter}>
              <TouchableOpacity
                style={[s.modalButton, s.cancelButton]}
                onPress={() => { setShowModal(false); resetForm(); }}
              >
                <Text style={s.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={s.modalButton}
                onPress={handleCreateChallenge}
              >
                <LinearGradient
                  colors={['#00E676', '#00C853']}
                  style={s.createButton}
                >
                  <Text style={s.createButtonText}>Create</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
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
  content: {
    flex: 1,
  },
  section: {
    padding: Spacing.page,
  },
  sectionTitle: {
    ...Typography.h2,
    color: Colors.text,
    marginBottom: Spacing.lg,
  },
  challengeCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.card,
    padding: Spacing.page,
    marginBottom: Spacing.lg,
    ...Shadows.md,
  },
  completedCard: {
    backgroundColor: Colors.primarySoft,
    borderLeftWidth: 4,
    borderLeftColor: Colors.success,
  },
  completedBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: Colors.success,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.md,
  },
  completedBadgeText: {
    ...Typography.overline,
    color: '#fff',
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  challengeIcon: {
    fontSize: 40,
    marginRight: Spacing.lg,
  },
  challengeInfo: {
    flex: 1,
  },
  challengeTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  challengeType: {
    ...Typography.overline,
    color: Colors.primary,
  },
  completedDate: {
    ...Typography.bodySmall,
    color: Colors.success,
    fontWeight: '500',
  },
  challengeDescription: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  targetBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primarySoft,
    padding: Spacing.md,
    borderRadius: Radius.sm,
    marginBottom: Spacing.lg,
  },
  targetLabel: {
    ...Typography.label,
    color: Colors.primaryDark,
    marginRight: Spacing.sm,
  },
  targetValue: {
    ...Typography.statSmall,
    color: Colors.primaryDark,
  },
  progressContainer: {
    marginBottom: Spacing.lg,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  progressLabel: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  progressValue: {
    ...Typography.bodySmall,
    fontWeight: '600',
    color: Colors.text,
  },
  progressBar: {
    height: 10,
    backgroundColor: Colors.border,
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: Spacing.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 5,
  },
  progressPercentage: {
    ...Typography.label,
    color: Colors.primary,
    textAlign: 'right',
  },
  challengeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  timeLeft: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    backgroundColor: Colors.accentLight,
    borderRadius: Radius.md,
  },
  timeExpired: {
    backgroundColor: '#FEF2F2',
  },
  timeText: {
    ...Typography.bodySmall,
    color: Colors.info,
    fontWeight: '500',
  },
  timeExpiredText: {
    color: Colors.danger,
  },
  updateButton: {
    paddingHorizontal: Spacing.page,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
  },
  updateButtonText: {
    ...Typography.label,
    color: '#fff',
  },
  deleteButton: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
  },
  deleteButtonText: {
    ...Typography.label,
    color: Colors.danger,
  },
  deleteCompletedBtn: {
    marginTop: Spacing.md,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: Radius.sm,
    padding: Spacing.sm,
    alignItems: 'center',
  },
  deleteCompletedBtnText: {
    ...Typography.label,
    color: Colors.danger,
  },
  rewardBox: {
    marginTop: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.primarySoft,
    borderRadius: Radius.sm,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  rewardText: {
    ...Typography.bodySmall,
    color: Colors.primaryDeep,
    fontWeight: '500',
  },
  rewardEarned: {
    marginTop: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.card,
    borderRadius: Radius.sm,
  },
  rewardEarnedText: {
    ...Typography.label,
    color: Colors.success,
    textAlign: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
    marginTop: 60,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: Spacing.page,
  },
  emptyTitle: {
    ...Typography.h1,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  emptyText: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  templatesSection: {
    padding: Spacing.page,
    paddingTop: 0,
  },
  templatesTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.lg,
  },
  templateCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.card,
    padding: Spacing.lg,
    marginRight: Spacing.md,
    width: 140,
    ...Shadows.sm,
  },
  templateIcon: {
    fontSize: 32,
    marginBottom: Spacing.sm,
  },
  templateTitle: {
    ...Typography.label,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  templateDesc: {
    ...Typography.labelSmall,
    color: Colors.textSecondary,
    fontWeight: '400',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderRadius: Radius.pill,
    ...Shadows.lg,
  },
  fabText: {
    ...Typography.h3,
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.page,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    ...Typography.h2,
    color: Colors.text,
  },
  modalClose: {
    fontSize: 24,
    color: Colors.textMuted,
  },
  modalBody: {
    padding: Spacing.page,
  },
  label: {
    ...Typography.label,
    color: Colors.text,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    padding: Spacing.md,
    ...Typography.bodyMedium,
    color: Colors.text,
    backgroundColor: Colors.background,
  },
  textArea: {
    height: 60,
    textAlignVertical: 'top',
  },
  typeSelector: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: Radius.sm,
    backgroundColor: Colors.background,
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: Colors.primary,
  },
  typeButtonText: {
    ...Typography.label,
    color: Colors.textSecondary,
  },
  typeButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: Spacing.page,
    gap: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  modalButton: {
    flex: 1,
    borderRadius: Radius.sm,
    overflow: 'hidden',
  },
  cancelButton: {
    backgroundColor: Colors.background,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelButtonText: {
    ...Typography.h3,
    color: Colors.textSecondary,
  },
  createButton: {
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: Radius.sm,
  },
  createButtonText: {
    ...Typography.h3,
    color: '#fff',
  },
});

export default ChallengesScreen;
