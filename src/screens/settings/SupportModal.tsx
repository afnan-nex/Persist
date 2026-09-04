import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { AppHeader } from '../../components/common/AppHeader';

export const SupportModal: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { colors, fontFamily } = useTheme();

  const handleOpenLink = (url: string) => {
    Linking.openURL(url).catch(() => {});
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader
        title="Support Persist"
        leftAction={{
          icon: 'arrow-left',
          onPress: () => navigation.goBack(),
        }}
      />

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner Card */}
        <View
          style={[
            styles.bannerCard,
            {
              backgroundColor: colors.primaryContainer,
              borderColor: colors.primary,
            },
          ]}
        >
          <MaterialCommunityIcons name="heart" size={48} color={colors.primary} />
          <Text style={[styles.bannerTitle, { color: colors.onPrimaryContainer, fontFamily }]}>
            Free & Open Source
          </Text>
          <Text style={[styles.bannerDesc, { color: colors.onPrimaryContainer, fontFamily }]}>
            Persist is built with love for people who want a private, tracker-free habit and task companion.
          </Text>
        </View>

        {/* Benefits List */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              borderColor: colors.outlineVariant,
            },
          ]}
        >
          <View style={styles.benefitRow}>
            <MaterialCommunityIcons name="check-circle" size={22} color={colors.primary} />
            <Text style={[styles.benefitText, { color: colors.onSurface, fontFamily }]}>
              All features unlocked — no hidden subscriptions
            </Text>
          </View>

          <View style={styles.benefitRow}>
            <MaterialCommunityIcons name="check-circle" size={22} color={colors.primary} />
            <Text style={[styles.benefitText, { color: colors.onSurface, fontFamily }]}>
              Zero advertisements, trackers, or telemetries
            </Text>
          </View>

          <View style={styles.benefitRow}>
            <MaterialCommunityIcons name="check-circle" size={22} color={colors.primary} />
            <Text style={[styles.benefitText, { color: colors.onSurface, fontFamily }]}>
              Offline first with 100% user data sovereignty
            </Text>
          </View>
        </View>

        {/* Developer Attribution Card */}
        <View
          style={[
            styles.developerCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.outlineVariant,
            },
          ]}
        >
          <Text style={[styles.developerTitle, { color: colors.onSurface, fontFamily }]}>
            Developed by AFNAN with ❤️
          </Text>
          <Text style={[styles.developerSubtitle, { color: colors.onSurfaceVariant, fontFamily }]}>
            Crafted with passion for minimalist &amp; private productivity
          </Text>

          <TouchableOpacity
            style={[
              styles.githubBtn,
              { backgroundColor: colors.surfaceVariant, borderColor: colors.outlineVariant },
            ]}
            onPress={() => handleOpenLink('https://github.com/afnan-nex')}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="github" size={24} color={colors.primary} />
            <Text style={[styles.githubBtnText, { color: colors.onSurface, fontFamily }]}>
              github.com/afnan-nex
            </Text>
            <MaterialCommunityIcons name="open-in-new" size={18} color={colors.onSurfaceVariant} />
          </TouchableOpacity>
        </View>

        {/* Support Actions */}
        <View style={styles.actionGroup}>
          <TouchableOpacity
            style={[styles.primaryActionBtn, { backgroundColor: colors.primary }]}
            onPress={() => handleOpenLink('https://github.com/afnan-nex')}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="github" size={22} color={colors.onPrimary} />
            <Text style={[styles.actionBtnText, { color: colors.onPrimary, fontFamily }]}>
              Follow on GitHub
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryActionBtn, { backgroundColor: colors.surfaceVariant }]}
            onPress={() => handleOpenLink('https://ko-fi.com')}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="coffee" size={22} color={colors.onSurface} />
            <Text style={[styles.secondaryBtnText, { color: colors.onSurface, fontFamily }]}>
              Buy Me a Coffee
            </Text>
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
  bannerCard: {
    alignItems: 'center',
    padding: 28,
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: 20,
  },
  bannerTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginTop: 12,
    marginBottom: 8,
  },
  bannerDesc: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    opacity: 0.9,
  },
  card: {
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    gap: 16,
    marginBottom: 24,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  benefitText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  actionGroup: {
    gap: 12,
  },
  primaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 24,
    gap: 10,
  },
  actionBtnText: {
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 24,
    gap: 10,
  },
  secondaryBtnText: {
    fontSize: 16,
    fontWeight: '700',
  },
  developerCard: {
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 20,
  },
  developerTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
  },
  developerSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 16,
  },
  githubBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    gap: 10,
    width: '100%',
    justifyContent: 'center',
  },
  githubBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
