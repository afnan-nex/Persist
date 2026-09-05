import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { authenticateUser } from '../../services/biometrics';
import { useTheme } from '../../theme/ThemeContext';
import { FilledButton } from '../m3';

interface BiometricLockScreenProps {
  onUnlock: () => void;
}

export const BiometricLockScreen: React.FC<BiometricLockScreenProps> = ({ onUnlock }) => {
  const { colors, typography, shapes, fontFamily } = useTheme();
  const [error, setError] = useState<string | null>(null);

  const attemptUnlock = async () => {
    setError(null);
    const success = await authenticateUser();
    if (success) {
      onUnlock();
    } else {
      setError('Authentication failed. Please try again.');
    }
  };

  useEffect(() => {
    attemptUnlock();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.iconCircle, { backgroundColor: colors.primaryContainer, borderRadius: shapes.full }]}>
        <MaterialCommunityIcons name="lock" size={48} color={colors.onPrimaryContainer} />
      </View>

      <Text style={[styles.title, { color: colors.onBackground, ...typography.headlineMedium, fontFamily }]}>
        Persist is Locked
      </Text>
      <Text style={[styles.subtitle, { color: colors.onSurfaceVariant, ...typography.bodyMedium, fontFamily }]}>
        Authenticate with your fingerprint or device PIN to continue
      </Text>

      {error ? (
        <Text style={[styles.errorText, { color: colors.error, ...typography.bodyMedium, fontFamily }]}>
          {error}
        </Text>
      ) : null}

      <FilledButton
        label="Unlock"
        icon="fingerprint"
        onPress={attemptUnlock}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    zIndex: 9999,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
    marginBottom: 24,
  },
  errorText: {
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  unlockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 24,
    gap: 8,
  },
  unlockButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
