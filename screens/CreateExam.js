import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { adminAPI } from '../services/api';
import Colors from '../constants/colors';
import { ExamIcon, PlusIcon } from '../components/Icons';

const { width } = Dimensions.get('window');
const isWeb = width > 768;

export default function CreateExam({ navigation }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    stack: '',
    duration: 120,
    totalQuestions: 120,
    passingScore: 70,
    questions: [],
  });
  const [error, setError] = useState('');
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    questionText: '',
    options: ['', '', '', ''],
    correctAnswer: '',
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const addQuestion = () => {
    if (
      !newQuestion.questionText ||
      !newQuestion.correctAnswer ||
      newQuestion.options.some(opt => !opt)
    ) {
      setError('Please fill all question fields.');
      return;
    }

    const question = {
      questionText: newQuestion.questionText,
      options: newQuestion.options.map(opt => ({
        text: opt,
        isCorrect: opt === newQuestion.correctAnswer,
      })),
      correctAnswer: newQuestion.correctAnswer,
      difficulty: 'medium',
      category: '',
    };

    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, question],
      totalQuestions: prev.totalQuestions + 1,
    }));

    setNewQuestion({ questionText: '', options: ['', '', '', ''], correctAnswer: '' });
    setShowQuestionForm(false);
    setError('');
  };

  const removeQuestion = index => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
      totalQuestions: prev.totalQuestions - 1,
    }));
  };

  const submitExam = async () => {
    if (!formData.title || !formData.stack) {
      setError('Title and stack are required.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await adminAPI.createExam(formData);
      Alert.alert('Success', 'Exam created successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      console.error('Create exam error:', err);
      setError(err.message || 'Failed to create exam.');
    } finally {
      setLoading(false);
    }
  };

  const renderQuestion = (question, index) => (
    <View style={styles.questionItem} key={index}>
      <Text style={styles.questionNumber}>Q{index + 1}</Text>
      <Text style={styles.questionText}>{question.questionText}</Text>
      <Text style={styles.correctAnswer}>Correct: {question.correctAnswer}</Text>
      <TouchableOpacity style={styles.removeButton} onPress={() => removeQuestion(index)}>
        <Text style={styles.removeText}>Remove</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Create Exam</Text>
            <TouchableOpacity onPress={submitExam} style={styles.submitButton} disabled={loading}>
              <Text style={styles.submitText}>Create</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Main Content */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={true}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled={true}
          >
            <View style={styles.formWrapper}>
              {/* Basic Information */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <ExamIcon size={24} color={Colors.primary} />
                  <Text style={styles.sectionTitle}>Basic Information</Text>
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Exam Title *"
                  value={formData.title}
                  onChangeText={value => handleInputChange('title', value)}
                  returnKeyType="next"
                />
                <TextInput
                  style={[styles.input, styles.multiline]}
                  placeholder="Description (optional)"
                  value={formData.description}
                  onChangeText={value => handleInputChange('description', value)}
                  multiline
                  numberOfLines={4}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Stack (e.g., Marketing) *"
                  value={formData.stack}
                  onChangeText={value => handleInputChange('stack', value)}
                />
              </View>

              {/* Exam Settings */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <PlusIcon size={24} color={Colors.primary} />
                  <Text style={styles.sectionTitle}>Exam Settings</Text>
                </View>
                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>Duration (minutes)</Text>
                  <TextInput
                    style={styles.numberInput}
                    value={String(formData.duration)}
                    onChangeText={value =>
                      handleInputChange('duration', parseInt(value) || 120)
                    }
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>Total Questions</Text>
                  <TextInput
                    style={styles.numberInput}
                    value={String(formData.totalQuestions)}
                    onChangeText={value =>
                      handleInputChange('totalQuestions', parseInt(value) || 120)
                    }
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>Passing Score (%)</Text>
                  <TextInput
                    style={styles.numberInput}
                    value={String(formData.passingScore)}
                    onChangeText={value =>
                      handleInputChange('passingScore', parseInt(value) || 70)
                    }
                    keyboardType="numeric"
                  />
                </View>
              </View>

              {/* Questions */}
              <View style={styles.section}>
                <View style={styles.questionsHeaderRow}>
                  <View style={styles.sectionHeader}>
                    <ExamIcon size={24} color={Colors.primary} />
                    <Text style={styles.sectionTitle}>Questions ({formData.questions.length})</Text>
                  </View>
                  <TouchableOpacity onPress={() => setShowQuestionForm(!showQuestionForm)}>
                    <View style={styles.addButton}>
                      <PlusIcon size={20} color={Colors.white} />
                      <Text style={styles.addButtonText}>Add Question</Text>
                    </View>
                  </TouchableOpacity>
                </View>

                {showQuestionForm && (
                  <View style={styles.questionForm}>
                    <TextInput
                      style={[styles.input, styles.multiline]}
                      placeholder="Question Text *"
                      value={newQuestion.questionText}
                      onChangeText={value =>
                        setNewQuestion(prev => ({ ...prev, questionText: value }))
                      }
                      multiline
                      numberOfLines={3}
                    />
                    <Text style={styles.inputLabel}>Options (A, B, C, D)</Text>
                    {newQuestion.options.map((option, index) => (
                      <TextInput
                        key={index}
                        style={styles.optionInput}
                        placeholder={`Option ${String.fromCharCode(65 + index)} *`}
                        value={option}
                        onChangeText={value => {
                          const newOptions = [...newQuestion.options];
                          newOptions[index] = value;
                          setNewQuestion(prev => ({
                            ...prev,
                            options: newOptions,
                          }));
                        }}
                      />
                    ))}
                    <TextInput
                      style={styles.input}
                      placeholder="Correct Answer (e.g., A) *"
                      value={newQuestion.correctAnswer}
                      onChangeText={value =>
                        setNewQuestion(prev => ({
                          ...prev,
                          correctAnswer: value.toUpperCase(),
                        }))
                      }
                    />
                    <TouchableOpacity
                      style={styles.addQuestionButton}
                      onPress={addQuestion}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.addQuestionButtonText}>Add Question</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {formData.questions.length > 0 && (
                  <View style={styles.questionsList}>
                    {formData.questions.map((question, index) => renderQuestion(question, index))}
                  </View>
                )}
              </View>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.lightGray,
    ...(isWeb && { height: '100vh' }),
  },
  container: {
    flex: 1,
    backgroundColor: Colors.lightGray,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    backgroundColor: Colors.white,
    paddingTop: Platform.OS === 'android' ? 20 : 24,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: Colors.mediumGray,
    zIndex: 10,
  },
  headerContent: {
    paddingHorizontal: isWeb ? 40 : 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: isWeb ? 1200 : '100%',
    alignSelf: 'center',
    width: '100%',
  },
  backButton: {
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  submitText: {
    color: Colors.white,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: isWeb ? 40 : 24,
    paddingVertical: 20,
    paddingBottom: 48, // enough space for last inputs and keyboard
  },
  formWrapper: {
    maxWidth: isWeb ? 900 : '100%',
    width: '100%',
    alignSelf: 'center',
  },
  formContainer: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  section: {
    borderWidth: 1,
    borderColor: Colors.border || Colors.lightGray,
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    backgroundColor: "#fafafa",
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  questionsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    flex: 1,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  settingLabel: {
    flex: 1,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: Colors.white,
  },
  multiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  numberInput: {
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: Colors.white,
    textAlign: 'center',
    width: 110,
  },
  questionForm: {
    backgroundColor: Colors.lightGray,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
    fontWeight: '600',
  },
  optionInput: {
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    fontSize: 16,
    backgroundColor: Colors.white,
  },
  addQuestionButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  addQuestionButtonText: {
    color: Colors.white,
    fontWeight: '600',
  },
  questionsList: {
    backgroundColor: Colors.lightGray,
    borderRadius: 12,
    padding: 12,
  },
  questionItem: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  questionNumber: {
    fontSize: 14,
    color: Colors.secondary,
    fontWeight: '600',
    marginBottom: 4,
  },
  questionText: {
    fontSize: 14,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  correctAnswer: {
    fontSize: 12,
    color: Colors.success,
    fontWeight: '600',
  },
  removeButton: {
    backgroundColor: Colors.danger,
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  removeText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  addButtonText: {
    color: Colors.white,
    fontWeight: '600',
    marginLeft: 8,
  },
  errorText: {
    color: Colors.danger,
    textAlign: 'center',
    marginTop: 4,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});