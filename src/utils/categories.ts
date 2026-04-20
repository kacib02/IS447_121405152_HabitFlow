import * as SQLite from 'expo-sqlite';
import { getActiveUser } from './auth';

const db = SQLite.openDatabaseSync('habitflow.db');

export type Category = {
  id: number;
  user_id: number;
  name: string;
  color: string;
  icon: string;
  created_at: string;
};

export async function initCategoryTable() {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      color TEXT NOT NULL,
      icon TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);
}

export async function createCategory(name: string, color: string, icon: string) {
  const activeUser = await getActiveUser();

  if (!activeUser) {
    throw new Error('No active user found.');
  }

  const trimmedName = name.trim();
  const trimmedColor = color.trim();
  const trimmedIcon = icon.trim();

  if (!trimmedName || !trimmedColor || !trimmedIcon) {
    throw new Error('All category fields are required.');
  }

  await db.runAsync(
    `INSERT INTO categories (user_id, name, color, icon, created_at)
     VALUES (?, ?, ?, ?, ?);`,
    [
      activeUser.id,
      trimmedName,
      trimmedColor,
      trimmedIcon,
      new Date().toISOString(),
    ]
  );
}

export async function getCategoriesForActiveUser() {
  const activeUser = await getActiveUser();

  if (!activeUser) {
    return [];
  }

  const rows = await db.getAllAsync<Category>(
    `SELECT * FROM categories
     WHERE user_id = ?
     ORDER BY id DESC;`,
    [activeUser.id]
  );

  return rows;
}