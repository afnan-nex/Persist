import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { TopAppBar } from '../../components/m3';

export const AboutScreen: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { colors, typography, shapes, elevation, fontFamily } = useTheme();

  const [showChangelog, setShowChangelog] = useState(false);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopAppBar
        title="About Persist"
        variant="small"
        navigationIcon={{
          icon: 'arrow-left',
          onPress: () => navigation.goBack(),
          accessibilityLabel: 'Go back',
        }}
      />

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* App Hero Card */}
        <View
          style={[
            styles.heroCard,
            {
              backgroundColor: colors.surfaceContainerLow,
              borderRadius: shapes.large,
              elevation: elevation.level1,
            },
          ]}
        >
          <View style={[styles.appIconContainer, { backgroundColor: colors.primaryContainer, borderRadius: shapes.large }]}>
            <MaterialCommunityIcons name="checkbox-marked-circle" size={44} color={colors.onPrimaryContainer} />
          </View>
          <Text style={[styles.appName, { color: colors.onSurface, ...typography.headlineMedium, fontFamily }]}>
            Persist
          </Text>
          <Text style={[styles.appVersion, { color: colors.primary, ...typography.labelLarge, fontFamily }]}>
            Version 1.0.0
          </Text>
          <Text style={[styles.appDescription, { color: colors.onSurfaceVariant, ...typography.bodyMedium, fontFamily }]}>
            A modern, privacy-respecting habit and task management companion engineered with Material 3 design and offline-first persistence.
          </Text>
        </View>

        {/* Developer Attribution Card */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.surfaceContainerLow,
              borderRadius: shapes.large,
              elevation: elevation.level1,
              alignItems: 'center',
            },
          ]}
        >
          <Text style={{ ...typography.titleMedium, fontWeight: '700', color: colors.onSurface, fontFamily, marginBottom: 4 }}>
            Developed by AFNAN with ❤️
          </Text>
          <Text style={{ ...typography.bodyMedium, color: colors.onSurfaceVariant, fontFamily, marginBottom: 14 }}>
            Creator &amp; Maintainer
          </Text>
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: colors.secondaryContainer,
              paddingVertical: 10,
              paddingHorizontal: 18,
              borderRadius: shapes.full,
              gap: 8,
            }}
            onPress={() => require('react-native').Linking.openURL('https://github.com/afnan-nex').catch(() => {})}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="github" size={20} color={colors.onSecondaryContainer} />
            <Text style={{ ...typography.labelLarge, color: colors.onSecondaryContainer, fontFamily }}>
              github.com/afnan-nex
            </Text>
            <MaterialCommunityIcons name="open-in-new" size={16} color={colors.onSecondaryContainer} />
          </TouchableOpacity>
        </View>

        {/* Features & Philosophy Card */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.surfaceContainerLow,
              borderRadius: shapes.large,
              elevation: elevation.level1,
            },
          ]}
        >
          <Text style={[styles.cardTitle, { color: colors.onSurface, ...typography.titleMedium, fontFamily }]}>
            Key Principles
          </Text>

          <View style={styles.featureItem}>
            <MaterialCommunityIcons name="shield-check-outline" size={22} color={colors.primary} />
            <View style={styles.featureTextCol}>
              <Text style={[styles.featureTitle, { color: colors.onSurface, ...typography.titleSmall, fontFamily }]}>
                100% Offline & Private
              </Text>
              <Text style={[styles.featureDesc, { color: colors.onSurfaceVariant, ...typography.bodyMedium, fontFamily }]}>
                Your data stays exclusively on your device in an encrypted local SQLite database. No tracking, no cloud sync required.
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <MaterialCommunityIcons name="alarm" size={22} color={colors.primary} />
            <View style={styles.featureTextCol}>
              <Text style={[styles.featureTitle, { color: colors.onSurface, ...typography.titleSmall, fontFamily }]}>
                Exact Device Reminders
              </Text>
              <Text style={[styles.featureDesc, { color: colors.onSurfaceVariant, ...typography.bodyMedium, fontFamily }]}>
                Scheduled local alarms keep you on track without relying on push notification servers.
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <MaterialCommunityIcons name="chart-bell-curve" size={22} color={colors.primary} />
            <View style={styles.featureTextCol}>
              <Text style={[styles.featureTitle, { color: colors.onSurface, ...typography.titleSmall, fontFamily }]}>
                Comprehensive Analytics
              </Text>
              <Text style={[styles.featureDesc, { color: colors.onSurfaceVariant, ...typography.bodyMedium, fontFamily }]}>
                Track 12-month heatmaps, consistency percentages, current and best streaks, and weekly distributions.
              </Text>
            </View>
          </View>
        </View>

        {/* Actions Card */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.surfaceContainerLow,
              borderRadius: shapes.large,
              elevation: elevation.level1,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => setShowChangelog(true)}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="history" size={22} color={colors.onSurface} />
            <Text style={[styles.actionRowText, { color: colors.onSurface, ...typography.bodyLarge, fontFamily }]}>
              View Changelog
            </Text>
            <MaterialCommunityIcons name="chevron-right" size={22} color={colors.onSurfaceVariant} />
          </TouchableOpacity>
        </View>

        {/* License Note */}
        <Text style={[styles.licenseText, { color: colors.onSurfaceVariant, ...typography.bodySmall, fontFamily }]}>
          Persist is free and open-source software licensed under the GNU General Public License v3.0.
        </Text>
      </ScrollView>

      {/* Changelog Modal */}
      <Modal visible={showChangelog} animationType="slide" transparent onRequestClose={() => setShowChangelog(false)}>
        <View style={[styles.modalOverlay, { backgroundColor: colors.scrim + '70' }]}>
          <View
            style={[
              styles.changelogSheet,
              {
                backgroundColor: colors.surfaceContainerHigh,
                borderTopLeftRadius: shapes.extraLarge,
                borderTopRightRadius: shapes.extraLarge,
                elevation: elevation.level3,
              },
            ]}
          >
            <View style={[styles.dragHandle, { backgroundColor: colors.outlineVariant }]} />
            <View style={styles.changelogHeader}>
              <Text style={[styles.changelogTitle, { color: colors.onSurface, ...typography.headlineSmall, fontFamily }]}>
                What's New in 1.0.1
              </Text>
              <TouchableOpacity onPress={() => setShowChangelog(false)}>
                <MaterialCommunityIcons name="close" size={24} color={colors.onSurface} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.changelogScroll} showsVerticalScrollIndicator={false}>
              <Text style={[styles.versionBadge, { color: colors.primary, ...typography.titleSmall, fontFamily }]}>
                Version 1.0.1 — UX Refinements
              </Text>
              <View style={styles.bulletList}>
                <Text style={[styles.bulletItem, { color: colors.onSurface, ...typography.bodyMedium, fontFamily }]}>
                  • Refined Material 3 surface elevation with clean borderless card styling
                </Text>
                <Text style={[styles.bulletItem, { color: colors.onSurface, ...typography.bodyMedium, fontFamily }]}>
                  • Redesigned analog clock dial with accurate touch handling and default to current phone time
                </Text>
                <Text style={[styles.bulletItem, { color: colors.onSurface, ...typography.bodyMedium, fontFamily }]}>
                  • Keyboard-aware modals with persistent action buttons pinned above the virtual keyboard
                </Text>
                <Text style={[styles.bulletItem, { color: colors.onSurface, ...typography.bodyMedium, fontFamily }]}>
                  • Instant autofocus and one-tap keyboard activation when opening task/habit modals
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  heroCard: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 24,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  appIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  appVersion: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
    marginBottom: 12,
  },
  appDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 300,
  },
  card: {
    borderRadius: 22,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    marginBottom: 16,
  },
  featureTextCol: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionRowText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  licenseText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginHorizontal: 16,
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  changelogSheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 36,
    maxHeight: '70%',
    elevation: 16,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  changelogHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  changelogTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  changelogScroll: {
    marginBottom: 12,
  },
  versionBadge: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
  },
  bulletList: {
    gap: 10,
  },
  bulletItem: {
    fontSize: 14,
    lineHeight: 20,
  },
});
