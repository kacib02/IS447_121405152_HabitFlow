import * as SQLite from 'expo-sqlite';
import { getActiveUser } from './auth';
import type { Target } from './targets';

const db = SQLite.openDatabaseSync('habitflow.db');

export type TargetProgress = {
  progress: number;
  remaining: number;
  exceededBy: number;
  status: 'unmet' | 'met' | 'exceeded';
  percent: number;
  periodStart: string;
  periodEnd: string;
};

function getStartAndEndOfWeek(date = new Date()) {
  const current = new Date(date);
  const day = current.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;

  const start = new Date(current);
  start.setDate(current.getDate() + diffToMonday);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
}

function getStartAndEndOfMonth(date = new Date()) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  start.setHours(0, 0, 0, 0);

  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  end.setHours(23, 59, 59, 999);

  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
}

function getPeriodBounds(periodType: 'weekly' | 'monthly') {
  return periodType === 'weekly'
    ? getStartAndEndOfWeek()
    : getStartAndEndOfMonth();
}

export async function calculateTargetProgress(target: Target): Promise<TargetProgress> {
  const activeUser = await getActiveUser();

  if (!activeUser) {
    throw new Error('No active user found.');
  }

  const { start, end } = getPeriodBounds(target.period_type);

  let query = `
    SELECT * FROM habit_logs
    WHERE user_id = ?
      AND log_date >= ?
      AND log_date <= ?
  `;

  const params: (number | string)[] = [activeUser.id, start, end];

  if (target.habit_id) {
    query += ` AND habit_id = ?`;
    params.push(target.habit_id);
  }

  if (target.category_id) {
    query += ` AND category_id = ?`;
    params.push(target.category_id);
  }

  const logs = await db.getAllAsync<{
    id: number;
    value: number;
  }>(query + ` ORDER BY log_date DESC, id DESC;`, params);

  const progress =
    target.target_type === 'count'
      ? logs.length
      : logs.reduce((sum, log) => sum + Number(log.value), 0);

  const remaining = Math.max(target.target_value - progress, 0);
  const exceededBy = Math.max(progress - target.target_value, 0);

  let status: 'unmet' | 'met' | 'exceeded' = 'unmet';

  if (progress > target.target_value) {
    status = 'exceeded';
  } else if (progress === target.target_value) {
    status = 'met';
  }

  const percent =
    target.target_value > 0
      ? Math.min((progress / target.target_value) * 100, 100)
      : 0;

  return {
    progress,
    remaining,
    exceededBy,
    status,
    percent,
    periodStart: start,
    periodEnd: end,
  };
}