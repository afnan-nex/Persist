import { getDatabase } from './database';
import {
  Habit,
  HabitStatus,
  HabitWithAnalytics,
  OverallAnalytics,
  DayOfWeek,
  ALL_DAYS_OF_WEEK,
} from '../types';
import {
  countCurrentStreak,
  countBestStreak,
  calculateConsistency,
  prepareLineChartData,
  prepareWeekDayFrequencyData,
  prepareHeatMapData,
  getTodayEpochDay,
} from './calculations';
import { scheduleHabitReminders, cancelHabitReminders } from '../services/notifications';

function parseDays(daysStr: string): DayOfWeek[] {
  if (!daysStr) return [];
  return daysStr
    .split(',')
    .map((s) => s.trim().toUpperCase())
    .filter((s) => ALL_DAYS_OF_WEEK.includes(s as DayOfWeek)) as DayOfWeek[];
}

function serializeDays(days: DayOfWeek[]): string {
  return days.join(',');
}

export async function getHabits(): Promise<Habit[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{
    id: number;
    title: string;
    description: string | null;
    index: number | null;
    days: string | null;
    time: number | null;
    reminder: number | null;
  }>('SELECT id, title, description, [index], days, time, reminder FROM habit_index ORDER BY [index] ASC;');

  return rows.map((r) => ({
    id: r.id,
    title: r.title || 'Untitled Habit',
    description: r.description || '',
    index: r.index ?? 0,
    days: parseDays(r.days || ''),
    time: r.time ?? 540,
    reminder: r.reminder === 1,
  }));
}

export async function getHabitById(id: number): Promise<Habit | null> {
  const db = await getDatabase();
  const r = await db.getFirstAsync<{
    id: number;
    title: string;
    description: string | null;
    index: number | null;
    days: string | null;
    time: number | null;
    reminder: number | null;
  }>('SELECT id, title, description, [index], days, time, reminder FROM habit_index WHERE id = ?;', [id]);

  if (!r) return null;
  return {
    id: r.id,
    title: r.title || 'Untitled Habit',
    description: r.description || '',
    index: r.index ?? 0,
    days: parseDays(r.days || ''),
    time: r.time ?? 540,
    reminder: r.reminder === 1,
  };
}

export async function upsertHabit(habit: Omit<Habit, 'id'> & { id?: number }): Promise<number> {
  const db = await getDatabase();
  let habitId: number;

  const title = (habit.title || '').trim() || 'Untitled Habit';
  const description = (habit.description || '').trim();
  const days = habit.days && habit.days.length > 0 ? habit.days : ALL_DAYS_OF_WEEK;
  const time = typeof habit.time === 'number' ? habit.time : 540;
  const reminder = habit.reminder ? 1 : 0;

  if (habit.id && habit.id > 0) {
    habitId = habit.id;
    const existing = await getHabitById(habitId);
    const resolvedIndex = habit.index ?? existing?.index ?? 0;
    await db.runAsync(
      'UPDATE habit_index SET title = ?, description = ?, [index] = ?, days = ?, time = ?, reminder = ? WHERE id = ?;',
      [
        title,
        description,
        resolvedIndex,
        serializeDays(days),
        time,
        reminder,
        habitId,
      ]
    );
  } else {
    const last = await db.getFirstAsync<{ maxIndex: number }>(
      'SELECT MAX([index]) as maxIndex FROM habit_index;'
    );
    const newIndex = habit.index ?? ((last?.maxIndex ?? -1) + 1);
    const res = await db.runAsync(
      'INSERT INTO habit_index (title, description, [index], days, time, reminder) VALUES (?, ?, ?, ?, ?, ?);',
      [
        title,
        description,
        newIndex,
        serializeDays(days),
        time,
        reminder,
      ]
    );
    habitId = res.lastInsertRowId;
  }

  // Safe notification handling: notification failures must NEVER prevent saving
  try {
    const savedHabit: Habit = {
      id: habitId,
      title,
      description,
      index: habit.index ?? 0,
      days,
      time,
      reminder: habit.reminder ?? false,
    };

    if (savedHabit.reminder) {
      await scheduleHabitReminders(savedHabit);
    } else {
      await cancelHabitReminders(habitId);
    }
  } catch (notifErr) {
    console.warn('Notification scheduling warning:', notifErr);
  }

  return habitId;
}

