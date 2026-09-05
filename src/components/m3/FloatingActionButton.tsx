import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
  Animated,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';

export type FABSize = 'small' | 'standard' | 'large' | 'extended';
export type FABColor = 'primary' | 'secondary' | 'tertiary' | 'surface';

export interface FloatingActionButtonProps {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label?: string;
  size?: FABSize;
  colorVariant?: FABColor;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  accessibilityLabel?: string;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  icon,
  label,
  size = 'standard',
  colorVariant = 'primary',
  onPress,
  style,
  disabled = false,
  accessibilityLabel,
}) => {
  const { colors, shapes, elevation, typography } = useTheme();

  // Color mapping per M3 spec
  const getColors = () => {
    switch (colorVariant) {
      case 'secondary':
        return {
          container: colors.secondaryContainer,
          content: colors.onSecondaryContainer,
        };
      case 'tertiary':
        return {
          container: colors.tertiaryContainer,
          content: colors.onTertiaryContainer,
        };
      case 'surface':
        return {
          container: colors.surfaceContainerHigh,
          content: colors.primary,
        };
      case 'primary':
      default:
        return {
          container: colors.primaryContainer,
          content: colors.onPrimaryContainer,
        };
    }
  };

  const { container, content } = getColors();

  // Size mapping per M3 spec
  const getSizeStyles = (): {
    containerStyle: ViewStyle;
    iconSize: number;
  } => {
    switch (size) {
      case 'small':
        return {
          containerStyle: {
            width: 40,
            height: 40,
            borderRadius: shapes.medium, // 12dp
          },
          iconSize: 24,
        };
      case 'large':
        return {
          containerStyle: {
            width: 96,
            height: 96,
            borderRadius: shapes.extraLarge, // 28dp
          },
          iconSize: 36,
        };
      case 'extended':
        return {
          containerStyle: {
            height: 56,
            paddingHorizontal: 16,
            borderRadius: shapes.large, // 16dp
            flexDirection: 'row',
            gap: 12,
          },
          iconSize: 24,
        };
      case 'standard':
      default:
        return {
          containerStyle: {
            width: 56,
            height: 56,
            borderRadius: shapes.large, // 16dp
          },
          iconSize: 24,
        };
    }
  };

  const { containerStyle, iconSize } = getSizeStyles();

  return (
    <TouchableOpacity
      style={[
        styles.base,
        containerStyle,
        {
          backgroundColor: container,
          elevation: elevation.level3, // 6dp resting
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.25,
          shadowRadius: 4,
          opacity: disabled ? 0.38 : 1,
        },
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || label || 'Action button'}
    >
      <MaterialCommunityIcons name={icon} size={iconSize} color={content} />
      {size === 'extended' && label ? (
        <Text
          style={[
            typography.labelLarge,
            { color: content, fontWeight: '700' },
          ]}
        >
          {label}
        </Text>
      ) : null}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
