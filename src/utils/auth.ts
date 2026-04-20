import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('habitflow.db');

export type User = {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  created_at: string;
};

export async function initAuthTables() {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL
    );
  `);
}

export async function registerUser(name: string, email: string, password: string) {
  const trimmedName = name.trim();
  const trimmedEmail = email.trim().toLowerCase();
  const trimmedPassword = password.trim();

  if (!trimmedName || !trimmedEmail || !trimmedPassword) {
    throw new Error('All fields are required.');
  }

  const existingUsers = await db.getAllAsync<User>(
    'SELECT * FROM users WHERE email = ?;',
    [trimmedEmail]
  );

  if (existingUsers.length > 0) {
    throw new Error('An account with this email already exists.');
  }

  await db.runAsync(
    `INSERT INTO users (name, email, password_hash, created_at)
     VALUES (?, ?, ?, ?);`,
    [trimmedName, trimmedEmail, trimmedPassword, new Date().toISOString()]
  );

  const newUsers = await db.getAllAsync<User>(
    'SELECT * FROM users WHERE email = ?;',
    [trimmedEmail]
  );

  const user = newUsers[0];

  await db.execAsync('DELETE FROM sessions;');

  await db.runAsync(
    `INSERT INTO sessions (user_id, is_active, created_at)
     VALUES (?, 1, ?);`,
    [user.id, new Date().toISOString()]
  );

  return user;
}

export async function loginUser(email: string, password: string) {
  const trimmedEmail = email.trim().toLowerCase();
  const trimmedPassword = password.trim();

  if (!trimmedEmail || !trimmedPassword) {
    throw new Error('Email and password are required.');
  }

  const users = await db.getAllAsync<User>(
    'SELECT * FROM users WHERE email = ? AND password_hash = ?;',
    [trimmedEmail, trimmedPassword]
  );

  if (users.length === 0) {
    throw new Error('Invalid email or password.');
  }

  const user = users[0];

  await db.execAsync('DELETE FROM sessions;');

  await db.runAsync(
    `INSERT INTO sessions (user_id, is_active, created_at)
     VALUES (?, 1, ?);`,
    [user.id, new Date().toISOString()]
  );

  return user;
}

export async function getActiveUser() {
  const rows = await db.getAllAsync<{
    id: number;
    name: string;
    email: string;
  }>(
    `SELECT users.id, users.name, users.email
     FROM sessions
     INNER JOIN users ON sessions.user_id = users.id
     WHERE sessions.is_active = 1
     ORDER BY sessions.id DESC
     LIMIT 1;`
  );

  return rows.length > 0 ? rows[0] : null;
}

export async function logoutUser() {
  await db.execAsync('DELETE FROM sessions;');
}

export async function deleteCurrentUser() {
  const activeUser = await getActiveUser();

  if (!activeUser) {
    throw new Error('No active user found.');
  }

  await db.runAsync('DELETE FROM users WHERE id = ?;', [activeUser.id]);
  await db.execAsync('DELETE FROM sessions;');
}