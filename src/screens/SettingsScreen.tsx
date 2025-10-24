import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useEnergy } from '../context/EnergyContext';

const SettingsScreen = () => {
  const { settings, updateSettings } = useEnergy();
  const [electricityRate, setElectricityRate] = useState(settings.electricityRate.toString());
  const [currency, setCurrency] = useState(settings.currency);
  const [weatherLocation, setWeatherLocation] = useState(settings.weatherLocation);

  const handleSave = async () => {
    try {
      await updateSettings({
        electricityRate: parseFloat(electricityRate),
        currency,
        weatherLocation,
      });
      Alert.alert('Success', 'Settings saved successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save settings');
    }
  };

  const handleToggleNotifications = async (value: boolean) => {
    await updateSettings({ notificationsEnabled: value });
  };

  const handleToggleDarkMode = async (value: boolean) => {
    await updateSettings({ darkMode: value });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>⚙️ Settings</Text>
        <Text style={styles.subtitle}>Customize your energy tracking</Text>
      </View>

      <View style={styles.content}>
        {/* Energy Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ Energy Settings</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Electricity Rate (per kWh)</Text>
            <TextInput
              style={styles.input}
              value={electricityRate}
              onChangeText={setElectricityRate}
              keyboardType="decimal-pad"
              placeholder="0.12"
              placeholderTextColor="#999"
            />
            <Text style={styles.hint}>Your local electricity rate for cost calculations</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Currency Symbol</Text>
            <TextInput
              style={styles.input}
              value={currency}
              onChangeText={setCurrency}
              placeholder="$"
              maxLength={3}
              placeholderTextColor="#999"
            />
          </View>
        </View>

        {/* Location Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📍 Location</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Weather Location</Text>
            <TextInput
              style={styles.input}
              value={weatherLocation}
              onChangeText={setWeatherLocation}
              placeholder="New York"
              placeholderTextColor="#999"
            />
            <Text style={styles.hint}>City name for weather-based tips</Text>
          </View>
        </View>

        {/* App Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📱 App Preferences</Text>

          <View style={styles.switchRow}>
            <View style={styles.switchInfo}>
              <Text style={styles.switchLabel}>🔔 Notifications</Text>
              <Text style={styles.switchHint}>Get reminders and alerts</Text>
            </View>
            <Switch
              value={settings.notificationsEnabled}
              onValueChange={handleToggleNotifications}
              trackColor={{ false: '#ccc', true: '#81C784' }}
              thumbColor={settings.notificationsEnabled ? '#4CAF50' : '#f4f3f4'}
            />
          </View>

          <View style={styles.switchRow}>
            <View style={styles.switchInfo}>
              <Text style={styles.switchLabel}>🌙 Dark Mode</Text>
              <Text style={styles.switchHint}>Enable dark theme (coming soon)</Text>
            </View>
            <Switch
              value={settings.darkMode}
              onValueChange={handleToggleDarkMode}
              trackColor={{ false: '#ccc', true: '#81C784' }}
              thumbColor={settings.darkMode ? '#4CAF50' : '#f4f3f4'}
              disabled
            />
          </View>
        </View>

        {/* Environmental Factors */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🌍 Environmental Factors</Text>

          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>CO₂ Factor</Text>
            <Text style={styles.infoValue}>{settings.co2Factor} kg CO₂ per kWh</Text>
            <Text style={styles.infoHint}>Average grid emission factor (USA)</Text>
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>💾 Save Settings</Text>
        </TouchableOpacity>

        {/* About */}
        <View style={styles.aboutSection}>
          <Text style={styles.aboutTitle}>About Energy Tracker</Text>
          <Text style={styles.aboutText}>
            Version 1.0.0{'\n'}
            Track, analyze, and reduce your energy consumption with smart insights and personalized tips.
          </Text>
          <Text style={styles.aboutCopyright}>© 2025 Energy Tracker App</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#607D8B',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  content: {
    padding: 15,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    color: '#333',
  },
  hint: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  switchInfo: {
    flex: 1,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  switchHint: {
    fontSize: 13,
    color: '#666',
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 5,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  infoHint: {
    fontSize: 12,
    color: '#666',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  aboutSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
    marginBottom: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  aboutTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  aboutText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 15,
  },
  aboutCopyright: {
    fontSize: 12,
    color: '#999',
  },
});

export default SettingsScreen;
