import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

export type CardVariant = 'elevated' | 'filled' | 'outlined';

export interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  onLongPress?: () => void;
  disabled?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'elevated',
  style,
  onPress,
  onLongPress,
  disabled = false,
}) => {
  const { colors, shapes, elevation } = useTheme();

  const getVariantStyles = (): {
    backgroundColor: string;
    elevationLevel: number;
    borderWidth?: number;
    borderColor?: string;
  } => {
    switch (variant) {
      case 'filled':
        return {
          backgroundColor: colors.surfaceContainerHighest,
          elevationLevel: elevation.level0,
        };
      case 'outlined':
        return {
          backgroundColor: colors.surface,
          elevationLevel: elevation.level0,
          borderWidth: 1,
          borderColor: colors.outlineVariant,
        };
      case 'elevated':
      default:
        return {
          backgroundColor: colors.surfaceContainerLow,
          elevationLevel: elevation.level1,
        };
    }
  };

  const { backgroundColor, elevationLevel, borderWidth, borderColor } = getVariantStyles();

  const cardStyle: ViewStyle = {
    backgroundColor,
    borderRadius: shapes.large, // 16dp per M3 Cards specification
    elevation: elevationLevel,
    borderWidth,
    borderColor,
    overflow: 'hidden',
  };

  if (onPress || onLongPress) {
    return (
      <TouchableOpacity
        style={[cardStyle, style]}
        onPress={onPress}
        onLongPress={onLongPress}
        disabled={disabled}
        activeOpacity={0.75}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={[cardStyle, style]}>{children}</View>;
};

export const ElevatedCard: React.FC<Omit<CardProps, 'variant'>> = (props) => (
  <Card variant="elevated" {...props} />
);

export const FilledCard: React.FC<Omit<CardProps, 'variant'>> = (props) => (
  <Card variant="filled" {...props} />
);

export const OutlinedCard: React.FC<Omit<CardProps, 'variant'>> = (props) => (
  <Card variant="outlined" {...props} />
);
