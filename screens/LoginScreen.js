// screens/LoginScreen.js
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

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { login } = useAuth();

  const showErrorModal = (message) => {
    setErrorMessage(message);
    setErrorVisible(true);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      showErrorModal('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      await login(email, password);
    } catch (error) {
      showErrorModal(error.message || 'Login failed. Please try again.');
      console.error('Login error:', error);
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
        title="Login Error"
        message={errorMessage}
        onClose={() => setErrorVisible(false)}
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
          <Text style={styles.tagline}>Your Career Growth Partner</Text>
        </View>

        <View style={styles.card}>
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
              placeholder="Enter your password"
              placeholderTextColor={Colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!loading}
            />
          </View>

          <TouchableOpacity style={styles.forgotButton}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.primaryButton, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={Colors.white} size="small" />
            ) : (
              <Text style={styles.primaryButtonText}>Login</Text>
            )}
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.linkContainer}>
            <Text style={styles.linkText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
              <Text style={styles.linkButton}>Sign Up</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={styles.guestButton}
            onPress={() => showErrorModal('Guest mode coming soon!')}
          >
            <Text style={styles.guestButtonText}>Continue as Guest</Text>
          </TouchableOpacity>
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
    marginBottom: 40,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  tagline: {
    fontSize: 16,
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
  forgotButton: {
    alignSelf: 'flex-end',
    marginBottom: 24,
    marginTop: -8,
  },
  forgotText: {
    color: Colors.textLink,
    fontSize: 14,
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
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
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 28,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.mediumGray,
  },
  dividerText: {
    marginHorizontal: 16,
    color: Colors.textMuted,
    fontSize: 14,
    fontWeight: '500',
  },
  linkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
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
  guestButton: {
    marginTop: 20,
    padding: 12,
    alignItems: 'center',
  },
  guestButtonText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});