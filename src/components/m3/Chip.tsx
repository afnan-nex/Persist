import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';

export interface FilterChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  customColor?: string;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  showCheckmark?: boolean;
}

export const FilterChip: React.FC<FilterChipProps> = ({
  label,
  selected,
  onPress,
  icon,
  customColor,
  style,
  labelStyle,
  showCheckmark = true,
}) => {
  const { colors, shapes, typography } = useTheme();

  const containerBg = selected
    ? customColor
      ? `${customColor}22`
      : colors.secondaryContainer
    : colors.surfaceContainerLow;

  const contentColor = selected
    ? customColor || colors.onSecondaryContainer
    : colors.onSurfaceVariant;

  const borderColor = selected
    ? customColor || colors.primary
    : 'transparent';

  return (
    <TouchableOpacity
      style={[
        styles.chipBase,
        {
          borderRadius: shapes.small, // 8dp per M3 chip specification
          backgroundColor: containerBg,
          borderColor,
          borderWidth: selected ? 1 : 0,
        },
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.75}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
    >
      <View style={styles.contentRow}>
        {selected && showCheckmark && (
          <MaterialCommunityIcons
            name="check"
            size={16}
            color={contentColor}
            style={styles.leadingIcon}
          />
        )}
        {!selected && icon && (
          <MaterialCommunityIcons
            name={icon}
            size={16}
            color={contentColor}
            style={styles.leadingIcon}
          />
        )}
        <Text
          style={[
            typography.labelLarge,
            {
              color: contentColor,
              fontWeight: selected ? '700' : '500',
            },
            labelStyle,
          ]}
        >
          {label}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export interface AssistChipProps {
  label: string;
  onPress: () => void;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  style?: StyleProp<ViewStyle>;
}

export const AssistChip: React.FC<AssistChipProps> = ({
  label,
  onPress,
  icon,
  style,
}) => {
  const { colors, shapes, typography } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.chipBase,
        {
          borderRadius: shapes.small, // 8dp
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: colors.outlineVariant,
        },
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.75}
      accessibilityRole="button"
    >
      <View style={styles.contentRow}>
        {icon && (
          <MaterialCommunityIcons
            name={icon}
            size={16}
            color={colors.primary}
            style={styles.leadingIcon}
          />
        )}
        <Text
          style={[
            typography.labelLarge,
            { color: colors.onSurface, fontWeight: '500' },
          ]}
        >
          {label}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chipBase: {
    height: 32, // standard M3 chip height
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leadingIcon: {
    marginRight: 6,
  },
});
