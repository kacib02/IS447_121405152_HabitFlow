import * as SQLite from 'expo-sqlite';
import { getActiveUser } from './auth';

const db = SQLite.openDatabaseSync('habitflow.db');

export type Habit = {
  id: number;
  user_id: number;
  category_id: number;
  title: string;
  description: string | null;
  habit_type: string;
  unit: string;
  is_archived: number;
  created_at: string;
  category_name?: string;
};

export async function initHabitTable() {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS habits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      category_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      habit_type TEXT NOT NULL,
      unit TEXT NOT NULL,
      is_archived INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );
  `);
}

export async function createHabit(
  title: string,
  description: string,
  habitType: string,
  unit: string,
  categoryId: number
) {
  const activeUser = await getActiveUser();

  if (!activeUser) {
    throw new Error('No active user found.');
  }

  const trimmedTitle = title.trim();
  const trimmedDescription = description.trim();
  const trimmedHabitType = habitType.trim().toLowerCase();
  const trimmedUnit = unit.trim();

  if (!trimmedTitle || !trimmedHabitType || !trimmedUnit || !categoryId) {
    throw new Error('All habit fields are required.');
  }

  if (!['boolean', 'count'].includes(trimmedHabitType)) {
    throw new Error('Habit type must be either boolean or count.');
  }

  await db.runAsync(
    `INSERT INTO habits (
      user_id, category_id, title, description, habit_type, unit, is_archived, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, 0, ?);`,
    [
      activeUser.id,
      categoryId,
      trimmedTitle,
      trimmedDescription || null,
      trimmedHabitType,
      trimmedUnit,
      new Date().toISOString(),
    ]
  );
}

export async function getHabitsForActiveUser() {
  const activeUser = await getActiveUser();

  if (!activeUser) {
    return [];
  }

  const rows = await db.getAllAsync<Habit>(
    `SELECT habits.*, categories.name AS category_name
     FROM habits
     INNER JOIN categories ON habits.category_id = categories.id
     WHERE habits.user_id = ?
     ORDER BY habits.id DESC;`,
    [activeUser.id]
  );

  return rows;
}