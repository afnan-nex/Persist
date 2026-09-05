import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { TopAppBar, M3Switch } from '../../components/m3';
import { isBiometricsAvailable, authenticateUser } from '../../services/biometrics';

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { colors, appSettings, setAppSettings, fontFamily } = useTheme();

  const handleToggleBiometrics = async (value: boolean) => {
    if (value) {
      const available = await isBiometricsAvailable();
      if (!available) {
        alert('Biometric authentication is not supported or not enrolled on this device.');
        return;
      }
      const authenticated = await authenticateUser();
      if (authenticated) {
        await setAppSettings({ biometricLock: true });
      }
    } else {
      const authenticated = await authenticateUser();
      if (authenticated) {
        await setAppSettings({ biometricLock: false });
      }
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopAppBar title="Settings" />

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 90 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Appearance Section */}
        <Text style={[styles.sectionTitle, { color: colors.primary, fontFamily }]}>
          Appearance
        </Text>
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.surfaceContainerLow,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.navRow}
            onPress={() => navigation.navigate('LookAndFeel')}
            activeOpacity={0.7}
          >
            <View style={[styles.iconCircle, { backgroundColor: colors.primaryContainer }]}>
              <MaterialCommunityIcons name="palette-outline" size={20} color={colors.primary} />
            </View>
            <View style={styles.rowLabelCol}>
              <Text style={[styles.rowTitle, { color: colors.onSurface, fontFamily }]}>
                Look and Feel
              </Text>
              <Text style={[styles.rowSubtitle, { color: colors.onSurfaceVariant, fontFamily }]}>
                Theme, seed colors, AMOLED mode, fonts
              </Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={22} color={colors.onSurfaceVariant} />
          </TouchableOpacity>
        </View>

        {/* Preferences Section */}
        <Text style={[styles.sectionTitle, { color: colors.primary, fontFamily }]}>
          Preferences
        </Text>
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.surfaceContainerLow,
            },
          ]}
        >
          {/* Start of Week */}
          <View style={styles.settingRow}>
            <View style={[styles.iconCircle, { backgroundColor: colors.surfaceContainerHigh }]}>
              <MaterialCommunityIcons name="calendar-start" size={20} color={colors.onSurface} />
            </View>
            <View style={styles.rowLabelCol}>
              <Text style={[styles.rowTitle, { color: colors.onSurface, fontFamily }]}>
                Start of the Week
              </Text>
              <Text style={[styles.rowSubtitle, { color: colors.onSurfaceVariant, fontFamily }]}>
                {appSettings.startOfWeek === 'MONDAY' ? 'Monday' : 'Sunday'}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.togglePill, { backgroundColor: colors.surfaceContainerHigh }]}
              onPress={() =>
                setAppSettings({
                  startOfWeek: appSettings.startOfWeek === 'MONDAY' ? 'SUNDAY' : 'MONDAY',
                })
              }
            >
              <Text style={[styles.togglePillText, { color: colors.primary, fontFamily }]}>
                {appSettings.startOfWeek === 'MONDAY' ? 'Mon' : 'Sun'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.outlineVariant }]} />

          {/* Starting Tab */}
          <View style={styles.settingRow}>
            <View style={[styles.iconCircle, { backgroundColor: colors.surfaceContainerHigh }]}>
              <MaterialCommunityIcons name="view-dashboard-outline" size={20} color={colors.onSurface} />
            </View>
            <View style={styles.rowLabelCol}>
              <Text style={[styles.rowTitle, { color: colors.onSurface, fontFamily }]}>
                Default Tab
              </Text>
              <Text style={[styles.rowSubtitle, { color: colors.onSurfaceVariant, fontFamily }]}>
                Open to {appSettings.startingPage === 'tasks' ? 'Tasks' : 'Habits'}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.togglePill, { backgroundColor: colors.surfaceContainerHigh }]}
              onPress={() =>
                setAppSettings({
                  startingPage: appSettings.startingPage === 'tasks' ? 'habits' : 'tasks',
                })
              }
            >
              <Text style={[styles.togglePillText, { color: colors.primary, fontFamily }]}>
                {appSettings.startingPage === 'tasks' ? 'Tasks' : 'Habits'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.outlineVariant }]} />

          {/* 24-Hour Time */}
          <View style={styles.settingRow}>
            <View style={[styles.iconCircle, { backgroundColor: colors.surfaceContainerHigh }]}>
              <MaterialCommunityIcons name="clock-outline" size={20} color={colors.onSurface} />
            </View>
            <View style={styles.rowLabelCol}>
              <Text style={[styles.rowTitle, { color: colors.onSurface, fontFamily }]}>
                24-Hour Clock
              </Text>
              <Text style={[styles.rowSubtitle, { color: colors.onSurfaceVariant, fontFamily }]}>
                Use 24-hour time format
              </Text>
            </View>
            <M3Switch
              value={appSettings.is24Hr}
              onValueChange={(val) => setAppSettings({ is24Hr: val })}
            />
          </View>

          <View style={[styles.divider, { backgroundColor: colors.outlineVariant }]} />

          {/* Notifications Toggle */}
          <View style={styles.settingRow}>
            <View style={[styles.iconCircle, { backgroundColor: colors.surfaceContainerHigh }]}>
              <MaterialCommunityIcons name="bell-outline" size={20} color={colors.onSurface} />
            </View>
            <View style={styles.rowLabelCol}>
              <Text style={[styles.rowTitle, { color: colors.onSurface, fontFamily }]}>
                Notifications
              </Text>
              <Text style={[styles.rowSubtitle, { color: colors.onSurfaceVariant, fontFamily }]}>
                Receive alarms and habit reminders
              </Text>
            </View>
            <M3Switch
              value={appSettings.notificationsEnabled}
              onValueChange={(val) => setAppSettings({ notificationsEnabled: val })}
            />
          </View>

          <View style={[styles.divider, { backgroundColor: colors.outlineVariant }]} />

          {/* Biometric Lock */}
          <View style={styles.settingRow}>
            <View style={[styles.iconCircle, { backgroundColor: colors.surfaceContainerHigh }]}>
              <MaterialCommunityIcons name="fingerprint" size={20} color={colors.onSurface} />
            </View>
            <View style={styles.rowLabelCol}>
              <Text style={[styles.rowTitle, { color: colors.onSurface, fontFamily }]}>
                Biometric Lock
              </Text>
              <Text style={[styles.rowSubtitle, { color: colors.onSurfaceVariant, fontFamily }]}>
                Protect app with fingerprint / PIN
              </Text>
            </View>
            <M3Switch
              value={appSettings.biometricLock}
              onValueChange={handleToggleBiometrics}
            />
          </View>
        </View>

        {/* Data & Backup Section */}
        <Text style={[styles.sectionTitle, { color: colors.primary, fontFamily }]}>
          Data & System
        </Text>
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.surfaceContainerLow,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.navRow}
            onPress={() => navigation.navigate('Backup')}
            activeOpacity={0.7}
          >
            <View style={[styles.iconCircle, { backgroundColor: colors.surfaceContainerHigh }]}>
              <MaterialCommunityIcons name="cloud-upload-outline" size={20} color={colors.onSurface} />
            </View>
            <View style={styles.rowLabelCol}>
              <Text style={[styles.rowTitle, { color: colors.onSurface, fontFamily }]}>
                Backup and Restore
              </Text>
              <Text style={[styles.rowSubtitle, { color: colors.onSurfaceVariant, fontFamily }]}>
                Export or import JSON data
              </Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={22} color={colors.onSurfaceVariant} />
          </TouchableOpacity>


          <View style={[styles.divider, { backgroundColor: colors.outlineVariant }]} />

          <TouchableOpacity
            style={styles.navRow}
            onPress={() => navigation.navigate('About')}
            activeOpacity={0.7}
          >
            <View style={[styles.iconCircle, { backgroundColor: colors.surfaceContainerHigh }]}>
              <MaterialCommunityIcons name="information-outline" size={20} color={colors.onSurface} />
            </View>
            <View style={styles.rowLabelCol}>
              <Text style={[styles.rowTitle, { color: colors.onSurface, fontFamily }]}>
                About Persist
              </Text>
              <Text style={[styles.rowSubtitle, { color: colors.onSurfaceVariant, fontFamily }]}>
                v1.0.1 • Open source
              </Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={22} color={colors.onSurfaceVariant} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 16,
    marginLeft: 4,
  },
  card: {
    borderRadius: 22,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  rowLabelCol: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  rowSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  togglePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  togglePillText: {
    fontSize: 13,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    marginLeft: 68,
  },
});
