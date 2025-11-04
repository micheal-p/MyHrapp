// screens/JobApplications.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { jobAPI } from '../services/api';
import Colors from '../constants/colors';
import { NotificationIcon, UserIcon, ArrowRightIcon, StarIcon, DownloadIcon } from '../components/Icons';

const { width } = Dimensions.get('window');
const isWeb = width > 768;

export default function JobApplications({ navigation }) {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await jobAPI.getApplications();
      setApplications(data.applications || []);
    } catch (err) {
      console.error('Fetch applications error:', err);
      setError('Failed to load applications');
      Alert.alert('Error', 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleViewCandidate = (candidate) => {
    navigation.navigate('CandidateProfile', { candidate });
  };

  const handleAction = (action, applicationId) => {
    Alert.alert('Action', `${action} application?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm',
        onPress: async () => {
          try {
            await jobAPI.updateApplicationStatus(applicationId, { status: action });
            fetchApplications();
            Alert.alert('Success', `Application ${action.toLowerCase()}d!`);
          } catch (err) {
            Alert.alert('Error', 'Failed to update status');
          }
        },
      },
    ]);
  };

  const downloadResume = async (url, filename) => {
    if (Platform.OS === 'web') {
      window.open(url, '_blank');
    } else {
      try {
        const supported = await Linking.canOpenURL(url);
        if (supported) {
          await Linking.openURL(url);
        } else {
          Alert.alert('Error', 'Cannot open this file');
        }
      } catch (err) {
        Alert.alert('Error', 'Failed to download resume');
      }
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading applications...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={fetchApplications} style={styles.retryButton}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Job Applications</Text>
          <TouchableOpacity onPress={fetchApplications} style={styles.refreshButton}>
            <NotificationIcon size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={[styles.contentWrapper, isWeb && styles.contentWrapperWeb]}>
          {applications.length === 0 ? (
            <View style={styles.emptyState}>
              <NotificationIcon size={48} color={Colors.mediumGray} />
              <Text style={styles.emptyText}>No applications yet</Text>
              <Text style={styles.emptySubtext}>Post a job to start receiving applications</Text>
            </View>
          ) : (
            applications.map((app) => (
              <View key={app._id} style={styles.applicationCard}>
                <View style={styles.appHeader}>
                  <View style={styles.candidateInfo}>
                    <View style={styles.candidateAvatar}>
                      <UserIcon size={24} color={Colors.primary} />
                    </View>
                    <View style={styles.candidateDetails}>
                      <Text style={styles.candidateName}>{app.candidate.fullName}</Text>
                      <Text style={styles.candidateStack}>{app.candidate.stack}</Text>
                      <View style={styles.scoreContainer}>
                        <StarIcon size={16} color={Colors.warning} />
                        <Text style={styles.scoreText}>{app.candidate.score || 0}</Text>
                      </View>
                    </View>
                  </View>
                  <Text style={styles.jobTitle}>{app.job.title}</Text>
                </View>

                {app.coverLetter && (
                  <View style={styles.coverLetter}>
                    <Text style={styles.coverLetterText} numberOfLines={2}>
                      {app.coverLetter}
                    </Text>
                  </View>
                )}

                {/* RESUME DOWNLOAD LINK */}
                {app.resumeUrl && (
                  <TouchableOpacity
                    style={styles.resumeRow}
                    onPress={() => downloadResume(app.resumeUrl, `Resume_${app.candidate.fullName}.pdf`)}
                  >
                    <DownloadIcon size={18} color={Colors.primary} />
                    <Text style={styles.resumeLink}>Download Application Resume</Text>
                  </TouchableOpacity>
                )}

                <View style={styles.appFooter}>
                  <Text style={styles.appliedDate}>
                    Applied {new Date(app.appliedAt).toLocaleDateString()}
                  </Text>
                  <View style={styles.actions}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.rejectButton]}
                      onPress={() => handleAction('Rejected', app._id)}
                    >
                      <Text style={styles.rejectText}>Reject</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.viewButton]}
                      onPress={() => handleViewCandidate(app.candidate)}
                    >
                      <Text style={styles.viewText}>View Profile</Text>
                      <ArrowRightIcon size={16} color={Colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.acceptButton]}
                      onPress={() => handleAction('Accepted', app._id)}
                    >
                      <Text style={styles.acceptText}>Accept</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {app.status && (
                  <View
                    style={[
                      styles.statusBadge,
                      app.status === 'Accepted' ? styles.acceptedBadge : styles.rejectedBadge,
                    ]}
                  >
                    <Text style={styles.statusText}>{app.status}</Text>
                  </View>
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.lightGray },
  centerContent: { justifyContent: 'center', alignItems: 'center', padding: 40 },
  header: {
    backgroundColor: Colors.white,
    paddingTop: 60,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: Colors.mediumGray,
  },
  headerContent: {
    paddingHorizontal: isWeb ? 40 : 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: { padding: 8 },
  backText: { fontSize: 16, fontWeight: '600', color: Colors.primary },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  refreshButton: { padding: 8 },
  scrollView: { flex: 1 },
  contentWrapper: { paddingHorizontal: 24, paddingVertical: 24 },
  contentWrapperWeb: { maxWidth: 1200, width: '100%', alignSelf: 'center', paddingHorizontal: 40 },
  applicationCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  appHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  candidateInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  candidateAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  candidateDetails: { flex: 1 },
  candidateName: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginBottom: 2 },
  candidateStack: { fontSize: 14, color: Colors.textSecondary, marginBottom: 4 },
  scoreContainer: { flexDirection: 'row', alignItems: 'center' },
  scoreText: { fontSize: 14, color: Colors.textPrimary, fontWeight: '600', marginLeft: 4 },
  jobTitle: { fontSize: 14, color: Colors.primary, fontWeight: '600' },
  coverLetter: { backgroundColor: Colors.lightGray, borderRadius: 8, padding: 12, marginBottom: 12 },
  coverLetterText: { fontSize: 14, color: Colors.textSecondary, lineHeight: 20 },

  // RESUME DOWNLOAD
  resumeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary + '10',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    gap: 8,
  },
  resumeLink: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },

  appFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
  },
  appliedDate: { fontSize: 13, color: Colors.textSecondary },
  actions: { flexDirection: 'row', gap: 8 },
  actionButton: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rejectButton: { backgroundColor: 'rgba(239, 68, 68, 0.1)', borderWidth: 1, borderColor: Colors.danger },
  rejectText: { color: Colors.danger, fontSize: 13, fontWeight: '600' },
  viewButton: { backgroundColor: Colors.primary },
  viewText: { color: Colors.white, fontSize: 13, fontWeight: '600' },
  acceptButton: { backgroundColor: 'rgba(34, 197, 94, 0.1)', borderWidth: 1, borderColor: Colors.success },
  acceptText: { color: Colors.success, fontSize: 13, fontWeight: '600' },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginTop: 8 },
  acceptedBadge: { backgroundColor: 'rgba(34, 197, 94, 0.2)' },
  rejectedBadge: { backgroundColor: 'rgba(239, 68, 68, 0.2)' },
  statusText: { fontSize: 12, fontWeight: '600', color: Colors.textPrimary },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary, marginTop: 16 },
  emptySubtext: { fontSize: 14, color: Colors.textSecondary, marginTop: 8, textAlign: 'center' },
  loadingText: { marginTop: 16, fontSize: 16, color: Colors.textSecondary },
  errorText: { fontSize: 16, color: Colors.danger, textAlign: 'center', marginBottom: 16 },
  retryButton: { backgroundColor: Colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  retryText: { color: Colors.white, fontSize: 16, fontWeight: '600' },
});