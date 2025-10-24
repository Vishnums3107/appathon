declare module 'react-native-push-notification' {
  export enum Importance {
    DEFAULT = 3,
    HIGH = 4,
    LOW = 2,
    MIN = 1,
    NONE = 0,
  }

  export interface PushNotificationObject {
    id?: string | number;
    channelId?: string;
    ticker?: string;
    autoCancel?: boolean;
    largeIcon?: string;
    smallIcon?: string;
    bigText?: string;
    subText?: string;
    color?: string;
    vibrate?: boolean;
    vibration?: number;
    tag?: string;
    group?: string;
    groupSummary?: boolean;
    ongoing?: boolean;
    priority?: string;
    visibility?: string;
    importance?: Importance;
    allowWhileIdle?: boolean;
    ignoreInForeground?: boolean;
    shortcutId?: string;
    onlyAlertOnce?: boolean;
    when?: number;
    usesChronometer?: boolean;
    timeoutAfter?: number;
    messageId?: string;
    actions?: string[];
    invokeApp?: boolean;
    userInfo?: any;
    playSound?: boolean;
    soundName?: string;
    number?: number;
    repeatType?: string;
    repeatTime?: number;
    date?: Date;
    title?: string;
    message: string;
  }

  export interface ChannelObject {
    channelId: string;
    channelName: string;
    channelDescription?: string;
    playSound?: boolean;
    soundName?: string;
    importance?: Importance;
    vibrate?: boolean;
  }

  export class PushNotification {
    static configure(options: any): void;
    static localNotification(notification: PushNotificationObject): void;
    static localNotificationSchedule(notification: PushNotificationObject): void;
    static requestPermissions(): void;
    static createChannel(channel: ChannelObject, callback: (created: boolean) => void): void;
    static cancelLocalNotification(id: string | number): void;
    static cancelAllLocalNotifications(): void;
    static getDeliveredNotifications(callback: (notifications: any[]) => void): void;
    static FetchResult: {
      NoData: string;
      NewData: string;
      ResultFailed: string;
    };
  }

  export default PushNotification;
}
