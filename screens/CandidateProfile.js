// screens/CandidateProfile.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
  ScrollView,
} from 'react-native';
import { profileAPI } from '../services/api';
import Colors from '../constants/colors';

export default function CandidateProfile({ route, navigation }) {
  const { candidateId } = route.params;
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCandidate = async () => {
      try {
        setLoading(true);
        const data = await profileAPI.getProfileById(candidateId);
        setCandidate(data);
      } catch (err) {
        console.error('Error fetching candidate:', err);
        setError('Failed to load candidate profile.');
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
        <Text style={styles.value}>{candidate.score ?? 0}</Text>

        <Text style={styles.label}>Experience</Text>
        <Text style={styles.value}>{candidate.experience ?? 0} years</Text>

        <Text style={styles.label}>Location</Text>
        <Text style={styles.value}>
          {candidate.city}, {candidate.state}, {candidate.country}
        </Text>

        <Text style={styles.label}>Skills</Text>
        <Text style={styles.value}>
          {candidate.skills?.length > 0 ? candidate.skills.join(', ') : 'None listed'}
        </Text>

        {candidate.cvURL && (
          <TouchableOpacity
            style={styles.cvButton}
            onPress={() => Linking.openURL(candidate.cvURL)}
          >
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: Colors.mediumGray,
  },
  title: { fontSize: 24, fontWeight: '700', color: Colors.textPrimary },
  backText: { fontSize: 16, color: Colors.primary, fontWeight: '600' },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  label: { fontSize: 14, color: Colors.textSecondary, marginTop: 16, marginBottom: 4 },
  value: { fontSize: 18, color: Colors.textPrimary, fontWeight: '600' },
  cvButton: {
    backgroundColor: Colors.primary,
    marginTop: 20,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cvButtonText: { color: Colors.white, fontWeight: '700', fontSize: 16 },
  errorText: { color: Colors.danger, fontSize: 16, textAlign: 'center', marginBottom: 20 },
  button: { backgroundColor: Colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
  buttonText: { color: Colors.white, fontWeight: '700' },
});