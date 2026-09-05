import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { DayOfWeek } from '../../types';
import {
  getTodayEpochDay,
  epochDayToDayOfWeek,
  getIsoDayNumber,
} from '../../data/calculations';
import { useTheme } from '../../theme/ThemeContext';

interface HeatMapProps {
  data: Record<number, number>; // epochDay -> completion count
  isBoolean?: boolean; // true for single habit, false for overall
  startOfWeek?: DayOfWeek;
  onPressDay?: (epochDay: number, count: number) => void;
}

export const HeatMap: React.FC<HeatMapProps> = ({
  data,
  isBoolean = false,
  startOfWeek = 'MONDAY',
  onPressDay,
}) => {
  const { colors, fontFamily } = useTheme();

  const today = getTodayEpochDay();
  const totalWeeks = 52;
  const todayDow = epochDayToDayOfWeek(today);

  const todayIso = getIsoDayNumber(todayDow);
  const startIso = getIsoDayNumber(startOfWeek);

  const daysIntoCurrentWeek = (todayIso - startIso + 7) % 7;
  const startDateOfTodayWeek = today - daysIntoCurrentWeek;
  const startOfHeatmap = startDateOfTodayWeek - (totalWeeks - 1) * 7;

  // Build 52 columns of 7 days
  const weeks: { epochDay: number; count: number; isFuture: boolean }[][] = [];

  for (let w = 0; w < totalWeeks; w++) {
    const weekDays = [];
    for (let d = 0; d < 7; d++) {
      const epochDay = startOfHeatmap + w * 7 + d;
      const count = data[epochDay] || 0;
      const isFuture = epochDay > today;
      weekDays.push({ epochDay, count, isFuture });
    }
    weeks.push(weekDays);
  }

  // Get color for cell
  const getCellColor = (count: number, isFuture: boolean) => {
    if (isFuture) return 'transparent';
    if (count === 0) return colors.surfaceVariant;

    if (isBoolean) {
      return colors.primary;
    }

    if (count === 1) return colors.primary + '55'; // ~33%
    if (count === 2) return colors.primary + '88'; // ~53%
    if (count === 3) return colors.primary + 'BB'; // ~73%
    return colors.primary; // 4+ = 100%
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.grid}>
          {weeks.map((week, wIdx) => (
            <View key={`week-${wIdx}`} style={styles.weekColumn}>
              {week.map((day) => {
                const cellColor = getCellColor(day.count, day.isFuture);
                return (
                  <TouchableOpacity
                    key={`day-${day.epochDay}`}
                    style={[
                      styles.cell,
                      {
                        backgroundColor: cellColor,
                        borderColor: day.epochDay === today ? colors.primary : 'transparent',
                        borderWidth: day.epochDay === today ? 1.5 : 0,
                      },
                    ]}
                    disabled={day.isFuture || !onPressDay}
                    onPress={() => onPressDay && onPressDay(day.epochDay, day.count)}
                    activeOpacity={0.7}
                  />
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Legend */}
      <View style={styles.legendRow}>
        <Text style={[styles.legendText, { color: colors.onSurfaceVariant, fontFamily }]}>
          Less
        </Text>
        <View style={[styles.legendCell, { backgroundColor: colors.surfaceVariant }]} />
        <View style={[styles.legendCell, { backgroundColor: colors.primary + '55' }]} />
        <View style={[styles.legendCell, { backgroundColor: colors.primary + '88' }]} />
        <View style={[styles.legendCell, { backgroundColor: colors.primary + 'BB' }]} />
        <View style={[styles.legendCell, { backgroundColor: colors.primary }]} />
        <Text style={[styles.legendText, { color: colors.onSurfaceVariant, fontFamily }]}>
          More
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  grid: {
    flexDirection: 'row',
    gap: 3,
  },
  weekColumn: {
    flexDirection: 'column',
    gap: 3,
  },
  cell: {
    width: 13,
    height: 13,
    borderRadius: 3,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    paddingHorizontal: 20,
    marginTop: 10,
  },
  legendCell: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  legendText: {
    fontSize: 11,
    marginHorizontal: 4,
  },
});
