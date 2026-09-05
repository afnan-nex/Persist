import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Habit, HabitStatus, DayOfWeek } from '../../types';
import {
  getHabits,
  getHabitStatuses,
  upsertHabit,
  deleteHabit,
  toggleHabitStatus,
  updateHabitIndexes,
} from '../../data/habitRepository';
import { countCurrentStreak } from '../../data/calculations';
import { useTheme } from '../../theme/ThemeContext';
import { TopAppBar, FloatingActionButton } from '../../components/m3';
import { EmptyState } from '../../components/common/EmptyState';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { HabitCard } from '../../components/habits/HabitCard';
import { HabitUpsertModal } from '../../components/habits/HabitUpsertModal';

export const HabitsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { colors } = useTheme();

  const [habits, setHabits] = useState<Habit[]>([]);
  const [statuses, setStatuses] = useState<HabitStatus[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isReorderMode, setIsReorderMode] = useState(false);

  // Modals & Dialogs
  const [habitToEdit, setHabitToEdit] = useState<Habit | null>(null);
  const [showHabitModal, setShowHabitModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [habitToDelete, setHabitToDelete] = useState<Habit | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [hbs, sts] = await Promise.all([getHabits(), getHabitStatuses()]);
      setHabits(hbs);
      setStatuses(sts);
    } catch (error) {
      console.error('Failed to load habits data:', error);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  const handleToggleDate = async (habitId: number, epochDay: number) => {
    await toggleHabitStatus(habitId, epochDay);
    await loadData();
  };

  const handleSaveHabit = async (habitData: {
    id?: number;
    title: string;
    description: string;
    days: DayOfWeek[];
    time: number;
    reminder: boolean;
  }) => {
    try {
      await upsertHabit({
        ...habitData,
        index: habitData.id ? habits.find((h) => h.id === habitData.id)?.index ?? 0 : habits.length,
      });
    } catch (error) {
      console.error('Failed to save habit:', error);
    } finally {
      await loadData();
    }
  };

  const handleDeleteHabit = async () => {
    if (habitToDelete) {
      await deleteHabit(habitToDelete.id);
      setHabitToDelete(null);
      setShowDeleteDialog(false);
      await loadData();
    }
  };

  const handleMoveHabit = async (index: number, direction: 'up' | 'down') => {
    const currentList = [...habits];
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= currentList.length) return;

    const temp = currentList[index];
    currentList[index] = currentList[target];
    currentList[target] = temp;

    await updateHabitIndexes(currentList);
    await loadData();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopAppBar
        title="Habits"
        subtitle={`${habits.length} habits tracked`}
        actions={[
          {
            icon: isReorderMode ? 'check' : 'swap-vertical',
            color: isReorderMode ? colors.primary : colors.onSurface,
            onPress: () => setIsReorderMode(!isReorderMode),
            accessibilityLabel: 'Reorder habits',
          },
          {
            icon: 'chart-box-outline',
            onPress: () => navigation.navigate('OverallAnalytics'),
            accessibilityLabel: 'View overall analytics',
          },
        ]}
      />

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 90 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {habits.length === 0 ? (
          <EmptyState
            icon="calendar-check-outline"
            title="No habits yet"
            description="Start building consistent daily routines by creating your first habit."
            actionText="Create Habit"
            onAction={() => {
              setHabitToEdit(null);
              setShowHabitModal(true);
            }}
          />
        ) : (
          habits.map((habit, idx) => {
            const habitStatuses = statuses.filter((s) => s.habitId === habit.id);
            const completedEpochDays = new Set(habitStatuses.map((s) => s.date));
            const streak = countCurrentStreak(
              Array.from(completedEpochDays),
              habit.days
            );

            return (
              <HabitCard
                key={habit.id}
                habit={habit}
                completedEpochDays={completedEpochDays}
                currentStreak={streak}
                isReorderMode={isReorderMode}
                onToggleDate={handleToggleDate}
                onPressCard={(h) => navigation.navigate('HabitAnalytics', { habitId: h.id })}
                onLongPressCard={(h) => {
                  setHabitToEdit(h);
                  setShowHabitModal(true);
                }}
                onMoveUp={() => handleMoveHabit(idx, 'up')}
                onMoveDown={() => handleMoveHabit(idx, 'down')}
                canMoveUp={idx > 0}
                canMoveDown={idx < habits.length - 1}
              />
            );
          })
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <FloatingActionButton
        icon="plus"
        size="standard"
        colorVariant="primary"
        style={{
          position: 'absolute',
          right: 20,
          bottom: insets.bottom + 92,
        }}
        onPress={() => {
          setHabitToEdit(null);
          setShowHabitModal(true);
        }}
        accessibilityLabel="Create new habit"
      />

      {/* Upsert Modal */}
      <HabitUpsertModal
        visible={showHabitModal}
        habitToEdit={habitToEdit}
        onSave={handleSaveHabit}
        onDelete={(id) => {
          const h = habits.find((item) => item.id === id);
          if (h) {
            setHabitToDelete(h);
            setShowDeleteDialog(true);
          }
        }}
        onClose={() => {
          setShowHabitModal(false);
          setHabitToEdit(null);
        }}
      />

      {/* Delete Dialog */}
      <ConfirmDialog
        visible={showDeleteDialog}
        title="Delete Habit"
        message={`Are you sure you want to delete "${habitToDelete?.title}"? All associated streak and completion history will be lost.`}
        confirmText="Delete"
        isDestructive
        onConfirm={handleDeleteHabit}
        onCancel={() => {
          setShowDeleteDialog(false);
          setHabitToDelete(null);
        }}
      />
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
  fab: {
    position: 'absolute',
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
});
