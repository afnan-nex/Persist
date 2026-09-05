import * as SQLite from 'expo-sqlite';

let databaseInstance: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (databaseInstance) {
    return databaseInstance;
  }

  const db = await SQLite.openDatabaseAsync('persist.db');

  // Enable foreign keys
  await db.execAsync('PRAGMA foreign_keys = ON;');

  // Create tables matching schema v5
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      name TEXT NOT NULL,
      [index] INTEGER NOT NULL,
      color TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS task (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      categoryId INTEGER NOT NULL,
      title TEXT NOT NULL,
      status INTEGER NOT NULL,
      [index] INTEGER NOT NULL,
      reminder INTEGER DEFAULT NULL,
      FOREIGN KEY(categoryId) REFERENCES categories(id) ON UPDATE NO ACTION ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS index_task_categoryId ON task (categoryId);

    CREATE TABLE IF NOT EXISTS habit_index (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      [index] INTEGER NOT NULL,
      days TEXT NOT NULL,
      time INTEGER NOT NULL,
      reminder INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS habit_status (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      habitId INTEGER NOT NULL,
      date INTEGER NOT NULL,
      FOREIGN KEY(habitId) REFERENCES habit_index(id) ON UPDATE NO ACTION ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS index_habit_status_habitId ON habit_status (habitId);
  `);

  // Ensure default "Misc" category exists
  const existingCategories = await db.getAllAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM categories;'
  );
  if (!existingCategories || existingCategories[0].count === 0) {
    await db.runAsync(
      'INSERT INTO categories (name, [index], color) VALUES (?, ?, ?);',
      ['Misc', 0, '#8E8E93']
    );
  }

  // Safe migrations: ensure all columns exist on habit_index if upgrading an existing database
  try {
    const habitCols = await db.getAllAsync<{ name: string }>('PRAGMA table_info(habit_index);');
    const colNames = new Set(habitCols.map((c) => c.name.toLowerCase()));
    if (!colNames.has('description')) {
      await db.execAsync("ALTER TABLE habit_index ADD COLUMN description TEXT NOT NULL DEFAULT '';");
    }
    if (!colNames.has('index')) {
      await db.execAsync("ALTER TABLE habit_index ADD COLUMN [index] INTEGER NOT NULL DEFAULT 0;");
    }
    if (!colNames.has('days')) {
      await db.execAsync("ALTER TABLE habit_index ADD COLUMN days TEXT NOT NULL DEFAULT '';");
    }
    if (!colNames.has('time')) {
      await db.execAsync("ALTER TABLE habit_index ADD COLUMN time INTEGER NOT NULL DEFAULT 540;");
    }
    if (!colNames.has('reminder')) {
      await db.execAsync("ALTER TABLE habit_index ADD COLUMN reminder INTEGER NOT NULL DEFAULT 1;");
    }
  } catch (migErr) {
    console.warn('Safe migration warning on habit_index:', migErr);
  }

  databaseInstance = db;
  return db;
}
