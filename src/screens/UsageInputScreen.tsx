import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useEnergy } from '../context/EnergyContext';
import { ApplianceCategory } from '../types';
import { getDefaultAppliances, validateAppliance } from '../utils/energy';

const UsageInputScreen = () => {
  const { addAppliance, appliances } = useEnergy();
  const [name, setName] = useState('');
  const [powerRating, setPowerRating] = useState('');
  const [hoursPerDay, setHoursPerDay] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [category, setCategory] = useState<ApplianceCategory>(ApplianceCategory.OTHER);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPresets, setShowPresets] = useState(false);

  const categories = Object.values(ApplianceCategory);
  const presets = getDefaultAppliances();

  const handleSubmit = async () => {
    const applianceData = {
      name: name.trim(),
      powerRating: parseFloat(powerRating),
      hoursPerDay: parseFloat(hoursPerDay),
      quantity: parseInt(quantity, 10),
      category,
      isActive: true,
    };

    const errors = validateAppliance(applianceData);
    if (errors.length > 0) {
      Alert.alert('Validation Error', errors.join('\n'));
      return;
    }

    setIsSubmitting(true);
    try {
      await addAppliance(applianceData);
      Alert.alert('Success', 'Appliance added successfully!');
      
      // Reset form
      setName('');
      setPowerRating('');
      setHoursPerDay('');
      setQuantity('1');
      setCategory(ApplianceCategory.OTHER);
    } catch (error) {
      Alert.alert('Error', 'Failed to add appliance');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePresetSelect = (preset: any) => {
    setName(preset.name);
    setPowerRating(preset.powerRating.toString());
    setCategory(preset.category);
    setShowPresets(false);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Add Appliance</Text>
        <Text style={styles.subtitle}>
          Enter your appliance details to track energy usage
        </Text>
      </View>

      <View style={styles.form}>
        {/* Appliance Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Appliance Name *</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, styles.flex1]}
              placeholder="e.g., Living Room Light"
              value={name}
              onChangeText={setName}
              placeholderTextColor="#999"
            />
            <TouchableOpacity
              style={styles.presetButton}
              onPress={() => setShowPresets(!showPresets)}
            >
              <Text style={styles.presetButtonText}>📋</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Presets */}
        {showPresets && (
          <View style={styles.presetsContainer}>
            <Text style={styles.presetsTitle}>Quick Select:</Text>
            <View style={styles.presetsGrid}>
              {presets.map((preset, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.presetChip}
                  onPress={() => handlePresetSelect(preset)}
                >
                  <Text style={styles.presetChipText}>{preset.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Power Rating */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Power Rating (Watts) *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 60"
            value={powerRating}
            onChangeText={setPowerRating}
            keyboardType="numeric"
            placeholderTextColor="#999"
          />
          <Text style={styles.hint}>
            💡 Tip: Check the label on your appliance
          </Text>
        </View>

        {/* Hours Per Day */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Hours of Use Per Day *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 5"
            value={hoursPerDay}
            onChangeText={setHoursPerDay}
            keyboardType="numeric"
            placeholderTextColor="#999"
          />
          <Text style={styles.hint}>Average daily usage (0-24 hours)</Text>
        </View>

        {/* Quantity */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Quantity *</Text>
          <TextInput
            style={styles.input}
            placeholder="1"
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="numeric"
            placeholderTextColor="#999"
          />
        </View>

        {/* Category */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.categoryContainer}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryChip,
                    category === cat && styles.categoryChipActive,
                  ]}
                  onPress={() => setCategory(cat)}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      category === cat && styles.categoryChipTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Add Appliance</Text>
          )}
        </TouchableOpacity>

        {/* Summary */}
        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>Current Appliances: {appliances.length}</Text>
          <Text style={styles.summaryText}>
            ✅ All data is automatically saved
          </Text>
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
    backgroundColor: '#4CAF50',
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
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flex1: {
    flex: 1,
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
    marginTop: 4,
  },
  presetButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  presetButtonText: {
    fontSize: 20,
  },
  presetsContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  presetsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  presetChip: {
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    margin: 4,
  },
  presetChipText: {
    fontSize: 13,
    color: '#333',
  },
  categoryContainer: {
    flexDirection: 'row',
    paddingVertical: 5,
  },
  categoryChip: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 10,
    borderWidth: 2,
    borderColor: '#ddd',
  },
  categoryChipActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: '#fff',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  summary: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 4,
  },
  summaryText: {
    fontSize: 14,
    color: '#4CAF50',
  },
});

export default UsageInputScreen;
