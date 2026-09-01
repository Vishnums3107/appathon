/**
 * Social Leaderboard Screen
 * Shows global and friends rankings with achievements
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Colors, Typography, Spacing, Radius, Shadows } from '../theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LeaderboardEntry {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  totalSavings: number; // kWh
  co2Offset: number; // kg
  rank: number;
  weeklyRank: number;
  monthlyRank: number;
  streak: number;
  achievements: number;
  joinedDate: string;
  isFriend: boolean;
}

const LeaderboardScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'friends' | 'weekly' | 'monthly'>('all');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userEntry, setUserEntry] = useState<LeaderboardEntry | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadLeaderboard = useCallback(async () => {
    try {
      // Load or generate leaderboard data
      const stored = await AsyncStorage.getItem('leaderboard_data');
      let data: LeaderboardEntry[] = stored ? JSON.parse(stored) : [];

      if (data.length === 0) {
        data = generateSampleLeaderboard();
        await AsyncStorage.setItem('leaderboard_data', JSON.stringify(data));
      }

      // Filter based on active tab
      let filtered = data;
      if (activeTab === 'friends') {
        filtered = data.filter((entry) => entry.isFriend);
      }

      // Sort based on tab
      if (activeTab === 'weekly') {
        filtered.sort((a, b) => a.weeklyRank - b.weeklyRank);
      } else if (activeTab === 'monthly') {
        filtered.sort((a, b) => a.monthlyRank - b.monthlyRank);
      } else {
        filtered.sort((a, b) => a.rank - b.rank);
      }

      setLeaderboard(filtered);

      // Find current user (first entry for demo)
      const currentUser = data.find((entry) => entry.userId === 'current_user') || data[0];
      setUserEntry(currentUser);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    }
  }, [activeTab]);

  useEffect(() => {
    loadLeaderboard();
  }, [loadLeaderboard]);

  const generateSampleLeaderboard = (): LeaderboardEntry[] => {
    const names = [
      'You', 'Sarah Chen', 'Mike Johnson', 'Emma Davis', 'Alex Brown',
      'Lisa Wang', 'Tom Wilson', 'Anna Lee', 'Chris Martin', 'Maya Patel',
      'John Smith', 'Kate Taylor', 'Ryan Clark', 'Sophie Moore', 'Dan White',
    ];

    return names.map((name, index) => ({
      id: `user-${index}`,
      userId: index === 0 ? 'current_user' : `user-${index}`,
      username: name,
      avatar: `https://api.dicebear.com/7.x/avataaars/png?seed=${name}`,
      totalSavings: Math.max(100, 2000 - index * 100 - Math.random() * 50),
      co2Offset: Math.max(50, 1000 - index * 50 - Math.random() * 25),
      rank: index + 1,
      weeklyRank: Math.floor(Math.random() * 50) + 1,
      monthlyRank: Math.floor(Math.random() * 100) + 1,
      streak: Math.floor(Math.random() * 90) + 1,
      achievements: Math.floor(Math.random() * 20) + 1,
      joinedDate: new Date(new Date().getFullYear(), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString(),
      isFriend: index > 0 && Math.random() > 0.6,
    }));
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLeaderboard();
    setRefreshing(false);
  };

  const getRankEmoji = (rank: number): string => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getRankColor = (rank: number): string => {
    if (rank === 1) return '#FFD700';
    if (rank === 2) return '#C0C0C0';
    if (rank === 3) return '#CD7F32';
    return Colors.textSecondary;
  };

  const renderLeaderboardEntry = (entry: LeaderboardEntry, index: number) => {
    const isCurrentUser = entry.userId === 'current_user';
    const currentRank = activeTab === 'weekly' ? entry.weeklyRank :
                       activeTab === 'monthly' ? entry.monthlyRank : entry.rank;

    return (
      <View
        key={entry.id}
        style={[
          s.entryCard,
          isCurrentUser && s.currentUserCard,
          index < 3 && s.topThreeCard,
        ]}
      >
        <View style={s.rankContainer}>
          <Text style={[s.rankText, { color: getRankColor(currentRank) }]}>
            {getRankEmoji(currentRank)}
          </Text>
        </View>

        <Image source={{ uri: entry.avatar }} style={s.avatar} />

        <View style={s.infoContainer}>
          <View style={s.nameRow}>
            <Text style={[s.username, isCurrentUser && s.currentUserText]}>
              {entry.username}
              {isCurrentUser && ' (You)'}
            </Text>
            {entry.isFriend && <Text style={s.friendBadge}>👥 Friend</Text>}
          </View>

          <View style={s.statsRow}>
            <View style={s.stat}>
              <Text style={s.statValue}>{entry.totalSavings.toFixed(0)}</Text>
              <Text style={s.statLabel}>kWh Saved</Text>
            </View>
            <View style={s.stat}>
              <Text style={s.statValue}>{entry.co2Offset.toFixed(0)}</Text>
              <Text style={s.statLabel}>kg CO₂</Text>
            </View>
            <View style={s.stat}>
              <Text style={s.statValue}>{entry.streak}</Text>
              <Text style={s.statLabel}>🔥 Streak</Text>
            </View>
          </View>
        </View>

        <View style={s.achievementsContainer}>
          <Text style={s.achievementCount}>🏆 {entry.achievements}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.dark} />
      {/* Header */}
      <LinearGradient colors={['#0B1120', '#162032']} style={s.header}>
        <Text style={s.headerLabel}>LOCAL PREVIEW</Text>
        <Text style={s.headerTitle}>Leaderboard Preview</Text>
      </LinearGradient>

      <View style={s.previewNotice}>
        <Text style={s.previewNoticeText}>Sample standings are stored on this device. Connect a leaderboard service to compete with real people.</Text>
      </View>

      {/* Current User Card */}
      {userEntry && (
        <View style={s.currentUserBanner}>
          <View style={s.currentUserInfo}>
            <Image source={{ uri: userEntry.avatar }} style={s.bannerAvatar} />
            <View>
              <Text style={s.bannerName}>Your sample position</Text>
              <Text style={s.bannerRank}>
                {getRankEmoji(activeTab === 'weekly' ? userEntry.weeklyRank :
                              activeTab === 'monthly' ? userEntry.monthlyRank : userEntry.rank)}
                {' '}in this preview
              </Text>
            </View>
          </View>
          <View style={s.bannerStats}>
            <Text style={s.bannerStatText}>{userEntry.totalSavings.toFixed(0)} kWh</Text>
            <Text style={s.bannerStatLabel}>Total Savings</Text>
          </View>
        </View>
      )}

      {/* Tab Selector */}
      <View style={s.tabContainer}>
        <TouchableOpacity
          style={[s.tab, activeTab === 'all' && s.activeTab]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[s.tabText, activeTab === 'all' && s.activeTabText]}>
            🌍 Global
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[s.tab, activeTab === 'friends' && s.activeTab]}
          onPress={() => setActiveTab('friends')}
        >
          <Text style={[s.tabText, activeTab === 'friends' && s.activeTabText]}>
            👥 Friends
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[s.tab, activeTab === 'weekly' && s.activeTab]}
          onPress={() => setActiveTab('weekly')}
        >
          <Text style={[s.tabText, activeTab === 'weekly' && s.activeTabText]}>
            📅 Weekly
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[s.tab, activeTab === 'monthly' && s.activeTab]}
          onPress={() => setActiveTab('monthly')}
        >
          <Text style={[s.tabText, activeTab === 'monthly' && s.activeTabText]}>
            📆 Monthly
          </Text>
        </TouchableOpacity>
      </View>

      {/* Leaderboard List */}
      <ScrollView
        style={s.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {leaderboard.length === 0 ? (
          <View style={s.emptyState}>
            <Text style={s.emptyIcon}>🏆</Text>
            <Text style={s.emptyText}>No rankings available yet</Text>
            <Text style={s.emptySubtext}>
              Start saving energy to climb the leaderboard!
            </Text>
          </View>
        ) : (
          leaderboard.map((entry, index) => renderLeaderboardEntry(entry, index))
        )}
      </ScrollView>

      {/* Bottom Info */}
      <View style={s.bottomInfo}>
        <Text style={s.bottomText}>
          💡 Rankings update daily based on energy savings
        </Text>
      </View>
    </View>
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
  previewNotice: {
    marginHorizontal: Spacing.page,
    marginTop: Spacing.page,
    backgroundColor: Colors.primarySoft,
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  previewNoticeText: { ...Typography.bodySmall, color: Colors.primaryDark, lineHeight: 18 },
  currentUserBanner: {
    backgroundColor: Colors.card,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
    padding: Spacing.lg,
    borderRadius: Radius.card,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
    ...Shadows.md,
  },
  currentUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bannerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: Spacing.md,
    backgroundColor: Colors.border,
  },
  bannerName: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    marginBottom: 3,
  },
  bannerRank: {
    ...Typography.h3,
    color: Colors.text,
  },
  bannerStats: {
    alignItems: 'flex-end',
  },
  bannerStatText: {
    ...Typography.stat,
    color: Colors.primary,
  },
  bannerStatLabel: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    borderRadius: Radius.md,
    padding: Spacing.xs,
    ...Shadows.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.sm,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    ...Typography.label,
    color: Colors.textSecondary,
  },
  activeTabText: {
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  entryCard: {
    backgroundColor: Colors.card,
    marginHorizontal: Spacing.lg,
    marginVertical: 6,
    padding: Spacing.md,
    borderRadius: Radius.card,
    flexDirection: 'row',
    alignItems: 'center',
    ...Shadows.sm,
  },
  currentUserCard: {
    borderWidth: 2,
    borderColor: Colors.primary,
    backgroundColor: Colors.primarySoft,
  },
  topThreeCard: {
    ...Shadows.md,
  },
  rankContainer: {
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    ...Typography.h2,
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    marginRight: Spacing.md,
    backgroundColor: Colors.border,
  },
  infoContainer: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  username: {
    ...Typography.h3,
    color: Colors.text,
    marginRight: Spacing.sm,
  },
  currentUserText: {
    color: Colors.primary,
  },
  friendBadge: {
    ...Typography.overline,
    color: Colors.success,
    backgroundColor: Colors.primarySoft,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  statsRow: {
    flexDirection: 'row',
  },
  stat: {
    marginRight: Spacing.lg,
  },
  statValue: {
    ...Typography.label,
    color: Colors.text,
  },
  statLabel: {
    ...Typography.overline,
    color: Colors.textSecondary,
    letterSpacing: 0.3,
  },
  achievementsContainer: {
    alignItems: 'center',
  },
  achievementCount: {
    ...Typography.label,
    color: Colors.primary,
  },
  bottomInfo: {
    backgroundColor: Colors.card,
    padding: Spacing.md,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  bottomText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: Spacing.lg,
  },
  emptyText: {
    ...Typography.h2,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  emptySubtext: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});

export default LeaderboardScreen;
