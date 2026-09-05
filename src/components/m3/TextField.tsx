import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Animated,
  TextInputProps,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';

export type TextFieldVariant = 'filled' | 'outlined';

export interface M3TextFieldProps extends Omit<TextInputProps, 'style'> {
  label: string;
  variant?: TextFieldVariant;
  errorText?: string;
  helperText?: string;
  leadingIcon?: keyof typeof MaterialCommunityIcons.glyphMap;
  trailingIcon?: keyof typeof MaterialCommunityIcons.glyphMap;
  onTrailingIconPress?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
}

export const M3TextField = React.forwardRef<TextInput, M3TextFieldProps>(
  (
    {
      label,
      variant = 'filled',
      errorText,
      helperText,
      leadingIcon,
      trailingIcon,
      onTrailingIconPress,
      containerStyle,
      value,
      placeholder,
      onFocus,
      onBlur,
      ...rest
    },
    ref
  ) => {
    const { colors, shapes, typography } = useTheme();
    const [isFocused, setIsFocused] = useState(false);

    const hasValue = Boolean(value && value.length > 0);
    const isError = Boolean(errorText);

    // Floating label animation
    const animatedFocus = useRef(new Animated.Value(hasValue ? 1 : 0)).current;

    useEffect(() => {
      Animated.timing(animatedFocus, {
        toValue: isFocused || hasValue ? 1 : 0,
        duration: 150,
        useNativeDriver: false,
      }).start();
    }, [isFocused, hasValue, animatedFocus]);

    const labelTop = animatedFocus.interpolate({
      inputRange: [0, 1],
      outputRange: [variant === 'filled' ? 18 : 16, variant === 'filled' ? 6 : -10],
    });

    const labelFontSize = animatedFocus.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 12],
    });

    const labelColor = isError
      ? colors.error
      : isFocused
      ? colors.primary
      : colors.onSurfaceVariant;

    const borderColor = isError
      ? colors.error
      : isFocused
      ? colors.primary
      : variant === 'outlined'
      ? colors.outline
      : colors.outlineVariant;

    const borderWidth = isFocused || isError ? 2 : 1;

    return (
      <View style={[styles.wrapper, containerStyle]}>
        <View
          style={[
            variant === 'filled' ? styles.filledContainer : styles.outlinedContainer,
            variant === 'filled'
              ? {
                  backgroundColor: colors.surfaceContainerHighest,
                  borderTopLeftRadius: shapes.extraSmall,
                  borderTopRightRadius: shapes.extraSmall,
                  borderBottomColor: borderColor,
                  borderBottomWidth: borderWidth,
                }
              : {
                  backgroundColor: 'transparent',
                  borderRadius: shapes.small,
                  borderColor,
                  borderWidth,
                },
          ]}
        >
          {/* Leading Icon */}
          {leadingIcon && (
            <MaterialCommunityIcons
              name={leadingIcon}
              size={22}
              color={isFocused ? colors.primary : colors.onSurfaceVariant}
              style={styles.leadingIcon}
            />
          )}

          {/* Input & Animated Label Area */}
          <View style={styles.inputArea}>
            <Animated.Text
              style={[
                styles.floatingLabel,
                {
                  top: labelTop,
                  fontSize: labelFontSize,
                  color: labelColor,
                  backgroundColor:
                    variant === 'outlined' && (isFocused || hasValue)
                      ? colors.surface
                      : 'transparent',
                  paddingHorizontal: variant === 'outlined' && (isFocused || hasValue) ? 4 : 0,
                },
              ]}
              numberOfLines={1}
            >
              {label}
            </Animated.Text>

            <TextInput
              ref={ref}
              value={value}
              showSoftInputOnFocus={true}
              style={[
                styles.input,
                {
                  color: colors.onSurface,
                  paddingTop: variant === 'filled' ? 20 : 8,
                },
              ]}
              placeholderTextColor={colors.onSurfaceVariant + '80'}
              onFocus={(e) => {
                setIsFocused(true);
                onFocus?.(e);
              }}
              onBlur={(e) => {
                setIsFocused(false);
                onBlur?.(e);
              }}
              {...rest}
            />
          </View>

          {/* Trailing Icon */}
          {trailingIcon && (
            <TouchableOpacity
              onPress={onTrailingIconPress}
              disabled={!onTrailingIconPress}
              style={styles.trailingIcon}
            >
              <MaterialCommunityIcons
                name={trailingIcon}
                size={22}
                color={isError ? colors.error : colors.onSurfaceVariant}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Supporting / Helper / Error Text */}
        {(errorText || helperText) && (
          <Text
            style={[
              typography.bodySmall,
              {
                color: errorText ? colors.error : colors.onSurfaceVariant,
                marginTop: 4,
                marginHorizontal: 16,
              },
            ]}
          >
            {errorText || helperText}
          </Text>
        )}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 8,
  },
  filledContainer: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  outlinedContainer: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  inputArea: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
  },
  floatingLabel: {
    position: 'absolute',
    left: 0,
    fontWeight: '500',
  },
  input: {
    fontSize: 16,
    paddingBottom: 4,
    paddingHorizontal: 0,
  },
  leadingIcon: {
    marginRight: 12,
  },
  trailingIcon: {
    marginLeft: 8,
    padding: 4,
  },
});
