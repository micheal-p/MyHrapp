// screens/EmployerDashboard.js (Complete - Fixed TouchableOpacity Import)
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,  // Fixed: Added import
  ActivityIndicator,
  Dimensions,
  Alert,  // Added for premium alert
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import Colors from '../constants/colors';
import { SearchIcon, AnalyticsIcon, StarIcon, CompanyIcon, PlusIcon, JobIcon, ArrowRightIcon } from '../components/Icons';

const { width } = Dimensions.get('window');
const isWeb = width > 768;

export default function EmployerDashboard({ navigation }) {
  const { user, logout, loading } = useAuth();

  const handleLogout = async () => {
    await logout();  // Sets user=null in context → Auto-renders auth screens
  };

  const handleEditCompany = () => {
    navigation.navigate('EmployerProfileSetup');  // Nav to employer setup
  };

  const handlePostJob = () => {
    navigation.navigate('PostJob');  // Nav to post job screen
  };

  const handleBrowseCandidates = () => {
    navigation.navigate('EmployerCandidates');  // Nav to candidates
  };

  const handleViewAnalytics = () => {
    navigation.navigate('Analytics');  // Nav to analytics (placeholder—build later)
  };

  const handleHot10 = () => {
    Alert.alert('Premium Feature', 'Hot 10 is a premium feature. Upgrade to access.');
  };

  if (loading || !user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.userName}>{user?.fullName || 'Employer'}</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={isWeb ? true : false}
      >
        <View style={[styles.contentWrapper, isWeb && styles.contentWrapperWeb]}>
          <View style={styles.companyCard}>
            <View style={styles.companyLeft}>
              <View style={styles.companyIconContainer}>
                <CompanyIcon size={28} color={Colors.primary} />
              </View>
              <View style={styles.companyInfo}>
                <Text style={styles.companyName}>
                  {user?.companyName || 'Set up your company'}
                </Text>
                <Text style={styles.companyIndustry}>
                  {user?.industry || 'Add industry'}
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.editButton} onPress={handleEditCompany}>
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <JobIcon size={20} color={Colors.primary} />
              </View>
              <Text style={styles.statNumber}>{user?.jobsPosted || 0}</Text>
              <Text style={styles.statLabel}>Active Jobs</Text>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <JobIcon size={20} color={Colors.secondary} />
              </View>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Applications</Text>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <JobIcon size={20} color={Colors.accent} />
              </View>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Hired</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.primaryCTA} onPress={handlePostJob} activeOpacity={0.9}>
            <View style={styles.ctaIconContainer}>
              <PlusIcon size={24} color={Colors.white} />
            </View>
            <View style={styles.ctaContent}>
              <Text style={styles.ctaTitle}>Post a New Job</Text>
              <Text style={styles.ctaDescription}>
                Find the perfect candidate for your team
              </Text>
            </View>
          </TouchableOpacity>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <TouchableOpacity style={styles.actionCard} onPress={handleBrowseCandidates} activeOpacity={0.7}>
              <View style={styles.actionLeft}>
                <View style={styles.actionIconContainer}>
                  <SearchIcon size={22} color={Colors.primary} />
                </View>
                <View style={styles.actionContent}>
                  <Text style={styles.actionTitle}>Browse Top Candidates</Text>
                  <Text style={styles.actionDescription}>
                    View ranked professionals in your region
                  </Text>
                </View>
              </View>
              <ArrowRightIcon size={20} color={Colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard} onPress={handleViewAnalytics} activeOpacity={0.7}>
              <View style={styles.actionLeft}>
                <View style={styles.actionIconContainer}>
                  <AnalyticsIcon size={22} color={Colors.primary} />
                </View>
                <View style={styles.actionContent}>
                  <Text style={styles.actionTitle}>View Analytics</Text>
                  <Text style={styles.actionDescription}>
                    Track your job posts performance
                  </Text>
                </View>
              </View>
              <ArrowRightIcon size={20} color={Colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard} onPress={handleHot10} activeOpacity={0.7}>
              <View style={styles.actionLeft}>
                <View style={styles.actionIconContainer}>
                  <StarIcon size={22} color={Colors.warning} />
                </View>
                <View style={styles.actionContent}>
                  <Text style={styles.actionTitle}>Hot 10 Feature</Text>
                  <Text style={styles.actionDescription}>
                    Highlight your top job opportunities
                  </Text>
                </View>
              </View>
              <View style={styles.premiumBadge}>
                <Text style={styles.premiumText}>Premium</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <JobIcon size={48} color={Colors.mediumGray} />
              </View>
              <Text style={styles.emptyStateText}>No recent activity</Text>
              <Text style={styles.emptyStateDescription}>
                Post your first job to get started
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.lightGray,
    ...(isWeb && { height: '100vh' }),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.lightGray,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  header: {
    backgroundColor: Colors.primary,
    paddingTop: 60,
    paddingBottom: 32,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
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
    fontSize: 15,
    color: Colors.white,
    opacity: 0.9,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  userName: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.white,
    marginTop: 6,
    letterSpacing: -0.8,
  },
  logoutButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  logoutText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  scrollView: {
    flex: 1,
    ...(isWeb && { height: 'calc(100vh - 152px)' }),
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
  companyCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  companyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  companyIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: Colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  companyInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  companyIndustry: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  editButton: {
    backgroundColor: Colors.lightGray,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  editButtonText: {
    color: Colors.primary,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
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
    shadowRadius: 12,
    elevation: 2,
  },
  statIconContainer: {
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
    letterSpacing: -1,
  },
  statLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  primaryCTA: {
    backgroundColor: Colors.secondary,
    borderRadius: 20,
    padding: 28,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: Colors.secondary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  },
  ctaIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  ctaContent: {
    flex: 1,
  },
  ctaTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  ctaDescription: {
    fontSize: 15,
    color: Colors.white,
    opacity: 0.95,
    fontWeight: '500',
    lineHeight: 22,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  actionCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  actionDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
    lineHeight: 20,
  },
  premiumBadge: {
    backgroundColor: Colors.warning,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  premiumText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  emptyState: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 48,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: Colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyStateText: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  emptyStateDescription: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 22,
  },
});