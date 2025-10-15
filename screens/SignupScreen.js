// screens/SignupScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image
} from 'react-native';
import Colors from '../constants/colors';
import ErrorModal from '../components/ErrorModal';
import { useAuth } from '../contexts/AuthContext';

export default function SignupScreen({ navigation }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('employee');
  const [loading, setLoading] = useState(false);
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorTitle, setErrorTitle] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successVisible, setSuccessVisible] = useState(false);

  const { signup } = useAuth();

  const roles = [
    { id: 'employee', label: 'Employee', description: 'Looking for opportunities' },
    { id: 'employer', label: 'Employer', description: 'Hiring talent' },
  ];

  const showErrorModal = (title, message) => {
    setErrorTitle(title);
    setErrorMessage(message);
    setErrorVisible(true);
  };

  const showSuccessModal = () => {
    setSuccessVisible(true);
  };

  const handleSignup = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      showErrorModal('Missing Fields', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      showErrorModal('Password Mismatch', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      showErrorModal('Weak Password', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await signup(fullName, email, password, selectedRole);
      showSuccessModal();
    } catch (error) {
      showErrorModal('Signup Error', error.message || 'Signup failed. Please try again.');
      console.error('Signup error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ErrorModal
        visible={errorVisible}
        title={errorTitle}
        message={errorMessage}
        onClose={() => setErrorVisible(false)}
      />
      
      <ErrorModal
        visible={successVisible}
        title="Success!"
        message="Account created successfully! Redirecting..."
        onClose={() => setSuccessVisible(false)}
      />

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerContainer}>
          <Image 
            source={require('../assets/images/logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join MyHr and grow your career</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              placeholderTextColor={Colors.textMuted}
              value={fullName}
              onChangeText={setFullName}
              editable={!loading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor={Colors.textMuted}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!loading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Create a password (min 6 characters)"
              placeholderTextColor={Colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!loading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Re-enter your password"
              placeholderTextColor={Colors.textMuted}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              editable={!loading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>I am a/an:</Text>
            <View style={styles.roleContainer}>
              {roles.map((role) => (
                <TouchableOpacity
                  key={role.id}
                  style={[
                    styles.roleCard,
                    selectedRole === role.id && styles.roleCardSelected
                  ]}
                  onPress={() => setSelectedRole(role.id)}
                  disabled={loading}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.roleLabel,
                    selectedRole === role.id && styles.roleLabelSelected
                  ]}>
                    {role.label}
                  </Text>
                  <Text style={[
                    styles.roleDescription,
                    selectedRole === role.id && styles.roleDescriptionSelected
                  ]}>
                    {role.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={[styles.primaryButton, loading && styles.buttonDisabled]}
            onPress={handleSignup}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={Colors.white} size="small" />
            ) : (
              <Text style={styles.primaryButtonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          <View style={styles.linkContainer}>
            <Text style={styles.linkText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.linkButton}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.lightGray,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 60,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 36,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  input: {
    backgroundColor: Colors.lightGray,
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.mediumGray,
    fontWeight: '400',
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  roleCard: {
    flex: 1,
    backgroundColor: Colors.lightGray,
    borderRadius: 10,
    padding: 18,
    borderWidth: 2,
    borderColor: Colors.mediumGray,
    alignItems: 'center',
  },
  roleCardSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  roleLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  roleLabelSelected: {
    color: Colors.white,
  },
  roleDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  roleDescriptionSelected: {
    color: Colors.white,
    opacity: 0.9,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  linkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  linkText: {
    color: Colors.textSecondary,
    fontSize: 15,
    fontWeight: '400',
  },
  linkButton: {
    color: Colors.textLink,
    fontSize: 15,
    fontWeight: '700',
  },
});