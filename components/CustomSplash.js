// components/CustomSplash.js
import React from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator } from 'react-native';
import Colors from '../constants/colors';

export default function CustomSplash() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Logo */}
        <Image 
          source={require('../assets/images/logo.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
        
        {/* Tagline */}
        <Text style={styles.tagline}>Your Career Growth Partner</Text>
        
        {/* Loading Indicator */}
        <ActivityIndicator 
          size="large" 
          color={Colors.white} 
          style={styles.loader}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary, // Deep blue background
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 24,
  },
  tagline: {
    fontSize: 18,
    color: Colors.white,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  loader: {
    marginTop: 40,
  },
});