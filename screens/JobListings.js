// screens/JobListings.js (Improved - Naira with Flag)
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
  TextInput,
  Modal,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { jobAPI, uploadAPI } from '../services/api';
import Colors from '../constants/colors';
import { JobIcon, SearchIcon, LocationIcon, SalaryIcon, CloseIcon } from '../components/Icons';
import * as DocumentPicker from 'expo-document-picker';

const { width } = Dimensions.get('window');
const isWeb = width > 768;

export default function JobListings({ navigation }) {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const data = await jobAPI.getAllJobs();
      setJobs(data);
    } catch (error) {
      console.error('Fetch jobs error:', error);
      Alert.alert('Error', 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = (job) => {
    if (!user?.profileComplete) {
      Alert.alert(
        'Complete Your Profile',
        'Please complete your profile before applying to jobs.',
        [{ text: 'Go to Profile', onPress: () => navigation.navigate('EmployeeProfileSetup') }]
      );
      return;
    }

    setSelectedJob(job);
    setCoverLetter('');
    setShowApplyModal(true);
  };

  const submitApplication = async () => {
    try {
      setApplying(true);
      await jobAPI.applyToJob(selectedJob._id, { coverLetter });
      Alert.alert('Success', 'Application submitted successfully!');
      setShowApplyModal(false);
      fetchJobs(); // Refresh to update applied status
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to apply');
    } finally {
      setApplying(false);
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const ApplyModal = () => (
    <Modal visible={showApplyModal} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Apply for {selectedJob?.title}</Text>
            <TouchableOpacity onPress={() => setShowApplyModal(false)}>
              <CloseIcon size={24} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
            <View style={styles.jobInfoSection}>
              <Text style={styles.sectionTitle}>Position Details</Text>
              <Text style={styles.jobDetailText}>Company: {selectedJob?.company?.companyName}</Text>
              <Text style={styles.jobDetailText}>Location: {selectedJob?.location}</Text>
              <Text style={styles.jobDetailText}>Stack: {selectedJob?.stack}</Text>
            </View>

            <View style={styles.profileSection}>
              <Text style={styles.sectionTitle}>Your Profile</Text>
              <Text style={styles.profileText}>Name: {user?.fullName}</Text>
              <Text style={styles.profileText}>Email: {user?.email}</Text>
              <Text style={styles.profileText}>Stack: {user?.stack}</Text>
              <Text style={styles.profileText}>Score: {user?.score || 0}</Text>
              {user?.cvURL && (
                <Text style={styles.profileText}>✓ CV Attached</Text>
              )}
            </View>

            <View style={styles.coverLetterSection}>
              <Text style={styles.sectionTitle}>Cover Letter (Optional)</Text>
              <TextInput
                style={styles.coverLetterInput}
                placeholder="Tell the employer why you're a great fit..."
                value={coverLetter}
                onChangeText={setCoverLetter}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
            </View>
          </ScrollView>

          <TouchableOpacity
            style={[styles.submitButton, applying && styles.submitButtonDisabled]}
            onPress={submitApplication}
            disabled={applying}
          >
            {applying ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.submitButtonText}>Submit Application</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Job Listings</Text>
          <View style={styles.placeholder} />
        </View>
      </View>

      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <SearchIcon size={20} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search jobs..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ApplyModal />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={[styles.contentWrapper, isWeb && styles.contentWrapperWeb]}>
          {filteredJobs.length === 0 ? (
            <View style={styles.emptyState}>
              <JobIcon size={48} color={Colors.mediumGray} />
              <Text style={styles.emptyText}>No jobs available</Text>
              <Text style={styles.emptySubtext}>Check back later for new opportunities</Text>
            </View>
          ) : (
            filteredJobs.map((job) => (
              <View key={job._id} style={styles.jobCard}>
                <View style={styles.jobHeader}>
                  <View style={styles.companyBadge}>
                    <Text style={styles.companyInitial}>
                      {job.company?.companyName?.[0] || 'C'}
                    </Text>
                  </View>
                  <View style={styles.jobHeaderInfo}>
                    <Text style={styles.jobTitle}>{job.title}</Text>
                    <Text style={styles.companyName}>{job.company?.companyName || 'Company'}</Text>
                  </View>
                </View>

                <View style={styles.jobDetails}>
                  <View style={styles.detailRow}>
                    <JobIcon size={16} color={Colors.primary} />
                    <Text style={styles.detailText}>{job.stack}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <LocationIcon size={16} color={Colors.primary} />
                    <Text style={styles.detailText}>{job.location}</Text>
                  </View>
                  {job.salaryRange?.min && job.salaryRange?.max && (
                    <View style={styles.detailRow}>
                      <SalaryIcon size={16} color={Colors.primary} />
                      <Text style={styles.detailText}>
                        ₦{job.salaryRange.min} - ₦{job.salaryRange.max} <Text style={styles.flagEmoji}>🇳🇬</Text>
                      </Text>
                    </View>
                  )}
                </View>

                <Text style={styles.jobDescription} numberOfLines={3}>
                  {job.description}
                </Text>

                {job.requirements && job.requirements.length > 0 && (
                  <View style={styles.requirementsContainer}>
                    <Text style={styles.requirementsLabel}>Requirements:</Text>
                    <View style={styles.requirementsList}>
                      {job.requirements.slice(0, 3).map((req, index) => (
                        <View key={index} style={styles.requirementTag}>
                          <Text style={styles.requirementText}>{req}</Text>
                        </View>
                      ))}
                      {job.requirements.length > 3 && (
                        <Text style={styles.moreRequirements}>+{job.requirements.length - 3} more</Text>
                      )}
                    </View>
                  </View>
                )}

                <View style={styles.jobFooter}>
                  <Text style={styles.postedDate}>
                    Posted {new Date(job.createdAt).toLocaleDateString()}
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.applyButton,
                      job.hasApplied && styles.appliedButton
                    ]}
                    onPress={() => handleApply(job)}
                    disabled={job.hasApplied}
                  >
                    <Text style={[
                      styles.applyButtonText,
                      job.hasApplied && styles.appliedButtonText
                    ]}>
                      {job.hasApplied ? 'Applied' : 'Apply Now'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
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
  placeholder: {
    width: 60,
  },
  searchSection: {
    backgroundColor: Colors.white,
    paddingHorizontal: isWeb ? 40 : 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.lightGray,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  scrollView: {
    flex: 1,
  },
  contentWrapper: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  contentWrapperWeb: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 40,
  },
  jobCard: {
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
  jobHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  companyBadge: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  companyInitial: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.white,
  },
  jobHeaderInfo: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  companyName: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  jobDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    gap: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 6,
    fontWeight: '500',
  },
  flagEmoji: {
    fontSize: 12,
  },
  jobDescription: {
    fontSize: 15,
    color: Colors.textPrimary,
    lineHeight: 22,
    marginBottom: 16,
  },
  requirementsContainer: {
    marginBottom: 16,
  },
  requirementsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  requirementsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  requirementTag: {
    backgroundColor: Colors.lightGray,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  requirementText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  moreRequirements: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
    alignSelf: 'center',
  },
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
  },
  postedDate: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  applyButton: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  appliedButton: {
    backgroundColor: Colors.lightGray,
  },
  applyButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  appliedButtonText: {
    color: Colors.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 8,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    margin: 20,
    maxHeight: '85%',
    width: isWeb ? 600 : '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    flex: 1,
    marginRight: 12,
  },
  modalScroll: {
    maxHeight: '70%',
  },
  jobInfoSection: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: Colors.lightGray,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  jobDetailText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 6,
    fontWeight: '500',
  },
  profileSection: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: Colors.lightGray,
    borderRadius: 12,
  },
  profileText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 6,
    fontWeight: '500',
  },
  coverLetterSection: {
    marginBottom: 20,
  },
  coverLetterInput: {
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderRadius: 12,
    padding: 16,
    minHeight: 120,
    fontSize: 15,
    color: Colors.textPrimary,
    textAlignVertical: 'top',
    backgroundColor: Colors.white,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
});