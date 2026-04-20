import { integer, sqliteTable, text, real } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: text('created_at').notNull(),
});

export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull(),
  name: text('name').notNull(),
  color: text('color').notNull(),
  icon: text('icon').notNull(),
  createdAt: text('created_at').notNull(),
});

export const habits = sqliteTable('habits', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull(),
  categoryId: integer('category_id').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  habitType: text('habit_type', { enum: ['boolean', 'count'] }).notNull(),
  unit: text('unit').notNull(),
  isArchived: integer('is_archived').notNull().default(0),
  createdAt: text('created_at').notNull(),
});

export const habitLogs = sqliteTable('habit_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  habitId: integer('habit_id').notNull(),
  userId: integer('user_id').notNull(),
  categoryId: integer('category_id').notNull(),
  logDate: text('log_date').notNull(),
  value: real('value').notNull(),
  notes: text('notes'),
  createdAt: text('created_at').notNull(),
});

export const targets = sqliteTable('targets', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull(),
  habitId: integer('habit_id'),
  categoryId: integer('category_id'),
  periodType: text('period_type', { enum: ['weekly', 'monthly'] }).notNull(),
  targetType: text('target_type', { enum: ['count', 'sum'] }).notNull(),
  targetValue: real('target_value').notNull(),
  createdAt: text('created_at').notNull(),
});

export const sessions = sqliteTable('sessions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull(),
  isActive: integer('is_active').notNull().default(1),
  createdAt: text('created_at').notNull(),
});