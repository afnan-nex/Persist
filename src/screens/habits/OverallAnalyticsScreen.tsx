import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { OverallAnalytics } from '../../types';
import { getOverallAnalytics } from '../../data/habitRepository';
import { useTheme } from '../../theme/ThemeContext';
import { AppHeader } from '../../components/common/AppHeader';
import { HeatMap } from '../../components/habits/HeatMap';
import { WeekdayFrequencyChart } from '../../components/habits/WeekdayFrequencyChart';
import { DayCompletionSheet } from '../../components/habits/DayCompletionSheet';

export const OverallAnalyticsScreen: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { colors, appSettings, fontFamily } = useTheme();

  const [analytics, setAnalytics] = useState<OverallAnalytics | null>(null);
  const [selectedEpochDay, setSelectedEpochDay] = useState<number | null>(null);

  useEffect(() => {
    getOverallAnalytics().then(setAnalytics);
  }, []);

  if (!analytics) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <AppHeader
          title="Overall Analytics"
          leftAction={{
            icon: 'arrow-left',
            onPress: () => navigation.goBack(),
          }}
        />
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.onSurfaceVariant, fontFamily }]}>
            Loading analytics...
          </Text>
        </View>
      </View>
    );
  }

  const { consistency, topHabits, heatMapData, weekDayFrequencyData } = analytics;
  const consistencyPercent = Math.round(consistency * 100);

  const rankBadges = [
    { rank: '1', color: '#F59E0B', label: '1st' },
    { rank: '2', color: '#94A3B8', label: '2nd' },
    { rank: '3', color: '#B45309', label: '3rd' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader
        title="Overall Analytics"
        subtitle="All habits aggregate performance"
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
        {/* Overall Consistency Card */}
        <View
          style={[
            styles.metricCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.outlineVariant,
            },
          ]}
        >
          <View style={styles.ringArea}>
            <Text
              style={[
                styles.overallConsistencyText,
                { color: colors.primary, fontFamily },
              ]}
            >
              {consistencyPercent}%
            </Text>
            <Text
              style={[
                styles.overallConsistencyLabel,
                { color: colors.onSurfaceVariant, fontFamily },
              ]}
            >
              Overall Consistency
            </Text>
          </View>
        </View>

        {/* Top Habits Leaderboard */}
        {topHabits.length > 0 && (
          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.surface,
                borderColor: colors.outlineVariant,
              },
            ]}
          >
            <View style={styles.cardHeaderRow}>
              <MaterialCommunityIcons name="podium" size={20} color={colors.primary} />
              <Text style={[styles.cardTitle, { color: colors.onSurface, fontFamily }]}>
                Top Performing Habits
              </Text>
            </View>

            <View style={styles.leaderboardList}>
              {topHabits.map((item, idx) => {
                const badge = rankBadges[idx] || { rank: `${idx + 1}`, color: colors.primary };
                const pct = Math.round(item.consistency * 100);

                return (
                  <View key={item.title} style={styles.leaderboardItem}>
                    <View style={[styles.rankCircle, { backgroundColor: badge.color }]}>
                      <Text style={[styles.rankText, { fontFamily }]}>{badge.rank}</Text>
                    </View>

                    <View style={styles.habitCol}>
                      <Text
                        style={[styles.habitTitle, { color: colors.onSurface, fontFamily }]}
                        numberOfLines={1}
                      >
                        {item.title}
                      </Text>
                      <View
                        style={[
                          styles.consistencyBarBg,
                          { backgroundColor: colors.surfaceVariant },
                        ]}
                      >
                        <View
                          style={[
                            styles.consistencyBarFill,
                            {
                              width: `${pct}%`,
                              backgroundColor: colors.primary,
                            },
                          ]}
                        />
                      </View>
                    </View>

                    <Text
                      style={[
                        styles.habitPct,
                        { color: colors.onSurface, fontFamily },
                      ]}
                    >
                      {pct}%
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Aggregated Intensity Heatmap */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              borderColor: colors.outlineVariant,
            },
          ]}
        >
          <Text style={[styles.cardTitle, { color: colors.onSurface, fontFamily }]}>
            Aggregate Heatmap
          </Text>
          <Text style={[styles.cardSubtitle, { color: colors.onSurfaceVariant, fontFamily }]}>
            Tap any day to see habits completed
          </Text>
          <HeatMap
            data={heatMapData}
            isBoolean={false}
            startOfWeek={appSettings.startOfWeek}
            onPressDay={(epochDay) => setSelectedEpochDay(epochDay)}
          />
        </View>

        {/* Weekday Breakdown */}
        <WeekdayFrequencyChart data={weekDayFrequencyData} />
      </ScrollView>

      {/* Drill-down sheet */}
      <DayCompletionSheet
        visible={selectedEpochDay !== null}
        epochDay={selectedEpochDay}
        onClose={() => setSelectedEpochDay(null)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  metricCard: {
    borderRadius: 22,
    padding: 24,
    borderWidth: 1,
    marginBottom: 16,
    elevation: 1,
    alignItems: 'center',
  },
  ringArea: {
    alignItems: 'center',
  },
  overallConsistencyText: {
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: -1,
  },
  overallConsistencyLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  card: {
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    marginBottom: 16,
    elevation: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  cardSubtitle: {
    fontSize: 13,
    marginTop: 2,
    marginBottom: 12,
  },
  leaderboardList: {
    gap: 14,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rankCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  habitCol: {
    flex: 1,
  },
  habitTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
  },
  consistencyBarBg: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  consistencyBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  habitPct: {
    fontSize: 15,
    fontWeight: '700',
    minWidth: 40,
    textAlign: 'right',
  },
});
