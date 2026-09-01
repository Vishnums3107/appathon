import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Switch, Alert, StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useEnergy } from '../context/EnergyContext';
import { Colors, Typography, Spacing, Radius, Shadows } from '../theme';

const SettingsScreen = () => {
  const { settings, updateSettings } = useEnergy();
  const [rate, setRate] = useState(settings.electricityRate.toString());
  const [currency, setCurrency] = useState(settings.currency);
  const [location, setLocation] = useState(settings.weatherLocation);
  const [co2Factor, setCo2Factor] = useState(settings.co2Factor.toString());

  useEffect(() => {
    setRate(settings.electricityRate.toString());
    setCurrency(settings.currency);
    setLocation(settings.weatherLocation);
    setCo2Factor(settings.co2Factor.toString());
  }, [settings.electricityRate, settings.currency, settings.weatherLocation, settings.co2Factor]);

  const handleSave = async () => {
    const parsedRate = Number.parseFloat(rate);
    const parsedCo2Factor = Number.parseFloat(co2Factor);
    if (!Number.isFinite(parsedRate) || parsedRate < 0) {
      Alert.alert('Check electricity rate', 'Enter a valid rate of zero or more per kWh.');
      return;
    }
    if (!Number.isFinite(parsedCo2Factor) || parsedCo2Factor < 0) {
      Alert.alert('Check CO2 factor', 'Enter a valid emission factor of zero or more.');
      return;
    }
    try {
      await updateSettings({
        electricityRate: parsedRate,
        currency: currency.trim() || '$',
        weatherLocation: location.trim() || 'New York',
        co2Factor: parsedCo2Factor,
      });
      Alert.alert('Saved', 'Settings updated successfully');
    } catch { Alert.alert('Error', 'Failed to save'); }
  };

  return (
    <ScrollView style={s.screen} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.dark} />
      <LinearGradient colors={['#0B1120', '#162032']} style={s.header}>
        <Text style={s.headerLabel}>SETTINGS</Text>
        <Text style={s.headerTitle}>Preferences</Text>
      </LinearGradient>

      <View style={s.body}>
        {/* Energy */}
        <Text style={s.secTitle}>Energy</Text>
        <View style={s.card}>
          <Text style={s.label}>Electricity Rate (per kWh)</Text>
          <TextInput style={s.input} value={rate} onChangeText={setRate}
            keyboardType="decimal-pad" placeholder="0.12" placeholderTextColor={Colors.textMuted} />
          <Text style={s.hint}>Your local rate for cost calculations</Text>
          <View style={s.divider} />
          <Text style={s.label}>Currency Symbol</Text>
          <TextInput style={s.input} value={currency} onChangeText={setCurrency}
            placeholder="$" maxLength={3} placeholderTextColor={Colors.textMuted} />
        </View>

        {/* Location */}
        <Text style={s.secTitle}>Location</Text>
        <View style={s.card}>
          <Text style={s.label}>Weather Location</Text>
          <TextInput style={s.input} value={location} onChangeText={setLocation}
            placeholder="New York" placeholderTextColor={Colors.textMuted} />
          <Text style={s.hint}>City name for weather-based tips</Text>
        </View>

        {/* Toggles */}
        <Text style={s.secTitle}>Preferences</Text>
        <View style={s.card}>
          {[
            { label: 'Notifications', desc: 'Reminders & alerts', key: 'notificationsEnabled' as const, icon: '🔔' },
            { label: 'Voice Tips', desc: 'Text-to-speech', key: 'voiceEnabled' as const, icon: '🔊' },
          ].map((t, i) => (
            <View key={t.key}>
              {i > 0 && <View style={s.divider} />}
              <View style={s.switchRow}>
                <Text style={s.switchIcon}>{t.icon}</Text>
                <View style={s.switchCopy}>
                  <Text style={s.switchLabel}>{t.label}</Text>
                  <Text style={s.switchDesc}>{t.desc}</Text>
                </View>
                <Switch value={settings[t.key]}
                  onValueChange={(v) => updateSettings({ [t.key]: v })}
                  trackColor={{ false: Colors.border, true: Colors.primaryLight }}
                  thumbColor={settings[t.key] ? Colors.primary : '#ccc'} />
              </View>
            </View>
          ))}
        </View>

        {/* CO2 */}
        <Text style={s.secTitle}>Environmental</Text>
        <View style={s.card}>
          <Text style={s.label}>CO₂ Emission Factor (kg/kWh)</Text>
          <TextInput style={s.input} value={co2Factor} onChangeText={setCo2Factor}
            keyboardType="decimal-pad" placeholder="0.92" placeholderTextColor={Colors.textMuted} />
          <Text style={s.hint}>Used in every impact and CO₂ calculation</Text>
        </View>

        {/* Save */}
        <TouchableOpacity onPress={handleSave} activeOpacity={0.85}>
          <LinearGradient colors={['#00E676', '#00C853']} style={s.saveBtn}>
            <Text style={s.saveTxt}>Save Settings</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* About */}
        <View style={[s.card, s.aboutSection]}>
          <Text style={s.aboutTitle}>SaveVolt</Text>
          <Text style={s.aboutBody}>Version 1.0.0{'\n'}Track, analyze, and reduce your energy.</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  header: { paddingTop: 54, paddingBottom: 28, paddingHorizontal: Spacing.page, alignItems: 'center' },
  headerLabel: { ...Typography.overline, color: Colors.primary, marginBottom: 4 },
  headerTitle: { ...Typography.displaySmall, color: '#fff' },
  body: { padding: Spacing.page },
  secTitle: { ...Typography.label, color: Colors.textSecondary, marginTop: 20, marginBottom: 10, letterSpacing: 0.5 },
  card: { backgroundColor: Colors.card, borderRadius: Radius.card, padding: Spacing.lg, ...Shadows.sm },
  aboutSection: { alignItems: 'center', marginBottom: 40 },
  label: { ...Typography.label, color: Colors.textSecondary, marginBottom: 6 },
  input: { backgroundColor: Colors.background, borderRadius: Radius.sm, padding: 14, ...Typography.bodyLarge, color: Colors.text, borderWidth: 1, borderColor: Colors.border },
  hint: { ...Typography.bodySmall, color: Colors.textMuted, marginTop: 4 },
  divider: { height: 1, backgroundColor: Colors.divider, marginVertical: 16 },
  switchRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  switchIcon: { fontSize: 20, marginRight: 12 },
  switchCopy: { flex: 1 },
  switchLabel: { ...Typography.h3, color: Colors.text },
  switchDesc: { ...Typography.bodySmall, color: Colors.textMuted, marginTop: 1 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  infoLabel: { ...Typography.label, color: Colors.textSecondary },
  infoVal: { ...Typography.statSmall, color: Colors.primary },
  saveBtn: { borderRadius: Radius.md, paddingVertical: 16, alignItems: 'center', marginTop: 24 },
  saveTxt: { ...Typography.h3, color: Colors.dark },
  aboutTitle: { ...Typography.h2, color: Colors.text, marginBottom: 8 },
  aboutBody: { ...Typography.bodySmall, color: Colors.textMuted, textAlign: 'center', lineHeight: 18 },
});

export default SettingsScreen;
