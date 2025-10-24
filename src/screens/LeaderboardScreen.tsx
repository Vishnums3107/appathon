/**
 * Social Leaderboard Screen
 * Shows global and friends rankings with achievements
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
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

  useEffect(() => {
    loadLeaderboard();
  }, [activeTab]);

  const loadLeaderboard = async () => {
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
  };

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
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
      totalSavings: Math.max(100, 2000 - index * 100 - Math.random() * 50),
      co2Offset: Math.max(50, 1000 - index * 50 - Math.random() * 25),
      rank: index + 1,
      weeklyRank: Math.floor(Math.random() * 50) + 1,
      monthlyRank: Math.floor(Math.random() * 100) + 1,
      streak: Math.floor(Math.random() * 90) + 1,
      achievements: Math.floor(Math.random() * 20) + 1,
      joinedDate: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28)).toISOString(),
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
    return '#757575';
  };

  const renderLeaderboardEntry = (entry: LeaderboardEntry, index: number) => {
    const isCurrentUser = entry.userId === 'current_user';
    const currentRank = activeTab === 'weekly' ? entry.weeklyRank :
                       activeTab === 'monthly' ? entry.monthlyRank : entry.rank;

    return (
      <View
        key={entry.id}
        style={[
          styles.entryCard,
          isCurrentUser && styles.currentUserCard,
          index < 3 && styles.topThreeCard,
        ]}
      >
        <View style={styles.rankContainer}>
          <Text style={[styles.rankText, { color: getRankColor(currentRank) }]}>
            {getRankEmoji(currentRank)}
          </Text>
        </View>

        <Image source={{ uri: entry.avatar }} style={styles.avatar} />

        <View style={styles.infoContainer}>
          <View style={styles.nameRow}>
            <Text style={[styles.username, isCurrentUser && styles.currentUserText]}>
              {entry.username}
              {isCurrentUser && ' (You)'}
            </Text>
            {entry.isFriend && <Text style={styles.friendBadge}>👥 Friend</Text>}
          </View>

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{entry.totalSavings.toFixed(0)}</Text>
              <Text style={styles.statLabel}>kWh Saved</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{entry.co2Offset.toFixed(0)}</Text>
              <Text style={styles.statLabel}>kg CO₂</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{entry.streak}</Text>
              <Text style={styles.statLabel}>🔥 Streak</Text>
            </View>
          </View>
        </View>

        <View style={styles.achievementsContainer}>
          <Text style={styles.achievementCount}>🏆 {entry.achievements}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🏆 Leaderboard</Text>
        <Text style={styles.headerSubtitle}>Compete with others to save energy!</Text>
      </View>

      {/* Current User Card */}
      {userEntry && (
        <View style={styles.currentUserBanner}>
          <View style={styles.currentUserInfo}>
            <Image source={{ uri: userEntry.avatar }} style={styles.bannerAvatar} />
            <View>
              <Text style={styles.bannerName}>Your Ranking</Text>
              <Text style={styles.bannerRank}>
                {getRankEmoji(activeTab === 'weekly' ? userEntry.weeklyRank :
                              activeTab === 'monthly' ? userEntry.monthlyRank : userEntry.rank)}
                {' '}in {activeTab === 'all' ? 'Global' : activeTab}
              </Text>
            </View>
          </View>
          <View style={styles.bannerStats}>
            <Text style={styles.bannerStatText}>{userEntry.totalSavings.toFixed(0)} kWh</Text>
            <Text style={styles.bannerStatLabel}>Total Savings</Text>
          </View>
        </View>
      )}

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'all' && styles.activeTab]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
            🌍 Global
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'friends' && styles.activeTab]}
          onPress={() => setActiveTab('friends')}
        >
          <Text style={[styles.tabText, activeTab === 'friends' && styles.activeTabText]}>
            👥 Friends
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'weekly' && styles.activeTab]}
          onPress={() => setActiveTab('weekly')}
        >
          <Text style={[styles.tabText, activeTab === 'weekly' && styles.activeTabText]}>
            📅 Weekly
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'monthly' && styles.activeTab]}
          onPress={() => setActiveTab('monthly')}
        >
          <Text style={[styles.tabText, activeTab === 'monthly' && styles.activeTabText]}>
            📆 Monthly
          </Text>
        </TouchableOpacity>
      </View>

      {/* Leaderboard List */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {leaderboard.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🏆</Text>
            <Text style={styles.emptyText}>No rankings available yet</Text>
            <Text style={styles.emptySubtext}>
              Start saving energy to climb the leaderboard!
            </Text>
          </View>
        ) : (
          leaderboard.map((entry, index) => renderLeaderboardEntry(entry, index))
        )}
      </ScrollView>

      {/* Bottom Info */}
      <View style={styles.bottomInfo}>
        <Text style={styles.bottomText}>
          💡 Rankings update daily based on energy savings
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#FF9800',
    padding: 20,
    paddingTop: 40,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#FFF',
    opacity: 0.9,
  },
  currentUserBanner: {
    backgroundColor: '#FFF',
    margin: 15,
    padding: 15,
    borderRadius: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  currentUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bannerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    backgroundColor: '#E0E0E0',
  },
  bannerName: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 3,
  },
  bannerRank: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  bannerStats: {
    alignItems: 'flex-end',
  },
  bannerStatText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF9800',
  },
  bannerStatLabel: {
    fontSize: 12,
    color: '#757575',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    marginHorizontal: 15,
    marginBottom: 10,
    borderRadius: 12,
    padding: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#FF9800',
  },
  tabText: {
    fontSize: 13,
    color: '#757575',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#FFF',
  },
  scrollView: {
    flex: 1,
  },
  entryCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 15,
    marginVertical: 6,
    padding: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  currentUserCard: {
    borderWidth: 2,
    borderColor: '#FF9800',
    backgroundColor: '#FFF8E1',
  },
  topThreeCard: {
    elevation: 4,
    shadowOpacity: 0.15,
  },
  rankContainer: {
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    marginRight: 12,
    backgroundColor: '#E0E0E0',
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
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  currentUserText: {
    color: '#FF9800',
  },
  friendBadge: {
    fontSize: 10,
    color: '#4CAF50',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statsRow: {
    flexDirection: 'row',
  },
  stat: {
    marginRight: 15,
  },
  statValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 10,
    color: '#757575',
  },
  achievementsContainer: {
    alignItems: 'center',
  },
  achievementCount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF9800',
  },
  bottomInfo: {
    backgroundColor: '#FFF',
    padding: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  bottomText: {
    fontSize: 12,
    color: '#757575',
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
    marginBottom: 15,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});

export default LeaderboardScreen;
