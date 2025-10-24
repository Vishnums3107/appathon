/**
 * Energy Tracker App
 * Track, analyze, and reduce your energy consumption
 * 
 * @format
 */

import React, { useEffect } from 'react';
import { StatusBar, StyleSheet, useColorScheme, View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { EnergyProvider, useEnergy } from './src/context/EnergyContext';
import AppNavigator from './src/navigation/AppNavigator';
import { initializeTts } from './src/utils/voice';

function AppContent() {
  const { isLoading } = useEnergy();

  useEffect(() => {
    // Initialize text-to-speech on app start
    initializeTts();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return <AppNavigator />;
}

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <EnergyProvider>
        <AppContent />
      </EnergyProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
});

export default App;
