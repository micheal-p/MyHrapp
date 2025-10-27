// screens/MyCertifications.js
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
  Alert,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { examAPI } from '../services/api';
import Colors from '../constants/colors';

const { width } = Dimensions.get('window');
const isWeb = width > 768;

export default function MyCertifications({ navigation }) {
  const { user, loading: authLoading } = useAuth();
  const [certifications, setCertifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;

    fetchCertifications();
  }, [user]);

  const fetchCertifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const results = await examAPI.getMyResults();
      // Filter passed exams (certificates earned)
      const earnedCerts = results.filter(result => result.passed && result.certificateIssued);
      setCertifications(earnedCerts);
    } catch (err) {
      console.error('Fetch certifications error:', err);
      setError('Failed to load certifications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const viewCertificate = (cert) => {
    // TODO: Navigate to PDF viewer or generate on-the-fly
    Alert.alert(
      'Certificate',
      `View certificate for: ${cert.examId?.title || 'Exam'}\nScore: ${cert.score}%`,
      [{ text: 'Close' }]
    );
  };

  const renderCertification = ({ item: cert }) => (
    <View style={styles.certCard}>
      <View style={styles.certHeader}>
        <Text style={styles.certTitle}>{cert.examId?.title || 'Exam'}</Text>
        <Text style={styles.certDate}>
          Completed: {new Date(cert.completedAt).toLocaleDateString()}
        </Text>
      </View>
      <View style={styles.certDetails}>
        <Text style={styles.certScore}>Score: {cert.score}%</Text>
        <Text style={styles.certStatus}>Passed ✓</Text>
      </View>
      <TouchableOpacity
        style={styles.viewButton}
        onPress={() => viewCertificate(cert)}
      >
        <Text style={styles.viewButtonText}>View Certificate</Text>
      </TouchableOpacity>
    </View>
  );

  if (authLoading || loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={fetchCertifications} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>My Certifications</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.contentWrapper, isWeb && styles.contentWrapperWeb]}>
          {certifications.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No Certifications Yet</Text>
              <Text style={styles.emptySubtitle}>
                Earn certifications by passing exams in your stack.
              </Text>
              <TouchableOpacity
                style={styles.takeExamButton}
                onPress={() => navigation.navigate('AvailableExams')}
              >
                <Text style={styles.takeExamButtonText}>Take an Exam</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={certifications}
              renderItem={renderCertification}
              keyExtractor={(item) => item._id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.certsList}
            />
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
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
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
  certsList: {
    paddingBottom: 20,
  },
  certCard: {
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
  certHeader: {
    marginBottom: 12,
  },
  certTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  certDate: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  certDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  certScore: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  certStatus: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.success,
  },
  viewButton: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  viewButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  takeExamButton: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  takeExamButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  errorText: {
    fontSize: 16,
    color: Colors.danger,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  retryButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
});