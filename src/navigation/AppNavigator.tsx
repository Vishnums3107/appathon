import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';

// Screens
import DashboardScreen from '../screens/DashboardScreen';
import UsageInputScreen from '../screens/UsageInputScreen';
import EnergyAuditScreen from '../screens/EnergyAuditScreen';
import TrendsScreen from '../screens/TrendsScreen';
import TipsScreen from '../screens/TipsScreen';
import ChatScreen from '../screens/ChatScreen';
import ProgressScreen from '../screens/ProgressScreen';
import ReportsScreen from '../screens/ReportsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import EnergyMapScreen from '../screens/EnergyMapScreen';
import CommunityGoalsScreen from '../screens/CommunityGoalsScreen';
import ChallengesScreen from '../screens/ChallengesScreen';
import ImpactVisualizerScreen from '../screens/ImpactVisualizerScreen';
import LeaderboardScreen from '../screens/LeaderboardScreen';

const Tab = createBottomTabNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#4CAF50',
          tabBarInactiveTintColor: '#999',
          tabBarStyle: {
            height: 60,
            paddingBottom: 8,
            paddingTop: 8,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
          },
        }}
      >
        <Tab.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>📊</Text>,
            tabBarLabel: 'Dashboard',
          }}
        />
        <Tab.Screen
          name="Input"
          component={UsageInputScreen}
          options={{
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>➕</Text>,
            tabBarLabel: 'Add',
          }}
        />
        <Tab.Screen
          name="Audit"
          component={EnergyAuditScreen}
          options={{
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>⚡</Text>,
            tabBarLabel: 'Audit',
          }}
        />
        <Tab.Screen
          name="Trends"
          component={TrendsScreen}
          options={{
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>📈</Text>,
            tabBarLabel: 'Trends',
          }}
        />
        <Tab.Screen
          name="Tips"
          component={TipsScreen}
          options={{
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>💡</Text>,
            tabBarLabel: 'Tips',
          }}
        />
        <Tab.Screen
          name="Chat"
          component={ChatScreen}
          options={{
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>🤖</Text>,
            tabBarLabel: 'Assistant',
          }}
        />
        <Tab.Screen
          name="Progress"
          component={ProgressScreen}
          options={{
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>🏆</Text>,
            tabBarLabel: 'Progress',
          }}
        />
        <Tab.Screen
          name="Reports"
          component={ReportsScreen}
          options={{
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>📄</Text>,
            tabBarLabel: 'Reports',
          }}
        />
        <Tab.Screen
          name="Map"
          component={EnergyMapScreen}
          options={{
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>🗺️</Text>,
            tabBarLabel: 'Map',
          }}
        />
        <Tab.Screen
          name="Community"
          component={CommunityGoalsScreen}
          options={{
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>🤝</Text>,
            tabBarLabel: 'Community',
          }}
        />
        <Tab.Screen
          name="Challenges"
          component={ChallengesScreen}
          options={{
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>🎯</Text>,
            tabBarLabel: 'Challenges',
          }}
        />
        <Tab.Screen
          name="Impact"
          component={ImpactVisualizerScreen}
          options={{
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>🌍</Text>,
            tabBarLabel: 'Impact',
          }}
        />
        <Tab.Screen
          name="Leaderboard"
          component={LeaderboardScreen}
          options={{
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>🏅</Text>,
            tabBarLabel: 'Ranking',
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>⚙️</Text>,
            tabBarLabel: 'Settings',
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
