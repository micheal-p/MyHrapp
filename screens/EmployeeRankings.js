// screens/EmployeeRankings.js (Complete - Added Back Button & Fixed Load)
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { rankingsAPI } from '../services/api';
import Colors from '../constants/colors';
import { RankingIcon, TrophyIcon, StarIcon } from '../components/Icons';

const { width } = Dimensions.get('window');
const isWeb = width > 768;

export default function EmployeeRankings({ navigation }) {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState('city');
  const [myRankData, setMyRankData] = useState(null);

  useEffect(() => {
    if (user) {
      fetchLeaderboard();
    }
  }, [user, view]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await rankingsAPI.getEmployeeLeaderboard(view);
      setLeaderboard(data || []);

      // Find current user's position
      const myPosition = data?.findIndex(u => u._id === user.id);
      if (myPosition !== -1) {
        setMyRankData({ position: myPosition + 1, total: data.length });
      }
    } catch (err) {
      console.error('Fetch leaderboard error:', err);
      setError('Failed to load rankings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getRankColor = (position) => {
    if (position === 1) return '#FFD700'; // Gold
    if (position === 2) return '#C0C0C0'; // Silver
    if (position === 3) return '#CD7F32'; // Bronze
    return Colors.primary;
  };

  const getRankIcon = (position) => {
    if (position === 1) return '🥇';
    if (position === 2) return '🥈';
    if (position === 3) return '🥉';
    return null;
  };

  const renderUserRow = ({ item: userItem, index }) => {
    const position = index + 1;
    const isCurrentUser = userItem._id === user.id;
    
    return (
      <View style={[
        styles.userRow,
        isCurrentUser && styles.currentUserRow
      ]}>
        {/* Rank Badge */}
        <View style={[styles.rankBadge, { backgroundColor: getRankColor(position) }]}>
          {getRankIcon(position) ? (
            <Text style={styles.rankEmoji}>{getRankIcon(position)}</Text>
          ) : (
            <Text style={styles.rankNumber}>{position}</Text>
          )}
        </View>

        {/* User Info */}
        <View style={styles.userInfo}>
          <View style={styles.userNameRow}>
            <Text style={styles.userName}>{userItem.fullName}</Text>
            {isCurrentUser && (
              <View style={styles.youBadge}>
                <Text style={styles.youText}>You</Text>
              </View>
            )}
          </View>
          <Text style={styles.userStack}>{userItem.stack} • {userItem.experience} yrs</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>⭐</Text>
              <Text style={styles.statText}>{userItem.score} pts</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>📝</Text>
              <Text style={styles.statText}>{userItem.examsTaken} exams</Text>
            </View>
          </View>
        </View>

        {/* Score Badge */}
        <View style={styles.scoreBadge}>
          <Text style={styles.scoreValue}>{userItem.score}</Text>
          <Text style={styles.scoreLabel}>points</Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading rankings...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorEmoji}>😕</Text>
          <Text style={styles.errorTitle}>Oops!</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={fetchLeaderboard} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={styles.backButton}
          >
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Rankings</Text>
          <View style={styles.placeholder} />
        </View>
      </View>

      {/* Region Selector */}
      <View style={styles.filtersContainer}>
        <Text style={styles.filtersLabel}>View Rankings By:</Text>
        <View style={styles.filters}>
          {[
            { key: 'city', label: 'City', icon: '🏙️' },
            { key: 'state', label: 'State', icon: '🗺️' },
            { key: 'country', label: 'Country', icon: '🌍' }
          ].map(filter => (
            <TouchableOpacity
              key={filter.key}
              style={[styles.filterButton, view === filter.key && styles.activeFilter]}
              onPress={() => setView(filter.key)}
              activeOpacity={0.7}
            >
              <Text style={styles.filterIcon}>{filter.icon}</Text>
              <Text style={[
                styles.filterText,
                view === filter.key && styles.activeFilterText
              ]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.contentWrapper, isWeb && styles.contentWrapperWeb]}>
          {/* Region Info Card */}
          <View style={styles.regionCard}>
            <View style={styles.regionIconContainer}>
              <RankingIcon size={24} color={Colors.primary} />
            </View>
            <View style={styles.regionInfo}>
              <Text style={styles.regionTitle}>
                {view === 'city' && user?.city}
                {view === 'state' && user?.state}
                {view === 'country' && user?.country}
              </Text>
              <Text style={styles.regionSubtitle}>
                {leaderboard.length} {leaderboard.length === 1 ? 'professional' : 'professionals'} ranked
              </Text>
            </View>
            {myRankData && (
              <View style={styles.myRankBadge}>
                <Text style={styles.myRankText}>#{myRankData.position}</Text>
              </View>
            )}
          </View>

          {/* Leaderboard */}
          {leaderboard.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <TrophyIcon size={64} color={Colors.mediumGray} />
              </View>
              <Text style={styles.emptyTitle}>No Rankings Yet</Text>
              <Text style={styles.emptySubtitle}>
                Be the first to complete your profile and appear in the leaderboard!
              </Text>
              <TouchableOpacity 
                style={styles.completeProfileButton}
                onPress={() => navigation.navigate('EmployeeProfileSetup')}
              >
                <Text style={styles.completeProfileText}>Complete Profile</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* Top 3 Podium (if enough users) */}
              {leaderboard.length >= 3 && (
                <View style={styles.podiumContainer}>
                  {/* 2nd Place */}
                  <View style={styles.podiumSlot}>
                    <View style={[styles.podiumAvatar, styles.silverAvatar]}>
                      <Text style={styles.podiumEmoji}>🥈</Text>
                    </View>
                    <Text style={styles.podiumName} numberOfLines={1}>
                      {leaderboard[1]?.fullName}
                    </Text>
                    <Text style={styles.podiumScore}>{leaderboard[1]?.score} pts</Text>
                    <View style={[styles.podiumBar, styles.silverBar]} />
                  </View>

                  {/* 1st Place */}
                  <View style={[styles.podiumSlot, styles.firstPlace]}>
                    <View style={[styles.podiumAvatar, styles.goldAvatar]}>
                      <Text style={styles.podiumEmoji}>🥇</Text>
                    </View>
                    <Text style={styles.podiumName} numberOfLines={1}>
                      {leaderboard[0]?.fullName}
                    </Text>
                    <Text style={styles.podiumScore}>{leaderboard[0]?.score} pts</Text>
                    <View style={[styles.podiumBar, styles.goldBar]} />
                  </View>

                  {/* 3rd Place */}
                  <View style={styles.podiumSlot}>
                    <View style={[styles.podiumAvatar, styles.bronzeAvatar]}>
                      <Text style={styles.podiumEmoji}>🥉</Text>
                    </View>
                    <Text style={styles.podiumName} numberOfLines={1}>
                      {leaderboard[2]?.fullName}
                    </Text>
                    <Text style={styles.podiumScore}>{leaderboard[2]?.score} pts</Text>
                    <View style={[styles.podiumBar, styles.bronzeBar]} />
                  </View>
                </View>
              )}

              {/* Full Leaderboard */}
              <Text style={styles.sectionTitle}>
                {leaderboard.length >= 3 ? 'Full Leaderboard' : 'Current Rankings'}
              </Text>
              <FlatList
                data={leaderboard}
                renderItem={renderUserRow}
                keyExtractor={(item) => item._id}
                scrollEnabled={false}
                contentContainerStyle={styles.leaderboardList}
              />
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.lightGray,
    ...(isWeb && { height: '100vh', overflow: 'hidden' }),
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 16,
    fontWeight: '500',
  },
  header: {
    backgroundColor: Colors.white,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.mediumGray,
  },
  headerContent: {
    paddingHorizontal: isWeb ? 40 : 24,
    maxWidth: isWeb ? 1200 : '100%',
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  placeholder: {
    width: 60,
  },
  filtersContainer: {
    backgroundColor: Colors.white,
    paddingHorizontal: isWeb ? 40 : 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.mediumGray,
  },
  filtersLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  filters: {
    flexDirection: 'row',
    gap: 12,
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: Colors.lightGray,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeFilter: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterIcon: {
    fontSize: 16,
  },
  filterText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  activeFilterText: {
    color: Colors.white,
  },
  scrollView: {
    flex: 1,
    ...(isWeb && { height: 'calc(100vh - 200px)', overflow: 'auto' }),
  },
  content: {
    paddingVertical: 24,
    paddingBottom: 60,
  },
  contentWrapper: {
    paddingHorizontal: 24,
  },
  contentWrapperWeb: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 40,
  },
  regionCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  regionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  regionInfo: {
    flex: 1,
  },
  regionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  regionSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  myRankBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  myRankText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
  podiumContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginBottom: 32,
    paddingHorizontal: 16,
    gap: 12,
  },
  podiumSlot: {
    flex: 1,
    alignItems: 'center',
  },
  firstPlace: {
    marginTop: -20,
  },
  podiumAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 3,
  },
  goldAvatar: {
    backgroundColor: '#FFD700',
    borderColor: '#FFA500',
  },
  silverAvatar: {
    backgroundColor: '#C0C0C0',
    borderColor: '#A9A9A9',
  },
  bronzeAvatar: {
    backgroundColor: '#CD7F32',
    borderColor: '#8B4513',
  },
  podiumEmoji: {
    fontSize: 32,
  },
  podiumName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
    textAlign: 'center',
  },
  podiumScore: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginBottom: 8,
  },
  podiumBar: {
    width: '100%',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  goldBar: {
    height: 80,
    backgroundColor: '#FFD700',
  },
  silverBar: {
    height: 60,
    backgroundColor: '#C0C0C0',
  },
  bronzeBar: {
    height: 40,
    backgroundColor: '#CD7F32',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  leaderboardList: {
    paddingBottom: 20,
  },
  userRow: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  currentUserRow: {
    backgroundColor: Colors.primaryLight,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  rankBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  rankEmoji: {
    fontSize: 24,
  },
  rankNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.white,
  },
  userInfo: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  youBadge: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  youText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.white,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  userStack: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statIcon: {
    fontSize: 12,
  },
  statText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  scoreBadge: {
    backgroundColor: Colors.lightGray,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
  },
  scoreValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
  },
  scoreLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  emptySubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
    marginBottom: 32,
  },
  completeProfileButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  completeProfileText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  errorContainer: {
    alignItems: 'center',
    maxWidth: 320,
  },
  errorEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  retryButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
});