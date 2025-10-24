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
import { format, addDays } from 'date-fns';

const ChallengesScreen = () => {
  const { challenges, addChallenge, updateChallenge, completeChallenge } = useEnergy();
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

    const durationDays = parseInt(duration);
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

  const getChallengeIcon = (type: string) => {
    switch (type) {
      case 'energy': return '⚡';
      case 'cost': return '💰';
      case 'streak': return '🔥';
      default: return '🎯';
    }
  };

  const getChallengeUnit = (type: string) => {
    switch (type) {
      case 'energy': return 'kWh';
      case 'cost': return '$';
      case 'streak': return 'days';
      default: return 'points';
    }
  };

  const activeChallenges = challenges.filter(c => !c.isCompleted);
  const completedChallenges = challenges.filter(c => c.isCompleted);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🎯 Energy Challenges</Text>
        <Text style={styles.subtitle}>Create and track your challenges</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Active Challenges */}
        {activeChallenges.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Active Challenges</Text>
            {activeChallenges.map((challenge) => {
              const progress = (challenge.currentProgress / challenge.target) * 100;
              const daysLeft = Math.ceil(
                (new Date(challenge.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
              );
              const isExpired = daysLeft < 0;

              return (
                <View key={challenge.id} style={styles.challengeCard}>
                  <View style={styles.challengeHeader}>
                    <Text style={styles.challengeIcon}>{getChallengeIcon(challenge.type)}</Text>
                    <View style={styles.challengeInfo}>
                      <Text style={styles.challengeTitle}>{challenge.title}</Text>
                      <Text style={styles.challengeType}>{challenge.type.toUpperCase()}</Text>
                    </View>
                  </View>

                  {challenge.description ? (
                    <Text style={styles.challengeDescription}>{challenge.description}</Text>
                  ) : null}

                  <View style={styles.targetBox}>
                    <Text style={styles.targetLabel}>Target:</Text>
                    <Text style={styles.targetValue}>
                      {challenge.target} {getChallengeUnit(challenge.type)}
                    </Text>
                  </View>

                  <View style={styles.progressContainer}>
                    <View style={styles.progressHeader}>
                      <Text style={styles.progressLabel}>Progress</Text>
                      <Text style={styles.progressValue}>
                        {challenge.currentProgress.toFixed(1)} / {challenge.target} {getChallengeUnit(challenge.type)}
                      </Text>
                    </View>
                    <View style={styles.progressBar}>
                      <View
                        style={[
                          styles.progressFill,
                          { width: `${Math.min(progress, 100)}%` },
                        ]}
                      />
                    </View>
                    <Text style={styles.progressPercentage}>{progress.toFixed(0)}%</Text>
                  </View>

                  <View style={styles.challengeFooter}>
                    <View style={[styles.timeLeft, isExpired && styles.timeExpired]}>
                      <Text style={[styles.timeText, isExpired && styles.timeExpiredText]}>
                        ⏰ {isExpired ? 'Expired' : `${daysLeft} days left`}
                      </Text>
                    </View>
                    {!isExpired && (
                      <TouchableOpacity
                        style={styles.updateButton}
                        onPress={() => {
                          Alert.prompt(
                            'Update Progress',
                            `How much progress have you made? (${getChallengeUnit(challenge.type)})`,
                            (value) => {
                              const amount = parseFloat(value);
                              if (!isNaN(amount) && amount > 0) {
                                handleProgressUpdate(challenge.id, amount);
                              }
                            },
                            'plain-text',
                            '',
                            'numeric'
                          );
                        }}
                      >
                        <Text style={styles.updateButtonText}>+ Update</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {challenge.reward && (
                    <View style={styles.rewardBox}>
                      <Text style={styles.rewardText}>🏆 Reward: {challenge.reward}</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* Completed Challenges */}
        {completedChallenges.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Completed ✅</Text>
            {completedChallenges.map((challenge) => (
              <View key={challenge.id} style={[styles.challengeCard, styles.completedCard]}>
                <View style={styles.completedBadge}>
                  <Text style={styles.completedBadgeText}>✅ COMPLETED</Text>
                </View>
                <View style={styles.challengeHeader}>
                  <Text style={styles.challengeIcon}>{getChallengeIcon(challenge.type)}</Text>
                  <View style={styles.challengeInfo}>
                    <Text style={styles.challengeTitle}>{challenge.title}</Text>
                    <Text style={styles.completedDate}>
                      Completed {format(new Date(challenge.endDate), 'MMM dd, yyyy')}
                    </Text>
                  </View>
                </View>
                {challenge.reward && (
                  <View style={styles.rewardEarned}>
                    <Text style={styles.rewardEarnedText}>🏆 {challenge.reward}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Empty State */}
        {challenges.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🎯</Text>
            <Text style={styles.emptyTitle}>No Challenges Yet</Text>
            <Text style={styles.emptyText}>
              Create your first challenge and start achieving energy-saving goals!
            </Text>
          </View>
        )}

        {/* Challenge Templates */}
        <View style={styles.templatesSection}>
          <Text style={styles.templatesTitle}>Quick Challenge Templates</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={styles.templateCard}
              onPress={() => {
                setType('energy');
                setTitle('Save 10 kWh in a Week');
                setTarget('10');
                setDuration('7');
                setShowModal(true);
              }}
            >
              <Text style={styles.templateIcon}>⚡</Text>
              <Text style={styles.templateTitle}>Energy Saver</Text>
              <Text style={styles.templateDesc}>Save 10 kWh in 7 days</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.templateCard}
              onPress={() => {
                setType('cost');
                setTitle('Reduce Bill by $10');
                setTarget('10');
                setDuration('30');
                setShowModal(true);
              }}
            >
              <Text style={styles.templateIcon}>💰</Text>
              <Text style={styles.templateTitle}>Bill Reducer</Text>
              <Text style={styles.templateDesc}>Save $10 in 30 days</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.templateCard}
              onPress={() => {
                setType('streak');
                setTitle('14-Day Eco Streak');
                setTarget('14');
                setDuration('14');
                setShowModal(true);
              }}
            >
              <Text style={styles.templateIcon}>🔥</Text>
              <Text style={styles.templateTitle}>Streak Master</Text>
              <Text style={styles.templateDesc}>14-day streak</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={() => setShowModal(true)}>
        <Text style={styles.fabText}>+ New Challenge</Text>
      </TouchableOpacity>

      {/* Create Challenge Modal */}
      <Modal visible={showModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Challenge</Text>
              <TouchableOpacity onPress={() => { setShowModal(false); resetForm(); }}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.label}>Challenge Title*</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="e.g., Save 20 kWh this week"
                placeholderTextColor="#999"
              />

              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Add details about this challenge..."
                placeholderTextColor="#999"
                multiline
                numberOfLines={2}
              />

              <Text style={styles.label}>Challenge Type*</Text>
              <View style={styles.typeSelector}>
                {(['energy', 'cost', 'streak', 'custom'] as const).map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.typeButton, type === t && styles.typeButtonActive]}
                    onPress={() => setType(t)}
                  >
                    <Text style={[styles.typeButtonText, type === t && styles.typeButtonTextActive]}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Target ({getChallengeUnit(type)})*</Text>
              <TextInput
                style={styles.input}
                value={target}
                onChangeText={setTarget}
                placeholder="e.g., 20"
                keyboardType="decimal-pad"
                placeholderTextColor="#999"
              />

              <Text style={styles.label}>Duration (days)*</Text>
              <TextInput
                style={styles.input}
                value={duration}
                onChangeText={setDuration}
                placeholder="7"
                keyboardType="number-pad"
                placeholderTextColor="#999"
              />
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => { setShowModal(false); resetForm(); }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.createButton]}
                onPress={handleCreateChallenge}
              >
                <Text style={styles.createButtonText}>Create</Text>
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
    backgroundColor: '#FF5722',
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
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  challengeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    elevation: 3,
  },
  completedCard: {
    backgroundColor: '#E8F5E9',
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  completedBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  completedBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  challengeIcon: {
    fontSize: 40,
    marginRight: 15,
  },
  challengeInfo: {
    flex: 1,
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  challengeType: {
    fontSize: 11,
    color: '#FF5722',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  completedDate: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
  challengeDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
    lineHeight: 18,
  },
  targetBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  targetLabel: {
    fontSize: 13,
    color: '#FF9800',
    fontWeight: '600',
    marginRight: 8,
  },
  targetValue: {
    fontSize: 16,
    color: '#FF9800',
    fontWeight: 'bold',
  },
  progressContainer: {
    marginBottom: 15,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
    color: '#666',
  },
  progressValue: {
    fontSize: 12,
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
    backgroundColor: '#FF5722',
    borderRadius: 5,
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF5722',
    textAlign: 'right',
  },
  challengeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  timeLeft: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
  },
  timeExpired: {
    backgroundColor: '#FFEBEE',
  },
  timeText: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: '500',
  },
  timeExpiredText: {
    color: '#F44336',
  },
  updateButton: {
    backgroundColor: '#FF5722',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  rewardBox: {
    marginTop: 12,
    padding: 10,
    backgroundColor: '#FFF9C4',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#FBC02D',
  },
  rewardText: {
    fontSize: 12,
    color: '#F57F17',
    fontWeight: '500',
  },
  rewardEarned: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  rewardEarnedText: {
    fontSize: 13,
    color: '#4CAF50',
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
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
  templatesSection: {
    padding: 20,
    paddingTop: 0,
  },
  templatesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  templateCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginRight: 12,
    width: 140,
    elevation: 2,
  },
  templateIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  templateTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  templateDesc: {
    fontSize: 11,
    color: '#666',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#FF5722',
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
    maxHeight: '80%',
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
    marginTop: 12,
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
    height: 60,
    textAlignVertical: 'top',
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: '#FF5722',
  },
  typeButtonText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  typeButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
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
    backgroundColor: '#FF5722',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ChallengesScreen;
