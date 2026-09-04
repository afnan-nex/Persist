import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import {
  Habit,
  DayOfWeek,
  SINGLE_CHAR_DAYS,
  SHORT_DAY_NAMES,
} from '../../types';
import {
  getTodayEpochDay,
  epochDayToDayOfWeek,
  getIsoDayNumber,
} from '../../data/calculations';
import { useTheme } from '../../theme/ThemeContext';

interface WeekStripProps {
  habit: Habit;
  completedEpochDays: Set<number>;
  startOfWeek: DayOfWeek;
  onToggleDate: (date: number) => void;
}

export const WeekStrip: React.FC<WeekStripProps> = ({
  habit,
  completedEpochDays,
  startOfWeek,
  onToggleDate,
}) => {
  const { colors, fontFamily } = useTheme();
  const today = getTodayEpochDay();
  const todayDow = epochDayToDayOfWeek(today);

  const todayIso = getIsoDayNumber(todayDow);
  const startIso = getIsoDayNumber(startOfWeek);

  const daysIntoCurrentWeek = (todayIso - startIso + 7) % 7;
  const startOfWeekDate = today - daysIntoCurrentWeek;

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const epochDay = startOfWeekDate + i;
    const dow = epochDayToDayOfWeek(epochDay);
    const isScheduled = habit.days.includes(dow);
    const isCompleted = completedEpochDays.has(epochDay);
    const isToday = epochDay === today;
    const isFuture = epochDay > today;

    return {
      epochDay,
      dow,
      isScheduled,
      isCompleted,
      isToday,
      isFuture,
    };
  });

  const handlePress = (epochDay: number, isFuture: boolean) => {
    if (isFuture) return; // Cannot check future days
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggleDate(epochDay);
  };

  return (
    <View style={styles.container}>
      {weekDays.map((item, idx) => {
        const prevCompleted = idx > 0 && weekDays[idx - 1].isCompleted;
        const nextCompleted = idx < 6 && weekDays[idx + 1].isCompleted;

        // Connected capsule border radii
        let borderTopLeft = 14;
        let borderBottomLeft = 14;
        let borderTopRight = 14;
        let borderBottomRight = 14;

        if (item.isCompleted) {
          if (prevCompleted) {
            borderTopLeft = 0;
            borderBottomLeft = 0;
          }
          if (nextCompleted) {
            borderTopRight = 0;
            borderBottomRight = 0;
          }
        }

        return (
          <TouchableOpacity
            key={item.epochDay}
            style={[
              styles.dayCell,
              {
                backgroundColor: item.isCompleted
                  ? colors.primary
                  : item.isScheduled
                  ? colors.surfaceVariant
                  : 'transparent',
                borderTopLeftRadius: borderTopLeft,
                borderBottomLeftRadius: borderBottomLeft,
                borderTopRightRadius: borderTopRight,
                borderBottomRightRadius: borderBottomRight,
                opacity: item.isFuture ? 0.4 : 1,
              },
              item.isToday && !item.isCompleted && [styles.todayRing, { borderColor: colors.primary }],
            ]}
            disabled={item.isFuture}
            onPress={() => handlePress(item.epochDay, item.isFuture)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.dayLabel,
                {
                  color: item.isCompleted
                    ? colors.onPrimary
                    : item.isScheduled
                    ? colors.onSurface
                    : colors.onSurfaceVariant,
                  fontWeight: item.isToday || item.isCompleted ? '800' : '500',
                  fontFamily,
                },
              ]}
            >
              {SINGLE_CHAR_DAYS[item.dow]}
            </Text>

            {item.isCompleted ? (
              <MaterialCommunityIcons name="check" size={12} color={colors.onPrimary} />
            ) : item.isToday ? (
              <View style={[styles.todayDot, { backgroundColor: colors.primary }]} />
            ) : (
              <View style={styles.placeholderDot} />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    marginTop: 10,
  },
  dayCell: {
    flex: 1,
    height: 48,
    marginHorizontal: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  todayRing: {
    borderWidth: 1.5,
  },
  dayLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 2,
  },
  placeholderDot: {
    width: 4,
    height: 4,
    marginTop: 2,
  },
});
