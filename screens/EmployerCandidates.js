// screens/EmployerCandidates.js (Fixed - Autocomplete, Input Validation)
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
  TextInput,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { rankingsAPI } from '../services/api';
import Colors from '../constants/colors';

// Predefined stacks and locations for autocomplete
const STACK_SUGGESTIONS = ['Marketing', 'Software Development', 'Data Science', 'Design', 'Finance'];
const LOCATION_SUGGESTIONS = ['Lagos', 'Abuja', 'Ifako-Ijaiye', 'Nigeria', 'Port Harcourt'];

const { width } = Dimensions.get('window');
const isWeb = width > 768;

export default function EmployerCandidates({ navigation }) {
  const { user, loading: authLoading } = useAuth();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    stack: '',
    location: '',
    minScore: '',
  });
  const [stackSuggestions, setStackSuggestions] = useState([]);
  const [locationSuggestions, setLocationSuggestions] = useState([]);

  useEffect(() => {
    if (!user) return;

    fetchCandidates();
  }, [user, filters]);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      setError(null);
      // Only send valid filters (min length 2 for stack/location)
      const stack = filters.stack.length >= 2 ? filters.stack : null;
      const location = filters.location.length >= 2 ? filters.location : null;
      const minScore = filters.minScore ? parseInt(filters.minScore) : null;

      console.log(`Candidates URL: http://172.20.10.10:5000/api/rankings/leaderboard?${stack ? `stack=${stack}&` : ''}${location ? `location=${location}&` : ''}view=country`);

      const data = await rankingsAPI.getEmployerCandidates(stack, location, minScore);
      console.log('Raw candidates response:', JSON.stringify(data));
      setCandidates(data?.leaderboard || []);
    } catch (err) {
      console.error('Fetch candidates error:', err);
      setError('Failed to load candidates. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));

    // Autocomplete suggestions
    if (key === 'stack') {
      if (value.length >= 1) {
        const suggestions = STACK_SUGGESTIONS.filter(s => s.toLowerCase().includes(value.toLowerCase()));
        setStackSuggestions(suggestions);
      } else {
        setStackSuggestions([]);
      }
    } else if (key === 'location') {
      if (value.length >= 1) {
        const suggestions = LOCATION_SUGGESTIONS.filter(l => l.toLowerCase().includes(value.toLowerCase()));
        setLocationSuggestions(suggestions);
      } else {
        setLocationSuggestions([]);
      }
    }
  };

  const applySuggestion = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    if (key === 'stack') setStackSuggestions([]);
    if (key === 'location') setLocationSuggestions([]);
  };

  const clearFilters = () => {
    setFilters({ stack: '', location: '', minScore: '' });
    setStackSuggestions([]);
    setLocationSuggestions([]);
  };

  const renderCandidate = ({ item: candidate, index }) => (
    <View style={styles.candidateCard}>
      <View style={styles.candidateHeader}>
        <Text style={styles.candidateRank}>#{index + 1}</Text>
        <View style={styles.candidateInfo}>
          <Text style={styles.candidateName}>{candidate.fullName}</Text>
          <Text style={styles.candidateStack}>{candidate.stack} • {candidate.experience} yrs</Text>
        </View>
      </View>
      <View style={styles.candidateDetails}>
        <Text style={styles.candidateScore}>Score: {candidate.score}</Text>
        <Text style={styles.candidateSkills}>
          Skills: {candidate.skills?.slice(0, 3).join(', ') || 'None'}...
        </Text>
        <Text style={styles.candidateLocation}>
          {candidate.city}, {candidate.state}, {candidate.country}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.viewProfileButton}
        onPress={() => navigation.navigate('CandidateProfile', { candidateId: candidate._id })}
      >
        <Text style={styles.viewProfileButtonText}>View Profile</Text>
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
        <TouchableOpacity onPress={fetchCandidates} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Top Candidates</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <View style={styles.filterRow}>
          <View style={styles.filterInputContainer}>
            <TextInput
              style={styles.filterInput}
              placeholder="Stack (e.g., Marketing)"
              value={filters.stack}
              onChangeText={(value) => handleFilterChange('stack', value)}
            />
            {stackSuggestions.length > 0 && (
              <View style={styles.suggestionsContainer}>
                {stackSuggestions.map((suggestion, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.suggestionItem}
                    onPress={() => applySuggestion('stack', suggestion)}
                  >
                    <Text style={styles.suggestionText}>{suggestion}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
          <View style={styles.filterInputContainer}>
            <TextInput
              style={styles.filterInput}
              placeholder="Location (e.g., Lagos)"
              value={filters.location}
              onChangeText={(value) => handleFilterChange('location', value)}
            />
            {locationSuggestions.length > 0 && (
              <View style={styles.suggestionsContainer}>
                {locationSuggestions.map((suggestion, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.suggestionItem}
                    onPress={() => applySuggestion('location', suggestion)}
                  >
                    <Text style={styles.suggestionText}>{suggestion}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
          <TextInput
            style={styles.filterInput}
            placeholder="Min Score"
            value={filters.minScore}
            onChangeText={(value) => handleFilterChange('minScore', value)}
            keyboardType="numeric"
          />
        </View>
        <View style={styles.filterActions}>
          <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.contentWrapper, isWeb && styles.contentWrapperWeb]}>
          <Text style={styles.resultsCount}>
            Showing {candidates.length} candidates
          </Text>
          {candidates.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No Candidates Found</Text>
              <Text style={styles.emptySubtitle}>Try adjusting your filters (e.g., Marketing, Lagos).</Text>
            </View>
          ) : (
            <FlatList
              data={candidates}
              renderItem={renderCandidate}
              keyExtractor={(item) => item._id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.candidatesList}
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
  filtersContainer: {
    backgroundColor: Colors.white,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.mediumGray,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterInputContainer: {
    flex: 1,
    position: 'relative',
  },
  filterInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: Colors.white,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    zIndex: 1000,
    maxHeight: 150,
    overflow: 'hidden',
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  suggestionText: {
    fontSize: 16,
    color: Colors.textPrimary,
  },
  filterActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  clearButton: {
    backgroundColor: Colors.mediumGray,
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  clearButtonText: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
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
  resultsCount: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 16,
    textAlign: 'center',
  },
  candidatesList: {
    paddingBottom: 20,
  },
  candidateCard: {
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
  candidateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  candidateRank: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary,
    marginRight: 12,
  },
  candidateInfo: {
    flex: 1,
  },
  candidateName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  candidateStack: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  candidateDetails: {
    marginBottom: 12,
  },
  candidateScore: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 4,
  },
  candidateSkills: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  candidateLocation: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  viewProfileButton: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  viewProfileButtonText: {
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