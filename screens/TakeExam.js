// screens/TakeExam.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { examAPI } from '../services/api';
import Colors from '../constants/colors';

const { width, height } = Dimensions.get('window');
const isWeb = width > 768;

export default function TakeExam({ route, navigation }) {
  const { examId } = route.params;
  const { user, loading: authLoading } = useAuth();
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});  // { questionId: selectedOptionText }
  const [timeLeft, setTimeLeft] = useState(0);  // Seconds
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!user || !examId) return;

    fetchExam();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [user, examId]);

  const fetchExam = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedExam = await examAPI.getExam(examId);
      setExam(fetchedExam);
      setTimeLeft(fetchedExam.duration * 60);  // Convert min to sec
      startTimer();
    } catch (err) {
      console.error('Fetch exam error:', err);
      setError(err.message || 'Failed to load exam.');
    } finally {
      setLoading(false);
    }
  };

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleSubmit();  // Auto-submit on timeout
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const selectAnswer = (questionId, optionText) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionText,
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < (exam?.questions?.length || 0) - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    if (isSubmitted) return;

    clearInterval(timerRef.current);
    const timeTaken = exam.duration - Math.floor(timeLeft / 60);  // Min

    try {
      setLoading(true);
      const submission = {
        answers: Object.entries(answers).map(([questionId, selectedAnswer]) => ({
          questionId,
          selectedAnswer,
        })),
        timeTaken,
      };

      const result = await examAPI.submitExam(examId, submission.answers, timeTaken);

      // Update user context after submit
      if (user) {
        const { refreshUser } = useAuth();
        await refreshUser();  // Refreshes score/rank/certs
      }

      setIsSubmitted(true);
      Alert.alert(
        result.message,
        `Your score: ${result.result.score}%`,
        [{ text: 'View Results', onPress: () => setShowResults(true) }]
      );
    } catch (err) {
      console.error('Submit exam error:', err);
      Alert.alert('Submission Failed', err.message || 'Please try again.');
      // Restart timer on error
      startTimer();
    } finally {
      setLoading(false);
    }
  };

  const currentQuestion = exam?.questions?.[currentQuestionIndex];

  if (authLoading || loading || !exam) {
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
        <TouchableOpacity onPress={fetchExam} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{exam.title}</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.timerBar}>
          <Text style={styles.timerText}>Time: {formatTime(timeLeft)}</Text>
          <Text style={styles.progressText}>
            Q {currentQuestionIndex + 1} / {exam.totalQuestions}
          </Text>
        </View>
      </View>

      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>{currentQuestion?.questionText}</Text>
        <View style={styles.optionsContainer}>
          {currentQuestion?.options?.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.option,
                answers[currentQuestion._id] === option.text && styles.selectedOption,
              ]}
              onPress={() => selectAnswer(currentQuestion._id, option.text)}
              disabled={isSubmitted}
            >
              <Text style={[
                styles.optionText,
                answers[currentQuestion._id] === option.text && styles.selectedOptionText,
              ]}>
                {String.fromCharCode(65 + index)}. {option.text}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.navigation}>
          <TouchableOpacity
            style={[styles.navButton, styles.prevButton]}
            onPress={handlePrev}
            disabled={currentQuestionIndex === 0 || isSubmitted}
          >
            <Text style={styles.navButtonText}>Previous</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.navButton, styles.nextButton]}
            onPress={handleNext}
            disabled={currentQuestionIndex === exam.questions.length - 1 || isSubmitted}
          >
            <Text style={styles.navButtonText}>
              {currentQuestionIndex === exam.questions.length - 1 ? 'Finish' : 'Next'}
            </Text>
          </TouchableOpacity>
        </View>

        {currentQuestionIndex === exam.questions.length - 1 && !isSubmitted && (
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Submit Exam</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Results Modal */}
      <Modal visible={showResults} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.resultsModal}>
            <Text style={styles.resultsTitle}>Exam Results</Text>
            <Text style={styles.resultsScore}>
              Score: {examAPI.submitExam.result?.score || 0}%
            </Text>
            <Text style={[
              styles.resultsPassed,
              examAPI.submitExam.result?.passed ? styles.passed : styles.failed,
            ]}>
              {examAPI.submitExam.result?.passed ? 'Passed!' : 'Failed. Try again.'}
            </Text>
            {examAPI.submitExam.result?.certificateIssued && (
              <TouchableOpacity style={styles.certificateButton}>
                <Text style={styles.certificateButtonText}>View Certificate</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setShowResults(false);
                navigation.goBack();
              }}
            >
              <Text style={styles.closeButtonText}>Close</Text>
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
    ...(isWeb && { height: '100vh' }),
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: Colors.white,
    paddingTop: 60,
    paddingBottom: 16,
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
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  timerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: Colors.primaryLight,
  },
  timerText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  questionContainer: {
    flex: 1,
    padding: 24,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 24,
    lineHeight: 24,
  },
  optionsContainer: {
    marginBottom: 32,
  },
  option: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  selectedOption: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  optionText: {
    fontSize: 16,
    color: Colors.textPrimary,
  },
  selectedOptionText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  navButton: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginHorizontal: 8,
    backgroundColor: Colors.lightGray,
  },
  prevButton: {
    backgroundColor: Colors.mediumGray,
  },
  nextButton: {
    backgroundColor: Colors.primary,
  },
  navButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: Colors.success,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultsModal: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 32,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
  },
  resultsTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  resultsScore: {
    fontSize: 48,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 16,
  },
  resultsPassed: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 24,
  },
  passed: {
    color: Colors.success,
  },
  failed: {
    color: Colors.danger,
  },
  certificateButton: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  certificateButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    backgroundColor: Colors.lightGray,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  closeButtonText: {
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