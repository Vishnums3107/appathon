import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Appliance,
  ApplianceCategory,
  UsageRecord,
  DashboardData,
  EnergyTip,
  Reminder,
  UserGoal,
  Streak,
  Badge,
  AppSettings,
  WeatherData,
  EnergyConsumption,
} from '../types';
import {
  calculateEnergyConsumptions,
  calculateConsumptionByCategory,
  getTopConsumers,
  calculateCost,
  calculateCO2Emissions,
  co2ToTrees,
  generateTrendData,
  calculateComparison,
} from '../utils/energy';
import { generateEnergyTips, getWeatherBasedTips } from '../utils/tips';
import { getMockWeatherData } from '../utils/weather';
import { format } from 'date-fns';

interface EnergyContextType {
  // State
  appliances: Appliance[];
  usageRecords: UsageRecord[];
  tips: EnergyTip[];
  reminders: Reminder[];
  goals: UserGoal[];
  streak: Streak;
  badges: Badge[];
  settings: AppSettings;
  weatherData: WeatherData | null;
  dashboardData: DashboardData | null;

  // Actions
  addAppliance: (appliance: Omit<Appliance, 'id' | 'createdAt'>) => Promise<void>;
  updateAppliance: (id: string, updates: Partial<Appliance>) => Promise<void>;
  deleteAppliance: (id: string) => Promise<void>;
  toggleAppliance: (id: string) => Promise<void>;
  
  addReminder: (reminder: Omit<Reminder, 'id'>) => Promise<void>;
  updateReminder: (id: string, updates: Partial<Reminder>) => Promise<void>;
  deleteReminder: (id: string) => Promise<void>;
  
  addGoal: (goal: Omit<UserGoal, 'id' | 'createdAt' | 'currentValue' | 'isAchieved'>) => Promise<void>;
  updateGoal: (id: string, updates: Partial<UserGoal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  
  updateSettings: (updates: Partial<AppSettings>) => Promise<void>;
  refreshWeatherData: () => Promise<void>;
  saveUsageRecord: () => Promise<void>;
  refreshDashboard: () => void;
  updateStreak: () => Promise<void>;
  
  // Utility
  isLoading: boolean;
}

const EnergyContext = createContext<EnergyContextType | undefined>(undefined);

const STORAGE_KEYS = {
  APPLIANCES: '@energy_app_appliances',
  USAGE_RECORDS: '@energy_app_usage_records',
  REMINDERS: '@energy_app_reminders',
  GOALS: '@energy_app_goals',
  STREAK: '@energy_app_streak',
  BADGES: '@energy_app_badges',
  SETTINGS: '@energy_app_settings',
};

const DEFAULT_SETTINGS: AppSettings = {
  electricityRate: 0.12,
  currency: '$',
  co2Factor: 0.92,
  notificationsEnabled: true,
  weatherLocation: 'New York',
  darkMode: false,
};

const INITIAL_BADGES: Badge[] = [
  {
    id: 'badge-1',
    name: 'First Steps',
    description: 'Added your first appliance',
    icon: '🌱',
    isEarned: false,
  },
  {
    id: 'badge-2',
    name: 'Week Warrior',
    description: 'Maintained streak for 7 days',
    icon: '🔥',
    isEarned: false,
  },
  {
    id: 'badge-3',
    name: 'Energy Saver',
    description: 'Reduced consumption by 20%',
    icon: '⚡',
    isEarned: false,
  },
  {
    id: 'badge-4',
    name: 'Green Champion',
    description: 'Saved equivalent of 10 trees',
    icon: '🌳',
    isEarned: false,
  },
];

export const EnergyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [appliances, setAppliances] = useState<Appliance[]>([]);
  const [usageRecords, setUsageRecords] = useState<UsageRecord[]>([]);
  const [tips, setTips] = useState<EnergyTip[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [goals, setGoals] = useState<UserGoal[]>([]);
  const [streak, setStreak] = useState<Streak>({
    currentStreak: 0,
    longestStreak: 0,
    lastActivityDate: '',
    totalDaysActive: 0,
  });
  const [badges, setBadges] = useState<Badge[]>(INITIAL_BADGES);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load data from AsyncStorage on mount
  useEffect(() => {
    loadAllData();
  }, []);

  // Refresh dashboard when appliances change
  useEffect(() => {
    if (!isLoading && appliances.length > 0) {
      refreshDashboard();
    }
  }, [appliances, settings]);

  const loadAllData = async () => {
    try {
      setIsLoading(true);
      
      const [
        storedAppliances,
        storedRecords,
        storedReminders,
        storedGoals,
        storedStreak,
        storedBadges,
        storedSettings,
      ] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.APPLIANCES),
        AsyncStorage.getItem(STORAGE_KEYS.USAGE_RECORDS),
        AsyncStorage.getItem(STORAGE_KEYS.REMINDERS),
        AsyncStorage.getItem(STORAGE_KEYS.GOALS),
        AsyncStorage.getItem(STORAGE_KEYS.STREAK),
        AsyncStorage.getItem(STORAGE_KEYS.BADGES),
        AsyncStorage.getItem(STORAGE_KEYS.SETTINGS),
      ]);

