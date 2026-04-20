import * as SQLite from 'expo-sqlite';
import { getActiveUser } from './auth';

const db = SQLite.openDatabaseSync('habitflow.db');

export type HabitLog = {
  id: number;
  habit_id: number;
  user_id: number;
  category_id: number;
  log_date: string;
  value: number;
  notes: string | null;
  created_at: string;
  habit_title?: string;
  category_name?: string;
};

export async function initHabitLogTable() {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS habit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      habit_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      category_id INTEGER NOT NULL,
      log_date TEXT NOT NULL,
      value REAL NOT NULL,
      notes TEXT,
      created_at TEXT NOT NULL
    );
  `);
}

export async function createHabitLog(
  habitId: number,
  categoryId: number,
  logDate: string,
  value: number,
  notes: string
) {
  const activeUser = await getActiveUser();

  if (!activeUser) {
    throw new Error('No active user found.');
  }

  const trimmedDate = logDate.trim();
  const trimmedNotes = notes.trim();

  if (!habitId || !categoryId || !trimmedDate) {
    throw new Error('Habit, category, and date are required.');
  }

  if (Number.isNaN(value)) {
    throw new Error('Value must be a valid number.');
  }

  await db.runAsync(
    `INSERT INTO habit_logs (
      habit_id, user_id, category_id, log_date, value, notes, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?);`,
    [
      habitId,
      activeUser.id,
      categoryId,
      trimmedDate,
      value,
      trimmedNotes || null,
      new Date().toISOString(),
    ]
  );
}

export async function getHabitLogsForActiveUser() {
  const activeUser = await getActiveUser();

  if (!activeUser) {
    return [];
  }

  const rows = await db.getAllAsync<HabitLog>(
    `SELECT
        habit_logs.*,
        habits.title AS habit_title,
        categories.name AS category_name
     FROM habit_logs
     INNER JOIN habits ON habit_logs.habit_id = habits.id
     INNER JOIN categories ON habit_logs.category_id = categories.id
     WHERE habit_logs.user_id = ?
     ORDER BY habit_logs.log_date DESC, habit_logs.id DESC;`,
    [activeUser.id]
  );

  return rows;
}

export async function deleteHabitLog(logId: number) {
  await db.runAsync('DELETE FROM habit_logs WHERE id = ?;', [logId]);
}