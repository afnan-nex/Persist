import React, { useEffect, useRef } from 'react';
import {
  TouchableOpacity,
  Animated,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';

export interface M3SwitchProps {
  value?: boolean;
  selected?: boolean;
  onValueChange: (val: boolean) => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  showIcon?: boolean;
}

export const M3Switch: React.FC<M3SwitchProps> = ({
  value,
  selected,
  onValueChange,
  disabled = false,
  style,
  accessibilityLabel,
  showIcon = false,
}) => {
  const { colors } = useTheme();
  const currentValue = value ?? selected ?? false;
  const animatedValue = useRef(new Animated.Value(currentValue ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(animatedValue, {
      toValue: currentValue ? 1 : 0,
      useNativeDriver: false,
      friction: 8,
      tension: 50,
    }).start();
  }, [currentValue, animatedValue]);

  const handleToggle = () => {
    if (!disabled) {
      onValueChange(!currentValue);
    }
  };

  // Interpolated colors and dimensions
  const trackColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.surfaceContainerHighest, colors.primary],
  });

  const borderColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.outline, colors.primary],
  });

  const thumbColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.outline, colors.onPrimary],
  });

  const thumbTranslateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [4, 24],
  });

  const thumbSize = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [16, 24],
  });

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handleToggle}
      disabled={disabled}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      accessibilityLabel={accessibilityLabel}
    >
      <Animated.View
        style={[
          styles.track,
          {
            backgroundColor: trackColor,
            borderColor,
            borderWidth: 2,
            opacity: disabled ? 0.38 : 1,
          },
          style,
        ]}
      >
        <Animated.View
          style={[
            styles.thumb,
            {
              backgroundColor: thumbColor,
              width: thumbSize,
              height: thumbSize,
              borderRadius: 12,
              transform: [{ translateX: thumbTranslateX }],
            },
          ]}
        >
          {showIcon && value && (
            <MaterialCommunityIcons name="check" size={14} color={colors.primary} />
          )}
        </Animated.View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  track: {
    width: 52, // M3 standard switch width
    height: 32, // M3 standard switch height
    borderRadius: 16,
    justifyContent: 'center',
  },
  thumb: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
