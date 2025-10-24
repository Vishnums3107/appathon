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
  Room,
  CommunityGoal,
  Challenge,
  DailySnapshot,
  CountdownTimer,
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
  rooms: Room[];
  communityGoals: CommunityGoal[];
  challenges: Challenge[];
  snapshots: DailySnapshot[];
  activeTimers: CountdownTimer[];

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
  
  addRoom: (room: Room) => Promise<void>;
  updateRoom: (id: string, updates: Partial<Room>) => Promise<void>;
  deleteRoom: (id: string) => Promise<void>;
  assignApplianceToRoom: (applianceId: string, roomId: string) => Promise<void>;
  
  addCommunityGoal: (goal: Omit<CommunityGoal, 'id' | 'createdAt' | 'currentEnergy' | 'isAchieved'>) => Promise<void>;
  updateCommunityGoal: (id: string, updates: Partial<CommunityGoal>) => Promise<void>;
  
  addChallenge: (challenge: Omit<Challenge, 'id' | 'currentProgress' | 'isCompleted'>) => Promise<void>;
  updateChallenge: (id: string, updates: Partial<Challenge>) => Promise<void>;
  completeChallenge: (id: string) => Promise<void>;
  
  generateDailySnapshot: () => Promise<DailySnapshot>;
  saveDailySnapshot: (snapshot: DailySnapshot) => Promise<void>;
  
  addCountdownTimer: (timer: Omit<CountdownTimer, 'id'>) => Promise<void>;
  updateTimer: (id: string) => Promise<void>;
  removeTimer: (id: string) => Promise<void>;
  
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
  voiceEnabled: false,
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
  const [rooms, setRooms] = useState<Room[]>([]);
  const [communityGoals, setCommunityGoals] = useState<CommunityGoal[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [snapshots, setSnapshots] = useState<DailySnapshot[]>([]);
  const [activeTimers, setActiveTimers] = useState<CountdownTimer[]>([]);
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
        storedRooms,
        storedCommunityGoals,
        storedChallenges,
        storedSnapshots,
        storedTimers,
      ] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.APPLIANCES),
        AsyncStorage.getItem(STORAGE_KEYS.USAGE_RECORDS),
        AsyncStorage.getItem(STORAGE_KEYS.REMINDERS),
        AsyncStorage.getItem(STORAGE_KEYS.GOALS),
        AsyncStorage.getItem(STORAGE_KEYS.STREAK),
        AsyncStorage.getItem(STORAGE_KEYS.BADGES),
        AsyncStorage.getItem(STORAGE_KEYS.SETTINGS),
        AsyncStorage.getItem('@energy_app_rooms'),
        AsyncStorage.getItem('@energy_app_community_goals'),
        AsyncStorage.getItem('@energy_app_challenges'),
        AsyncStorage.getItem('@energy_app_snapshots'),
        AsyncStorage.getItem('@energy_app_timers'),
      ]);

      if (storedAppliances) setAppliances(JSON.parse(storedAppliances));
      if (storedRecords) setUsageRecords(JSON.parse(storedRecords));
      if (storedReminders) setReminders(JSON.parse(storedReminders));
      if (storedGoals) setGoals(JSON.parse(storedGoals));
      if (storedStreak) setStreak(JSON.parse(storedStreak));
      if (storedBadges) setBadges(JSON.parse(storedBadges));
      if (storedSettings) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(storedSettings) });
      if (storedRooms) setRooms(JSON.parse(storedRooms));
      if (storedCommunityGoals) setCommunityGoals(JSON.parse(storedCommunityGoals));
      if (storedChallenges) setChallenges(JSON.parse(storedChallenges));
      if (storedSnapshots) setSnapshots(JSON.parse(storedSnapshots));
      if (storedTimers) setActiveTimers(JSON.parse(storedTimers));

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

  // Room management
  const addRoom = async (room: Room) => {
    const updated = [...rooms, room];
    setRooms(updated);
    await AsyncStorage.setItem('@energy_app_rooms', JSON.stringify(updated));
  };

  const updateRoom = async (id: string, updates: Partial<Room>) => {
    const updated = rooms.map((r) => (r.id === id ? { ...r, ...updates } : r));
    setRooms(updated);
    await AsyncStorage.setItem('@energy_app_rooms', JSON.stringify(updated));
  };

  const deleteRoom = async (id: string) => {
    const updated = rooms.filter((r) => r.id !== id);
    setRooms(updated);
    await AsyncStorage.setItem('@energy_app_rooms', JSON.stringify(updated));
  };

  const assignApplianceToRoom = async (applianceId: string, roomId: string) => {
    const updated = rooms.map((room) => {
      // Remove appliance from all rooms first
      const appliances = room.appliances.filter(id => id !== applianceId);
      // Add to target room
      if (room.id === roomId) {
        return { ...room, appliances: [...appliances, applianceId] };
      }
      return { ...room, appliances };
    });
    setRooms(updated);
    await AsyncStorage.setItem('@energy_app_rooms', JSON.stringify(updated));
  };

  // Community Goals
  const addCommunityGoal = async (goalData: Omit<CommunityGoal, 'id' | 'createdAt' | 'currentEnergy' | 'isAchieved'>) => {
    const newGoal: CommunityGoal = {
      ...goalData,
      id: `community-goal-${Date.now()}`,
      currentEnergy: 0,
      isAchieved: false,
      createdAt: new Date().toISOString(),
    };
    const updated = [...communityGoals, newGoal];
    setCommunityGoals(updated);
    await AsyncStorage.setItem('@energy_app_community_goals', JSON.stringify(updated));
  };

  const updateCommunityGoal = async (id: string, updates: Partial<CommunityGoal>) => {
    const updated = communityGoals.map((g) => (g.id === id ? { ...g, ...updates } : g));
    setCommunityGoals(updated);
    await AsyncStorage.setItem('@energy_app_community_goals', JSON.stringify(updated));
  };

  // Challenges
  const addChallenge = async (challengeData: Omit<Challenge, 'id' | 'currentProgress' | 'isCompleted'>) => {
    const newChallenge: Challenge = {
      ...challengeData,
      id: `challenge-${Date.now()}`,
      currentProgress: 0,
      isCompleted: false,
    };
    const updated = [...challenges, newChallenge];
    setChallenges(updated);
    await AsyncStorage.setItem('@energy_app_challenges', JSON.stringify(updated));
  };

  const updateChallenge = async (id: string, updates: Partial<Challenge>) => {
    const updated = challenges.map((c) => (c.id === id ? { ...c, ...updates } : c));
    setChallenges(updated);
    await AsyncStorage.setItem('@energy_app_challenges', JSON.stringify(updated));
  };

  const completeChallenge = async (id: string) => {
    await updateChallenge(id, { isCompleted: true });
  };

  // Daily Snapshots
  const generateDailySnapshot = async (): Promise<DailySnapshot> => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const consumptions = calculateEnergyConsumptions(appliances, settings.electricityRate);
    const totalEnergy = consumptions.reduce((sum, c) => sum + c.dailyConsumption, 0);
    const totalCost = calculateCost(totalEnergy, settings.electricityRate);
    const totalCO2 = calculateCO2Emissions(totalEnergy);

    const topSaver = consumptions.length > 0 
      ? consumptions.sort((a, b) => a.dailyConsumption - b.dailyConsumption)[0].applianceName
      : 'No appliances';

    const snapshot: DailySnapshot = {
      id: `snapshot-${Date.now()}`,
      date: today,
      energyConsumed: totalEnergy,
      moneySaved: totalCost,
      co2Avoided: totalCO2,
      topSavingAction: `Optimized ${topSaver}`,
      streakDays: streak.currentStreak,
    };

    return snapshot;
  };

  const saveDailySnapshot = async (snapshot: DailySnapshot) => {
    const updated = [...snapshots, snapshot];
    setSnapshots(updated);
    await AsyncStorage.setItem('@energy_app_snapshots', JSON.stringify(updated));
  };

  // Countdown Timers
  const addCountdownTimer = async (timerData: Omit<CountdownTimer, 'id'>) => {
    const newTimer: CountdownTimer = {
      ...timerData,
      id: `timer-${Date.now()}`,
    };
    const updated = [...activeTimers, newTimer];
    setActiveTimers(updated);
    await AsyncStorage.setItem('@energy_app_timers', JSON.stringify(updated));
  };

  const updateTimer = async (id: string) => {
    const timer = activeTimers.find(t => t.id === id);
    if (!timer) return;

    const now = new Date();
    const target = new Date(timer.targetTime);
    const diff = target.getTime() - now.getTime();

    if (diff <= 0) {
      // Timer completed
      await removeTimer(id);
      return;
    }

    const remainingHours = Math.floor(diff / (1000 * 60 * 60));
    const remainingMinutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    const updated = activeTimers.map((t) =>
      t.id === id
        ? { ...t, remainingHours, remainingMinutes, currentTime: now.toISOString() }
        : t
    );
    setActiveTimers(updated);
    await AsyncStorage.setItem('@energy_app_timers', JSON.stringify(updated));
  };

  const removeTimer = async (id: string) => {
    const updated = activeTimers.filter(t => t.id !== id);
    setActiveTimers(updated);
    await AsyncStorage.setItem('@energy_app_timers', JSON.stringify(updated));
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
    rooms,
    communityGoals,
    challenges,
    snapshots,
    activeTimers,
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
    addRoom,
    updateRoom,
    deleteRoom,
    assignApplianceToRoom,
    addCommunityGoal,
    updateCommunityGoal,
    addChallenge,
    updateChallenge,
    completeChallenge,
    generateDailySnapshot,
    saveDailySnapshot,
    addCountdownTimer,
    updateTimer,
    removeTimer,
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
