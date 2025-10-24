import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { useEnergy } from '../context/EnergyContext';
import { Room, EnergyHotspot } from '../types';
import { calculateApplianceConsumption, formatEnergy, formatCost } from '../utils/energy';

const screenWidth = Dimensions.get('window').width;
const mapWidth = screenWidth - 40;
const mapHeight = 400;

const EnergyMapScreen = () => {
  const { appliances, settings, rooms, addRoom, updateRoom } = useEnergy();
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);

  // Calculate energy hotspots
  const calculateHotspots = (): EnergyHotspot[] => {
    if (!rooms || rooms.length === 0) {
      return [];
    }

    const totalConsumption = appliances.reduce(
      (sum, app) => sum + calculateApplianceConsumption(app, 1),
      0
    );

    return rooms.map((room) => {
      const roomAppliances = appliances.filter(a => room.appliances.includes(a.id));
      const consumption = roomAppliances.reduce(
        (sum, app) => sum + calculateApplianceConsumption(app, 1),
        0
      );
      const monthlyConsumption = consumption * 30;
      const cost = monthlyConsumption * settings.electricityRate;
      const percentage = totalConsumption > 0 ? (consumption / totalConsumption) * 100 : 0;

      // Color based on consumption level
      let color = '#4CAF50'; // Green - low
      if (percentage > 30) color = '#FF5722'; // Red - high
      else if (percentage > 15) color = '#FF9800'; // Orange - medium
      else if (percentage > 5) color = '#FFC107'; // Yellow - moderate

      return {
        roomId: room.id,
        roomName: room.name,
        totalConsumption: monthlyConsumption,
        totalCost: cost,
        percentage,
        color,
      };
    });
  };

  const hotspots = calculateHotspots();

  const handleAddRoom = () => {
    Alert.prompt(
      'Add Room',
      'Enter room name',
      (roomName) => {
        if (roomName && roomName.trim()) {
          const newRoom: Room = {
            id: `room-${Date.now()}`,
            name: roomName.trim(),
            appliances: [],
            position: { x: 50, y: 50 },
          };
          addRoom(newRoom);
        }
      }
    );
  };

  const handleRoomPress = (roomId: string) => {
    setSelectedRoom(roomId === selectedRoom ? null : roomId);
  };

  const getRoomAppliances = (roomId: string) => {
    const room = rooms?.find(r => r.id === roomId);
    if (!room) return [];
    return appliances.filter(a => room.appliances.includes(a.id));
  };

  if (!rooms || rooms.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>🗺️ Energy Map</Text>
          <Text style={styles.subtitle}>Visualize energy hotspots in your home</Text>
        </View>

        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🏠</Text>
          <Text style={styles.emptyTitle}>No Rooms Added</Text>
          <Text style={styles.emptyText}>
            Create rooms and assign appliances to see your energy map
          </Text>
          <TouchableOpacity style={styles.addButton} onPress={handleAddRoom}>
            <Text style={styles.addButtonText}>+ Add First Room</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🗺️ Energy Map</Text>
        <Text style={styles.subtitle}>Real-time energy hotspots</Text>
      </View>

      {/* Heat Map Legend */}
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Heat Map Legend:</Text>
        <View style={styles.legendItems}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#4CAF50' }]} />
            <Text style={styles.legendText}>Low (&lt;5%)</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#FFC107' }]} />
            <Text style={styles.legendText}>Moderate (5-15%)</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#FF9800' }]} />
            <Text style={styles.legendText}>Medium (15-30%)</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#FF5722' }]} />
            <Text style={styles.legendText}>High (&gt;30%)</Text>
          </View>
        </View>
      </View>

      {/* Energy Map Visualization */}
      <View style={styles.mapContainer}>
        <View style={styles.map}>
          {hotspots.map((hotspot) => {
            const room = rooms.find(r => r.id === hotspot.roomId);
            if (!room) return null;

            // Calculate size based on consumption percentage
            const size = Math.max(60, Math.min(120, 60 + (hotspot.percentage * 2)));

            return (
              <TouchableOpacity
                key={hotspot.roomId}
                style={[
                  styles.roomMarker,
                  {
                    backgroundColor: hotspot.color,
                    width: size,
                    height: size,
                    left: room.position.x,
                    top: room.position.y,
                    borderWidth: selectedRoom === hotspot.roomId ? 3 : 0,
                    borderColor: '#fff',
                  },
                ]}
                onPress={() => handleRoomPress(hotspot.roomId)}
              >
                <Text style={styles.roomName}>{hotspot.roomName}</Text>
                <Text style={styles.roomPercentage}>{hotspot.percentage.toFixed(0)}%</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Room Details */}
      {selectedRoom && (
        <View style={styles.detailsContainer}>
          {hotspots.filter(h => h.roomId === selectedRoom).map((hotspot) => {
            const roomAppliances = getRoomAppliances(hotspot.roomId);
            
            return (
              <View key={hotspot.roomId} style={styles.detailsCard}>
                <Text style={styles.detailsTitle}>📍 {hotspot.roomName}</Text>
                
                <View style={styles.statsRow}>
                  <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Monthly Energy</Text>
                    <Text style={styles.statValue}>{formatEnergy(hotspot.totalConsumption)}</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Monthly Cost</Text>
                    <Text style={styles.statValue}>{formatCost(hotspot.totalCost, settings.currency)}</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statLabel}>% of Total</Text>
                    <Text style={styles.statValue}>{hotspot.percentage.toFixed(1)}%</Text>
                  </View>
                </View>

                <Text style={styles.appliancesTitle}>Appliances in this room:</Text>
                {roomAppliances.length === 0 ? (
                  <Text style={styles.noAppliances}>No appliances assigned</Text>
                ) : (
                  roomAppliances.map((appliance) => {
                    const consumption = calculateApplianceConsumption(appliance, 1);
                    return (
                      <View key={appliance.id} style={styles.applianceItem}>
                        <Text style={styles.applianceName}>{appliance.name}</Text>
                        <Text style={styles.applianceConsumption}>
                          {formatEnergy(consumption * 30)}/mo
                        </Text>
                      </View>
                    );
                  })
                )}
              </View>
            );
          })}
        </View>
      )}

      {/* Hotspot Summary */}
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>🔥 Energy Hotspots Ranking</Text>
        {hotspots
          .sort((a, b) => b.percentage - a.percentage)
          .map((hotspot, index) => (
            <View key={hotspot.roomId} style={styles.hotspotItem}>
              <View style={styles.hotspotRank}>
                <Text style={styles.rankText}>
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
                </Text>
              </View>
              <View style={styles.hotspotInfo}>
                <Text style={styles.hotspotName}>{hotspot.roomName}</Text>
                <View style={styles.hotspotBar}>
                  <View
                    style={[
                      styles.hotspotBarFill,
                      { width: `${hotspot.percentage}%`, backgroundColor: hotspot.color },
                    ]}
                  />
                </View>
              </View>
              <Text style={styles.hotspotValue}>{hotspot.percentage.toFixed(1)}%</Text>
            </View>
          ))}
      </View>

      <TouchableOpacity style={styles.fab} onPress={handleAddRoom}>
        <Text style={styles.fabText}>+ Add Room</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2196F3',
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
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 100,
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
    marginBottom: 30,
  },
  addButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  legend: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 15,
    borderRadius: 10,
    elevation: 2,
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  legendItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 5,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  mapContainer: {
    margin: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 3,
    overflow: 'hidden',
  },
  map: {
    width: mapWidth,
    height: mapHeight,
    backgroundColor: '#f9f9f9',
    position: 'relative',
  },
  roomMarker: {
    position: 'absolute',
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  roomName: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  roomPercentage: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 2,
  },
  detailsContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  detailsCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    elevation: 2,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    marginBottom: 5,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  appliancesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  noAppliances: {
    fontSize: 13,
    color: '#999',
    fontStyle: 'italic',
  },
  applianceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  applianceName: {
    fontSize: 14,
    color: '#333',
  },
  applianceConsumption: {
    fontSize: 13,
    color: '#2196F3',
    fontWeight: '600',
  },
  summaryContainer: {
    backgroundColor: '#fff',
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 10,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  hotspotItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  hotspotRank: {
    width: 40,
  },
  rankText: {
    fontSize: 18,
  },
  hotspotInfo: {
    flex: 1,
    marginRight: 10,
  },
  hotspotName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  hotspotBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  hotspotBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  hotspotValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    width: 50,
    textAlign: 'right',
  },
  fab: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderRadius: 30,
    alignSelf: 'center',
    marginVertical: 20,
    elevation: 4,
  },
  fabText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EnergyMapScreen;
