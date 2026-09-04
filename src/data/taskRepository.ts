import { getDatabase } from './database';
import { Category, Task } from '../types';
import { scheduleTaskReminder, cancelTaskReminder } from '../services/notifications';

export async function getCategories(): Promise<Category[]> {
  const db = await getDatabase();
  return await db.getAllAsync<Category>(
    'SELECT id, name, [index], color FROM categories ORDER BY [index] ASC;'
  );
}

export async function upsertCategory(
  category: Omit<Category, 'id'> & { id?: number }
): Promise<number> {
  const db = await getDatabase();
  if (category.id && category.id > 0) {
    await db.runAsync(
      'UPDATE categories SET name = ?, [index] = ?, color = ? WHERE id = ?;',
      [category.name, category.index, category.color, category.id]
    );
    return category.id;
  } else {
    // If index not specified, put at end
    const last = await db.getFirstAsync<{ maxIndex: number }>(
      'SELECT MAX([index]) as maxIndex FROM categories;'
    );
    const newIndex = category.index ?? ((last?.maxIndex ?? -1) + 1);
    const res = await db.runAsync(
      'INSERT INTO categories (name, [index], color) VALUES (?, ?, ?);',
      [category.name, newIndex, category.color]
    );
    return res.lastInsertRowId;
  }
}

export async function deleteCategory(id: number): Promise<boolean> {
  const db = await getDatabase();
  const countRes = await db.getFirstAsync<{ total: number }>(
    'SELECT COUNT(*) as total FROM categories;'
  );
  if (countRes && countRes.total <= 1) {
    return false; // Safeguard: keep at least 1 category
  }

  // Cancel reminders for tasks in this category
  const tasksInCat = await db.getAllAsync<{ id: number }>(
    'SELECT id FROM task WHERE categoryId = ?;',
    [id]
  );
  for (const t of tasksInCat) {
    await cancelTaskReminder(t.id);
  }

  await db.runAsync('DELETE FROM categories WHERE id = ?;', [id]);
  return true;
}

export async function updateCategoryIndexes(categories: Category[]): Promise<void> {
  const db = await getDatabase();
  await db.withTransactionAsync(async () => {
    for (let i = 0; i < categories.length; i++) {
      await db.runAsync('UPDATE categories SET [index] = ? WHERE id = ?;', [
        i,
        categories[i].id,
      ]);
    }
  });
}

export async function getTasks(): Promise<Task[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{
    id: number;
    categoryId: number;
    title: string;
    status: number;
    index: number;
    reminder: number | null;
  }>('SELECT id, categoryId, title, status, [index], reminder FROM task ORDER BY [index] ASC;');

  return rows.map((r) => ({
    ...r,
    status: r.status === 1,
  }));
}

export async function getTaskById(id: number): Promise<Task | null> {
  const db = await getDatabase();
  const r = await db.getFirstAsync<{
    id: number;
    categoryId: number;
    title: string;
    status: number;
    index: number;
    reminder: number | null;
  }>('SELECT id, categoryId, title, status, [index], reminder FROM task WHERE id = ?;', [id]);

  if (!r) return null;
  return {
    ...r,
    status: r.status === 1,
  };
}

export async function upsertTask(
  task: Omit<Task, 'id' | 'index' | 'status'> & {
    id?: number;
    index?: number;
    status?: boolean;
  }
): Promise<number> {
  const db = await getDatabase();
  let taskId: number;
  const isStatus = task.status ?? false;

  if (task.id && task.id > 0) {
    taskId = task.id;
    const existing = await getTaskById(taskId);
    const resolvedIndex = task.index ?? existing?.index ?? 0;
    await db.runAsync(
      'UPDATE task SET categoryId = ?, title = ?, status = ?, [index] = ?, reminder = ? WHERE id = ?;',
      [
        task.categoryId,
        task.title,
        isStatus ? 1 : 0,
        resolvedIndex,
        isStatus ? null : task.reminder ?? null,
        taskId,
      ]
    );
  } else {
    const last = await db.getFirstAsync<{ maxIndex: number }>(
      'SELECT MAX([index]) as maxIndex FROM task WHERE categoryId = ?;',
      [task.categoryId]
    );
    const newIndex = task.index ?? ((last?.maxIndex ?? -1) + 1);
    const res = await db.runAsync(
      'INSERT INTO task (categoryId, title, status, [index], reminder) VALUES (?, ?, ?, ?, ?);',
      [
        task.categoryId,
        task.title,
        isStatus ? 1 : 0,
        newIndex,
        isStatus ? null : task.reminder ?? null,
      ]
    );
    taskId = res.lastInsertRowId;
  }

  const savedTask: Task = {
    id: taskId,
    categoryId: task.categoryId,
    title: task.title,
    status: isStatus,
    index: task.index ?? 0,
    reminder: isStatus ? null : task.reminder ?? null,
  };

  if (savedTask.status || !savedTask.reminder) {
    await cancelTaskReminder(taskId);
  } else {
    await scheduleTaskReminder(savedTask);
  }

  return taskId;
}

export async function toggleTaskStatus(taskId: number, newStatus: boolean): Promise<void> {
  const db = await getDatabase();
  if (newStatus) {
    await cancelTaskReminder(taskId);
    await db.runAsync('UPDATE task SET status = 1, reminder = NULL WHERE id = ?;', [taskId]);
  } else {
    await db.runAsync('UPDATE task SET status = 0 WHERE id = ?;', [taskId]);
    const task = await getTaskById(taskId);
    if (task && task.reminder) {
      await scheduleTaskReminder(task);
    }
  }
}

export async function deleteTask(id: number): Promise<void> {
  const db = await getDatabase();
  await cancelTaskReminder(id);
  await db.runAsync('DELETE FROM task WHERE id = ?;', [id]);
}

export async function deleteCompletedTasks(): Promise<void> {
  const db = await getDatabase();
  const completed = await db.getAllAsync<{ id: number }>(
    'SELECT id FROM task WHERE status = 1;'
  );
  for (const c of completed) {
    await cancelTaskReminder(c.id);
  }
  await db.runAsync('DELETE FROM task WHERE status = 1;');
}

export async function deleteAllTasks(): Promise<void> {
  const db = await getDatabase();
  const all = await db.getAllAsync<{ id: number }>('SELECT id FROM task;');
  for (const t of all) {
    await cancelTaskReminder(t.id);
  }
  await db.runAsync('DELETE FROM task;');
}

export async function updateTaskIndexes(tasks: Task[]): Promise<void> {
  const db = await getDatabase();
  await db.withTransactionAsync(async () => {
    for (let i = 0; i < tasks.length; i++) {
      await db.runAsync('UPDATE task SET [index] = ? WHERE id = ?;', [i, tasks[i].id]);
    }
  });
}
