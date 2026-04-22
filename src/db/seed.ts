import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('habitflow.db');

export async function seedDatabase() {
  // Check if seed has already been run for this user to avoid duplication
  const existingCategories = await db.getAllAsync<{ id: number }>(
    `SELECT id FROM categories LIMIT 1;`
  );

  if (existingCategories.length > 0) {
    console.log('Seed already run — skipping.');
    return;
  }

  console.log('Seeding database...');

  // ── 1. Create a demo user ──────────────────────────────────────────────────
  await db.runAsync(
    `INSERT OR IGNORE INTO users (name, email, password_hash, created_at)
     VALUES (?, ?, ?, ?);`,
    ['Demo User', 'demo@habitflow.com', 'demo1234', new Date().toISOString()]
  );

  const userRows = await db.getAllAsync<{ id: number }>(
    `SELECT id FROM users WHERE email = ?;`,
    ['demo@habitflow.com']
  );
  const userId = userRows[0].id;

  // ── 2. Create a session for the demo user ─────────────────────────────────
  await db.execAsync(`DELETE FROM sessions;`);
  await db.runAsync(
    `INSERT INTO sessions (user_id, is_active, created_at) VALUES (?, 1, ?);`,
    [userId, new Date().toISOString()]
  );

  // ── 3. Categories ──────────────────────────────────────────────────────────
  const categoryData = [
    { name: 'Health', color: '#16a34a' },
    { name: 'Fitness', color: '#2563eb' },
    { name: 'Mindfulness', color: '#7c3aed' },
    { name: 'Learning', color: '#ea580c' },
  ];

  for (const cat of categoryData) {
    await db.runAsync(
      `INSERT INTO categories (user_id, name, color, created_at) VALUES (?, ?, ?, ?);`,
      [userId, cat.name, cat.color, new Date().toISOString()]
    );
  }

  const categories = await db.getAllAsync<{ id: number; name: string }>(
    `SELECT id, name FROM categories WHERE user_id = ?;`,
    [userId]
  );

  const catMap: Record<string, number> = {};
  for (const cat of categories) {
    catMap[cat.name] = cat.id;
  }

  // ── 4. Habits ──────────────────────────────────────────────────────────────
  const habitData = [
    {
      title: 'Drink Water',
      description: 'Stay hydrated every day',
      habit_type: 'count',
      unit: 'glasses',
      category: 'Health',
    },
    {
      title: 'Morning Run',
      description: 'Run in the morning',
      habit_type: 'count',
      unit: 'minutes',
      category: 'Fitness',
    },
    {
      title: 'Meditate',
      description: 'Daily mindfulness session',
      habit_type: 'boolean',
      unit: 'completed',
      category: 'Mindfulness',
    },
    {
      title: 'Read',
      description: 'Read a book or article',
      habit_type: 'count',
      unit: 'pages',
      category: 'Learning',
    },
    {
      title: 'Gym Session',
      description: 'Full workout at the gym',
      habit_type: 'boolean',
      unit: 'completed',
      category: 'Fitness',
    },
  ];

  for (const habit of habitData) {
    await db.runAsync(
      `INSERT INTO habits (user_id, category_id, title, description, habit_type, unit, is_archived, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 0, ?);`,
      [
        userId,
        catMap[habit.category],
        habit.title,
        habit.description,
        habit.habit_type,
        habit.unit,
        new Date().toISOString(),
      ]
    );
  }

  const habits = await db.getAllAsync<{ id: number; title: string; category_id: number }>(
    `SELECT id, title, category_id FROM habits WHERE user_id = ?;`,
    [userId]
  );

  const habitMap: Record<string, { id: number; category_id: number }> = {};
  for (const habit of habits) {
    habitMap[habit.title] = { id: habit.id, category_id: habit.category_id };
  }

  // ── 5. Habit Logs (last 14 days of sample data) ────────────────────────────
  const today = new Date();

  function dateStr(daysAgo: number) {
    const d = new Date(today);
    d.setDate(today.getDate() - daysAgo);
    return d.toISOString().slice(0, 10);
  }

  const logData: {
    habitTitle: string;
    daysAgo: number;
    value: number;
    notes?: string;
  }[] = [
    // Drink Water
    { habitTitle: 'Drink Water', daysAgo: 0, value: 8 },
    { habitTitle: 'Drink Water', daysAgo: 1, value: 6 },
    { habitTitle: 'Drink Water', daysAgo: 2, value: 7 },
    { habitTitle: 'Drink Water', daysAgo: 3, value: 5 },
    { habitTitle: 'Drink Water', daysAgo: 4, value: 8 },
    { habitTitle: 'Drink Water', daysAgo: 5, value: 9 },
    { habitTitle: 'Drink Water', daysAgo: 6, value: 6 },
    { habitTitle: 'Drink Water', daysAgo: 8, value: 7 },
    { habitTitle: 'Drink Water', daysAgo: 10, value: 8 },
    { habitTitle: 'Drink Water', daysAgo: 12, value: 5 },
    // Morning Run
    { habitTitle: 'Morning Run', daysAgo: 0, value: 30, notes: 'Felt great' },
    { habitTitle: 'Morning Run', daysAgo: 2, value: 25 },
    { habitTitle: 'Morning Run', daysAgo: 4, value: 35, notes: 'Long route' },
    { habitTitle: 'Morning Run', daysAgo: 6, value: 20 },
    { habitTitle: 'Morning Run', daysAgo: 9, value: 30 },
    { habitTitle: 'Morning Run', daysAgo: 11, value: 40, notes: 'Personal best' },
    // Meditate
    { habitTitle: 'Meditate', daysAgo: 0, value: 1 },
    { habitTitle: 'Meditate', daysAgo: 1, value: 1 },
    { habitTitle: 'Meditate', daysAgo: 2, value: 1 },
    { habitTitle: 'Meditate', daysAgo: 3, value: 1 },
    { habitTitle: 'Meditate', daysAgo: 5, value: 1 },
    { habitTitle: 'Meditate', daysAgo: 7, value: 1 },
    { habitTitle: 'Meditate', daysAgo: 9, value: 1 },
    { habitTitle: 'Meditate', daysAgo: 11, value: 1 },
    // Read
    { habitTitle: 'Read', daysAgo: 0, value: 20 },
    { habitTitle: 'Read', daysAgo: 1, value: 15 },
    { habitTitle: 'Read', daysAgo: 3, value: 30, notes: 'Great chapter' },
    { habitTitle: 'Read', daysAgo: 5, value: 10 },
    { habitTitle: 'Read', daysAgo: 7, value: 25 },
    { habitTitle: 'Read', daysAgo: 10, value: 20 },
    // Gym Session
    { habitTitle: 'Gym Session', daysAgo: 1, value: 1 },
    { habitTitle: 'Gym Session', daysAgo: 3, value: 1 },
    { habitTitle: 'Gym Session', daysAgo: 5, value: 1 },
    { habitTitle: 'Gym Session', daysAgo: 8, value: 1 },
    { habitTitle: 'Gym Session', daysAgo: 10, value: 1 },
    { habitTitle: 'Gym Session', daysAgo: 13, value: 1 },
  ];

  for (const log of logData) {
    const habit = habitMap[log.habitTitle];
    if (!habit) continue;

    await db.runAsync(
      `INSERT INTO habit_logs (habit_id, user_id, category_id, log_date, value, notes, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?);`,
      [
        habit.id,
        userId,
        habit.category_id,
        dateStr(log.daysAgo),
        log.value,
        log.notes ?? null,
        new Date().toISOString(),
      ]
    );
  }

  // ── 6. Targets ─────────────────────────────────────────────────────────────
  const targetData = [
    {
      habitTitle: 'Drink Water',
      period_type: 'weekly',
      target_type: 'sum',
      target_value: 49, // 7 glasses/day × 7 days
    },
    {
      habitTitle: 'Morning Run',
      period_type: 'weekly',
      target_type: 'sum',
      target_value: 100, // 100 minutes per week
    },
    {
      habitTitle: 'Meditate',
      period_type: 'weekly',
      target_type: 'count',
      target_value: 5, // 5 sessions per week
    },
    {
      habitTitle: 'Read',
      period_type: 'monthly',
      target_type: 'sum',
      target_value: 300, // 300 pages per month
    },
    {
      habitTitle: 'Gym Session',
      period_type: 'weekly',
      target_type: 'count',
      target_value: 3, // 3 sessions per week
    },
  ];

  for (const target of targetData) {
    const habit = habitMap[target.habitTitle];
    if (!habit) continue;

    await db.runAsync(
      `INSERT INTO targets (user_id, habit_id, category_id, period_type, target_type, target_value, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?);`,
      [
        userId,
        habit.id,
        habit.category_id,
        target.period_type,
        target.target_type,
        target.target_value,
        new Date().toISOString(),
      ]
    );
  }

  console.log('Seed complete.');
}