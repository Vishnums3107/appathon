/**
 * Cloud Sync Service
 * Syncs data across multiple devices using Firebase Firestore
 */

import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appliance, Goal, Reminder, Achievement } from '../types';

export interface UserData {
  userId: string;
  email?: string;
  displayName?: string;
  createdAt: Date;
  lastSync: Date;
  deviceId: string;
}

export interface SyncStatus {
  isSyncing: boolean;
  lastSyncTime?: Date;
  syncError?: string;
  pendingChanges: number;
}

class CloudSyncService {
  private static instance: CloudSyncService;
  private userId: string | null = null;
  private deviceId: string = '';
  private syncStatus: SyncStatus = {
    isSyncing: false,
    pendingChanges: 0,
  };
  private syncListeners: ((status: SyncStatus) => void)[] = [];
  private unsubscribers: (() => void)[] = [];

  private constructor() {}

  public static getInstance(): CloudSyncService {
    if (!CloudSyncService.instance) {
      CloudSyncService.instance = new CloudSyncService();
    }
    return CloudSyncService.instance;
  }

  /**
   * Initialize cloud sync
   */
  public async initialize(userId: string): Promise<void> {
    try {
      this.userId = userId;
      this.deviceId = await this.getDeviceId();

      // Enable offline persistence
      await firestore().settings({
        persistence: true,
        cacheSizeBytes: firestore.CACHE_SIZE_UNLIMITED,
      });

      // Set up real-time listeners
      await this.setupRealtimeSync();

      console.log('Cloud sync initialized for user:', userId);
    } catch (error) {
      console.error('Failed to initialize cloud sync:', error);
      this.updateSyncStatus({ syncError: 'Initialization failed' });
    }
  }

  /**
   * Setup real-time sync listeners
   */
  private async setupRealtimeSync(): Promise<void> {
    if (!this.userId) return;

    const collections = ['appliances', 'goals', 'reminders', 'achievements', 'rooms', 'challenges'];

    collections.forEach((collection) => {
      const unsubscribe = firestore()
        .collection('users')
        .doc(this.userId!)
        .collection(collection)
        .onSnapshot(
          (snapshot) => {
            this.handleRealtimeUpdate(collection, snapshot);
          },
          (error) => {
            console.error(`Error listening to ${collection}:`, error);
          }
        );

      this.unsubscribers.push(unsubscribe);
    });
  }

  /**
   * Handle real-time updates from Firestore
   */
  private async handleRealtimeUpdate(collection: string, snapshot: any): Promise<void> {
    try {
      const changes = snapshot.docChanges();
      
      for (const change of changes) {
        const data = change.doc.data();
        const docId = change.doc.id;

        if (data.deviceId === this.deviceId) {
          // Skip changes from this device to avoid loops
          continue;
        }

        if (change.type === 'added' || change.type === 'modified') {
          await this.mergeRemoteData(collection, docId, data);
        } else if (change.type === 'removed') {
          await this.removeLocalData(collection, docId);
        }
      }

      this.updateSyncStatus({ lastSyncTime: new Date() });
    } catch (error) {
      console.error('Error handling real-time update:', error);
    }
  }

