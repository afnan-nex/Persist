import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  leftAction?: {
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    onPress: () => void;
  };
  rightActions?: {
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    onPress: () => void;
    color?: string;
  }[];
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  subtitle,
  leftAction,
  rightActions = [],
}) => {
  const insets = useSafeAreaInsets();
  const { colors, fontFamily } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: Math.max(insets.top, 16),
          backgroundColor: colors.background,
          borderBottomColor: colors.outlineVariant,
        },
      ]}
    >
      <View style={styles.content}>
        {leftAction && (
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: colors.surfaceVariant }]}
            onPress={leftAction.onPress}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name={leftAction.icon} size={22} color={colors.onSurface} />
          </TouchableOpacity>
        )}

        <View style={[styles.titleContainer, leftAction && { marginLeft: 16 }]}>
          <Text
            style={[
              styles.title,
              {
                color: colors.onBackground,
                fontFamily,
              },
            ]}
          >
            {title}
          </Text>
          {subtitle ? (
            <Text
              style={[
                styles.subtitle,
                {
                  color: colors.onSurfaceVariant,
                  fontFamily,
                },
              ]}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>

        <View style={styles.actionsContainer}>
          {rightActions.map((action, idx) => (
            <TouchableOpacity
              key={idx}
              style={[
                styles.iconButton,
                {
                  backgroundColor: colors.surfaceVariant,
                  marginLeft: 8,
                },
              ]}
              onPress={action.onPress}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name={action.icon}
                size={22}
                color={action.color || colors.onSurface}
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
