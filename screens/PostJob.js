// screens/PostJob.js (Employer Post Job)
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
  TextInput,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { jobAPI } from '../services/api';
import Colors from '../constants/colors';
import { JobIcon, PlusIcon } from '../components/Icons';

const { width } = Dimensions.get('window');

export default function PostJob({ navigation }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [jobData, setJobData] = useState({
    title: '',
    description: '',
    stack: '',
    location: '',
    salaryMin: '',
    salaryMax: '',
    requirements: [],
    applicationQuestions: [],  // New: Custom questions
  });
  const [requirement, setRequirement] = useState('');
  const [question, setQuestion] = useState('');  // New: For questions input
  const [error, setError] = useState('');

  const addRequirement = () => {
    if (requirement.trim()) {
      setJobData(prev => ({
        ...prev,
        requirements: [...prev.requirements, requirement.trim()],
      }));
      setRequirement('');
      setError('');
    }
  };

  const removeRequirement = index => {
    setJobData(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index),
    }));
  };

  // New: Add/remove questions
  const addQuestion = () => {
    if (question.trim()) {
      setJobData(prev => ({
        ...prev,
        applicationQuestions: [...prev.applicationQuestions, question.trim()],
      }));
      setQuestion('');
      setError('');
    }
  };

  const removeQuestion = index => {
    setJobData(prev => ({
      ...prev,
      applicationQuestions: prev.applicationQuestions.filter((_, i) => i !== index),
    }));
  };

  const submitJob = async () => {
    if (!jobData.title || !jobData.stack || !jobData.location) {
      setError('Title, stack, and location are required.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await jobAPI.postJob(jobData);
      Alert.alert('Success', 'Job posted successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (err) {
      console.error('Post job error:', err);
      setError(err.message || 'Failed to post job.');
    } finally {
      setLoading(false);
    }
  };

  const renderRequirement = (req, index) => (
    <View style={styles.requirementItem} key={index}>
      <Text style={styles.requirementText}>{req}</Text>
      <TouchableOpacity onPress={() => removeRequirement(index)}>
        <Text style={styles.removeReqText}>Remove</Text>
      </TouchableOpacity>
    </View>
  );

  // New: Render questions similarly
  const renderQuestion = (q, index) => (
    <View style={styles.requirementItem} key={index}>
      <Text style={styles.requirementText}>{q}</Text>
      <TouchableOpacity onPress={() => removeQuestion(index)}>
        <Text style={styles.removeReqText}>Remove</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Post Job</Text>
          <TouchableOpacity onPress={submitJob} style={styles.submitButton} disabled={loading}>
            <Text style={styles.submitText}>Post Job</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="Job Title *"
            value={jobData.title}
            onChangeText={value => setJobData(prev => ({ ...prev, title: value }))}
          />
          <TextInput
            style={styles.input}
            placeholder="Job Description *"
            value={jobData.description}
            onChangeText={value => setJobData(prev => ({ ...prev, description: value }))}
            multiline
            numberOfLines={4}
          />
          <TextInput
            style={styles.input}
            placeholder="Stack (e.g., Marketing) *"
            value={jobData.stack}
            onChangeText={value => setJobData(prev => ({ ...prev, stack: value }))}
          />
          <TextInput
            style={styles.input}
            placeholder="Location *"
            value={jobData.location}
            onChangeText={value => setJobData(prev => ({ ...prev, location: value }))}
          />
          <View style={styles.salaryRow}>
            <TextInput
              style={styles.salaryInput}
              placeholder="Min Salary"
              value={jobData.salaryMin}
              onChangeText={value => setJobData(prev => ({ ...prev, salaryMin: value }))}
              keyboardType="numeric"
            />
            <Text style={styles.salaryTo}>to</Text>
            <TextInput
              style={styles.salaryInput}
              placeholder="Max Salary"
              value={jobData.salaryMax}
              onChangeText={value => setJobData(prev => ({ ...prev, salaryMax: value }))}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.requirementsSection}>
            <Text style={styles.requirementsTitle}>Requirements</Text>
            <View style={styles.requirementInputRow}>
              <TextInput
                style={styles.requirementInput}
                placeholder="Add requirement (e.g., React experience)"
                value={requirement}
                onChangeText={setRequirement}
              />
              <TouchableOpacity onPress={addRequirement} style={styles.addReqButton}>
                <Text style={styles.addReqText}>Add</Text>
              </TouchableOpacity>
            </View>
            {jobData.requirements.length > 0 && (
              <View style={styles.requirementsList}>
                {jobData.requirements.map((req, index) => renderRequirement(req, index))}
              </View>
            )}
          </View>

          {/* New: Application Questions Section */}
          <View style={styles.requirementsSection}>
            <Text style={styles.requirementsTitle}>Application Questions (Optional)</Text>
            <Text style={styles.sectionSubtext}>Ask custom questions for deeper insights (e.g., "Tell us about a challenge you solved")</Text>
            <View style={styles.requirementInputRow}>
              <TextInput
                style={styles.requirementInput}
                placeholder="Add a question for applicants"
                value={question}
                onChangeText={setQuestion}
              />
              <TouchableOpacity onPress={addQuestion} style={styles.addReqButton}>
                <Text style={styles.addReqText}>Add</Text>
              </TouchableOpacity>
            </View>
            {jobData.applicationQuestions.length > 0 && (
              <View style={styles.requirementsList}>
                {jobData.applicationQuestions.map((q, index) => renderQuestion(q, index))}
              </View>
            )}
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.lightGray,
  },
  header: {
    backgroundColor: Colors.white,
    paddingTop: 60,
    paddingBottom: 24,
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
    padding: 8,
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
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  submitText: {
    color: Colors.white,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: Colors.white,
  },
  salaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  salaryInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: Colors.white,
    marginHorizontal: 4,
    textAlign: 'center',
  },
  salaryTo: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  requirementsSection: {
    marginBottom: 20,
  },
  requirementsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  sectionSubtext: {  // New
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  requirementInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  requirementInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: Colors.white,
    marginRight: 8,
  },
  addReqButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  addReqText: {
    color: Colors.white,
    fontWeight: '600',
  },
  requirementsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  requirementItem: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  requirementText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  removeReqText: {
    color: Colors.danger,
    fontSize: 12,
    marginLeft: 8,
  },
  errorText: {
    color: Colors.danger,
    textAlign: 'center',
    marginBottom: 16,
  },
});