import React, { useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useEnergy } from '../context/EnergyContext';
import { Colors, Radius, Shadows, Spacing, Typography } from '../theme';

const DAYS = [
  { label: 'S', value: 0 },
  { label: 'M', value: 1 },
  { label: 'T', value: 2 },
  { label: 'W', value: 3 },
  { label: 'T', value: 4 },
  { label: 'F', value: 5 },
  { label: 'S', value: 6 },
];

const formatSchedule = (days: number[]) => {
  if (days.length === 7) return 'Every day';
  if (days.length === 0) return 'No days selected';
  return days.map((day) => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day]).join(', ');
};

const RemindersScreen = () => {
  const { appliances, reminders, settings, addReminder, updateReminder, deleteReminder } = useEnergy();
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [time, setTime] = useState('20:00');
  const [days, setDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [applianceId, setApplianceId] = useState<string | undefined>();

  const activeCount = useMemo(() => reminders.filter((reminder) => reminder.isActive).length, [reminders]);

  const resetForm = () => {
    setTitle('');
    setMessage('');
    setTime('20:00');
    setDays([0, 1, 2, 3, 4, 5, 6]);
    setApplianceId(undefined);
  };

  const toggleDay = (day: number) => {
    setDays((current) => current.includes(day) ? current.filter((item) => item !== day) : [...current, day].sort());
  };

  const createReminder = async () => {
    if (!title.trim()) {
      Alert.alert('Add a title', 'Give this reminder a short, clear name.');
      return;
    }
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) {
      Alert.alert('Check the time', 'Use 24-hour time in the format HH:MM, for example 20:00.');
      return;
    }
    if (days.length === 0) {
      Alert.alert('Choose a day', 'Select at least one day for this reminder.');
      return;
    }

    await addReminder({
      title: title.trim(),
      message: message.trim() || `Time to check ${title.trim().toLowerCase()}.`,
      time,
      days,
      isActive: true,
      applianceId,
    });
    resetForm();
    setShowModal(false);
    Alert.alert('Reminder saved', settings.notificationsEnabled
      ? 'Your reminder is active in SaveVolt.'
      : 'Your reminder is saved. Turn on notifications in Settings to receive alerts.');
  };

  const removeReminder = (id: string, reminderTitle: string) => {
    Alert.alert('Delete reminder', `Remove “${reminderTitle}”?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteReminder(id) },
    ]);
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.dark} />
      <LinearGradient colors={[Colors.dark, '#162032']} style={styles.header}>
        <Text style={styles.eyebrow}>ROUTINES & ALERTS</Text>
        <Text style={styles.heading}>Reminders</Text>
        <Text style={styles.headerCopy}>Small prompts that keep energy-saving habits on track.</Text>
      </LinearGradient>

      <View style={styles.summaryCard}>
        <View>
          <Text style={styles.summaryValue}>{activeCount}</Text>
          <Text style={styles.summaryLabel}>active reminders</Text>
        </View>
        <TouchableOpacity style={styles.newButton} onPress={() => setShowModal(true)} activeOpacity={0.85}>
          <Text style={styles.newButtonText}>+ New reminder</Text>
        </TouchableOpacity>
      </View>

      {!settings.notificationsEnabled && (
        <View style={styles.notice}>
          <Text style={styles.noticeTitle}>Notifications are turned off</Text>
          <Text style={styles.noticeText}>Your reminders are saved, but alerts will stay muted until you enable notifications in Settings.</Text>
        </View>
      )}

      <View style={styles.list}>
        {reminders.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No reminders yet</Text>
            <Text style={styles.emptyText}>Create one for lights, cooling, appliance checks, or any energy-saving routine.</Text>
          </View>
        ) : reminders.map((reminder) => {
          const appliance = appliances.find((item) => item.id === reminder.applianceId);
          return (
            <View key={reminder.id} style={[styles.reminderCard, !reminder.isActive && styles.reminderInactive]}>
              <View style={styles.reminderHeader}>
                <View style={styles.timeBadge}><Text style={styles.timeText}>{reminder.time}</Text></View>
                <View style={styles.reminderInfo}>
                  <Text style={styles.reminderTitle}>{reminder.title}</Text>
                  <Text style={styles.reminderSchedule}>{formatSchedule(reminder.days)}</Text>
                </View>
                <Switch
                  value={reminder.isActive}
                  onValueChange={(value) => updateReminder(reminder.id, { isActive: value })}
                  trackColor={{ false: Colors.border, true: Colors.primaryLight }}
                  thumbColor={reminder.isActive ? Colors.primary : '#CBD5E1'}
                />
              </View>
              <Text style={styles.reminderMessage}>{reminder.message}</Text>
              <View style={styles.reminderFooter}>
                <Text style={styles.applianceText}>{appliance ? `For ${appliance.name}` : 'General energy routine'}</Text>
                <TouchableOpacity onPress={() => removeReminder(reminder.id, reminder.title)} hitSlop={8}>
                  <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </View>

      <Modal visible={showModal} transparent animationType="slide" onRequestClose={() => setShowModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>New reminder</Text>
                <Text style={styles.modalSubtitle}>Create a repeatable energy-saving prompt.</Text>
              </View>
              <TouchableOpacity onPress={() => { resetForm(); setShowModal(false); }} hitSlop={10}>
                <Text style={styles.closeText}>Close</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <Text style={styles.fieldLabel}>Title</Text>
              <TextInput value={title} onChangeText={setTitle} style={styles.input} placeholder="e.g., Switch off the living room" placeholderTextColor={Colors.textMuted} />
              <Text style={styles.fieldLabel}>Message (optional)</Text>
              <TextInput value={message} onChangeText={setMessage} style={[styles.input, styles.messageInput]} multiline placeholder="What should SaveVolt remind you to do?" placeholderTextColor={Colors.textMuted} />
              <Text style={styles.fieldLabel}>Time (24-hour)</Text>
              <TextInput value={time} onChangeText={setTime} style={styles.input} keyboardType="numbers-and-punctuation" maxLength={5} placeholder="20:00" placeholderTextColor={Colors.textMuted} />

              <Text style={styles.fieldLabel}>Repeat on</Text>
              <View style={styles.daysRow}>
                {DAYS.map((day, index) => {
                  const active = days.includes(day.value);
                  return (
                    <TouchableOpacity key={`${day.value}-${index}`} onPress={() => toggleDay(day.value)} style={[styles.dayButton, active && styles.dayButtonActive]}>
                      <Text style={[styles.dayText, active && styles.dayTextActive]}>{day.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {appliances.length > 0 && (
                <>
                  <Text style={styles.fieldLabel}>Appliance (optional)</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.applianceScroll}>
                    <TouchableOpacity onPress={() => setApplianceId(undefined)} style={[styles.applianceChip, !applianceId && styles.applianceChipActive]}>
                      <Text style={[styles.applianceChipText, !applianceId && styles.applianceChipTextActive]}>General</Text>
                    </TouchableOpacity>
                    {appliances.map((appliance) => (
                      <TouchableOpacity key={appliance.id} onPress={() => setApplianceId(appliance.id)} style={[styles.applianceChip, applianceId === appliance.id && styles.applianceChipActive]}>
                        <Text style={[styles.applianceChipText, applianceId === appliance.id && styles.applianceChipTextActive]}>{appliance.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </>
              )}

              <TouchableOpacity activeOpacity={0.85} onPress={createReminder}>
                <LinearGradient colors={[Colors.primary, Colors.primaryDark]} style={styles.saveButton}>
                  <Text style={styles.saveButtonText}>Save reminder</Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: 36 },
  header: { paddingTop: 56, paddingBottom: 35, paddingHorizontal: Spacing.page },
  eyebrow: { ...Typography.overline, color: Colors.primary, marginBottom: 5 },
  heading: { ...Typography.displaySmall, color: Colors.textOnDark, marginBottom: 6 },
  headerCopy: { ...Typography.bodyMedium, color: Colors.textOnDarkSub, maxWidth: 310, lineHeight: 20 },
  summaryCard: { marginHorizontal: Spacing.page, marginTop: -18, padding: 18, backgroundColor: Colors.card, borderRadius: Radius.card, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', ...Shadows.md },
  summaryValue: { ...Typography.stat, color: Colors.primary },
  summaryLabel: { ...Typography.bodySmall, color: Colors.textMuted, marginTop: 2 },
  newButton: { backgroundColor: Colors.dark, borderRadius: Radius.pill, paddingHorizontal: 14, paddingVertical: 10 },
  newButtonText: { ...Typography.labelSmall, color: Colors.primary },
  notice: { marginHorizontal: Spacing.page, marginTop: 16, borderRadius: Radius.md, padding: 14, backgroundColor: '#FEF3C7' },
  noticeTitle: { ...Typography.label, color: '#92400E', marginBottom: 3 },
  noticeText: { ...Typography.bodySmall, color: '#92400E', lineHeight: 17 },
  list: { paddingHorizontal: Spacing.page, marginTop: 20 },
  emptyState: { alignItems: 'center', backgroundColor: Colors.card, borderRadius: Radius.card, paddingHorizontal: 26, paddingVertical: 34, ...Shadows.sm },
  emptyTitle: { ...Typography.h3, color: Colors.text, marginBottom: 5 },
  emptyText: { ...Typography.bodySmall, color: Colors.textSecondary, textAlign: 'center', lineHeight: 18 },
  reminderCard: { backgroundColor: Colors.card, borderRadius: Radius.card, padding: 16, marginBottom: 12, ...Shadows.sm },
  reminderInactive: { opacity: 0.58 },
  reminderHeader: { flexDirection: 'row', alignItems: 'center' },
  timeBadge: { minWidth: 58, paddingHorizontal: 6, paddingVertical: 9, borderRadius: Radius.sm, backgroundColor: Colors.primarySoft, alignItems: 'center', marginRight: 11 },
  timeText: { ...Typography.label, color: Colors.primaryDark },
  reminderInfo: { flex: 1 },
  reminderTitle: { ...Typography.h3, color: Colors.text },
  reminderSchedule: { ...Typography.bodySmall, color: Colors.textMuted, marginTop: 2 },
  reminderMessage: { ...Typography.bodyMedium, color: Colors.textSecondary, marginTop: 14, lineHeight: 20 },
  reminderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 13, paddingTop: 11, borderTopWidth: 1, borderTopColor: Colors.divider },
  applianceText: { ...Typography.bodySmall, color: Colors.textMuted },
  deleteText: { ...Typography.labelSmall, color: Colors.danger },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(15,23,42,0.5)' },
  modal: { maxHeight: '88%', borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl, padding: Spacing.page, backgroundColor: Colors.card },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: 16, marginBottom: 22 },
  modalTitle: { ...Typography.h2, color: Colors.text },
  modalSubtitle: { ...Typography.bodySmall, color: Colors.textMuted, marginTop: 3 },
  closeText: { ...Typography.label, color: Colors.textSecondary },
  fieldLabel: { ...Typography.label, color: Colors.textSecondary, marginBottom: 7, marginTop: 14 },
  input: { borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.sm, backgroundColor: Colors.background, color: Colors.text, paddingHorizontal: 13, paddingVertical: 11, ...Typography.bodyMedium },
  messageInput: { minHeight: 70, textAlignVertical: 'top' },
  daysRow: { flexDirection: 'row', justifyContent: 'space-between' },
  dayButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.border },
  dayButtonActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  dayText: { ...Typography.labelSmall, color: Colors.textSecondary },
  dayTextActive: { color: Colors.dark },
  applianceScroll: { marginHorizontal: -Spacing.page, paddingHorizontal: Spacing.page },
  applianceChip: { borderRadius: Radius.pill, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 12, paddingVertical: 8, marginRight: 8, backgroundColor: Colors.background },
  applianceChipActive: { backgroundColor: Colors.primarySoft, borderColor: Colors.primary },
  applianceChipText: { ...Typography.labelSmall, color: Colors.textSecondary },
  applianceChipTextActive: { color: Colors.primaryDark },
  saveButton: { borderRadius: Radius.md, alignItems: 'center', marginTop: 26, marginBottom: 16, paddingVertical: 15 },
  saveButtonText: { ...Typography.h3, color: Colors.dark },
});

export default RemindersScreen;
