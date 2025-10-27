// screens/AvailableExams.js
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

export default function AvailableExams({ navigation }) {
  const { user, loading: authLoading } = useAuth();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;

    fetchExams();
  }, [user]);

  const fetchExams = async () => {
    try {
      setLoading(true);
      setError(null);
      const availableExams = await examAPI.getAvailableExams();
      setExams(availableExams);
    } catch (err) {
      console.error('Fetch exams error:', err);
      setError('Failed to load exams. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartExam = (examId) => {
    navigation.navigate('TakeExam', { examId });
  };

  const renderExamCard = ({ item: exam }) => (
    <View style={styles.examCard}>
      <View style={styles.examHeader}>
        <Text style={styles.examTitle}>{exam.title}</Text>
        <Text style={styles.examStack}>{exam.stack}</Text>
      </View>
      <Text style={styles.examDescription} numberOfLines={3}>
        {exam.description || 'No description available.'}
      </Text>
      <View style={styles.examMeta}>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Duration:</Text>
          <Text style={styles.metaValue}>{exam.duration} min</Text>
        </View>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Questions:</Text>
          <Text style={styles.metaValue}>{exam.totalQuestions}</Text>
        </View>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Passing:</Text>
          <Text style={styles.metaValue}>{exam.passingScore}%</Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.startButton}
        onPress={() => handleStartExam(exam._id)}
      >
        <Text style={styles.startButtonText}>Start Exam</Text>
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
        <TouchableOpacity onPress={fetchExams} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Available Exams</Text>
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
          {exams.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No Exams Available</Text>
              <Text style={styles.emptySubtitle}>
                Exams for your {user?.stack} stack will appear here when assigned.
              </Text>
            </View>
          ) : (
            <FlatList
              data={exams}
              renderItem={renderExamCard}
              keyExtractor={(item) => item._id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.examsList}
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
  examsList: {
    paddingBottom: 20,
  },
  examCard: {
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
  examHeader: {
    marginBottom: 12,
  },
  examTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  examStack: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  examDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  examMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metaItem: {
    alignItems: 'center',
    flex: 1,
  },
  metaLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  startButton: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  startButtonText: {
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
    lineHeight: 22,
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