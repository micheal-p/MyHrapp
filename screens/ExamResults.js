// screens/ExamResults.js
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
import { examAPI } from '../services/api';
import Colors from '../constants/colors';

const { width } = Dimensions.get('window');
const isWeb = width > 768;

export default function ExamResults({ route, navigation }) {
  const { examId, score, passed, correctAnswers, totalQuestions, timeTaken } = route.params || {};
  const { user, loading: authLoading } = useAuth();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCertificate, setShowCertificate] = useState(false);

  useEffect(() => {
    if (!examId || !user) return;

    fetchResults();
  }, [examId, user]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      setError(null);
      const userResults = await examAPI.getMyResults();
      const thisExamResult = userResults.find(r => r.examId._id.toString() === examId);
      setResults(thisExamResult);
    } catch (err) {
      console.error('Fetch results error:', err);
      setError('Failed to load results. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderAnswerItem = ({ item }) => (
    <View style={[
      styles.answerItem,
      item.isCorrect ? styles.correctAnswer : styles.incorrectAnswer,
    ]}>
      <Text style={styles.answerQuestion}>Q: {item.questionText}</Text>
      <Text style={styles.answerSelected}>
        Selected: {item.selectedAnswer}
        {item.isCorrect ? ' ✓' : ' ✗'}
      </Text>
    </View>
  );

  const generateCertificate = () => {
    // TODO: Integrate PDF gen (e.g., react-native-pdf-lib) or backend endpoint
    setShowCertificate(true);
    Alert.alert('Certificate', 'Certificate generated! (PDF download/view coming soon.)');
  };

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
        <TouchableOpacity onPress={fetchResults} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const result = results || { score, passed, correctAnswers, totalQuestions, timeTaken };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Exam Results</Text>
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
          {/* Score Card */}
          <View style={styles.scoreCard}>
            <Text style={styles.scoreTitle}>Your Performance</Text>
            <Text style={styles.scoreValue}>{result.score}%</Text>
            <Text style={[
              styles.scoreStatus,
              result.passed ? styles.passedStatus : styles.failedStatus,
            ]}>
              {result.passed ? 'Passed! Congratulations!' : 'Keep Practicing'}
            </Text>
            <View style={styles.scoreBreakdown}>
              <View style={styles.breakdownItem}>
                <Text style={styles.breakdownLabel}>Correct:</Text>
                <Text style={styles.breakdownValue}>{result.correctAnswers}/{result.totalQuestions}</Text>
              </View>
              <View style={styles.breakdownItem}>
                <Text style={styles.breakdownLabel}>Time:</Text>
                <Text style={styles.breakdownValue}>{result.timeTaken} min</Text>
              </View>
            </View>
          </View>

          {/* Certificate if Passed */}
          {result.passed && (
            <TouchableOpacity style={styles.certificateCard} onPress={generateCertificate}>
              <Text style={styles.certificateTitle}>Certificate Earned</Text>
              <Text style={styles.certificateSubtitle}>Tap to view/download your certificate</Text>
            </TouchableOpacity>
          )}

          {/* Answers Review */}
          <Text style={styles.sectionTitle}>Answers Review</Text>
          <FlatList
            data={result.answers || []}
            renderItem={renderAnswerItem}
            keyExtractor={(item, index) => index.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.answersList}
          />

          {/* Back to Dashboard */}
          <TouchableOpacity
            style={styles.dashboardButton}
            onPress={() => navigation.navigate('EmployeeDashboard')}
          >
            <Text style={styles.dashboardButtonText}>Back to Dashboard</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Certificate Modal (Placeholder) */}
      <Modal visible={showCertificate} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.certificateModal}>
            <Text style={styles.certificateModalTitle}>Certificate</Text>
            <Text style={styles.certificateModalText}>
              Congratulations, {user?.fullName}!
              You have successfully passed the {result.examId?.title} exam with {result.score}%.
            </Text>
            <TouchableOpacity style={styles.downloadButton}>
              <Text style={styles.downloadButtonText}>Download PDF</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setShowCertificate(false)}
            >
              <Text style={styles.closeModalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  scoreCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  scoreTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 64,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 8,
  },
  scoreStatus: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 24,
  },
  passedStatus: {
    color: Colors.success,
  },
  failedStatus: {
    color: Colors.danger,
  },
  scoreBreakdown: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  breakdownItem: {
    alignItems: 'center',
  },
  breakdownLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  breakdownValue: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  certificateCard: {
    backgroundColor: Colors.successLight,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.success,
  },
  certificateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.success,
    marginBottom: 4,
  },
  certificateSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  answersList: {
    paddingBottom: 20,
  },
  answerItem: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  correctAnswer: {
    borderLeftColor: Colors.success,
  },
  incorrectAnswer: {
    borderLeftColor: Colors.danger,
  },
  answerQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  answerSelected: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  dashboardButton: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  dashboardButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  certificateModal: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 32,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
  },
  certificateModalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  certificateModalText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  downloadButton: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  downloadButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  closeModalButton: {
    backgroundColor: Colors.lightGray,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  closeModalButtonText: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
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