  /**
   * Sync appliances to cloud
   */
  public async syncAppliances(appliances: Appliance[]): Promise<void> {
    if (!this.userId) return;

    this.updateSyncStatus({ isSyncing: true });

    try {
      const batch = firestore().batch();
      const collectionRef = firestore()
        .collection('users')
        .doc(this.userId)
        .collection('appliances');

      appliances.forEach((appliance) => {
        const docRef = collectionRef.doc(appliance.id);
        batch.set(docRef, {
          ...appliance,
          deviceId: this.deviceId,
          syncedAt: firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
      });

      await batch.commit();
      this.updateSyncStatus({ isSyncing: false, lastSyncTime: new Date() });
    } catch (error) {
      console.error('Failed to sync appliances:', error);
      this.updateSyncStatus({ isSyncing: false, syncError: 'Sync failed' });
    }
  }

  /**
   * Sync goals to cloud
   */
  public async syncGoals(goals: Goal[]): Promise<void> {
    if (!this.userId) return;

    this.updateSyncStatus({ isSyncing: true });

    try {
      const batch = firestore().batch();
      const collectionRef = firestore()
        .collection('users')
        .doc(this.userId)
        .collection('goals');

      goals.forEach((goal) => {
        const docRef = collectionRef.doc(goal.id);
        batch.set(docRef, {
          ...goal,
          deviceId: this.deviceId,
          syncedAt: firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
      });

      await batch.commit();
      this.updateSyncStatus({ isSyncing: false, lastSyncTime: new Date() });
    } catch (error) {
      console.error('Failed to sync goals:', error);
      this.updateSyncStatus({ isSyncing: false, syncError: 'Sync failed' });
    }
  }

  /**
   * Sync reminders to cloud
   */
  public async syncReminders(reminders: Reminder[]): Promise<void> {
    if (!this.userId) return;

    this.updateSyncStatus({ isSyncing: true });

    try {
      const batch = firestore().batch();
      const collectionRef = firestore()
        .collection('users')
        .doc(this.userId)
        .collection('reminders');

      reminders.forEach((reminder) => {
        const docRef = collectionRef.doc(reminder.id);
        batch.set(docRef, {
          ...reminder,
          deviceId: this.deviceId,
          syncedAt: firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
      });

      await batch.commit();
      this.updateSyncStatus({ isSyncing: false, lastSyncTime: new Date() });
    } catch (error) {
      console.error('Failed to sync reminders:', error);
      this.updateSyncStatus({ isSyncing: false, syncError: 'Sync failed' });
    }
  }

  /**
   * Sync achievements to cloud
   */
  public async syncAchievements(achievements: Achievement[]): Promise<void> {
    if (!this.userId) return;

    this.updateSyncStatus({ isSyncing: true });

    try {
      const batch = firestore().batch();
      const collectionRef = firestore()
        .collection('users')
        .doc(this.userId)
        .collection('achievements');

      achievements.forEach((achievement) => {
        const docRef = collectionRef.doc(achievement.id);
        batch.set(docRef, {
          ...achievement,
          deviceId: this.deviceId,
          syncedAt: firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
      });

      await batch.commit();
      this.updateSyncStatus({ isSyncing: false, lastSyncTime: new Date() });
    } catch (error) {
      console.error('Failed to sync achievements:', error);
      this.updateSyncStatus({ isSyncing: false, syncError: 'Sync failed' });
    }
  }

  /**
   * Sync custom data to cloud
   */
  public async syncCustomData(collection: string, data: any[]): Promise<void> {
    if (!this.userId) return;

    this.updateSyncStatus({ isSyncing: true });

    try {
      const batch = firestore().batch();
      const collectionRef = firestore()
        .collection('users')
        .doc(this.userId)
        .collection(collection);

      data.forEach((item) => {
        const docRef = collectionRef.doc(item.id);
        batch.set(docRef, {
          ...item,
          deviceId: this.deviceId,
          syncedAt: firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
      });

      await batch.commit();
      this.updateSyncStatus({ isSyncing: false, lastSyncTime: new Date() });
    } catch (error) {
      console.error(`Failed to sync ${collection}:`, error);
      this.updateSyncStatus({ isSyncing: false, syncError: 'Sync failed' });
    }
  }

  /**
   * Fetch data from cloud
   */
  public async fetchFromCloud<T>(collection: string): Promise<T[]> {
    if (!this.userId) return [];

    try {
      const snapshot = await firestore()
        .collection('users')
        .doc(this.userId)
        .collection(collection)
        .get();

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as T[];
    } catch (error) {
      console.error(`Failed to fetch ${collection}:`, error);
      return [];
    }
  }

  /**
   * Delete item from cloud
   */
  public async deleteFromCloud(collection: string, itemId: string): Promise<void> {
    if (!this.userId) return;

    try {
      await firestore()
        .collection('users')
        .doc(this.userId)
        .collection(collection)
        .doc(itemId)
        .delete();
    } catch (error) {
      console.error(`Failed to delete from ${collection}:`, error);
    }
  }

  /**
   * Merge remote data with local data
   */
  private async mergeRemoteData(collection: string, docId: string, data: any): Promise<void> {
    try {
      const storageKey = `${collection}_data`;
      const stored = await AsyncStorage.getItem(storageKey);
      const localData = stored ? JSON.parse(stored) : [];

      // Check if item exists locally
      const existingIndex = localData.findIndex((item: any) => item.id === docId);

      if (existingIndex >= 0) {
        // Resolve conflict: use server timestamp if available
        const localItem = localData[existingIndex];
        const remoteTimestamp = data.syncedAt?.toDate?.() || new Date(data.syncedAt);
        const localTimestamp = new Date(localItem.syncedAt || 0);

        if (remoteTimestamp > localTimestamp) {
          // Remote is newer, update local
          localData[existingIndex] = { ...data, id: docId };
        }
      } else {
        // New item, add to local
        localData.push({ ...data, id: docId });
      }

      await AsyncStorage.setItem(storageKey, JSON.stringify(localData));
    } catch (error) {
      console.error('Error merging remote data:', error);
    }
  }

  /**
   * Remove local data
   */
  private async removeLocalData(collection: string, docId: string): Promise<void> {
    try {
      const storageKey = `${collection}_data`;
      const stored = await AsyncStorage.getItem(storageKey);
      const localData = stored ? JSON.parse(stored) : [];

      const filtered = localData.filter((item: any) => item.id !== docId);
      await AsyncStorage.setItem(storageKey, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error removing local data:', error);
    }
  }

  /**
   * Get device ID
   */
  private async getDeviceId(): Promise<string> {
    try {
      let deviceId = await AsyncStorage.getItem('device_id');
      if (!deviceId) {
        deviceId = `device_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        await AsyncStorage.setItem('device_id', deviceId);
      }
      return deviceId;
    } catch (error) {
      console.error('Error getting device ID:', error);
      return `device_${Date.now()}`;
    }
  }

  /**
   * Update sync status
   */
  private updateSyncStatus(update: Partial<SyncStatus>): void {
    this.syncStatus = { ...this.syncStatus, ...update };
    this.notifySyncListeners();
  }

  /**
   * Add sync status listener
   */
  public addSyncListener(listener: (status: SyncStatus) => void): void {
    this.syncListeners.push(listener);
  }

  /**
   * Remove sync status listener
   */
  public removeSyncListener(listener: (status: SyncStatus) => void): void {
    this.syncListeners = this.syncListeners.filter((l) => l !== listener);
  }

  /**
   * Notify all sync listeners
   */
  private notifySyncListeners(): void {
    this.syncListeners.forEach((listener) => listener(this.syncStatus));
  }

  /**
   * Get current sync status
   */
  public getSyncStatus(): SyncStatus {
    return { ...this.syncStatus };
  }

  /**
   * Force full sync
   */
  public async forceSync(): Promise<void> {
    if (!this.userId) return;

    this.updateSyncStatus({ isSyncing: true });

    try {
      // Sync all collections
      const collections = ['appliances', 'goals', 'reminders', 'achievements', 'rooms', 'challenges'];

      for (const collection of collections) {
        const storageKey = `${collection}_data`;
        const stored = await AsyncStorage.getItem(storageKey);
        const localData = stored ? JSON.parse(stored) : [];

        if (localData.length > 0) {
          await this.syncCustomData(collection, localData);
        }
      }

      this.updateSyncStatus({ 
        isSyncing: false, 
        lastSyncTime: new Date(),
        syncError: undefined 
      });
    } catch (error) {
      console.error('Force sync failed:', error);
      this.updateSyncStatus({ isSyncing: false, syncError: 'Force sync failed' });
    }
  }

  /**
   * Cleanup and disconnect
   */
  public cleanup(): void {
    this.unsubscribers.forEach((unsubscribe) => unsubscribe());
    this.unsubscribers = [];
    this.syncListeners = [];
  }

  /**
   * Check if user is authenticated
   */
  public isAuthenticated(): boolean {
    return this.userId !== null;
  }

  /**
   * Get user ID
   */
  public getUserId(): string | null {
    return this.userId;
  }
}

export default CloudSyncService.getInstance();
