// screens/CandidateProfile.js (WITH DEBUG LOGGING)
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ActivityIndicator,
  TouchableOpacity, Linking, ScrollView
} from 'react-native';
import { profileAPI } from '../services/api';
import Colors from '../constants/colors';

// Helper function to sanitize candidate data
const sanitizeCandidate = (data) => {
  if (!data) return null;
  
  console.log('=== SANITIZING DATA ===');
  console.log('Raw profileComplete:', data.profileComplete, '| Type:', typeof data.profileComplete);
  console.log('Raw score:', data.score, '| Type:', typeof data.score);
  console.log('Raw experience:', data.experience, '| Type:', typeof data.experience);
  
  const sanitized = {
    ...data,
    profileComplete: data.profileComplete === true || data.profileComplete === 'true' || data.profileComplete === 1,
    score: Number(data.score) || 0,
    experience: Number(data.experience) || 0,
    rank: Number(data.rank) || 0,
  };
  
  console.log('Sanitized profileComplete:', sanitized.profileComplete, '| Type:', typeof sanitized.profileComplete);
  console.log('Sanitized score:', sanitized.score, '| Type:', typeof sanitized.score);
  console.log('=== END SANITIZING ===');
  
  return sanitized;
};

export default function CandidateProfile({ route, navigation }) {
  const { candidateId } = route.params;
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCandidate = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('=== FETCHING CANDIDATE ===');
        console.log('Candidate ID:', candidateId);

        if (!candidateId || !/^[0-9a-fA-F]{24}$/.test(candidateId)) {
          throw new Error('Invalid candidate ID');
        }

        const data = await profileAPI.getProfileById(candidateId);
        
        console.log('=== RAW API RESPONSE ===');
        console.log('Full response:', JSON.stringify(data, null, 2));
        console.log('profileComplete value:', data.profileComplete);
        console.log('profileComplete type:', typeof data.profileComplete);

        const sanitized = sanitizeCandidate(data);
        
        console.log('=== SETTING STATE ===');
        console.log('About to set candidate state with:', sanitized);
        
        setCandidate(sanitized);
        
        console.log('=== STATE SET COMPLETE ===');
      } catch (err) {
        console.error('=== FETCH ERROR ===');
        console.error('Error:', err);
        console.error('Error message:', err.message);
        console.error('Error stack:', err.stack);
        setError(err.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchCandidate();
  }, [candidateId]);

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

  console.log('=== RENDERING PROFILE ===');
  console.log('Candidate state:', candidate);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>{candidate.fullName}</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Stack</Text>
        <Text style={styles.value}>{candidate.stack || 'N/A'}</Text>

        <Text style={styles.label}>Score</Text>
        <Text style={styles.value}>{candidate.score} / 100</Text>

        <Text style={styles.label}>Experience</Text>
        <Text style={styles.value}>{candidate.experience} years</Text>

        <Text style={styles.label}>Location</Text>
        <Text style={styles.value}>
          {candidate.city || 'N/A'}, {candidate.state || 'N/A'}, {candidate.country || 'N/A'}
        </Text>

        <Text style={styles.label}>Skills</Text>
        <Text style={styles.value}>
          {candidate.skills?.length > 0 ? candidate.skills.join(', ') : 'None listed'}
        </Text>

        {candidate.cvURL && (
          <TouchableOpacity style={styles.cvButton} onPress={() => Linking.openURL(candidate.cvURL)}>
            <Text style={styles.cvButtonText}>View CV</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.lightGray },
  content: { padding: 24 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.lightGray },
  loadingText: { marginTop: 12, color: Colors.textSecondary, fontSize: 16 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: Colors.white, paddingTop: 60, paddingBottom: 16,
    paddingHorizontal: 24, borderBottomWidth: 1, borderBottomColor: Colors.mediumGray,
  },
  title: { fontSize: 24, fontWeight: '700', color: Colors.textPrimary },
  backText: { fontSize: 16, color: Colors.primary, fontWeight: '600' },
  card: {
    backgroundColor: Colors.white, borderRadius: 16, padding: 20, marginTop: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 3,
  },
  label: { fontSize: 14, color: Colors.textSecondary, marginTop: 16, marginBottom: 4 },
  value: { fontSize: 18, color: Colors.textPrimary, fontWeight: '600' },
  cvButton: { backgroundColor: Colors.primary, marginTop: 20, padding: 14, borderRadius: 12, alignItems: 'center' },
  cvButtonText: { color: Colors.white, fontWeight: '700', fontSize: 16 },
  errorText: { color: Colors.danger, fontSize: 16, textAlign: 'center', marginBottom: 20 },
  button: { backgroundColor: Colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
  buttonText: { color: Colors.white, fontWeight: '700' },
});