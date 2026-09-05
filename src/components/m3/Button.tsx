import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';

export type ButtonVariant = 'filled' | 'filled-tonal' | 'elevated' | 'outlined' | 'text';

export interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  destructive?: boolean;
  containerColor?: string;
  textColor?: string;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant = 'filled',
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  style,
  labelStyle,
  destructive = false,
  containerColor,
  textColor: customTextColor,
}) => {
  const { colors, shapes, elevation, typography } = useTheme();

  const getVariantStyles = (): {
    container: ViewStyle;
    textColor: string;
  } => {
    if (destructive) {
      if (variant === 'filled') {
        return {
          container: {
            backgroundColor: colors.error,
            elevation: elevation.level0,
          },
          textColor: colors.onError,
        };
      }
      if (variant === 'filled-tonal') {
        return {
          container: {
            backgroundColor: colors.errorContainer,
            elevation: elevation.level0,
          },
          textColor: colors.onErrorContainer,
        };
      }
      return {
        container: {
          backgroundColor: 'transparent',
          borderWidth: variant === 'outlined' ? 1 : 0,
          borderColor: colors.error,
        },
        textColor: colors.error,
      };
    }

    switch (variant) {
      case 'filled-tonal':
        return {
          container: {
            backgroundColor: colors.secondaryContainer,
            elevation: elevation.level0,
          },
          textColor: colors.onSecondaryContainer,
        };
      case 'elevated':
        return {
          container: {
            backgroundColor: colors.surfaceContainerLow,
            elevation: elevation.level1,
            shadowColor: colors.shadow,
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.2,
            shadowRadius: 2,
          },
          textColor: colors.primary,
        };
      case 'outlined':
        return {
          container: {
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: colors.outline,
          },
          textColor: colors.primary,
        };
      case 'text':
        return {
          container: {
            backgroundColor: 'transparent',
            paddingHorizontal: 12,
          },
          textColor: colors.primary,
        };
      case 'filled':
      default:
        return {
          container: {
            backgroundColor: colors.primary,
            elevation: elevation.level0,
          },
          textColor: colors.onPrimary,
        };
    }
  };

  const { container, textColor: defaultTextColor } = getVariantStyles();
  const resolvedContainer = containerColor ? { ...container, backgroundColor: containerColor } : container;
  const textColor = customTextColor || defaultTextColor;

  return (
    <TouchableOpacity
      style={[
        styles.base,
        {
          borderRadius: shapes.full, // pill shape per M3 spec
          opacity: disabled || loading ? 0.38 : 1,
        },
        resolvedContainer,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.75}
      accessibilityRole="button"
    >
      {loading ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : (
        <View style={styles.contentRow}>
          {icon && iconPosition === 'left' && (
            <MaterialCommunityIcons
              name={icon}
              size={18}
              color={textColor}
              style={styles.leftIcon}
            />
          )}
          <Text
            style={[
              typography.labelLarge,
              { color: textColor, fontWeight: '700' },
              labelStyle,
            ]}
          >
            {label}
          </Text>
          {icon && iconPosition === 'right' && (
            <MaterialCommunityIcons
              name={icon}
              size={18}
              color={textColor}
              style={styles.rightIcon}
            />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

export const FilledButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="filled" {...props} />
);

export const FilledTonalButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="filled-tonal" {...props} />
);

export const OutlinedButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="outlined" {...props} />
);

export const TextButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="text" {...props} />
);

export const ElevatedButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="elevated" {...props} />
);

const styles = StyleSheet.create({
  base: {
    height: 40, // standard M3 button height
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 64,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
  },
});
