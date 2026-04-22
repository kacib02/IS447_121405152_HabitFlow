import * as SQLite from 'expo-sqlite';
import { getActiveUser } from './auth';

const db = SQLite.openDatabaseSync('habitflow.db');

export type Category = {
  id: number;
  user_id: number;
  name: string;
  color: string;
  created_at: string;
};

export async function initCategoryTable() {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name ?,
      color ?,
      created_at TEXT NOT NULL
    );
  `);
}

export async function createCategory(name: string, color: string) {
  const activeUser = await getActiveUser();

  if (!activeUser) {
    throw new Error('No active user found.');
  }

  const trimmedName = name.trim();
  const trimmedColor = color.trim();
 

  if (!trimmedName || !trimmedColor) {
    throw new Error('All category fields are required.');
  }

  await db.runAsync(
    `INSERT INTO categories (user_id, name, color, icon, created_at)
     VALUES (?, ?, ?, ?, ?);`,
    [
      activeUser.id,
      trimmedName,
      trimmedColor,
      new Date().toISOString(),
    ]
  );
}

export async function updateCategory(
  categoryId: number,
  name: string,
  color: string
) {
  const activeUser = await getActiveUser();

  if (!activeUser) {
    throw new Error('No active user found.');
  }

  const trimmedName = name.trim();
  const trimmedColor = color.trim();

  if (!trimmedName || !trimmedColor) {
    throw new Error('All category fields are required.');
  }

  await db.runAsync(
    `UPDATE categories
     SET name = ?, color = ?, icon = ?
     WHERE id = ? AND user_id = ?;`,
    [trimmedName, trimmedColor, categoryId, activeUser.id]
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