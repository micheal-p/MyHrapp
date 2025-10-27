// screens/Analytics.js (Fixed - Uses SVG Icons, Error Boundary)
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import Colors from '../constants/colors';
import { AnalyticsIcon, ArrowLeftIcon, JobIcon, StarIcon } from '../components/Icons';
import { adminAPI } from '../services/api';

const { width } = Dimensions.get('window');
const isWeb = width > 768;

// Error Boundary Component
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Something went wrong: {this.state.error?.message}</Text>
          <TouchableOpacity onPress={() => this.setState({ hasError: false, error: null })} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

export default function Analytics({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Placeholder for future API call
  useEffect(() => {
    // Example: Fetch stats when ready (uncomment to use)
    /*
    const fetchStats = async () => {
      try {
        setLoading(true);
        const stats = await adminAPI.getStats();
        // Update state with stats when backend is ready
      } catch (err) {
        setError('Failed to load analytics data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
    */
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={() => setError(null)} style={styles.retryButton}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <ArrowLeftIcon size={20} color={Colors.primary} />
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Analytics</Text>
            <View style={styles.placeholder} />
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={isWeb ? true : false}
        >
          <View style={[styles.contentWrapper, isWeb && styles.contentWrapperWeb]}>
            <Text style={styles.introText}>
              Analytics coming soon! Track your job posts, applicant trends, and hiring metrics.
            </Text>

            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <View style={styles.statIconContainer}>
                  <JobIcon size={28} color={Colors.primary} />
                </View>
                <Text style={styles.statNumber}>0</Text>
                <Text style={styles.statLabel}>Total Applications</Text>
              </View>
              <View style={styles.statCard}>
                <View style={styles.statIconContainer}>
                  <AnalyticsIcon size={28} color={Colors.secondary} />
                </View>
                <Text style={styles.statNumber}>0%</Text>
                <Text style={styles.statLabel}>Hire Rate</Text>
              </View>
              <View style={styles.statCard}>
                <View style={styles.statIconContainer}>
                  <StarIcon size={28} color={Colors.warning} />
                </View>
                <Text style={styles.statNumber}>0</Text>
                <Text style={styles.statLabel}>Top Stacks</Text>
              </View>
            </View>

            <View style={styles.comingSoonCard}>
              <Text style={styles.comingSoonTitle}>Features Coming Soon</Text>
              <View style={styles.featuresList}>
                <View style={styles.featureRow}>
                  <View style={styles.featureIcon}>
                    <JobIcon size={20} color={Colors.white} />
                  </View>
                  <Text style={styles.featureText}>Applicant demographics</Text>
                </View>
                <View style={styles.featureRow}>
                  <View style={styles.featureIcon}>
                    <AnalyticsIcon size={20} color={Colors.white} />
                  </View>
                  <Text style={styles.featureText}>Job performance metrics</Text>
                </View>
                <View style={styles.featureRow}>
                  <View style={styles.featureIcon}>
                    <StarIcon size={20} color={Colors.white} />
                  </View>
                  <Text style={styles.featureText}>Hiring trends by stack</Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </ErrorBoundary>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.lightGray,
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: Colors.error,
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '500',
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  retryText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
  header: {
    backgroundColor: Colors.white,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.mediumGray,
  },
  headerContent: {
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  placeholder: {
    width: 60,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingBottom: 60,
  },
  contentWrapper: {
    paddingHorizontal: 24,
  },
  contentWrapperWeb: {
    maxWidth: 800,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 40,
  },
  introText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
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
  },
  statLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  comingSoonCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  comingSoonTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  featuresList: {
    alignItems: 'flex-start',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  featureIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    fontSize: 15,
    color: Colors.textPrimary,
    fontWeight: '500',
    lineHeight: 22,
  },
});