export async function deleteHabit(id: number): Promise<void> {
  const db = await getDatabase();
  await cancelHabitReminders(id);
  await db.runAsync('DELETE FROM habit_index WHERE id = ?;', [id]);
}

export async function updateHabitIndexes(habits: Habit[]): Promise<void> {
  const db = await getDatabase();
  await db.withTransactionAsync(async () => {
    for (let i = 0; i < habits.length; i++) {
      await db.runAsync('UPDATE habit_index SET [index] = ? WHERE id = ?;', [i, habits[i].id]);
    }
  });
}

export async function getHabitStatuses(): Promise<HabitStatus[]> {
  const db = await getDatabase();
  return await db.getAllAsync<HabitStatus>(
    'SELECT id, habitId, date FROM habit_status ORDER BY date ASC;'
  );
}

export async function getStatusesForHabit(habitId: number): Promise<HabitStatus[]> {
  const db = await getDatabase();
  return await db.getAllAsync<HabitStatus>(
    'SELECT id, habitId, date FROM habit_status WHERE habitId = ? ORDER BY date ASC;',
    [habitId]
  );
}

export async function toggleHabitStatus(habitId: number, date: number): Promise<boolean> {
  const db = await getDatabase();
  const existing = await db.getFirstAsync<{ id: number }>(
    'SELECT id FROM habit_status WHERE habitId = ? AND date = ?;',
    [habitId, date]
  );

  if (existing) {
    await db.runAsync('DELETE FROM habit_status WHERE id = ?;', [existing.id]);
    return false; // Now unchecked
  } else {
    await db.runAsync('INSERT INTO habit_status (habitId, date) VALUES (?, ?);', [
      habitId,
      date,
    ]);
    return true; // Now checked
  }
}

export async function getCompletedHabitsForDate(date: number): Promise<Habit[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{
    id: number;
    title: string;
    description: string;
    index: number;
    days: string;
    time: number;
    reminder: number;
  }>(
    `SELECT h.id, h.title, h.description, h.[index], h.days, h.time, h.reminder 
     FROM habit_index h
     INNER JOIN habit_status s ON h.id = s.habitId
     WHERE s.date = ?
     ORDER BY h.[index] ASC;`,
    [date]
  );

  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description,
    index: r.index,
    days: parseDays(r.days),
    time: r.time,
    reminder: r.reminder === 1,
  }));
}

export async function getHabitsWithAnalytics(
  firstDayOfWeek: DayOfWeek = 'MONDAY'
): Promise<HabitWithAnalytics[]> {
  const habits = await getHabits();
  const statuses = await getHabitStatuses();
  const today = getTodayEpochDay();

  return habits.map((habit) => {
    const habitStatuses = statuses.filter((s) => s.habitId === habit.id);
    const dates = habitStatuses.map((s) => s.date);

    // If no statuses, startedDaysAgo is 0, else days since first status or creation
    const minDate = dates.length > 0 ? Math.min(...dates) : today;
    const startedDaysAgo = Math.max(0, today - minDate);

    return {
      habit,
      statuses: habitStatuses,
      consistency: calculateConsistency(dates, habit.days),
      weeklyComparisonData: prepareLineChartData(firstDayOfWeek, habitStatuses),
      weekDayFrequencyData: prepareWeekDayFrequencyData(dates),
      currentStreak: countCurrentStreak(dates, habit.days),
      bestStreak: countBestStreak(dates, habit.days),
      startedDaysAgo,
    };
  });
}

export async function getOverallAnalytics(): Promise<OverallAnalytics> {
  const habits = await getHabits();
  const statuses = await getHabitStatuses();

  const habitConsistencies = habits.map((habit) => {
    const dates = statuses.filter((s) => s.habitId === habit.id).map((s) => s.date);
    return {
      title: habit.title,
      consistency: calculateConsistency(dates, habit.days),
    };
  });

  const consistencies = habitConsistencies.map((h) => h.consistency);
  const overallConsistency =
    consistencies.length > 0
      ? consistencies.reduce((a, b) => a + b, 0) / consistencies.length
      : 0;

  const topHabits = habitConsistencies
    .filter((h) => h.consistency > 0)
    .sort((a, b) => b.consistency - a.consistency)
    .slice(0, 3);

  const allDates = statuses.map((s) => s.date);

  return {
    heatMapData: prepareHeatMapData(statuses),
    weekDayFrequencyData: prepareWeekDayFrequencyData(allDates),
    consistency: overallConsistency,
    topHabits,
  };
}
