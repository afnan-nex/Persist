import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { HabitWithAnalytics } from '../../types';
import { getHabitsWithAnalytics } from '../../data/habitRepository';
import { useTheme } from '../../theme/ThemeContext';
import { TopAppBar } from '../../components/m3';
import { HeatMap } from '../../components/habits/HeatMap';
import { WeeklyChart } from '../../components/habits/WeeklyChart';
import { WeekdayFrequencyChart } from '../../components/habits/WeekdayFrequencyChart';
import { DayCompletionSheet } from '../../components/habits/DayCompletionSheet';

export const HabitAnalyticsScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { colors, typography, shapes, elevation, appSettings, fontFamily } = useTheme();

  const habitId = route.params?.habitId as number;
  const [analytics, setAnalytics] = useState<HabitWithAnalytics | null>(null);
  const [selectedEpochDay, setSelectedEpochDay] = useState<number | null>(null);

  useEffect(() => {
    getHabitsWithAnalytics(appSettings.startOfWeek).then((list) => {
      const found = list.find((item) => item.habit.id === habitId);
      if (found) {
        setAnalytics(found);
      }
    });
  }, [habitId, appSettings.startOfWeek]);

  if (!analytics) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <TopAppBar
          title="Analytics"
          variant="small"
          navigationIcon={{
            icon: 'arrow-left',
            onPress: () => navigation.goBack(),
            accessibilityLabel: 'Go back',
          }}
        />
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.onSurfaceVariant, ...typography.bodyLarge, fontFamily }]}>
            Loading analytics...
          </Text>
        </View>
      </View>
    );
  }

  const { habit, consistency, currentStreak, bestStreak, startedDaysAgo, statuses } = analytics;
  const consistencyPercent = Math.round(consistency * 100);

  // Map statuses to heatmap data
  const heatmapData: Record<number, number> = {};
  statuses.forEach((s) => {
    heatmapData[s.date] = 1;
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopAppBar
        title={habit.title}
        subtitle="Habit Analytics"
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
        {/* Consistency Overview Card */}
        <View
          style={[
            styles.metricCard,
            {
              backgroundColor: colors.surfaceContainerLow,
              borderRadius: shapes.large,
              elevation: elevation.level1,
            },
          ]}
        >
          <View style={styles.metricRow}>
            <View style={styles.metricItem}>
              <Text
                style={[
                  styles.metricValue,
                  { color: colors.primary, ...typography.displaySmall, fontFamily },
                ]}
              >
                {consistencyPercent}%
              </Text>
              <Text style={[styles.metricLabel, { color: colors.onSurfaceVariant, ...typography.labelMedium, fontFamily }]}>
                Consistency
              </Text>
            </View>

            <View style={[styles.metricDivider, { backgroundColor: colors.outlineVariant }]} />

            <View style={styles.metricItem}>
              <Text
                style={[
                  styles.metricValue,
                  { color: colors.onSurface, ...typography.displaySmall, fontFamily },
                ]}
              >
                {startedDaysAgo}
              </Text>
              <Text style={[styles.metricLabel, { color: colors.onSurfaceVariant, ...typography.labelMedium, fontFamily }]}>
                Days Ago Started
              </Text>
            </View>
          </View>
        </View>

        {/* Streaks Row */}
        <View style={styles.streaksRow}>
          <View
            style={[
              styles.streakCard,
              {
                backgroundColor: colors.surfaceContainerLow,
                borderRadius: shapes.large,
                elevation: elevation.level1,
              },
            ]}
          >
            <View style={styles.streakHeader}>
              <MaterialCommunityIcons name="fire" size={24} color="#F97316" />
              <Text style={[styles.streakTitle, { color: colors.onSurfaceVariant, ...typography.labelSmall, fontFamily }]}>
                Current
              </Text>
            </View>
            <Text style={[styles.streakDays, { color: colors.onSurface, ...typography.headlineMedium, fontFamily }]}>
              {currentStreak} <Text style={[styles.daysUnit, { ...typography.bodyMedium }]}>days</Text>
            </Text>
          </View>

          <View
            style={[
              styles.streakCard,
              {
                backgroundColor: colors.surfaceContainerLow,
                borderRadius: shapes.large,
                elevation: elevation.level1,
              },
            ]}
          >
            <View style={styles.streakHeader}>
              <MaterialCommunityIcons name="trophy-outline" size={24} color="#F59E0B" />
              <Text style={[styles.streakTitle, { color: colors.onSurfaceVariant, ...typography.labelSmall, fontFamily }]}>
                Best
              </Text>
            </View>
            <Text style={[styles.streakDays, { color: colors.onSurface, ...typography.headlineMedium, fontFamily }]}>
              {bestStreak} <Text style={[styles.daysUnit, { ...typography.bodyMedium }]}>days</Text>
            </Text>
          </View>
        </View>

        {/* 12-Month Contribution HeatMap Card */}
        <View
          style={[
            styles.chartCard,
            {
              backgroundColor: colors.surfaceContainerLow,
              borderRadius: shapes.large,
              elevation: elevation.level1,
            },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.onSurface, ...typography.titleMedium, fontFamily }]}>
            Activity Heatmap
          </Text>
          <Text style={[styles.sectionSubtitle, { color: colors.onSurfaceVariant, ...typography.bodyMedium, fontFamily }]}>
            Past 52 weeks of consistency
          </Text>
          <HeatMap
            data={heatmapData}
            isBoolean={true}
            startOfWeek={appSettings.startOfWeek}
            onPressDay={(epochDay) => setSelectedEpochDay(epochDay)}
          />
        </View>

        {/* Weekly Comparison Chart */}
        <WeeklyChart data={analytics.weeklyComparisonData} />

        {/* Weekday Breakdown Chart */}
        <WeekdayFrequencyChart data={analytics.weekDayFrequencyData} />
      </ScrollView>

      {/* Tap-on-HeatMap drill-down modal */}
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
    padding: 20,
    marginBottom: 16,
    elevation: 1,
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricValue: {
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: -1,
  },
  metricLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },
  metricDivider: {
    width: 1,
    height: 48,
  },
  streaksRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  streakCard: {
    flex: 1,
    borderRadius: 20,
    padding: 18,
    elevation: 1,
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  streakTitle: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  streakDays: {
    fontSize: 26,
    fontWeight: '800',
  },
  daysUnit: {
    fontSize: 14,
    fontWeight: '500',
  },
  chartCard: {
    borderRadius: 22,
    padding: 20,
    marginBottom: 16,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  sectionSubtitle: {
    fontSize: 13,
    marginTop: 2,
    marginBottom: 12,
  },
});
