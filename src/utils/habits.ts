import { and, desc, eq } from 'drizzle-orm';
import { db } from '../db';
import { habits, categories } from '../db/schema';
import { getActiveUser } from './auth';

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
  return;
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

  await db.insert(habits).values({
    userId: activeUser.id,
    categoryId,
    title: trimmedTitle,
    description: trimmedDescription || null,
    habitType: trimmedHabitType as 'boolean' | 'count',
    unit: trimmedUnit,
    isArchived: 0,
    createdAt: new Date().toISOString(),
  });
}

export async function updateHabit(
  habitId: number,
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

  await db
    .update(habits)
    .set({
      categoryId,
      title: trimmedTitle,
      description: trimmedDescription || null,
      habitType: trimmedHabitType as 'boolean' | 'count',
      unit: trimmedUnit,
    })
    .where(
      and(
        eq(habits.id, habitId),
        eq(habits.userId, activeUser.id)
      )
    );
}

export async function deleteHabit(habitId: number) {
  const activeUser = await getActiveUser();

  if (!activeUser) {
    throw new Error('No active user found.');
  }

  await db
    .delete(habits)
    .where(
      and(
        eq(habits.id, habitId),
        eq(habits.userId, activeUser.id)
      )
    );
}

export async function getHabitsForActiveUser(): Promise<Habit[]> {
  const activeUser = await getActiveUser();

  if (!activeUser) {
    return [];
  }

  const rows = await db
    .select({
      id: habits.id,
      userId: habits.userId,
      categoryId: habits.categoryId,
      title: habits.title,
      description: habits.description,
      habitType: habits.habitType,
      unit: habits.unit,
      isArchived: habits.isArchived,
      createdAt: habits.createdAt,
      categoryName: categories.name,
    })
    .from(habits)
    .innerJoin(categories, eq(habits.categoryId, categories.id))
    .where(eq(habits.userId, activeUser.id))
    .orderBy(desc(habits.id));

  return rows.map((row) => ({
    id: row.id,
    user_id: row.userId,
    category_id: row.categoryId,
    title: row.title,
    description: row.description,
    habit_type: row.habitType,
    unit: row.unit,
    is_archived: row.isArchived,
    created_at: row.createdAt,
    category_name: row.categoryName,
  }));
}