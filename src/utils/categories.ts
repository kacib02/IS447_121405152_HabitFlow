import { eq, and, desc } from 'drizzle-orm';
import { db } from '../db';
import { categories } from '../db/schema';
import { getActiveUser } from './auth';

export type Category = {
  id: number;
  user_id: number;
  name: string;
  color: string;
  created_at: string;
};

export async function initCategoryTable() {
  // Table creation is already handled in your DB init.
  // Kept here so your screen code does not need to change.
  return;
}

export async function createCategory(name: string, color: string) {
  const activeUser = await getActiveUser();

  if (!activeUser) {
    throw new Error('No active user found.');
  }

  const trimmedName = name.trim();
  const trimmedColor = color.trim().toLowerCase();

  if (!trimmedName || !trimmedColor) {
    throw new Error('Category name and colour are required.');
  }

  await db.insert(categories).values({
    userId: activeUser.id,
    name: trimmedName,
    color: trimmedColor,
    createdAt: new Date().toISOString(),
  });
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
  const trimmedColor = color.trim().toLowerCase();

  if (!trimmedName || !trimmedColor) {
    throw new Error('Category name and colour are required.');
  }

  await db
    .update(categories)
    .set({
      name: trimmedName,
      color: trimmedColor,
    })
    .where(
      and(
        eq(categories.id, categoryId),
        eq(categories.userId, activeUser.id)
      )
    );
}

export async function deleteCategory(categoryId: number) {
  const activeUser = await getActiveUser();

  if (!activeUser) {
    throw new Error('No active user found.');
  }

  await db
    .delete(categories)
    .where(
      and(
        eq(categories.id, categoryId),
        eq(categories.userId, activeUser.id)
      )
    );
}

export async function getCategoriesForActiveUser(): Promise<Category[]> {
  const activeUser = await getActiveUser();

  if (!activeUser) {
    return [];
  }

  const rows = await db
    .select()
    .from(categories)
    .where(eq(categories.userId, activeUser.id))
    .orderBy(desc(categories.id));

  return rows.map((row) => ({
    id: row.id,
    user_id: row.userId,
    name: row.name,
    color: row.color,
    created_at: row.createdAt,
  }));
}