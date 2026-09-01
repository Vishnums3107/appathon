import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, Radius, Shadows, Typography } from '../theme';

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
import RecommendationsScreen from '../screens/RecommendationsScreen';
import FeatureHubScreen from '../screens/FeatureHubScreen';
import RemindersScreen from '../screens/RemindersScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const TAB_ICONS: Record<string, string> = {
  Home: '◉',
  Track: '+',
  Insights: '◌',
  Goals: '★',
  Account: '•',
};

const TabIcon = ({ name, focused }: { name: string; focused: boolean }) => (
  <View style={tabStyles.iconWrap}>
    <Text style={[tabStyles.icon, focused && tabStyles.iconActive]}>{TAB_ICONS[name]}</Text>
    {focused && <View style={tabStyles.dot} />}
  </View>
);

const HomeTabIcon = ({ focused }: { focused: boolean }) => <TabIcon name="Home" focused={focused} />;
const TrackTabIcon = ({ focused }: { focused: boolean }) => <TabIcon name="Track" focused={focused} />;
const InsightsTabIcon = ({ focused }: { focused: boolean }) => <TabIcon name="Insights" focused={focused} />;
const GoalsTabIcon = ({ focused }: { focused: boolean }) => <TabIcon name="Goals" focused={focused} />;
const AccountTabIcon = ({ focused }: { focused: boolean }) => <TabIcon name="Account" focused={focused} />;

const BackButton = ({ navigation }: { navigation: { goBack: () => void } }) => (
  <TouchableOpacity onPress={navigation.goBack} style={stackStyles.backButton} activeOpacity={0.75} accessibilityLabel="Go back">
    <Text style={stackStyles.backButtonText}>‹</Text>
  </TouchableOpacity>
);

const sharedStackOptions = ({ navigation }: any) => ({
  headerTransparent: true,
  headerTitle: '',
  headerShadowVisible: false,
  headerLeft: () => <BackButton navigation={navigation} />,
});

const HomeStack = () => (
  <Stack.Navigator screenOptions={sharedStackOptions}>
    <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ headerShown: false }} />
  </Stack.Navigator>
);

const TrackHome = ({ navigation }: any) => <FeatureHubScreen area="track" navigation={navigation} />;
const InsightsHome = ({ navigation }: any) => <FeatureHubScreen area="insights" navigation={navigation} />;
const GoalsHome = ({ navigation }: any) => <FeatureHubScreen area="goals" navigation={navigation} />;
const AccountHome = ({ navigation }: any) => <FeatureHubScreen area="profile" navigation={navigation} />;

const TrackStack = () => (
  <Stack.Navigator screenOptions={sharedStackOptions}>
    <Stack.Screen name="TrackHome" component={TrackHome} options={{ headerShown: false }} />
    <Stack.Screen name="AddAppliance" component={UsageInputScreen} />
    <Stack.Screen name="Audit" component={EnergyAuditScreen} />
    <Stack.Screen name="Map" component={EnergyMapScreen} />
  </Stack.Navigator>
);

const InsightsStack = () => (
  <Stack.Navigator screenOptions={sharedStackOptions}>
    <Stack.Screen name="InsightsHome" component={InsightsHome} options={{ headerShown: false }} />
    <Stack.Screen name="Recommendations" component={RecommendationsScreen} />
    <Stack.Screen name="Trends" component={TrendsScreen} />
    <Stack.Screen name="Tips" component={TipsScreen} />
    <Stack.Screen name="Reports" component={ReportsScreen} />
  </Stack.Navigator>
);

const GoalsStack = () => (
  <Stack.Navigator screenOptions={sharedStackOptions}>
    <Stack.Screen name="GoalsHome" component={GoalsHome} options={{ headerShown: false }} />
    <Stack.Screen name="Progress" component={ProgressScreen} />
    <Stack.Screen name="Challenges" component={ChallengesScreen} />
    <Stack.Screen name="Community" component={CommunityGoalsScreen} />
    <Stack.Screen name="Impact" component={ImpactVisualizerScreen} />
    <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
  </Stack.Navigator>
);

const AccountStack = () => (
  <Stack.Navigator screenOptions={sharedStackOptions}>
    <Stack.Screen name="AccountHome" component={AccountHome} options={{ headerShown: false }} />
    <Stack.Screen name="Chat" component={ChatScreen} />
    <Stack.Screen name="Reminders" component={RemindersScreen} />
    <Stack.Screen name="Settings" component={SettingsScreen} />
  </Stack.Navigator>
);

const AppNavigator = () => (
  <NavigationContainer>
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primaryDark,
        tabBarInactiveTintColor: Colors.tabInactive,
        tabBarStyle: tabStyles.bar,
        tabBarLabelStyle: tabStyles.label,
      }}
    >
      <Tab.Screen name="Home" component={HomeStack} options={{ tabBarLabel: 'Home', tabBarIcon: HomeTabIcon }} />
      <Tab.Screen name="Track" component={TrackStack} options={{ tabBarLabel: 'Track', tabBarIcon: TrackTabIcon }} />
      <Tab.Screen name="Insights" component={InsightsStack} options={{ tabBarLabel: 'Insights', tabBarIcon: InsightsTabIcon }} />
      <Tab.Screen name="Goals" component={GoalsStack} options={{ tabBarLabel: 'Goals', tabBarIcon: GoalsTabIcon }} />
      <Tab.Screen name="Account" component={AccountStack} options={{ tabBarLabel: 'Account', tabBarIcon: AccountTabIcon }} />
    </Tab.Navigator>
  </NavigationContainer>
);

const tabStyles = StyleSheet.create({
  bar: {
    height: 68,
    paddingBottom: 9,
    paddingTop: 7,
    backgroundColor: Colors.tabBar,
    borderTopWidth: 0,
    ...Shadows.lg,
  },
  label: { ...Typography.labelSmall, fontSize: 10, letterSpacing: 0.2 },
  iconWrap: { height: 26, alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 21, lineHeight: 22, color: Colors.tabInactive, fontWeight: '700' },
  iconActive: { color: Colors.primaryDark },
  dot: { width: 4, height: 4, borderRadius: 2, marginTop: 2, backgroundColor: Colors.primaryDark },
});

const stackStyles = StyleSheet.create({
  backButton: {
    width: 36,
    height: 36,
    marginLeft: 16,
    marginTop: 4,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  backButtonText: { fontSize: 30, lineHeight: 31, marginTop: -3, color: Colors.dark, fontWeight: '400' },
});

export default AppNavigator;
