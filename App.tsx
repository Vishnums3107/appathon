/**
 * SaveVolt — Smart Energy Management
 * Track, analyze, and reduce your energy consumption
 * 
 * @format
 */

import React, { useEffect, useState } from 'react';
import { StatusBar, StyleSheet, useColorScheme, View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { EnergyProvider, useEnergy } from './src/context/EnergyContext';
import AppNavigator from './src/navigation/AppNavigator';
import { initializeTts } from './src/utils/voice';

function AppContent() {
  const { isLoading } = useEnergy();
  const [startupTimedOut, setStartupTimedOut] = useState(false);

  useEffect(() => {
    // Initialize text-to-speech on app start
    initializeTts();
  }, []);

  useEffect(() => {
    // SaveVolt is local-first. Never trap the user on a launch spinner if a
    // device service such as storage or networking is slow to respond.
    const timeout = setTimeout(() => setStartupTimedOut(true), 6000);
    return () => clearTimeout(timeout);
  }, []);

  if (isLoading && !startupTimedOut) {
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
    <GestureHandlerRootView style={styles.appRoot}>
      <SafeAreaProvider>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <EnergyProvider>
          <AppContent />
        </EnergyProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  appRoot: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
});

export default App;
