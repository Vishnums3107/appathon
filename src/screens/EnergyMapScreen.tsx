import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
  TextInput,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Colors, Typography, Spacing, Radius, Shadows } from '../theme';
import { useEnergy } from '../context/EnergyContext';
import { Room, EnergyHotspot } from '../types';
import { calculateApplianceConsumption, formatEnergy, formatCost } from '../utils/energy';

const screenWidth = Dimensions.get('window').width;
const mapWidth = screenWidth - 40;
const mapHeight = 400;

const EnergyMapScreen = () => {
  const { appliances, settings, rooms, addRoom, assignApplianceToRoom } = useEnergy();
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [showAddRoomModal, setShowAddRoomModal] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignRoomId, setAssignRoomId] = useState<string | null>(null);

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
      let color = Colors.success; // Green - low
      if (percentage > 30) color = Colors.danger; // Red - high
      else if (percentage > 15) color = Colors.warning; // Orange - medium
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
    setNewRoomName('');
    setShowAddRoomModal(true);
  };

  const confirmAddRoom = () => {
    if (newRoomName.trim()) {
      const roomCount = rooms?.length || 0;
      const positions = [
        { x: 50, y: 50 }, { x: 200, y: 50 }, { x: 50, y: 200 },
        { x: 200, y: 200 }, { x: 125, y: 125 }, { x: 50, y: 300 },
      ];
      const newRoom: Room = {
        id: `room-${Date.now()}`,
        name: newRoomName.trim(),
        appliances: [],
        position: positions[roomCount % positions.length],
      };
      addRoom(newRoom);
      setShowAddRoomModal(false);
    }
  };

  const handleAssignAppliance = (roomId: string) => {
    setAssignRoomId(roomId);
    setShowAssignModal(true);
  };

  const getUnassignedAppliances = () => {
    const assignedIds = new Set(rooms?.flatMap(r => r.appliances) || []);
    return appliances.filter(a => !assignedIds.has(a.id));
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
      <View style={s.container}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.dark} />
        <LinearGradient colors={['#0B1120', '#162032']} style={s.header}>
          <Text style={s.headerLabel}>ENERGY MAP</Text>
          <Text style={s.headerTitle}>Energy Map</Text>
        </LinearGradient>

        <View style={s.emptyContainer}>
          <Text style={s.emptyIcon}>🏠</Text>
          <Text style={s.emptyTitle}>No Rooms Added</Text>
          <Text style={s.emptyText}>
            Create rooms and assign appliances to see your energy map
          </Text>
          <TouchableOpacity onPress={handleAddRoom}>
            <LinearGradient colors={['#00E676', '#00C853']} style={s.addButton}>
              <Text style={s.addButtonText}>+ Add First Room</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.dark} />
      <LinearGradient colors={['#0B1120', '#162032']} style={s.header}>
        <Text style={s.headerLabel}>ENERGY MAP</Text>
        <Text style={s.headerTitle}>Energy Map</Text>
      </LinearGradient>

      {/* Heat Map Legend */}
      <View style={s.legend}>
        <Text style={s.legendTitle}>Heat Map Legend:</Text>
        <View style={s.legendItems}>
          <View style={s.legendItem}>
            <View style={[s.legendColor, { backgroundColor: Colors.success }]} />
            <Text style={s.legendText}>Low (&lt;5%)</Text>
          </View>
          <View style={s.legendItem}>
            <View style={[s.legendColor, s.legendColorModerate]} />
            <Text style={s.legendText}>Moderate (5-15%)</Text>
          </View>
          <View style={s.legendItem}>
            <View style={[s.legendColor, { backgroundColor: Colors.warning }]} />
            <Text style={s.legendText}>Medium (15-30%)</Text>
          </View>
          <View style={s.legendItem}>
            <View style={[s.legendColor, { backgroundColor: Colors.danger }]} />
            <Text style={s.legendText}>High (&gt;30%)</Text>
          </View>
        </View>
      </View>

      {/* Energy Map Visualization */}
      <View style={s.mapContainer}>
        <View style={s.map}>
          {hotspots.map((hotspot) => {
            const room = rooms.find(r => r.id === hotspot.roomId);
            if (!room) return null;

            // Calculate size based on consumption percentage
            const size = Math.max(60, Math.min(120, 60 + (hotspot.percentage * 2)));

            return (
              <TouchableOpacity
                key={hotspot.roomId}
                style={[
                  s.roomMarker,
                  {
                    backgroundColor: hotspot.color,
                    width: size,
                    height: size,
                    left: room.position.x,
                    top: room.position.y,
                  },
                  selectedRoom === hotspot.roomId && s.roomMarkerSelected,
                ]}
                onPress={() => handleRoomPress(hotspot.roomId)}
              >
                <Text style={s.roomName}>{hotspot.roomName}</Text>
                <Text style={s.roomPercentage}>{hotspot.percentage.toFixed(0)}%</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Room Details */}
      {selectedRoom && (
        <View style={s.detailsContainer}>
          {hotspots.filter(h => h.roomId === selectedRoom).map((hotspot) => {
            const roomAppliances = getRoomAppliances(hotspot.roomId);

            return (
              <View key={hotspot.roomId} style={s.detailsCard}>
                <Text style={s.detailsTitle}>📍 {hotspot.roomName}</Text>

                <View style={s.statsRow}>
                  <View style={s.statBox}>
                    <Text style={s.statLabel}>Monthly Energy</Text>
                    <Text style={s.statValue}>{formatEnergy(hotspot.totalConsumption)}</Text>
                  </View>
                  <View style={s.statBox}>
                    <Text style={s.statLabel}>Monthly Cost</Text>
                    <Text style={s.statValue}>{formatCost(hotspot.totalCost, settings.currency)}</Text>
                  </View>
                  <View style={s.statBox}>
                    <Text style={s.statLabel}>% of Total</Text>
                    <Text style={s.statValue}>{hotspot.percentage.toFixed(1)}%</Text>
                  </View>
                </View>

                <View style={s.appliancesHeaderRow}>
                  <Text style={s.appliancesTitle}>Appliances in this room:</Text>
                  <TouchableOpacity
                    onPress={() => handleAssignAppliance(hotspot.roomId)}
                  >
                    <LinearGradient
                      colors={['#00E676', '#00C853']}
                      style={s.assignButton}
                    >
                      <Text style={s.assignButtonText}>+ Assign</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
                {roomAppliances.length === 0 ? (
                  <Text style={s.noAppliances}>No appliances assigned. Tap "+ Assign" to add.</Text>
                ) : (
                  roomAppliances.map((appliance) => {
                    const consumption = calculateApplianceConsumption(appliance, 1);
                    return (
                      <View key={appliance.id} style={s.applianceItem}>
                        <Text style={s.applianceName}>{appliance.name}</Text>
                        <Text style={s.applianceConsumption}>
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
      <View style={s.summaryContainer}>
        <Text style={s.summaryTitle}>Energy Hotspots Ranking</Text>
        {hotspots
          .sort((a, b) => b.percentage - a.percentage)
          .map((hotspot, index) => (
            <View key={hotspot.roomId} style={s.hotspotItem}>
              <View style={s.hotspotRank}>
                <Text style={s.rankText}>
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
                </Text>
              </View>
              <View style={s.hotspotInfo}>
                <Text style={s.hotspotName}>{hotspot.roomName}</Text>
                <View style={s.hotspotBar}>
                  <View
                    style={[
                      s.hotspotBarFill,
                      { width: `${hotspot.percentage}%`, backgroundColor: hotspot.color },
                    ]}
                  />
                </View>
              </View>
              <Text style={s.hotspotValue}>{hotspot.percentage.toFixed(1)}%</Text>
            </View>
          ))}
      </View>

      <TouchableOpacity onPress={handleAddRoom} style={s.fabWrapper}>
        <LinearGradient colors={['#00E676', '#00C853']} style={s.fab}>
          <Text style={s.fabText}>+ Add Room</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Add Room Modal */}
      <Modal visible={showAddRoomModal} animationType="fade" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <Text style={s.modalTitle}>Add Room</Text>
            <TextInput
              style={s.modalInput}
              value={newRoomName}
              onChangeText={setNewRoomName}
              placeholder="Enter room name"
              placeholderTextColor={Colors.textMuted}
              autoFocus
            />
            <View style={s.modalButtons}>
              <TouchableOpacity style={s.modalCancel} onPress={() => setShowAddRoomModal(false)}>
                <Text style={s.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={confirmAddRoom}>
                <LinearGradient colors={['#00E676', '#00C853']} style={s.modalConfirm}>
                  <Text style={s.modalConfirmText}>Add</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Assign Appliance Modal */}
      <Modal visible={showAssignModal} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={[s.modalContent, s.assignModalContent]}>
            <Text style={s.modalTitle}>Assign Appliance</Text>
            <ScrollView>
              {getUnassignedAppliances().length === 0 ? (
                <Text style={s.noAppliances}>All appliances are assigned to rooms</Text>
              ) : (
                getUnassignedAppliances().map(appliance => (
                  <TouchableOpacity
                    key={appliance.id}
                    style={s.assignItem}
                    onPress={() => {
                      if (assignRoomId) {
                        assignApplianceToRoom(appliance.id, assignRoomId);
                      }
                      setShowAssignModal(false);
                    }}
                  >
                    <Text style={s.assignItemName}>{appliance.name}</Text>
                    <Text style={s.assignItemInfo}>{appliance.powerRating}W - {appliance.category}</Text>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
            <TouchableOpacity style={s.modalCancel} onPress={() => setShowAssignModal(false)}>
              <Text style={s.modalCancelText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingTop: 54,
    paddingBottom: 28,
    paddingHorizontal: Spacing.page,
    alignItems: 'center',
  },
  headerLabel: {
    ...Typography.overline,
    color: Colors.primary,
    marginBottom: 4,
  },
  headerTitle: {
    ...Typography.displaySmall,
    color: '#fff',
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
    marginBottom: Spacing.page,
  },
  emptyTitle: {
    ...Typography.h1,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  emptyText: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xxxl,
  },
  addButton: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: Radius.pill,
    ...Shadows.glow,
  },
  addButtonText: {
    ...Typography.h3,
    color: '#fff',
  },
  legend: {
    backgroundColor: Colors.card,
    margin: Spacing.page,
    padding: Spacing.lg,
    borderRadius: Radius.card,
    ...Shadows.sm,
  },
  legendTitle: {
    ...Typography.label,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  legendItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: Spacing.xs,
    marginRight: Spacing.xs,
  },
  legendColorModerate: { backgroundColor: '#FFC107' },
  legendText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  mapContainer: {
    marginHorizontal: Spacing.page,
    backgroundColor: Colors.card,
    borderRadius: Radius.card,
    ...Shadows.md,
    overflow: 'hidden',
  },
  map: {
    width: mapWidth,
    height: mapHeight,
    backgroundColor: Colors.background,
    position: 'relative',
  },
  roomMarker: {
    position: 'absolute',
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.md,
  },
  roomMarkerSelected: { borderWidth: 3, borderColor: '#fff' },
  roomName: {
    ...Typography.labelSmall,
    color: '#fff',
    textAlign: 'center',
  },
  roomPercentage: {
    ...Typography.statSmall,
    color: '#fff',
    marginTop: 2,
  },
  detailsContainer: {
    marginHorizontal: Spacing.page,
    marginTop: Spacing.page,
  },
  detailsCard: {
    backgroundColor: Colors.card,
    padding: Spacing.page,
    borderRadius: Radius.card,
    ...Shadows.md,
  },
  detailsTitle: {
    ...Typography.h2,
    color: Colors.text,
    marginBottom: Spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.page,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    ...Typography.labelSmall,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  statValue: {
    ...Typography.statSmall,
    color: Colors.primary,
  },
  appliancesHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  appliancesTitle: {
    ...Typography.label,
    color: Colors.text,
  },
  assignButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.card,
  },
  assignButtonText: {
    ...Typography.labelSmall,
    color: '#fff',
  },
  noAppliances: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
  applianceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  applianceName: {
    ...Typography.bodyMedium,
    color: Colors.text,
  },
  applianceConsumption: {
    ...Typography.label,
    color: Colors.primary,
  },
  summaryContainer: {
    backgroundColor: Colors.card,
    margin: Spacing.page,
    marginTop: Spacing.page,
    padding: Spacing.page,
    borderRadius: Radius.card,
    ...Shadows.md,
  },
  summaryTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.lg,
  },
  hotspotItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  hotspotRank: {
    width: 40,
  },
  rankText: {
    fontSize: 18,
  },
  hotspotInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  hotspotName: {
    ...Typography.label,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  hotspotBar: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: Spacing.xs,
    overflow: 'hidden',
  },
  hotspotBarFill: {
    height: '100%',
    borderRadius: Spacing.xs,
  },
  hotspotValue: {
    ...Typography.label,
    color: Colors.textSecondary,
    width: 50,
    textAlign: 'right',
  },
  fabWrapper: {
    alignSelf: 'center',
    marginVertical: Spacing.page,
  },
  fab: {
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderRadius: Radius.pill,
    ...Shadows.lg,
  },
  fabText: {
    ...Typography.h3,
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.card,
    borderRadius: Radius.card,
    padding: Spacing.page,
    width: '85%',
    ...Shadows.lg,
  },
  modalTitle: {
    ...Typography.h2,
    color: Colors.text,
    marginBottom: Spacing.lg,
  },
  assignModalContent: { maxHeight: '70%' },
  modalInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    padding: Spacing.md,
    ...Typography.bodyLarge,
    color: Colors.text,
    backgroundColor: Colors.background,
    marginBottom: Spacing.lg,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.md,
  },
  modalCancel: {
    paddingHorizontal: Spacing.page,
    paddingVertical: Spacing.md,
    borderRadius: Radius.sm,
    backgroundColor: Colors.background,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  modalCancelText: {
    ...Typography.h3,
    color: Colors.textSecondary,
  },
  modalConfirm: {
    paddingHorizontal: Spacing.page,
    paddingVertical: Spacing.md,
    borderRadius: Radius.sm,
  },
  modalConfirmText: {
    ...Typography.h3,
    color: '#fff',
  },
  assignItem: {
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  assignItemName: {
    ...Typography.h3,
    color: Colors.text,
  },
  assignItemInfo: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});

export default EnergyMapScreen;
