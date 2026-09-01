/* global jest */

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('react-native-linear-gradient', () => 'LinearGradient');

jest.mock('react-native-gesture-handler', () => ({
  GestureHandlerRootView: 'GestureHandlerRootView',
}));

jest.mock('react-native-tts', () => ({
  setDefaultLanguage: jest.fn(() => Promise.resolve()),
  setDefaultRate: jest.fn(() => Promise.resolve()),
  setDefaultPitch: jest.fn(() => Promise.resolve()),
  setDefaultVoice: jest.fn(() => Promise.resolve()),
  voices: jest.fn(() => Promise.resolve([])),
  stop: jest.fn(() => Promise.resolve()),
  speak: jest.fn(() => Promise.resolve()),
  engines: jest.fn(() => Promise.resolve([])),
  addEventListener: jest.fn(),
}));

jest.mock('react-native-chart-kit', () => ({
  PieChart: 'PieChart',
  BarChart: 'BarChart',
  LineChart: 'LineChart',
}));

jest.mock('react-native-share', () => ({ open: jest.fn(() => Promise.resolve()) }));
jest.mock('react-native-fs', () => ({
  CachesDirectoryPath: '/tmp',
  writeFile: jest.fn(() => Promise.resolve()),
}));
jest.mock('react-native-view-shot', () => 'ViewShot');

jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({ children }) => {
    const React = require('react');
    return React.createElement(React.Fragment, null, children);
  },
}));
jest.mock('@react-navigation/bottom-tabs', () => ({
  createBottomTabNavigator: () => {
    const React = require('react');
    return {
      Navigator: ({ children }) => React.createElement(React.Fragment, null, children),
      Screen: () => null,
    };
  },
}));
jest.mock('@react-navigation/stack', () => ({
  createStackNavigator: () => {
    const React = require('react');
    return {
      Navigator: ({ children }) => React.createElement(React.Fragment, null, children),
      Screen: () => null,
    };
  },
}));

jest.mock('react-native-push-notification', () => {
  const pushNotification = {
    configure: jest.fn(),
    createChannel: jest.fn(),
    localNotification: jest.fn(),
    localNotificationSchedule: jest.fn(),
    cancelLocalNotification: jest.fn(),
    cancelAllLocalNotifications: jest.fn(),
    getDeliveredNotifications: jest.fn((cb) => cb([])),
    removeAllDeliveredNotifications: jest.fn(),
    FetchResult: { NoData: 'noData' },
  };
  return pushNotification;
});

jest.mock('@react-native-firebase/messaging', () => {
  const messaging = () => ({
    requestPermission: jest.fn(() => Promise.resolve(-1)),
    getToken: jest.fn(() => Promise.resolve('mock-token')),
    onTokenRefresh: jest.fn(),
    onMessage: jest.fn(),
    setBackgroundMessageHandler: jest.fn(),
  });
  messaging.AuthorizationStatus = { AUTHORIZED: 1, PROVISIONAL: 2 };
  return messaging;
});

jest.mock('@react-native-firebase/firestore', () => {
  const firestore = () => ({
    settings: jest.fn(() => Promise.resolve()),
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        collection: jest.fn(() => ({
          onSnapshot: jest.fn(() => jest.fn()),
        })),
      })),
    })),
  });
  firestore.CACHE_SIZE_UNLIMITED = -1;
  return firestore;
});

jest.mock('@react-native-voice/voice', () => ({
  start: jest.fn(() => Promise.resolve()),
  stop: jest.fn(() => Promise.resolve()),
  cancel: jest.fn(() => Promise.resolve()),
  destroy: jest.fn(() => Promise.resolve()),
  isAvailable: jest.fn(() => Promise.resolve(true)),
  removeAllListeners: jest.fn(),
  onSpeechStart: null,
  onSpeechEnd: null,
  onSpeechResults: null,
  onSpeechError: null,
}));
