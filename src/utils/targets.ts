import * as SQLite from 'expo-sqlite';
import { getActiveUser } from './auth';

const db = SQLite.openDatabaseSync('habitflow.db');

export type Target = {
  id: number;
  user_id: number;
  habit_id: number | null;
  category_id: number | null;
  period_type: 'weekly' | 'monthly';
  target_type: 'count' | 'sum';
  target_value: number;
  created_at: string;
  habit_title?: string;
  category_name?: string;
};

export async function initTargetTable() {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS targets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      habit_id INTEGER,
      category_id INTEGER,
      period_type TEXT NOT NULL,
      target_type TEXT NOT NULL,
      target_value REAL NOT NULL,
      created_at TEXT NOT NULL
    );
  `);
}

export async function createTarget(
  habitId: number,
  periodType: 'weekly' | 'monthly',
  targetType: 'count' | 'sum',
  targetValue: number
) {
  const activeUser = await getActiveUser();

  if (!activeUser) {
    throw new Error('No active user found.');
  }

  if (!habitId) {
    throw new Error('Habit is required.');
  }

  if (!periodType) {
    throw new Error('Period type is required.');
  }

  if (!targetType) {
    throw new Error('Target type is required.');
  }

  if (Number.isNaN(targetValue) || targetValue <= 0) {
    throw new Error('Target value must be greater than 0.');
  }

  await db.runAsync(
    `INSERT INTO targets (
      user_id, habit_id, category_id, period_type, target_type, target_value, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?);`,
    [
      activeUser.id,
      habitId,
      null,
      periodType,
      targetType,
      targetValue,
      new Date().toISOString(),
    ]
  );
}

export async function getTargetsForActiveUser() {
  const activeUser = await getActiveUser();

  if (!activeUser) {
    return [];
  }

  const rows = await db.getAllAsync<Target>(
    `SELECT
        targets.*,
        habits.title AS habit_title
     FROM targets
     LEFT JOIN habits ON targets.habit_id = habits.id
     WHERE targets.user_id = ?
     ORDER BY targets.id DESC;`,
    [activeUser.id]
  );

  return rows;
}

export async function deleteTarget(targetId: number) {
  await db.runAsync(`DELETE FROM targets WHERE id = ?;`, [targetId]);
}