      if (storedAppliances) setAppliances(JSON.parse(storedAppliances));
      if (storedRecords) setUsageRecords(JSON.parse(storedRecords));
      if (storedReminders) setReminders(JSON.parse(storedReminders));
      if (storedGoals) setGoals(JSON.parse(storedGoals));
      if (storedStreak) setStreak(JSON.parse(storedStreak));
      if (storedBadges) setBadges(JSON.parse(storedBadges));
      if (storedSettings) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(storedSettings) });

      // Load weather data
      setWeatherData(getMockWeatherData());
      
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshDashboard = () => {
    if (appliances.length === 0) {
      setDashboardData(null);
      setTips([]);
      return;
    }

    const consumptions = calculateEnergyConsumptions(appliances, settings.electricityRate);
    const categoryConsumptions = calculateConsumptionByCategory(appliances, settings.electricityRate);
    const topConsumers = getTopConsumers(consumptions, 3);

    const totalEnergyConsumed = consumptions.reduce(
      (sum, c) => sum + c.monthlyConsumption,
      0
    );
    const totalCost = calculateCost(totalEnergyConsumed, settings.electricityRate);
    const totalCO2 = calculateCO2Emissions(totalEnergyConsumed);
    const treesEquivalent = co2ToTrees(totalCO2);

    setDashboardData({
      totalEnergyConsumed,
      totalCost,
      totalCO2Saved: totalCO2,
      treesEquivalent,
      topConsumers,
      consumptionByCategory: categoryConsumptions,
    });

    // Generate tips
    const energyTips = generateEnergyTips(appliances, consumptions);
    const weatherTips = weatherData
      ? getWeatherBasedTips(weatherData.temperature, weatherData.season, weatherData.humidity)
      : [];
    setTips([...energyTips, ...weatherTips]);
  };

  const addAppliance = async (applianceData: Omit<Appliance, 'id' | 'createdAt'>) => {
    const newAppliance: Appliance = {
      ...applianceData,
      id: `appliance-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };

    const updated = [...appliances, newAppliance];
    setAppliances(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.APPLIANCES, JSON.stringify(updated));

    // Award badge for first appliance
    if (updated.length === 1) {
      await awardBadge('badge-1');
    }

    await updateStreak();
  };

  const updateAppliance = async (id: string, updates: Partial<Appliance>) => {
    const updated = appliances.map((app) =>
      app.id === id ? { ...app, ...updates } : app
    );
    setAppliances(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.APPLIANCES, JSON.stringify(updated));
  };

  const deleteAppliance = async (id: string) => {
    const updated = appliances.filter((app) => app.id !== id);
    setAppliances(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.APPLIANCES, JSON.stringify(updated));
  };

  const toggleAppliance = async (id: string) => {
    await updateAppliance(id, {
      isActive: !appliances.find((a) => a.id === id)?.isActive,
    });
  };

  const addReminder = async (reminderData: Omit<Reminder, 'id'>) => {
    const newReminder: Reminder = {
      ...reminderData,
      id: `reminder-${Date.now()}`,
    };

    const updated = [...reminders, newReminder];
    setReminders(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(updated));
  };

  const updateReminder = async (id: string, updates: Partial<Reminder>) => {
    const updated = reminders.map((r) => (r.id === id ? { ...r, ...updates } : r));
    setReminders(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(updated));
  };

  const deleteReminder = async (id: string) => {
    const updated = reminders.filter((r) => r.id !== id);
    setReminders(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(updated));
  };

  const addGoal = async (
    goalData: Omit<UserGoal, 'id' | 'createdAt' | 'currentValue' | 'isAchieved'>
  ) => {
    const newGoal: UserGoal = {
      ...goalData,
      id: `goal-${Date.now()}`,
      currentValue: 0,
      isAchieved: false,
      createdAt: new Date().toISOString(),
    };

    const updated = [...goals, newGoal];
    setGoals(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(updated));
  };

  const updateGoal = async (id: string, updates: Partial<UserGoal>) => {
    const updated = goals.map((g) => (g.id === id ? { ...g, ...updates } : g));
    setGoals(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(updated));
  };

  const deleteGoal = async (id: string) => {
    const updated = goals.filter((g) => g.id !== id);
    setGoals(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(updated));
  };

  const updateSettings = async (updates: Partial<AppSettings>) => {
    const updated = { ...settings, ...updates };
    setSettings(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
  };

  const refreshWeatherData = async () => {
    const data = getMockWeatherData();
    setWeatherData(data);
  };

  const saveUsageRecord = async () => {
    if (appliances.length === 0) return;

    const consumptions = calculateEnergyConsumptions(appliances, settings.electricityRate);
    const totalConsumption = consumptions.reduce((sum, c) => sum + c.dailyConsumption, 0);
    const totalCost = calculateCost(totalConsumption, settings.electricityRate);
    const totalCO2 = calculateCO2Emissions(totalConsumption);

    const record: UsageRecord = {
      id: `record-${Date.now()}`,
      date: format(new Date(), 'yyyy-MM-dd'),
      appliances: [...appliances],
      totalConsumption,
      totalCost,
      totalCO2,
    };

    const updated = [...usageRecords, record];
    setUsageRecords(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.USAGE_RECORDS, JSON.stringify(updated));
  };

  const updateStreak = async () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const lastDate = streak.lastActivityDate;

    if (lastDate === today) return;

    let newStreak = { ...streak };

    if (lastDate === format(new Date(Date.now() - 86400000), 'yyyy-MM-dd')) {
      // Consecutive day
      newStreak.currentStreak += 1;
      newStreak.longestStreak = Math.max(newStreak.longestStreak, newStreak.currentStreak);
    } else if (lastDate === '') {
      // First activity
      newStreak.currentStreak = 1;
      newStreak.longestStreak = 1;
    } else {
      // Streak broken
      newStreak.currentStreak = 1;
    }

    newStreak.lastActivityDate = today;
    newStreak.totalDaysActive += 1;

    setStreak(newStreak);
    await AsyncStorage.setItem(STORAGE_KEYS.STREAK, JSON.stringify(newStreak));

    // Check for streak badge
    if (newStreak.currentStreak >= 7) {
      await awardBadge('badge-2');
    }
  };

  const awardBadge = async (badgeId: string) => {
    const updated = badges.map((badge) =>
      badge.id === badgeId && !badge.isEarned
        ? { ...badge, isEarned: true, earnedAt: new Date().toISOString() }
        : badge
    );
    setBadges(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.BADGES, JSON.stringify(updated));
  };

  const value: EnergyContextType = {
    appliances,
    usageRecords,
    tips,
    reminders,
    goals,
    streak,
    badges,
    settings,
    weatherData,
    dashboardData,
    addAppliance,
    updateAppliance,
    deleteAppliance,
    toggleAppliance,
    addReminder,
    updateReminder,
    deleteReminder,
    addGoal,
    updateGoal,
    deleteGoal,
    updateSettings,
    refreshWeatherData,
    saveUsageRecord,
    refreshDashboard,
    updateStreak,
    isLoading,
  };

  return <EnergyContext.Provider value={value}>{children}</EnergyContext.Provider>;
};

export const useEnergy = (): EnergyContextType => {
  const context = useContext(EnergyContext);
  if (context === undefined) {
    throw new Error('useEnergy must be used within an EnergyProvider');
  }
  return context;
};
