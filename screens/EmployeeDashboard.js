// screens/EmployeeDashboard.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { examAPI } from '../services/api';  // Added for badge
import Colors from '../constants/colors';
import { ProfileIcon, ExamIcon, RankingIcon, CertificateIcon, JobIcon } from '../components/Icons';

const { width } = Dimensions.get('window');
const isWeb = width > 768;

export default function EmployeeDashboard({ navigation }) {
  const { user, logout, loading } = useAuth();
  const [availableExamsCount, setAvailableExamsCount] = useState(0);  // Added for badge

  useEffect(() => {
    if (user) {
      examAPI.getAvailableExamsCount().then(count => setAvailableExamsCount(count));
    }
  }, [user]);  // Added to fetch count on user load

  const handleLogout = async () => {
    await logout();  // Sets user=null in context → Auto-renders auth screens
  };

  if (loading || !user) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const profileProgress = user?.profileComplete ? 100 : 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Hello, {user?.fullName?.split(' ')[0] || 'User'}!</Text>
            <Text style={styles.subtitle}>Welcome back to MyHr</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.contentWrapper, isWeb && styles.contentWrapperWeb]}>
          <View style={styles.rankCard}>
            <View style={styles.rankBadge}>
              <Text style={styles.rankNumber}>#{user?.rank || '--'}</Text>
            </View>
            <Text style={styles.rankLabel}>Your Current Rank</Text>
            <Text style={styles.rankSubtext}>
              {user?.state || 'Complete your profile to get ranked'}
            </Text>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{user?.score || 0}</Text>
              <Text style={styles.statLabel}>Score</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{user?.examsTaken || 0}</Text>
              <Text style={styles.statLabel}>Exams Taken</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{user?.certifications?.length || 0}</Text>
              <Text style={styles.statLabel}>Certificates</Text>
            </View>
          </View>

          {!user?.profileComplete && (
            <View style={styles.progressCard}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressTitle}>Complete Your Profile</Text>
                <Text style={styles.progressPercentage}>{profileProgress}%</Text>
              </View>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${profileProgress}%` }]} />
              </View>
              <Text style={styles.progressText}>
                Add your skills and experience to increase your visibility
              </Text>
              <TouchableOpacity
                style={styles.completeButton}
                onPress={() => navigation.navigate('EmployeeProfileSetup')}
              >
                <Text style={styles.completeButtonText}>Complete Profile →</Text>
              </TouchableOpacity>
            </View>
          )}

          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('AvailableExams')}>
              <View style={styles.actionIcon}>
                <ExamIcon size={32} color={Colors.primary} />
                {availableExamsCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{availableExamsCount > 9 ? '9+' : availableExamsCount}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.actionLabel}>Take Exam</Text>
              <Text style={styles.actionSubtext}>Start your certification</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('EmployeeRankings')}>
              <View style={styles.actionIcon}>
                <RankingIcon size={32} color={Colors.primary} />
              </View>
              <Text style={styles.actionLabel}>View Rankings</Text>
              <Text style={styles.actionSubtext}>See where you stand</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => navigation.navigate('EmployeeProfileSetup')}
            >
              <View style={styles.actionIcon}>
                <ProfileIcon size={32} color={Colors.primary} />
              </View>
              <Text style={styles.actionLabel}>Edit Profile</Text>
              <Text style={styles.actionSubtext}>Update your info</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('MyCertifications')}>
              <View style={styles.actionIcon}>
                <CertificateIcon size={32} color={Colors.primary} />
              </View>
              <Text style={styles.actionLabel}>Certificates</Text>
              <Text style={styles.actionSubtext}>View your achievements</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('JobListings')}>
              <View style={styles.actionIcon}>
                <JobIcon size={32} color={Colors.primary} />
              </View>
              <Text style={styles.actionLabel}>Browse Jobs</Text>
              <Text style={styles.actionSubtext}>Apply to new opportunities</Text>
            </TouchableOpacity>
          </View>

          {user?.profileComplete && (
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Profile Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Role:</Text>
                <Text style={styles.summaryValue}>{user?.stack || 'Not set'}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Experience:</Text>
                <Text style={styles.summaryValue}>{user?.experience || 0} years</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Location:</Text>
                <Text style={styles.summaryValue}>
                  {user?.city}, {user?.state}, {user?.country}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Skills:</Text>
                <Text style={styles.summaryValue}>
                  {user?.skills?.join(', ') || 'None'}
                </Text>
              </View>
            </View>
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
  },
  header: {
    backgroundColor: Colors.white,
    paddingTop: 60,
    paddingBottom: 24,
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
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginTop: 4,
    fontWeight: '500',
  },
  logoutButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: Colors.lightGray,
    borderRadius: 8,
  },
  logoutText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    ...(isWeb && { height: 'calc(100vh - 120px)', overflow: 'auto' }),
  },
  content: {
    paddingVertical: 32,
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
  rankCard: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  rankBadge: {
    backgroundColor: Colors.white,
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  rankNumber: {
    fontSize: 36,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: -1,
  },
  rankLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.white,
    marginBottom: 4,
  },
  rankSubtext: {
    fontSize: 14,
    color: Colors.white,
    opacity: 0.9,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  progressCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: Colors.lightGray,
    borderRadius: 4,
    marginBottom: 12,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  completeButton: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
  },
  completeButtonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 24,
  },
  actionCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    width: isWeb ? 'calc(25% - 12px)' : 'calc(50% - 8px)',
    minWidth: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  actionIcon: {
    marginBottom: 12,
  },
  actionLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  actionSubtext: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  summaryCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    width: 120,
  },
  summaryValue: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  // Added for badge
  badge: {
    position: 'absolute',
    right: -8,
    top: -8,
    backgroundColor: 'red',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});