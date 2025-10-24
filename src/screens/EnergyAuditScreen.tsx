import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { useEnergy } from '../context/EnergyContext';
import { calculateApplianceConsumption, formatEnergy, formatCost, formatCO2 } from '../utils/energy';

const EnergyAuditScreen = () => {
  const { appliances, toggleAppliance, deleteAppliance, settings } = useEnergy();

  const sortedAppliances = [...appliances].sort((a, b) => {
    const consumptionA = calculateApplianceConsumption(a, 1);
    const consumptionB = calculateApplianceConsumption(b, 1);
    return consumptionB - consumptionA;
  });

  const handleDelete = (id: string) => {
    deleteAppliance(id);
  };

  if (appliances.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📊</Text>
        <Text style={styles.emptyTitle}>No Appliances Yet</Text>
        <Text style={styles.emptyText}>
          Add your appliances to see instant energy audit
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>⚡ Energy Audit</Text>
        <Text style={styles.subtitle}>
          Real-time consumption analysis
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>💡</Text>
          <Text style={styles.infoText}>
            Toggle appliances on/off to see impact. Top consumers listed first.
          </Text>
        </View>

        {sortedAppliances.map((appliance, index) => {
          const dailyConsumption = calculateApplianceConsumption(appliance, 1);
          const monthlyConsumption = dailyConsumption * 30;
          const dailyCost = dailyConsumption * settings.electricityRate;
          const monthlyCost = monthlyConsumption * settings.electricityRate;

          return (
            <View key={appliance.id} style={styles.applianceCard}>
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                  <Text style={styles.rank}>#{index + 1}</Text>
                  <View>
                    <Text style={styles.applianceName}>{appliance.name}</Text>
                    <Text style={styles.applianceCategory}>{appliance.category}</Text>
                  </View>
                </View>
                <Switch
                  value={appliance.isActive}
                  onValueChange={() => toggleAppliance(appliance.id)}
                  trackColor={{ false: '#ccc', true: '#81C784' }}
                  thumbColor={appliance.isActive ? '#4CAF50' : '#f4f3f4'}
                />
              </View>

              {appliance.isActive && (
                <>
                  <View style={styles.specs}>
                    <View style={styles.specItem}>
                      <Text style={styles.specLabel}>Power</Text>
                      <Text style={styles.specValue}>{appliance.powerRating}W</Text>
                    </View>
                    <View style={styles.specItem}>
                      <Text style={styles.specLabel}>Hours/Day</Text>
                      <Text style={styles.specValue}>{appliance.hoursPerDay}h</Text>
                    </View>
                    <View style={styles.specItem}>
                      <Text style={styles.specLabel}>Quantity</Text>
                      <Text style={styles.specValue}>{appliance.quantity}</Text>
                    </View>
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.consumption}>
                    <Text style={styles.sectionTitle}>Daily Consumption</Text>
                    <View style={styles.consumptionRow}>
                      <View style={styles.consumptionItem}>
                        <Text style={styles.consumptionLabel}>Energy</Text>
                        <Text style={styles.consumptionValue}>
                          {formatEnergy(dailyConsumption)}
                        </Text>
                      </View>
                      <View style={styles.consumptionItem}>
                        <Text style={styles.consumptionLabel}>Cost</Text>
                        <Text style={styles.consumptionValue}>
                          {formatCost(dailyCost, settings.currency)}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.sectionTitle}>Monthly Projection</Text>
                    <View style={styles.consumptionRow}>
                      <View style={styles.consumptionItem}>
                        <Text style={styles.consumptionLabel}>Energy</Text>
                        <Text style={styles.consumptionValue}>
                          {formatEnergy(monthlyConsumption)}
                        </Text>
                      </View>
                      <View style={styles.consumptionItem}>
                        <Text style={styles.consumptionLabel}>Cost</Text>
                        <Text style={styles.consumptionValue}>
                          {formatCost(monthlyCost, settings.currency)}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDelete(appliance.id)}
                  >
                    <Text style={styles.deleteButtonText}>🗑️ Remove</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#f5f5f5',
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  header: {
    padding: 20,
    backgroundColor: '#FF9800',
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
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
  },
  infoIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#E65100',
  },
  applianceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rank: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF9800',
    marginRight: 12,
    width: 40,
  },
  applianceName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  applianceCategory: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  specs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  specItem: {
    alignItems: 'center',
  },
  specLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  specValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 15,
  },
  consumption: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    marginTop: 8,
  },
  consumptionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  consumptionItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  consumptionLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  consumptionValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF9800',
  },
  deleteButton: {
    backgroundColor: '#FFEBEE',
    borderRadius: 6,
    padding: 10,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#C62828',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default EnergyAuditScreen;
