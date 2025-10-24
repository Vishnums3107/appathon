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
} from 'react-native';
import { useEnergy } from '../context/EnergyContext';
import { formatEnergy, formatCost } from '../utils/energy';
import { format } from 'date-fns';

const CommunityGoalsScreen = () => {
  const { communityGoals, addCommunityGoal, updateCommunityGoal, settings } = useEnergy();
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
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🤝 Community Goals</Text>
        <Text style={styles.subtitle}>Save energy together</Text>
      </View>

      <ScrollView style={styles.content}>
        {communityGoals.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🌍</Text>
            <Text style={styles.emptyTitle}>No Community Goals Yet</Text>
            <Text style={styles.emptyText}>
              Create a goal and invite friends/family to save energy together
            </Text>
          </View>
        ) : (
          communityGoals.map((goal) => {
            const progress = (goal.currentEnergy / goal.targetEnergy) * 100;
            const daysLeft = Math.ceil(
              (new Date(goal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
            );

            return (
              <View key={goal.id} style={styles.goalCard}>
                <View style={styles.goalHeader}>
                  <View style={styles.goalTitleContainer}>
                    <Text style={styles.goalTitle}>{goal.title}</Text>
                    {goal.isAchieved && (
                      <View style={styles.achievedBadge}>
                        <Text style={styles.achievedText}>✅ Achieved!</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.creator}>by {goal.createdBy}</Text>
                </View>

                {goal.description ? (
                  <Text style={styles.goalDescription}>{goal.description}</Text>
                ) : null}

                <View style={styles.targetInfo}>
                  <Text style={styles.targetLabel}>Target:</Text>
                  <Text style={styles.targetValue}>
                    {formatEnergy(goal.targetEnergy)} to save
                  </Text>
                </View>

                <View style={styles.progressSection}>
                  <View style={styles.progressInfo}>
                    <Text style={styles.progressLabel}>Progress</Text>
                    <Text style={styles.progressValue}>
                      {formatEnergy(goal.currentEnergy)} / {formatEnergy(goal.targetEnergy)}
                    </Text>
                  </View>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${Math.min(progress, 100)}%`,
                          backgroundColor: goal.isAchieved ? '#4CAF50' : '#2196F3',
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.progressPercentage}>{progress.toFixed(0)}%</Text>
                </View>

                <View style={styles.participantsSection}>
                  <Text style={styles.participantsLabel}>
                    👥 {goal.participants.length} Participants
                  </Text>
                  <View style={styles.participantsList}>
                    {goal.participants.slice(0, 5).map((participant, index) => (
                      <View key={index} style={styles.participantChip}>
                        <Text style={styles.participantName}>{participant}</Text>
                      </View>
                    ))}
                    {goal.participants.length > 5 && (
                      <View style={styles.participantChip}>
                        <Text style={styles.participantName}>
                          +{goal.participants.length - 5} more
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                <View style={styles.goalFooter}>
                  <Text style={[styles.deadline, daysLeft < 7 && styles.deadlineUrgent]}>
                    ⏰ {daysLeft > 0 ? `${daysLeft} days left` : 'Expired'}
                  </Text>
                  {!goal.isAchieved && (
                    <TouchableOpacity
                      style={styles.contributeButton}
                      onPress={() => {
                        Alert.prompt(
                          'Contribute Energy Savings',
                          `How many kWh have you saved for "${goal.title}"?`,
                          (value) => {
                            const amount = parseFloat(value);
                            if (!isNaN(amount) && amount > 0) {
                              handleContribute(goal.id, amount);
                            }
                          },
                          'plain-text',
                          '',
                          'numeric'
                        );
                      }}
                    >
                      <Text style={styles.contributeButtonText}>+ Contribute</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={() => setShowModal(true)}>
        <Text style={styles.fabText}>+ Create Goal</Text>
      </TouchableOpacity>

      <Modal visible={showModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Community Goal</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.label}>Goal Title*</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="e.g., Save 100 kWh this month"
                placeholderTextColor="#999"
              />

              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Add more details about this goal..."
                placeholderTextColor="#999"
                multiline
                numberOfLines={3}
              />

              <Text style={styles.label}>Target Energy (kWh)*</Text>
              <TextInput
                style={styles.input}
                value={targetEnergy}
                onChangeText={setTargetEnergy}
                placeholder="100"
                keyboardType="decimal-pad"
                placeholderTextColor="#999"
              />

              <Text style={styles.label}>Participants (comma-separated)</Text>
              <TextInput
                style={styles.input}
                value={participants}
                onChangeText={setParticipants}
                placeholder="John, Sarah, Mike..."
                placeholderTextColor="#999"
              />

              <Text style={styles.hint}>
                Default deadline is 30 days from now
              </Text>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.createButton]}
                onPress={handleCreateGoal}
              >
                <Text style={styles.createButtonText}>Create Goal</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#673AB7',
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
  content: {
    flex: 1,
    padding: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 60,
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
  goalCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    elevation: 3,
  },
  goalHeader: {
    marginBottom: 12,
  },
  goalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  achievedBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  achievedText: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: '600',
  },
  creator: {
    fontSize: 12,
    color: '#999',
  },
  goalDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    lineHeight: 20,
  },
  targetInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#F3E5F5',
    borderRadius: 8,
  },
  targetLabel: {
    fontSize: 14,
    color: '#673AB7',
    fontWeight: '600',
    marginRight: 8,
  },
  targetValue: {
    fontSize: 16,
    color: '#673AB7',
    fontWeight: 'bold',
  },
  progressSection: {
    marginBottom: 15,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 13,
    color: '#666',
  },
  progressValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  progressBar: {
    height: 10,
    backgroundColor: '#E0E0E0',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 5,
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#673AB7',
    textAlign: 'right',
  },
  participantsSection: {
    marginBottom: 15,
  },
  participantsLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  participantsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  participantChip: {
    backgroundColor: '#E1BEE7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  participantName: {
    fontSize: 12,
    color: '#673AB7',
    fontWeight: '500',
  },
  goalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  deadline: {
    fontSize: 13,
    color: '#666',
  },
  deadlineUrgent: {
    color: '#F44336',
    fontWeight: '600',
  },
  contributeButton: {
    backgroundColor: '#673AB7',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  contributeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#673AB7',
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderRadius: 30,
    elevation: 6,
  },
  fabText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalClose: {
    fontSize: 24,
    color: '#999',
  },
  modalBody: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#333',
    backgroundColor: '#FAFAFA',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  hint: {
    fontSize: 12,
    color: '#999',
    marginTop: 15,
    fontStyle: 'italic',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  createButton: {
    backgroundColor: '#673AB7',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CommunityGoalsScreen;
