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
import { formatEnergy } from '../utils/energy';

const CommunityGoalsScreen = () => {
  const { communityGoals, addCommunityGoal, updateCommunityGoal } = useEnergy();
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetEnergy, setTargetEnergy] = useState('');
  const [participants, setParticipants] = useState('');

  const handleCreateGoal = async () => {
    if (!title.trim() || !targetEnergy) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const participantsList = participants
      .split(',')
      .map(p => p.trim())
      .filter(p => p.length > 0);

    await addCommunityGoal({
      title: title.trim(),
      description: description.trim(),
      targetEnergy: parseFloat(targetEnergy),
      participants: participantsList,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      createdBy: 'You',
    });

    setShowModal(false);
    setTitle('');
    setDescription('');
    setTargetEnergy('');
    setParticipants('');

    Alert.alert('Success', 'Community goal created successfully!');
  };

  const handleContribute = (goalId: string, amount: number) => {
    const goal = communityGoals.find(g => g.id === goalId);
    if (!goal) return;

    const newEnergy = Math.min(goal.currentEnergy + amount, goal.targetEnergy);
    const isAchieved = newEnergy >= goal.targetEnergy;

    updateCommunityGoal(goalId, {
      currentEnergy: newEnergy,
      isAchieved,
    });

    if (isAchieved && !goal.isAchieved) {
      Alert.alert('🎉 Goal Achieved!', `Congratulations! The community goal "${goal.title}" has been achieved!`);
    }
  };

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.dark} />
      <LinearGradient colors={['#0B1120', '#162032']} style={s.header}>
        <Text style={s.headerLabel}>SHARED PLANNING</Text>
        <Text style={s.headerTitle}>Shared Goal Planner</Text>
      </LinearGradient>

      <View style={s.localNotice}>
        <Text style={s.localNoticeText}>Goals and contributions are saved on this device. Share details manually until cloud collaboration is connected.</Text>
      </View>

      <ScrollView style={s.content}>
        {communityGoals.length === 0 ? (
          <View style={s.emptyContainer}>
            <Text style={s.emptyIcon}>🌍</Text>
            <Text style={s.emptyTitle}>No Community Goals Yet</Text>
            <Text style={s.emptyText}>
              Create a shared goal and record each contribution locally
            </Text>
          </View>
        ) : (
          communityGoals.map((goal) => {
            const progress = (goal.currentEnergy / goal.targetEnergy) * 100;
            const daysLeft = Math.ceil(
              (new Date(goal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
            );

            return (
              <View key={goal.id} style={s.goalCard}>
                <View style={s.goalHeader}>
                  <View style={s.goalTitleContainer}>
                    <Text style={s.goalTitle}>{goal.title}</Text>
                    {goal.isAchieved && (
                      <View style={s.achievedBadge}>
                        <Text style={s.achievedText}>Achieved!</Text>
                      </View>
                    )}
                  </View>
                  <Text style={s.creator}>by {goal.createdBy}</Text>
                </View>

                {goal.description ? (
                  <Text style={s.goalDescription}>{goal.description}</Text>
                ) : null}

                <View style={s.targetInfo}>
                  <Text style={s.targetLabel}>Target:</Text>
                  <Text style={s.targetValue}>
                    {formatEnergy(goal.targetEnergy)} to save
                  </Text>
                </View>

                <View style={s.progressSection}>
                  <View style={s.progressInfo}>
                    <Text style={s.progressLabel}>Progress</Text>
                    <Text style={s.progressValue}>
                      {formatEnergy(goal.currentEnergy)} / {formatEnergy(goal.targetEnergy)}
                    </Text>
                  </View>
                  <View style={s.progressBar}>
                    <View
                      style={[
                        s.progressFill,
                        {
                          width: `${Math.min(progress, 100)}%`,
                          backgroundColor: goal.isAchieved ? Colors.success : Colors.primary,
                        },
                      ]}
                    />
                  </View>
                  <Text style={s.progressPercentage}>{progress.toFixed(0)}%</Text>
                </View>

                <View style={s.participantsSection}>
                  <Text style={s.participantsLabel}>
                    👥 {goal.participants.length} Participants
                  </Text>
                  <View style={s.participantsList}>
                    {goal.participants.slice(0, 5).map((participant, index) => (
                      <View key={index} style={s.participantChip}>
                        <Text style={s.participantName}>{participant}</Text>
                      </View>
                    ))}
                    {goal.participants.length > 5 && (
                      <View style={s.participantChip}>
                        <Text style={s.participantName}>
                          +{goal.participants.length - 5} more
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                <View style={s.goalFooter}>
                  <Text style={[s.deadline, daysLeft < 7 && s.deadlineUrgent]}>
                    ⏰ {daysLeft > 0 ? `${daysLeft} days left` : 'Expired'}
                  </Text>
                  {!goal.isAchieved && (
                    <TouchableOpacity
                      onPress={() => {
                        Alert.alert(
                          'Contribute Energy Savings',
                          `Enter kWh saved for "${goal.title}"`,
                          [
                            { text: 'Cancel', style: 'cancel' },
                            { text: '+1 kWh', onPress: () => handleContribute(goal.id, 1) },
                            { text: '+5 kWh', onPress: () => handleContribute(goal.id, 5) },
                            { text: '+10 kWh', onPress: () => handleContribute(goal.id, 10) },
                          ]
                        );
                      }}
                    >
                      <LinearGradient
                        colors={['#00E676', '#00C853']}
                        style={s.contributeButton}
                      >
                        <Text style={s.contributeButtonText}>+ Contribute</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      <TouchableOpacity onPress={() => setShowModal(true)}>
        <LinearGradient colors={['#00E676', '#00C853']} style={s.fab}>
          <Text style={s.fabText}>+ Create Goal</Text>
        </LinearGradient>
      </TouchableOpacity>

      <Modal visible={showModal} animationType="slide" transparent={true}>
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Create Community Goal</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Text style={s.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={s.modalBody}>
              <Text style={s.label}>Goal Title*</Text>
              <TextInput
                style={s.input}
                value={title}
                onChangeText={setTitle}
                placeholder="e.g., Save 100 kWh this month"
                placeholderTextColor={Colors.textMuted}
              />

              <Text style={s.label}>Description</Text>
              <TextInput
                style={[s.input, s.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Add more details about this goal..."
                placeholderTextColor={Colors.textMuted}
                multiline
                numberOfLines={3}
              />

              <Text style={s.label}>Target Energy (kWh)*</Text>
              <TextInput
                style={s.input}
                value={targetEnergy}
                onChangeText={setTargetEnergy}
                placeholder="100"
                keyboardType="decimal-pad"
                placeholderTextColor={Colors.textMuted}
              />

              <Text style={s.label}>Participants (comma-separated)</Text>
              <TextInput
                style={s.input}
                value={participants}
                onChangeText={setParticipants}
                placeholder="John, Sarah, Mike..."
                placeholderTextColor={Colors.textMuted}
              />

              <Text style={s.hint}>
                Default deadline is 30 days from now
              </Text>
            </ScrollView>

            <View style={s.modalFooter}>
              <TouchableOpacity
                style={[s.modalButton, s.cancelButton]}
                onPress={() => setShowModal(false)}
              >
                <Text style={s.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={s.modalButton}
                onPress={handleCreateGoal}
              >
                <LinearGradient
                  colors={['#00E676', '#00C853']}
                  style={s.createButton}
                >
                  <Text style={s.createButtonText}>Create Goal</Text>
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
    padding: Spacing.page,
  },
  localNotice: {
    marginHorizontal: Spacing.page,
    marginTop: Spacing.page,
    backgroundColor: Colors.primarySoft,
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  localNoticeText: { ...Typography.bodySmall, color: Colors.primaryDark, lineHeight: 18 },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
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
  goalCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.card,
    padding: Spacing.page,
    marginBottom: Spacing.lg,
    ...Shadows.md,
  },
  goalHeader: {
    marginBottom: Spacing.md,
  },
  goalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  goalTitle: {
    ...Typography.h2,
    color: Colors.text,
    flex: 1,
  },
  achievedBadge: {
    backgroundColor: Colors.primarySoft,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.md,
  },
  achievedText: {
    ...Typography.labelSmall,
    color: Colors.success,
  },
  creator: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
  },
  goalDescription: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  targetInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.primarySoft,
    borderRadius: Radius.sm,
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
  progressSection: {
    marginBottom: Spacing.lg,
  },
  progressInfo: {
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
    borderRadius: 5,
  },
  progressPercentage: {
    ...Typography.statSmall,
    color: Colors.primary,
    textAlign: 'right',
  },
  participantsSection: {
    marginBottom: Spacing.lg,
  },
  participantsLabel: {
    ...Typography.label,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  participantsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  participantChip: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.card,
  },
  participantName: {
    ...Typography.bodySmall,
    color: Colors.primaryDeep,
    fontWeight: '500',
  },
  goalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  deadline: {
    ...Typography.label,
    color: Colors.textSecondary,
  },
  deadlineUrgent: {
    color: Colors.danger,
    fontWeight: '600',
  },
  contributeButton: {
    paddingHorizontal: Spacing.page,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
  },
  contributeButtonText: {
    ...Typography.label,
    color: '#fff',
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
    maxHeight: '90%',
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
    marginTop: Spacing.lg,
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
    height: 80,
    textAlignVertical: 'top',
  },
  hint: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    marginTop: Spacing.lg,
    fontStyle: 'italic',
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

export default CommunityGoalsScreen;
