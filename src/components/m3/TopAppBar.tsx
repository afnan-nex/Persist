import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';

export type TopAppBarVariant = 'small' | 'center-aligned' | 'medium' | 'large';

export interface TopAppBarAction {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  onPress: () => void;
  color?: string;
  badge?: number | string;
  accessibilityLabel?: string;
}

export interface TopAppBarProps {
  title: string;
  subtitle?: string;
  variant?: TopAppBarVariant;
  navigationIcon?: {
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    onPress: () => void;
    accessibilityLabel?: string;
  };
  actions?: TopAppBarAction[];
  style?: StyleProp<ViewStyle>;
  elevated?: boolean;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({
  title,
  subtitle,
  variant = 'small',
  navigationIcon,
  actions = [],
  style,
  elevated = false,
}) => {
  const insets = useSafeAreaInsets();
  const { colors, typography, elevation } = useTheme();

  const isCenterAligned = variant === 'center-aligned';
  const isLarge = variant === 'large';
  const isMedium = variant === 'medium';

  const containerBg = elevated ? colors.surfaceContainer : colors.surface;
  const containerElevation = elevated ? elevation.level2 : elevation.level0;

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: Math.max(insets.top, 8),
          backgroundColor: containerBg,
          elevation: containerElevation,
        },
        style,
      ]}
    >
      <View
        style={[
          styles.appBarRow,
          isCenterAligned && styles.centerAlignedRow,
          (isMedium || isLarge) && styles.expandedRow,
        ]}
      >
        {/* Navigation Icon */}
        {navigationIcon ? (
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: colors.surfaceContainerHigh }]}
            onPress={navigationIcon.onPress}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={navigationIcon.accessibilityLabel || 'Navigate up'}
          >
            <MaterialCommunityIcons
              name={navigationIcon.icon}
              size={24}
              color={colors.onSurface}
            />
          </TouchableOpacity>
        ) : (
          !isCenterAligned && <View style={styles.leadingSpacer} />
        )}

        {/* Title Area */}
        {!(isMedium || isLarge) && (
          <View
            style={[
              styles.titleArea,
              isCenterAligned && styles.centerTitleArea,
              navigationIcon ? { marginLeft: 12 } : null,
            ]}
          >
            <Text
              style={[
                typography.titleLarge,
                { color: colors.onSurface, fontWeight: '700' },
              ]}
              numberOfLines={1}
            >
              {title}
            </Text>
            {subtitle ? (
              <Text
                style={[
                  typography.labelMedium,
                  { color: colors.onSurfaceVariant, marginTop: 2 },
                ]}
                numberOfLines={1}
              >
                {subtitle}
              </Text>
            ) : null}
          </View>
        )}

        {/* Right Actions */}
        <View style={styles.actionsContainer}>
          {actions.map((action, idx) => (
            <TouchableOpacity
              key={idx}
              style={[
                styles.iconButton,
                { backgroundColor: colors.surfaceContainerHigh },
                idx > 0 && { marginLeft: 8 },
              ]}
              onPress={action.onPress}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={action.accessibilityLabel}
            >
              <MaterialCommunityIcons
                name={action.icon}
                size={22}
                color={action.color || colors.onSurfaceVariant}
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Expanded Title for Medium/Large variant */}
      {(isMedium || isLarge) && (
        <View style={[styles.expandedTitleArea, isLarge ? styles.largeTitleArea : null]}>
          <Text
            style={[
              isLarge ? typography.headlineMedium : typography.headlineSmall,
              { color: colors.onSurface, fontWeight: '700' },
            ]}
          >
            {title}
          </Text>
          {subtitle ? (
            <Text
              style={[
                typography.bodyMedium,
                { color: colors.onSurfaceVariant, marginTop: 4 },
              ]}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  appBarRow: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  centerAlignedRow: {
    justifyContent: 'space-between',
  },
  expandedRow: {
    justifyContent: 'space-between',
  },
  leadingSpacer: {
    width: 4,
  },
  titleArea: {
    flex: 1,
    justifyContent: 'center',
  },
  centerTitleArea: {
    alignItems: 'center',
  },
  expandedTitleArea: {
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 16,
  },
  largeTitleArea: {
    paddingBottom: 24,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
