import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Habit } from '../../types';
import { getTodayEpochDay, epochDayToDayOfWeek } from '../../data/calculations';
import { useTheme } from '../../theme/ThemeContext';
import { WeekStrip } from './WeekStrip';

interface HabitCardProps {
  habit: Habit;
  completedEpochDays: Set<number>;
  currentStreak: number;
  isReorderMode?: boolean;
  onToggleDate: (habitId: number, epochDay: number) => void;
  onPressCard: (habit: Habit) => void;
  onLongPressCard: (habit: Habit) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
}

export const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  completedEpochDays,
  currentStreak,
  isReorderMode = false,
  onToggleDate,
  onPressCard,
  onLongPressCard,
  onMoveUp,
  onMoveDown,
  canMoveUp = false,
  canMoveDown = false,
}) => {
  const { colors, appSettings, fontFamily } = useTheme();
  const today = getTodayEpochDay();
  const isTodayCompleted = completedEpochDays.has(today);
  const todayDow = epochDayToDayOfWeek(today);
  const isScheduledToday = habit.days.includes(todayDow);

  const handleTodayToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onToggleDate(habit.id, today);
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.outlineVariant,
        },
      ]}
    >
      <TouchableOpacity
        style={styles.cardHeader}
        onPress={() => onPressCard(habit)}
        onLongPress={() => onLongPressCard(habit)}
        activeOpacity={0.7}
      >
        <View style={styles.titleArea}>
          <Text
            style={[styles.title, { color: colors.onSurface, fontFamily }]}
            numberOfLines={1}
          >
            {habit.title}
          </Text>
          {habit.description ? (
            <Text
              style={[
                styles.description,
                { color: colors.onSurfaceVariant, fontFamily },
              ]}
              numberOfLines={1}
            >
              {habit.description}
            </Text>
          ) : null}
        </View>

        <View style={styles.rightArea}>
          {/* Streak badge */}
          <View
            style={[
              styles.streakBadge,
              {
                backgroundColor:
                  currentStreak > 0 ? colors.primaryContainer : colors.surfaceVariant,
              },
            ]}
          >
            <MaterialCommunityIcons
              name="fire"
              size={16}
              color={currentStreak > 0 ? '#F97316' : colors.onSurfaceVariant}
            />
            <Text
              style={[
                styles.streakText,
                {
                  color:
                    currentStreak > 0 ? colors.onPrimaryContainer : colors.onSurfaceVariant,
                  fontFamily,
                },
              ]}
            >
              {currentStreak}
            </Text>
          </View>

          {/* Today's Circle Checkbox */}
          {!isReorderMode ? (
            <TouchableOpacity
              style={[
                styles.todayButton,
                {
                  backgroundColor: isTodayCompleted ? colors.primary : 'transparent',
                  borderColor: isTodayCompleted
                    ? colors.primary
                    : isScheduledToday
                    ? colors.outline
                    : colors.outlineVariant,
                },
              ]}
              onPress={handleTodayToggle}
              activeOpacity={0.7}
            >
              {isTodayCompleted ? (
                <MaterialCommunityIcons name="check" size={20} color={colors.onPrimary} />
              ) : null}
            </TouchableOpacity>
          ) : (
            <View style={styles.reorderControls}>
              <TouchableOpacity
                style={[styles.reorderBtn, !canMoveUp && styles.disabled]}
                disabled={!canMoveUp}
                onPress={onMoveUp}
              >
                <MaterialCommunityIcons
                  name="chevron-up"
                  size={20}
                  color={canMoveUp ? colors.onSurface : colors.outline}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.reorderBtn, !canMoveDown && styles.disabled]}
                disabled={!canMoveDown}
                onPress={onMoveDown}
              >
                <MaterialCommunityIcons
                  name="chevron-down"
                  size={20}
                  color={canMoveDown ? colors.onSurface : colors.outline}
                />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </TouchableOpacity>

      {/* Week Calendar Strip */}
      <WeekStrip
        habit={habit}
        completedEpochDays={completedEpochDays}
        startOfWeek={appSettings.startOfWeek}
        onToggleDate={(date) => onToggleDate(habit.id, date)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleArea: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
  },
  description: {
    fontSize: 13,
    marginTop: 2,
  },
  rightArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 2,
  },
  streakText: {
    fontSize: 13,
    fontWeight: '800',
  },
  todayButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reorderControls: {
    flexDirection: 'row',
    gap: 2,
  },
  reorderBtn: {
    padding: 4,
  },
  disabled: {
    opacity: 0.3,
  },
});
