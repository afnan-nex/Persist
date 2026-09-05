import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PlatformPressable } from '@react-navigation/elements';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';

import { useTheme } from '../theme/ThemeContext';
import { TasksScreen } from '../screens/tasks/TasksScreen';
import { HabitsScreen } from '../screens/habits/HabitsScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';
import { HabitAnalyticsScreen } from '../screens/habits/HabitAnalyticsScreen';
import { OverallAnalyticsScreen } from '../screens/habits/OverallAnalyticsScreen';
import { LookAndFeelScreen } from '../screens/settings/LookAndFeelScreen';
import { BackupScreen } from '../screens/settings/BackupScreen';
import { AboutScreen } from '../screens/settings/AboutScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TasksTabIcon({ focused, color, size = 24 }: { focused: boolean; color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        stroke={color}
        strokeWidth={focused ? 2.4 : 1.9}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={focused ? `${color}25` : 'none'}
      />
    </Svg>
  );
}

function HabitsTabIcon({ focused, color, size = 24 }: { focused: boolean; color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        stroke={color}
        strokeWidth={focused ? 2.4 : 1.9}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function SettingsTabIcon({ focused, color, size = 24 }: { focused: boolean; color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle
        cx="12"
        cy="12"
        r="3"
        stroke={color}
        strokeWidth={focused ? 2.4 : 1.9}
        fill={focused ? `${color}25` : 'none'}
      />
      <Path
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
        stroke={color}
        strokeWidth={focused ? 2.2 : 1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function MainTabs() {
  const insets = useSafeAreaInsets();
  const { colors, appSettings, fontFamily } = useTheme();

  return (
    <Tab.Navigator
      initialRouteName={appSettings.startingPage === 'habits' ? 'HabitsTab' : 'TasksTab'}
      screenOptions={{
        headerShown: false,
        tabBarButton: (props) => (
          <PlatformPressable
            {...props}
            pressColor="transparent"
            android_ripple={{ color: 'transparent' }}
          />
        ),
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 3,
          backgroundColor: colors.surfaceContainer,
          borderTopWidth: 0,
          height: 80 + insets.bottom, // 80dp M3 NavigationBar height
          paddingBottom: Math.max(insets.bottom, 12),
          paddingTop: 12,
        },
        tabBarActiveTintColor: colors.onSurface,
        tabBarInactiveTintColor: colors.onSurfaceVariant,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          fontFamily,
          marginTop: 4,
        },
      }}
    >
      <Tab.Screen
        name="TasksTab"
        component={TasksScreen}
        options={{
          tabBarLabel: 'Tasks',
          tabBarIcon: ({ focused }) => (
            <View
              style={[
                styles.tabIconWrapper,
                focused && { backgroundColor: colors.secondaryContainer },
              ]}
            >
              <TasksTabIcon
                focused={focused}
                color={focused ? colors.onSecondaryContainer : colors.onSurfaceVariant}
                size={24}
              />
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="HabitsTab"
        component={HabitsScreen}
        options={{
          tabBarLabel: 'Habits',
          tabBarIcon: ({ focused }) => (
            <View
              style={[
                styles.tabIconWrapper,
                focused && { backgroundColor: colors.secondaryContainer },
              ]}
            >
              <HabitsTabIcon
                focused={focused}
                color={focused ? colors.onSecondaryContainer : colors.onSurfaceVariant}
                size={24}
              />
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="SettingsTab"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ focused }) => (
            <View
              style={[
                styles.tabIconWrapper,
                focused && { backgroundColor: colors.secondaryContainer },
              ]}
            >
              <SettingsTabIcon
                focused={focused}
                color={focused ? colors.onSecondaryContainer : colors.onSurfaceVariant}
                size={24}
              />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export const RootNavigator: React.FC = () => {
  const { colors } = useTheme();

  const navigationTheme = {
    dark: colors.isDark,
    colors: {
      primary: colors.primary,
      background: colors.background,
      card: colors.surface,
      text: colors.onSurface,
      border: colors.outlineVariant,
      notification: colors.primary,
    },
    fonts: DefaultTheme.fonts,
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: Platform.OS === 'android' ? 'fade_from_bottom' : 'default',
        }}
      >
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="HabitAnalytics" component={HabitAnalyticsScreen} />
        <Stack.Screen name="OverallAnalytics" component={OverallAnalyticsScreen} />
        <Stack.Screen name="LookAndFeel" component={LookAndFeelScreen} />
        <Stack.Screen name="Backup" component={BackupScreen} />
        <Stack.Screen name="About" component={AboutScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  tabIconWrapper: {
    width: 64,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
