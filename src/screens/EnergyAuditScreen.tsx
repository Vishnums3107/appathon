import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useEnergy } from '../context/EnergyContext';
import { calculateApplianceConsumption, formatEnergy, formatCost } from '../utils/energy';
import { Colors, Typography, Spacing, Radius, Shadows } from '../theme';

const EnergyAuditScreen = ({ navigation }: any) => {
  const { appliances, toggleAppliance, deleteAppliance, settings } = useEnergy();
  const sorted = [...appliances].sort((a, b) =>
    calculateApplianceConsumption(b, 1) - calculateApplianceConsumption(a, 1));
  const totalDailyConsumption = sorted.reduce((sum, appliance) => sum + calculateApplianceConsumption(appliance, 1), 0);

  const handleDelete = (id: string, name: string) =>
    Alert.alert('Remove Appliance', `Remove "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => deleteAppliance(id) },
    ]);

  if (appliances.length === 0) {
    return (
      <View style={s.emptyWrap}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
        <View style={s.emptyGlow} />
        <Text style={s.emptyIcon}>📊</Text>
        <Text style={s.emptyTitle}>No Appliances Yet</Text>
        <Text style={s.emptyBody}>Add your appliances to see an instant energy audit</Text>
        <TouchableOpacity style={s.emptyAction} onPress={() => navigation.navigate('AddAppliance')} activeOpacity={0.85}>
          <Text style={s.emptyActionText}>Add an appliance</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={s.screen} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.dark} />
      <LinearGradient colors={['#0B1120', '#162032']} style={s.header}>
        <Text style={s.headerLabel}>ENERGY AUDIT</Text>
        <Text style={s.headerTitle}>Live Analysis</Text>
        <Text style={s.headerSub}>Toggle appliances to see real-time impact</Text>
      </LinearGradient>
      <View style={s.body}>
        {sorted.map((appliance, index) => {
          const daily = calculateApplianceConsumption(appliance, 1);
          const monthly = daily * 30;
          const dailyCost = daily * settings.electricityRate;
          const monthlyCost = monthly * settings.electricityRate;
          const share = totalDailyConsumption > 0 ? (daily / totalDailyConsumption) * 100 : 0;
          const priority = share >= 40 ? 'High impact' : share >= 20 ? 'Medium impact' : 'Low impact';
          const priorityStyle = share >= 40 ? s.highPriority : share >= 20 ? s.mediumPriority : s.lowPriority;
          return (
            <View key={appliance.id} style={s.card}>
              <View style={s.cardTop}>
                <View style={s.cardLeft}>
                  <View style={[s.rank, index === 0 && s.rankFirst]}>
                    <Text style={[s.rankTxt, index === 0 && s.rankTxtFirst]}>{index + 1}</Text>
                  </View>
                  <View style={s.nameWrap}>
                    <Text style={s.name}>{appliance.name}</Text>
                    <View style={s.categoryRow}>
                      <Text style={s.cat}>{appliance.category}</Text>
                      <View style={[s.priorityBadge, priorityStyle]}><Text style={s.priorityText}>{priority}</Text></View>
                    </View>
                  </View>
                </View>
                <Switch value={appliance.isActive} onValueChange={() => toggleAppliance(appliance.id)}
                  trackColor={{ false: Colors.border, true: Colors.primaryLight }}
                  thumbColor={appliance.isActive ? Colors.primary : '#ccc'} />
              </View>
              {appliance.isActive && (
                <>
                  <View style={s.specStrip}>
                    {[{ l: 'Power', v: `${appliance.powerRating}W` }, { l: 'Hours', v: `${appliance.hoursPerDay}h` }, { l: 'Qty', v: `${appliance.quantity}` }].map(sp => (
                      <View key={sp.l} style={s.specItem}>
                        <Text style={s.specVal}>{sp.v}</Text>
                        <Text style={s.specLbl}>{sp.l}</Text>
                      </View>
                    ))}
                  </View>
                  <View style={s.consumGrid}>
                    <View style={s.consumCol}>
                      <Text style={s.consumTitle}>DAILY</Text>
                      <Text style={s.consumVal}>{formatEnergy(daily)}</Text>
                      <Text style={s.consumCost}>{formatCost(dailyCost, settings.currency)}</Text>
                    </View>
                    <View style={s.consumDiv} />
                    <View style={s.consumCol}>
                      <Text style={s.consumTitle}>MONTHLY</Text>
                      <Text style={s.consumVal}>{formatEnergy(monthly)}</Text>
                      <Text style={s.consumCost}>{formatCost(monthlyCost, settings.currency)}</Text>
                    </View>
                  </View>
                  <TouchableOpacity style={s.delBtn} onPress={() => handleDelete(appliance.id, appliance.name)}>
                    <Text style={s.delTxt}>Remove Appliance</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
};

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  emptyWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background, padding: 40 },
  emptyGlow: { position: 'absolute', width: 180, height: 180, borderRadius: 90, backgroundColor: Colors.primaryLight, opacity: 0.3 },
  emptyIcon: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { ...Typography.h1, color: Colors.text, marginBottom: 8 },
  emptyBody: { ...Typography.bodyMedium, color: Colors.textSecondary, textAlign: 'center' },
  emptyAction: { marginTop: 22, backgroundColor: Colors.dark, borderRadius: Radius.pill, paddingHorizontal: 20, paddingVertical: 12 },
  emptyActionText: { ...Typography.label, color: Colors.primary },
  header: { paddingTop: 54, paddingBottom: 28, paddingHorizontal: Spacing.page, alignItems: 'center' },
  headerLabel: { ...Typography.overline, color: Colors.primary, marginBottom: 4 },
  headerTitle: { ...Typography.displaySmall, color: '#fff', marginBottom: 6 },
  headerSub: { ...Typography.bodySmall, color: Colors.textOnDarkSub },
  body: { padding: Spacing.page },
  card: { backgroundColor: Colors.card, borderRadius: Radius.card, padding: Spacing.lg, marginBottom: 14, ...Shadows.md },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  rank: { width: 30, height: 30, borderRadius: 15, backgroundColor: Colors.borderLight, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  rankFirst: { backgroundColor: Colors.primary },
  rankTxt: { ...Typography.labelSmall, color: Colors.textSecondary },
  rankTxtFirst: { color: Colors.dark },
  nameWrap: { flex: 1 },
  name: { ...Typography.h3, color: Colors.text },
  categoryRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 2 },
  cat: { ...Typography.bodySmall, color: Colors.textMuted },
  priorityBadge: { borderRadius: Radius.pill, paddingHorizontal: 7, paddingVertical: 2 },
  highPriority: { backgroundColor: '#FEE2E2' },
  mediumPriority: { backgroundColor: '#FEF3C7' },
  lowPriority: { backgroundColor: Colors.primarySoft },
  priorityText: { ...Typography.labelSmall, color: Colors.textSecondary, fontSize: 9 },
  specStrip: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: Colors.background, borderRadius: Radius.sm, paddingVertical: 12, marginTop: 14 },
  specItem: { alignItems: 'center' },
  specVal: { ...Typography.statSmall, color: Colors.text },
  specLbl: { ...Typography.labelSmall, color: Colors.textMuted, marginTop: 2 },
  consumGrid: { flexDirection: 'row', marginTop: 14, backgroundColor: Colors.background, borderRadius: Radius.sm, overflow: 'hidden' },
  consumCol: { flex: 1, alignItems: 'center', paddingVertical: 14 },
  consumDiv: { width: 1, backgroundColor: Colors.border },
  consumTitle: { ...Typography.overline, color: Colors.textMuted, marginBottom: 6 },
  consumVal: { ...Typography.stat, color: Colors.primary },
  consumCost: { ...Typography.bodySmall, color: Colors.textSecondary, marginTop: 2 },
  delBtn: { marginTop: 14, borderRadius: Radius.sm, paddingVertical: 10, alignItems: 'center', backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA' },
  delTxt: { ...Typography.label, color: Colors.danger },
});

export default EnergyAuditScreen;
