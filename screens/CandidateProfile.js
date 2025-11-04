// screens/CandidateProfile.js (FIXED - No expo-file-system)
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';
import * as Sharing from 'expo-sharing';
import { profileAPI } from '../services/api';
import Colors from '../constants/colors';

const sanitizeCandidate = (data) => {
  if (!data) return null;
  return {
    ...data,
    profileComplete: !!(
      data.profileComplete === true ||
      data.profileComplete === 'true' ||
      data.profileComplete === 1 ||
      data.profileComplete === '1'
    ),
    score: Number(data.score) || 0,
    experience: Number(data.experience) || 0,
    rank: Number(data.rank) || 0,
  };
};

const getCompletionPercentage = (candidate) => {
  if (candidate.profileComplete) return 100;
  let percent = 0;
  if (candidate.stack) percent += 20;
  if (candidate.experience > 0) percent += 20;
  if (candidate.skills?.length > 0) percent += Math.min(20, candidate.skills.length * 10);
  if (candidate.cvURL) percent += 20;
  if (candidate.city && candidate.state && candidate.country) percent += 20;
  return Math.min(100, percent);
};

export default function CandidateProfile({ route, navigation }) {
  const { candidateId } = route.params;
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCVModal, setShowCVModal] = useState(false);

  useEffect(() => {
    const fetchCandidate = async () => {
      try {
        setLoading(true);
        setError(null);
        if (!candidateId || !/^[0-9a-fA-F]{24}$/.test(candidateId)) {
          throw new Error('Invalid candidate ID');
        }
        const data = await profileAPI.getProfileById(candidateId);
        setCandidate(sanitizeCandidate(data));
      } catch (err) {
        setError(err.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchCandidate();
  }, [candidateId]);

  // ✅ FIXED: Download CV without expo-file-system
  const handleDownloadCV = async () => {
    if (!candidate?.cvURL) {
      Alert.alert('No CV', 'This candidate has not uploaded a CV');
      return;
    }

    try {
      if (Platform.OS === 'web') {
        // Web: Open in new tab
        window.open(candidate.cvURL, '_blank');
      } else {
        // Mobile: Try to share or open
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          // If we can share, open URL and let user choose
          await Linking.openURL(candidate.cvURL);
        } else {
          // Fallback: just open the URL
          await Linking.openURL(candidate.cvURL);
        }
      }
    } catch (err) {
      console.error('Download CV error:', err);
      Alert.alert('Error', 'Could not open CV. URL: ' + candidate.cvURL);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (error || !candidate) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error || 'Candidate not found'}</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.button}>
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const completionPercentage = getCompletionPercentage(candidate);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{candidate.fullName}</Text>
        <View style={styles.placeholder} />
      </View>

      {completionPercentage < 100 && (
        <View style={styles.progressCard}>
          <Text style={styles.progressLabel}>Profile Completion</Text>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBar, { width: `${completionPercentage}%` }]} />
          </View>
          <Text style={styles.progressText}>{completionPercentage}% Complete</Text>
        </View>
      )}

      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>Stack</Text>
          <Text style={styles.value}>{candidate.stack || 'N/A'}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Score</Text>
          <Text style={[styles.value, styles.scoreValue]}>{candidate.score} / 100</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Experience</Text>
          <Text style={styles.value}>{candidate.experience} years</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Location</Text>
          <Text style={styles.value}>
            {candidate.city || 'N/A'}, {candidate.state || 'N/A'}, {candidate.country || 'N/A'}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{candidate.email || 'N/A'}</Text>
        </View>

        <View style={styles.skillsSection}>
          <Text style={styles.label}>Skills</Text>
          {candidate.skills?.length > 0 ? (
            <View style={styles.skillsContainer}>
              {candidate.skills.map((skill, index) => (
                <View key={index} style={styles.skillTag}>
                  <Text style={styles.skillText}>{skill}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.value}>No skills listed</Text>
          )}
        </View>

        {candidate.cvURL && (
          <View style={styles.cvSection}>
            <Text style={styles.label}>Resume/CV</Text>
            <View style={styles.cvButtons}>
              <TouchableOpacity style={styles.viewButton} onPress={() => setShowCVModal(true)}>
                <Text style={styles.buttonText}>👁️ View CV</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.downloadButton} onPress={handleDownloadCV}>
                <Text style={styles.buttonText}>⬇️ Download</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* CV Modal */}
      <Modal visible={showCVModal} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{candidate.fullName}'s CV</Text>
            <TouchableOpacity onPress={() => setShowCVModal(false)} style={styles.closeBtn}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>
          <WebView
            source={{ uri: candidate.cvURL }}
            style={styles.webview}
            startInLoadingState
            renderLoading={() => (
              <View style={styles.webviewLoader}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text>Loading CV...</Text>
              </View>
            )}
            javaScriptEnabled
            domStorageEnabled
            scalesPageToFit
          />
          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.footerBtn} onPress={handleDownloadCV}>
              <Text style={styles.buttonText}>⬇️ Download CV</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.lightGray,
  },
  content: {
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.lightGray,
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    color: Colors.textSecondary,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  backText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  placeholder: {
    width: 50,
  },
  progressCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  progressLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
    fontWeight: '600',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: Colors.lightGray,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: Colors.primary,
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '600',
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  row: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 6,
    fontWeight: '600',
  },
  value: {
    fontSize: 16,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  scoreValue: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 18,
  },
  skillsSection: {
    marginBottom: 20,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  skillTag: {
    backgroundColor: Colors.lightGray,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  skillText: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  cvSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
  },
  cvButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  viewButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  downloadButton: {
    flex: 1,
    backgroundColor: '#10B981',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  button: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 16,
  },
  buttonText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 15,
  },
  errorText: {
    color: Colors.danger,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  closeBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
    backgroundColor: Colors.lightGray,
  },
  modalClose: {
    fontSize: 20,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  webview: {
    flex: 1,
  },
  webviewLoader: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
  },
  footerBtn: {
    backgroundColor: '#10B981',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
});