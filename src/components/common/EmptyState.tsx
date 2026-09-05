import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { FilledTonalButton } from '../m3';

interface EmptyStateProps {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  onAction,
}) => {
  const { colors, typography, shapes, fontFamily } = useTheme();

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.iconCircle,
          {
            backgroundColor: colors.primaryContainer,
            borderRadius: shapes.full,
          },
        ]}
      >
        <MaterialCommunityIcons name={icon} size={48} color={colors.onPrimaryContainer} />
      </View>
      <Text
        style={[
          styles.title,
          {
            color: colors.onSurface,
            ...typography.titleLarge,
            fontFamily,
          },
        ]}
      >
        {title}
      </Text>
      <Text
        style={[
          styles.description,
          {
            color: colors.onSurfaceVariant,
            ...typography.bodyMedium,
            fontFamily,
          },
        ]}
      >
        {description}
      </Text>

      {actionText && onAction ? (
        <View style={{ marginTop: 16 }}>
          <FilledTonalButton
            label={actionText}
            onPress={onAction}
          />
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginVertical: 40,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
  button: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
