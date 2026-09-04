import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { getDatabase } from './database';
import { getHabits, getHabitStatuses, upsertHabit } from './habitRepository';
import { getTasks, getCategories, upsertTask } from './taskRepository';
import {
  ExportSchema,
  HabitSchema,
  HabitStatusSchema,
  TaskSchema,
  CategorySchema,
} from '../types';

export async function exportToJson(): Promise<boolean> {
  try {
    const habits = await getHabits();
    const habitStatuses = await getHabitStatuses();
    const tasks = await getTasks();
    const categories = await getCategories();

    const habitSchemas: HabitSchema[] = habits.map((h) => {
      // Time stored as minutes from midnight; convert to arbitrary epoch ms for full Grit compatibility
      const now = new Date();
      now.setHours(Math.floor(h.time / 60), h.time % 60, 0, 0);
      return {
        id: h.id,
        title: h.title,
        description: h.description,
        index: h.index,
        time: now.getTime(),
        days: h.days.join(','),
        reminder: h.reminder,
      };
    });

    const habitStatusSchemas: HabitStatusSchema[] = habitStatuses.map((s) => ({
      id: s.id,
      habitId: s.habitId,
      date: s.date,
    }));

    const taskSchemas: TaskSchema[] = tasks.map((t) => ({
      id: t.id,
      categoryId: t.categoryId,
      title: t.title,
      status: t.status,
      index: t.index,
      reminder: t.reminder ? Math.floor(t.reminder / 1000) : null,
    }));

    const categorySchemas: CategorySchema[] = categories.map((c) => ({
      id: c.id,
      name: c.name,
      index: c.index,
      color: c.color,
    }));

    const exportData: ExportSchema = {
      tasksSchemaVersion: 5,
      habitsSchemaVersion: 5,
      habits: habitSchemas,
      habitStatus: habitStatusSchemas,
      tasks: taskSchemas,
      categories: categorySchemas,
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    const dateStr = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `Persist-Export-${dateStr}.json`;
    const fileUri = `${FileSystem.documentDirectory}${filename}`;

    await FileSystem.writeAsStringAsync(fileUri, jsonString, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/json',
        dialogTitle: 'Save or Share Persist Backup',
        UTI: 'public.json',
      });
      return true;
    }
    return false;
  } catch (error) {
    console.error('Export failed:', error);
    throw error;
  }
}

export async function importFromJson(): Promise<{
  habitsCount: number;
  tasksCount: number;
  categoriesCount: number;
  statusesCount: number;
}> {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/json',
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      throw new Error('File selection cancelled');
    }

    const file = result.assets[0];
    const fileContent = await FileSystem.readAsStringAsync(file.uri);
    const data: ExportSchema = JSON.parse(fileContent);

    if (!data.habits || !data.tasks || !data.categories) {
      throw new Error('Invalid backup file format');
    }

    const db = await getDatabase();

    await db.withTransactionAsync(async () => {
      // Clear current tables
      await db.runAsync('DELETE FROM habit_status;');
      await db.runAsync('DELETE FROM habit_index;');
      await db.runAsync('DELETE FROM task;');
      await db.runAsync('DELETE FROM categories;');

      // Insert categories
      for (const cat of data.categories) {
        await db.runAsync(
          'INSERT INTO categories (id, name, [index], color) VALUES (?, ?, ?, ?);',
          [cat.id, cat.name, cat.index, cat.color]
        );
      }

      // Insert tasks
      for (const t of data.tasks) {
        const reminderMs = t.reminder ? t.reminder * 1000 : null;
        await db.runAsync(
          'INSERT INTO task (id, categoryId, title, status, [index], reminder) VALUES (?, ?, ?, ?, ?, ?);',
          [t.id, t.categoryId, t.title, t.status ? 1 : 0, t.index, reminderMs]
        );
      }

      // Insert habits
      for (const h of data.habits) {
        const dateObj = new Date(h.time);
        const minutes = dateObj.getHours() * 60 + dateObj.getMinutes();
        await db.runAsync(
          'INSERT INTO habit_index (id, title, description, [index], days, time, reminder) VALUES (?, ?, ?, ?, ?, ?, ?);',
          [h.id, h.title, h.description, h.index, h.days, minutes, h.reminder ? 1 : 0]
        );
      }

      // Insert habit statuses
      if (data.habitStatus) {
        for (const s of data.habitStatus) {
          await db.runAsync(
            'INSERT INTO habit_status (id, habitId, date) VALUES (?, ?, ?);',
            [s.id, s.habitId, s.date]
          );
        }
      }
    });

    // Reschedule notifications for imported items
    const restoredHabits = await getHabits();
    for (const h of restoredHabits) {
      if (h.reminder) {
        await upsertHabit(h);
      }
    }

    const restoredTasks = await getTasks();
    for (const t of restoredTasks) {
      if (!t.status && t.reminder) {
        await upsertTask(t);
      }
    }

    return {
      habitsCount: data.habits.length,
      tasksCount: data.tasks.length,
      categoriesCount: data.categories.length,
      statusesCount: data.habitStatus?.length || 0,
    };
  } catch (error) {
    console.error('Import failed:', error);
    throw error;
  }
}
