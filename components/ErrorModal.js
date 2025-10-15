// components/ErrorModal.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';
import Colors from '../constants/colors';

const { width } = Dimensions.get('window');
const isWeb = width > 768;

export const showError = (title, message, onClose) => {
  // This will be handled by a global error handler
  return { title, message, onClose };
};

export default function ErrorModal({ visible, title, message, onClose }) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, isWeb && styles.modalContainerWeb]}>
          {/* Error Icon */}
          <View style={styles.iconContainer}>
            <Text style={styles.iconText}>⚠️</Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>{title || 'Error'}</Text>

          {/* Message */}
          <Text style={styles.message}>{message}</Text>

          {/* Button */}
          <TouchableOpacity
            style={styles.button}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 40,
    elevation: 10,
  },
  modalContainerWeb: {
    maxWidth: 450,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 24,
  },
  iconText: {
    fontSize: 48,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  message: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 28,
    fontWeight: '500',
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});