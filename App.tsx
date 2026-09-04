import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { BiometricLockScreen } from './src/components/common/BiometricLockScreen';
import { initNotifications, registerNotificationResponseListener } from './src/services/notifications';

function MainContent() {
  const { colors, appSettings, isReady } = useTheme();
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    initNotifications();
    const sub = registerNotificationResponseListener();
    return () => {
      sub.remove();
    };
  }, []);

  if (!isReady) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const showLockScreen = appSettings.biometricLock && !isUnlocked;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={colors.isDark ? 'light' : 'dark'} />
      <RootNavigator />
      {showLockScreen && (
        <BiometricLockScreen onUnlock={() => setIsUnlocked(true)} />
      )}
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <MainContent />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
