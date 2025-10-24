/**
 * Real-time Push Notification Service
 * Handles local and remote push notifications with Firebase Cloud Messaging
 */

import messaging from '@react-native-firebase/messaging';
import PushNotification, { Importance } from 'react-native-push-notification';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface NotificationPreferences {
  enabled: boolean;
  energyAlerts: boolean;
  goalReminders: boolean;
  communityUpdates: boolean;
  challengeNotifications: boolean;
  achievementAlerts: boolean;
  dailyTips: boolean;
  weeklyReports: boolean;
  quietHoursStart?: string; // "22:00"
  quietHoursEnd?: string; // "08:00"
}

export interface CustomNotification {
  id: string;
  title: string;
  message: string;
  type: 'energy' | 'goal' | 'achievement' | 'community' | 'challenge' | 'tip' | 'alert';
  priority: 'high' | 'normal' | 'low';
  data?: any;
  scheduledTime?: Date;
}

class NotificationService {
  private static instance: NotificationService;
  private fcmToken: string | null = null;
  private preferences: NotificationPreferences = {
    enabled: true,
    energyAlerts: true,
    goalReminders: true,
    communityUpdates: true,
    challengeNotifications: true,
    achievementAlerts: true,
    dailyTips: true,
    weeklyReports: true,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
  };

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Initialize notification service
   */
  public async initialize(): Promise<void> {
    try {
      // Configure local notifications
      this.configurePushNotifications();

      // Request permissions
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        // Get FCM token
        this.fcmToken = await messaging().getToken();
        console.log('FCM Token:', this.fcmToken);

        // Save token to cloud for later use
        await this.saveFCMToken(this.fcmToken);

        // Listen for token refresh
        messaging().onTokenRefresh(async (token) => {
          this.fcmToken = token;
          await this.saveFCMToken(token);
        });

        // Handle foreground notifications
        messaging().onMessage(async (remoteMessage) => {
          await this.handleRemoteNotification(remoteMessage);
        });

        // Handle background notifications
        messaging().setBackgroundMessageHandler(async (remoteMessage) => {
          await this.handleRemoteNotification(remoteMessage);
        });
      }

      // Load preferences
      await this.loadPreferences();
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
    }
  }

  /**
   * Configure local push notifications
   */
  private configurePushNotifications(): void {
    PushNotification.configure({
      onRegister: (token) => {
        console.log('Local notification token:', token);
      },

      onNotification: (notification) => {
        console.log('Local notification received:', notification);
        notification.finish(PushNotification.FetchResult.NoData);
      },

      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },

      popInitialNotification: true,
      requestPermissions: true,
    });

    // Create notification channels for Android
    this.createNotificationChannels();
  }

  /**
   * Create notification channels for Android
   */
  private createNotificationChannels(): void {
    const channels = [
      {
        channelId: 'energy-alerts',
        channelName: 'Energy Alerts',
        channelDescription: 'High energy consumption alerts',
        importance: Importance.HIGH,
      },
      {
        channelId: 'goal-reminders',
        channelName: 'Goal Reminders',
        channelDescription: 'Energy saving goal reminders',
        importance: Importance.DEFAULT,
      },
      {
        channelId: 'achievements',
        channelName: 'Achievements',
        channelDescription: 'Achievement unlocked notifications',
        importance: Importance.HIGH,
      },
      {
        channelId: 'community',
        channelName: 'Community Updates',
        channelDescription: 'Community goal and challenge updates',
        importance: Importance.DEFAULT,
      },
      {
        channelId: 'daily-tips',
        channelName: 'Daily Tips',
        channelDescription: 'Daily energy saving tips',
        importance: Importance.LOW,
      },
    ];

    channels.forEach((channel) => {
      PushNotification.createChannel(
        {
          channelId: channel.channelId,
          channelName: channel.channelName,
          channelDescription: channel.channelDescription,
          importance: channel.importance,
          vibrate: true,
        },
        (created) => console.log(`Channel ${channel.channelId} created:`, created)
      );
    });
  }

  /**
   * Send local notification
   */
  public async sendLocalNotification(notification: CustomNotification): Promise<void> {
    if (!this.preferences.enabled || this.isQuietHours()) {
      return;
    }

    // Check if this type of notification is enabled
    if (!this.isNotificationTypeEnabled(notification.type)) {
      return;
    }

    const channelId = this.getChannelId(notification.type);

    PushNotification.localNotification({
      id: notification.id,
      channelId,
      title: notification.title,
      message: notification.message,
      priority: notification.priority,
      vibrate: true,
      playSound: true,
      userInfo: notification.data,
      smallIcon: 'ic_notification',
      largeIcon: 'ic_launcher',
    });
  }

  /**
   * Schedule notification for later
   */
  public async scheduleNotification(
    notification: CustomNotification,
    date: Date
  ): Promise<void> {
    if (!this.preferences.enabled) {
      return;
    }

    const channelId = this.getChannelId(notification.type);

    PushNotification.localNotificationSchedule({
      id: notification.id,
      channelId,
      title: notification.title,
      message: notification.message,
      date,
      priority: notification.priority,
      vibrate: true,
      playSound: true,
      userInfo: notification.data,
    });
  }

  /**
   * Send energy spike alert
   */
  public async sendEnergySpikeAlert(consumption: number, threshold: number): Promise<void> {
    await this.sendLocalNotification({
      id: `energy-spike-${Date.now()}`,
      title: '⚡ High Energy Usage Detected!',
      message: `Your energy consumption (${consumption.toFixed(1)} kWh) exceeded ${threshold.toFixed(1)} kWh threshold.`,
      type: 'energy',
      priority: 'high',
      data: { consumption, threshold },
    });
  }

  /**
   * Send goal achievement notification
   */
  public async sendGoalAchievement(goalName: string, savings: number): Promise<void> {
    await this.sendLocalNotification({
      id: `goal-achieved-${Date.now()}`,
      title: '🎉 Goal Achieved!',
      message: `Congratulations! You completed "${goalName}" and saved ${savings.toFixed(1)} kWh!`,
      type: 'achievement',
      priority: 'high',
      data: { goalName, savings },
    });
  }

  /**
   * Send community update
   */
  public async sendCommunityUpdate(message: string): Promise<void> {
    await this.sendLocalNotification({
      id: `community-${Date.now()}`,
      title: '🤝 Community Update',
      message,
      type: 'community',
      priority: 'normal',
    });
  }

  /**
   * Send daily tip notification
   */
  public async sendDailyTip(tip: string): Promise<void> {
    await this.sendLocalNotification({
      id: `daily-tip-${Date.now()}`,
      title: '💡 Daily Energy Tip',
      message: tip,
      type: 'tip',
      priority: 'low',
    });
  }

  /**
   * Send challenge reminder
   */
  public async sendChallengeReminder(challengeName: string, daysLeft: number): Promise<void> {
    await this.sendLocalNotification({
      id: `challenge-reminder-${Date.now()}`,
      title: '🎯 Challenge Reminder',
      message: `${challengeName} ends in ${daysLeft} day${daysLeft > 1 ? 's' : ''}!`,
      type: 'challenge',
      priority: 'normal',
      data: { challengeName, daysLeft },
    });
  }

  /**
   * Send weekly report
   */
  public async sendWeeklyReport(totalSavings: number, treesEquivalent: number): Promise<void> {
    await this.sendLocalNotification({
      id: `weekly-report-${Date.now()}`,
      title: '📊 Weekly Energy Report',
      message: `You saved ${totalSavings.toFixed(1)} kWh this week! That's ${treesEquivalent} tree${treesEquivalent > 1 ? 's' : ''} planted! 🌳`,
      type: 'goal',
      priority: 'normal',
      data: { totalSavings, treesEquivalent },
    });
  }

  /**
   * Handle remote notification from FCM
   */
  private async handleRemoteNotification(remoteMessage: any): Promise<void> {
    console.log('Remote notification:', remoteMessage);

    if (remoteMessage.notification) {
      await this.sendLocalNotification({
        id: remoteMessage.messageId || `remote-${Date.now()}`,
        title: remoteMessage.notification.title || 'Energy Tracker',
        message: remoteMessage.notification.body || '',
        type: remoteMessage.data?.type || 'energy',
        priority: 'normal',
        data: remoteMessage.data,
      });
    }
  }

  /**
   * Get notification preferences
   */
  public getPreferences(): NotificationPreferences {
    return { ...this.preferences };
  }

  /**
   * Update notification preferences
   */
  public async updatePreferences(
    preferences: Partial<NotificationPreferences>
  ): Promise<void> {
    this.preferences = { ...this.preferences, ...preferences };
    await AsyncStorage.setItem('notification_preferences', JSON.stringify(this.preferences));
  }

  /**
   * Load preferences from storage
   */
  private async loadPreferences(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('notification_preferences');
      if (stored) {
        this.preferences = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load notification preferences:', error);
    }
  }

  /**
   * Check if currently in quiet hours
   */
  private isQuietHours(): boolean {
    if (!this.preferences.quietHoursStart || !this.preferences.quietHoursEnd) {
      return false;
    }

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour * 60 + currentMinute;

    const [startHour, startMinute] = this.preferences.quietHoursStart.split(':').map(Number);
    const [endHour, endMinute] = this.preferences.quietHoursEnd.split(':').map(Number);

    const startTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;

    if (startTime < endTime) {
      return currentTime >= startTime && currentTime < endTime;
    } else {
      // Quiet hours span midnight
      return currentTime >= startTime || currentTime < endTime;
    }
  }

  /**
   * Check if notification type is enabled
   */
  private isNotificationTypeEnabled(type: string): boolean {
    const mapping: { [key: string]: keyof NotificationPreferences } = {
      energy: 'energyAlerts',
      goal: 'goalReminders',
      achievement: 'achievementAlerts',
      community: 'communityUpdates',
      challenge: 'challengeNotifications',
      tip: 'dailyTips',
    };

    const prefKey = mapping[type];
    return prefKey ? Boolean(this.preferences[prefKey]) : true;
  }

  /**
   * Get channel ID for notification type
   */
  private getChannelId(type: string): string {
    const mapping: { [key: string]: string } = {
      energy: 'energy-alerts',
      goal: 'goal-reminders',
      achievement: 'achievements',
      community: 'community',
      challenge: 'community',
      tip: 'daily-tips',
      alert: 'energy-alerts',
    };

    return mapping[type] || 'energy-alerts';
  }

  /**
   * Save FCM token to cloud
   */
  private async saveFCMToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem('fcm_token', token);
      // TODO: Send token to your backend server for push notifications
      console.log('FCM token saved:', token);
    } catch (error) {
      console.error('Failed to save FCM token:', error);
    }
  }

  /**
   * Get FCM token
   */
  public getFCMToken(): string | null {
    return this.fcmToken;
  }

  /**
   * Cancel notification
   */
  public cancelNotification(id: string): void {
    PushNotification.cancelLocalNotification(id);
  }

  /**
   * Cancel all notifications
   */
  public cancelAllNotifications(): void {
    PushNotification.cancelAllLocalNotifications();
  }

  /**
   * Get delivered notifications
   */
  public async getDeliveredNotifications(): Promise<any[]> {
    return new Promise((resolve) => {
      PushNotification.getDeliveredNotifications((notifications) => {
        resolve(notifications);
      });
    });
  }
}

export default NotificationService.getInstance();
