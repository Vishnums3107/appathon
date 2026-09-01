import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
  Alert, ActivityIndicator, StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useEnergy } from '../context/EnergyContext';
import { ApplianceCategory } from '../types';
import { getDefaultAppliances, validateAppliance } from '../utils/energy';
import { Colors, Typography, Spacing, Radius, Shadows } from '../theme';

const CATEGORY_ICONS: Record<string, string> = {
  Lighting: '💡', Cooling: '❄️', Heating: '🔥', Kitchen: '🍳',
  Entertainment: '📺', Laundry: '👕', Office: '💻', Other: '🔌',
};

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
    const data = {
      name: name.trim(), powerRating: parseFloat(powerRating),
      hoursPerDay: parseFloat(hoursPerDay), quantity: parseInt(quantity, 10),
      category, isActive: true,
    };
    const errors = validateAppliance(data);
    if (errors.length > 0) { Alert.alert('Validation Error', errors.join('\n')); return; }
    setIsSubmitting(true);
    try {
      await addAppliance(data);
      Alert.alert('Added!', `${data.name} is now being tracked.`);
      setName(''); setPowerRating(''); setHoursPerDay(''); setQuantity('1');
      setCategory(ApplianceCategory.OTHER);
    } catch { Alert.alert('Error', 'Failed to add appliance'); }
    finally { setIsSubmitting(false); }
  };

  const handlePresetSelect = (preset: any) => {
    setName(preset.name); setPowerRating(preset.powerRating.toString());
    setCategory(preset.category); setShowPresets(false);
  };

  return (
    <ScrollView style={s.screen} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.dark} />

      <LinearGradient colors={['#0B1120', '#162032']} style={s.header}>
        <Text style={s.headerLabel}>ADD APPLIANCE</Text>
        <Text style={s.headerTitle}>Track New Device</Text>
        <Text style={s.headerSub}>Enter details to start monitoring energy usage</Text>
      </LinearGradient>

      <View style={s.body}>
        <View style={s.trackingStatus}>
          <Text style={s.trackingStatusValue}>{appliances.length}</Text>
          <Text style={s.trackingStatusText}>{appliances.length === 1 ? 'appliance currently tracked' : 'appliances currently tracked'}</Text>
        </View>
        {/* Presets toggle */}
        <TouchableOpacity
          style={s.presetToggle}
          onPress={() => setShowPresets(!showPresets)}
          activeOpacity={0.8}
        >
          <Text style={s.presetToggleIcon}>⚡</Text>
          <Text style={s.presetToggleText}>
            {showPresets ? 'Hide Quick Presets' : 'Use Quick Presets'}
          </Text>
        </TouchableOpacity>

        {showPresets && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.presetScroll}>
            {presets.map((p, i) => (
              <TouchableOpacity key={i} style={s.presetChip} onPress={() => handlePresetSelect(p)} activeOpacity={0.7}>
                <Text style={s.presetIcon}>{CATEGORY_ICONS[p.category] || '🔌'}</Text>
                <Text style={s.presetName}>{p.name}</Text>
                <Text style={s.presetWatt}>{p.powerRating}W</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Form */}
        <View style={s.formCard}>
          <Text style={s.label}>Appliance Name</Text>
          <TextInput style={s.input} value={name} onChangeText={setName}
            placeholder="e.g., Air Conditioner" placeholderTextColor={Colors.textMuted} />

          <Text style={s.label}>Power Rating (Watts)</Text>
          <TextInput style={s.input} value={powerRating} onChangeText={setPowerRating}
            keyboardType="decimal-pad" placeholder="e.g., 1500" placeholderTextColor={Colors.textMuted} />

          <Text style={s.label}>Hours Used Per Day</Text>
          <TextInput style={s.input} value={hoursPerDay} onChangeText={setHoursPerDay}
            keyboardType="decimal-pad" placeholder="e.g., 8" placeholderTextColor={Colors.textMuted} />

          <Text style={s.label}>Quantity</Text>
          <TextInput style={s.input} value={quantity} onChangeText={setQuantity}
            keyboardType="number-pad" placeholder="1" placeholderTextColor={Colors.textMuted} />

          <Text style={s.label}>Category</Text>
          <View style={s.catGrid}>
            {categories.map((c) => (
              <TouchableOpacity
                key={c}
                style={[s.catChip, category === c && s.catChipActive]}
                onPress={() => setCategory(c)}
                activeOpacity={0.7}
              >
                <Text style={s.catIcon}>{CATEGORY_ICONS[c] || '🔌'}</Text>
                <Text style={[s.catLabel, category === c && s.catLabelActive]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Submit */}
        <TouchableOpacity onPress={handleSubmit} disabled={isSubmitting} activeOpacity={0.85}>
          <LinearGradient colors={['#00E676', '#00C853']} style={s.submitBtn}>
            {isSubmitting ? (
              <ActivityIndicator color={Colors.dark} />
            ) : (
              <Text style={s.submitText}>Add Appliance</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },

  header: { paddingTop: 54, paddingBottom: 28, paddingHorizontal: Spacing.page, alignItems: 'center' },
  headerLabel: { ...Typography.overline, color: Colors.primary, marginBottom: 4 },
  headerTitle: { ...Typography.displaySmall, color: '#fff', marginBottom: 6 },
  headerSub: { ...Typography.bodySmall, color: Colors.textOnDarkSub, textAlign: 'center' },

  body: { padding: Spacing.page, marginTop: -10 },
  trackingStatus: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center', marginBottom: 16 },
  trackingStatusValue: { ...Typography.statSmall, color: Colors.primary, marginRight: 6 },
  trackingStatusText: { ...Typography.bodySmall, color: Colors.textMuted },

  presetToggle: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.card, borderRadius: Radius.pill, paddingVertical: 12,
    marginBottom: 16, ...Shadows.sm,
  },
  presetToggleIcon: { fontSize: 18, marginRight: 8 },
  presetToggleText: { ...Typography.label, color: Colors.primary },
  presetScroll: { marginBottom: 16 },
  presetChip: {
    backgroundColor: Colors.card, borderRadius: Radius.md, padding: 14,
    marginRight: 10, alignItems: 'center', width: 100, ...Shadows.sm,
  },
  presetIcon: { fontSize: 28, marginBottom: 6 },
  presetName: { ...Typography.labelSmall, color: Colors.text, textAlign: 'center' },
  presetWatt: { ...Typography.bodySmall, color: Colors.textMuted, marginTop: 2 },

  formCard: {
    backgroundColor: Colors.card, borderRadius: Radius.card, padding: Spacing.xl, ...Shadows.md,
  },
  label: { ...Typography.label, color: Colors.textSecondary, marginBottom: 6, marginTop: 16 },
  input: {
    backgroundColor: Colors.background, borderRadius: Radius.sm, padding: 14,
    ...Typography.bodyLarge, color: Colors.text, borderWidth: 1, borderColor: Colors.border,
  },

  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  catChip: {
    paddingVertical: 10, paddingHorizontal: 14, borderRadius: Radius.pill,
    borderWidth: 1.5, borderColor: Colors.border, flexDirection: 'row', alignItems: 'center',
  },
  catChipActive: { borderColor: Colors.primary, backgroundColor: Colors.primarySoft },
  catIcon: { fontSize: 16, marginRight: 6 },
  catLabel: { ...Typography.labelSmall, color: Colors.textSecondary },
  catLabelActive: { color: Colors.primaryDark },

  submitBtn: {
    borderRadius: Radius.md, paddingVertical: 16, alignItems: 'center',
    marginTop: 24, marginBottom: 30,
  },
  submitText: { ...Typography.h3, color: Colors.dark },
});

export default UsageInputScreen;
