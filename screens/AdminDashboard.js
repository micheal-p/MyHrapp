// screens/AdminDashboard.js (Updated - Nav to CreateExam)
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { adminAPI } from '../services/api';
import Colors from '../constants/colors';
import { AnalyticsIcon, UserIcon, ExamIcon, PlusIcon, RefreshIcon, ProfileIcon, CertificateIcon, StarIcon, CompanyIcon } from '../components/Icons';

const { width } = Dimensions.get('window');
const isWeb = width > 768;

export default function AdminDashboard({ navigation }) {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      logout();
      return;
    }

    fetchStats();
  }, [user]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getStats();
      setStats(data);
      console.log('Admin stats loaded:', data);
    } catch (error) {
      console.error('Admin stats error:', error);
      setStats({
        totalUsers: 0,
        totalEmployees: 0,
        totalEmployers: 0,
        totalExams: 0,
        totalResults: 0,
        averageScore: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const tabs = [
    { key: 'overview', label: 'Overview', icon: <AnalyticsIcon size={20} color={Colors.primary} /> },
    { key: 'users', label: 'Users', icon: <UserIcon size={20} color={Colors.primary} /> },
    { key: 'exams', label: 'Exams', icon: <ExamIcon size={20} color={Colors.primary} /> },
  ];

  const quickActions = [
    { 
      title: 'Create Exam', 
      description: 'Add new certification exam',
      icon: <PlusIcon size={32} color={Colors.white} />,
      color: Colors.primary,
      onPress: () => navigation.navigate('CreateExam')  // Fixed: Nav to screen
    },
    { 
      title: 'Manage Users', 
      description: 'View and edit user accounts',
      icon: <UserIcon size={32} color={Colors.white} />,
      color: Colors.secondary,
      onPress: () => setActiveTab('users')
    },
    { 
      title: 'View Exams', 
      description: 'Manage all exams',
      icon: <ExamIcon size={32} color={Colors.white} />,
      color: Colors.accent,
      onPress: () => setActiveTab('exams')
    },
    { 
      title: 'Recalculate Ranks', 
      description: 'Update all rankings',
      icon: <RefreshIcon size={32} color={Colors.white} />,
      color: Colors.warning,
      onPress: () => Alert.alert('Ranks', 'Coming soon!')
    },
  ];

  const renderTabContent = () => {
    console.log('Rendering tab:', activeTab, stats);  // Debug log
    switch (activeTab) {
      case 'overview':
        return (
          <View>
            {/* Stats Grid */}
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <View style={styles.statIconContainer}>
                  <UserIcon size={28} color={Colors.primary} />
                </View>
                <Text style={styles.statValue}>{stats?.totalUsers || 0}</Text>
                <Text style={styles.statLabel}>Total Users</Text>
              </View>

              <View style={styles.statCard}>
                <View style={styles.statIconContainer}>
                  <ProfileIcon size={28} color={Colors.primary} />
                </View>
                <Text style={styles.statValue}>{stats?.totalEmployees || 0}</Text>
                <Text style={styles.statLabel}>Employees</Text>
              </View>

              <View style={styles.statCard}>
                <View style={styles.statIconContainer}>
                  <CompanyIcon size={28} color={Colors.primary} />
                </View>
                <Text style={styles.statValue}>{stats?.totalEmployers || 0}</Text>
                <Text style={styles.statLabel}>Employers</Text>
              </View>

              <View style={styles.statCard}>
                <View style={styles.statIconContainer}>
                  <ExamIcon size={28} color={Colors.primary} />
                </View>
                <Text style={styles.statValue}>{stats?.totalExams || 0}</Text>
                <Text style={styles.statLabel}>Active Exams</Text>
              </View>

              <View style={styles.statCard}>
                <View style={styles.statIconContainer}>
                  <CertificateIcon size={28} color={Colors.primary} />
                </View>
                <Text style={styles.statValue}>{stats?.totalResults || 0}</Text>
                <Text style={styles.statLabel}>Exam Results</Text>
              </View>

              <View style={styles.statCard}>
                <View style={styles.statIconContainer}>
                  <StarIcon size={28} color={Colors.primary} />
                </View>
                <Text style={styles.statValue}>{stats?.averageScore || 0}%</Text>
                <Text style={styles.statLabel}>Avg Score</Text>
              </View>
            </View>

            {/* Quick Actions */}
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionsGrid}>
              {quickActions.map((action, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.actionCard}
                  onPress={action.onPress}
                  activeOpacity={0.7}
                >
                  <View style={[styles.actionIconBg, { backgroundColor: action.color }]}>
                    {action.icon}
                  </View>
                  <Text style={styles.actionTitle}>{action.title}</Text>
                  <Text style={styles.actionDescription}>{action.description}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Recent Activity */}
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <Text style={styles.emptyIcon}>📋</Text>
              </View>
              <Text style={styles.emptyText}>No recent activity</Text>
              <Text style={styles.emptySubtext}>
                User actions and system events will appear here
              </Text>
            </View>
          </View>
        );

      case 'users':
        return (
          <View style={styles.comingSoonContainer}>
            <View style={styles.comingSoonIconBg}>
              <UserIcon size={48} color={Colors.primary} />
            </View>
            <Text style={styles.comingSoonTitle}>User Management</Text>
            <Text style={styles.comingSoonText}>
              View, edit, and manage all user accounts. Search by name, email, or role.
            </Text>
            <TouchableOpacity style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Coming Soon</Text>
            </TouchableOpacity>
          </View>
        );

      case 'exams':
        return (
          <View style={styles.comingSoonContainer}>
            <View style={styles.comingSoonIconBg}>
              <ExamIcon size={48} color={Colors.primary} />
            </View>
            <Text style={styles.comingSoonTitle}>Exam Management</Text>
            <Text style={styles.comingSoonText}>
              Create new exams, add questions, and manage existing certifications.
            </Text>
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={() => navigation.navigate('CreateExam')}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>Create New Exam</Text>
            </TouchableOpacity>
          </View>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  console.log('AdminDashboard render:', { userRole: user?.role, stats });  // Debug

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Admin Dashboard</Text>
            <Text style={styles.subtitle}>Manage your MyHr platform</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.activeTab]}
            onPress={() => setActiveTab(tab.key)}
            activeOpacity={0.7}
          >
            {tab.icon}
            <Text style={[styles.tabLabel, activeTab === tab.key && styles.activeTabLabel]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.contentWrapper, isWeb && styles.contentWrapperWeb]}>
          {renderTabContent()}
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
  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 16,
    fontWeight: '500',
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
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    paddingHorizontal: isWeb ? 40 : 24,
    maxWidth: isWeb ? 1200 : '100%',
    width: '100%',
    alignSelf: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.mediumGray,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginRight: 8,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: Colors.primary,
  },
  tabIcon: {
    fontSize: 18,
  },
  tabLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  activeTabLabel: {
    color: Colors.primary,
  },
  scrollView: {
    flex: 1,
    ...(isWeb && { height: 'calc(100vh - 180px)', overflow: 'auto' }),
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    minWidth: isWeb ? 180 : 150,
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
  statIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: Colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statIcon: {
    fontSize: 28,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 4,
    letterSpacing: -1,
  },
  statLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
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
    marginBottom: 32,
  },
  actionCard: {
    flex: 1,
    minWidth: isWeb ? 140 : 150,
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
  actionIconBg: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionIcon: {
    fontSize: 28,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
    textAlign: 'center',
  },
  actionDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
  emptyState: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 48,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
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
  emptyIcon: {
    fontSize: 40,
  },
  emptyText: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  comingSoonContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  comingSoonIconBg: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  comingSoonIcon: {
    fontSize: 48,
  },
  comingSoonTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  comingSoonText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
    maxWidth: 400,
  },
  primaryButton: {
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
  primaryButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});