export type InsightSummary = {
  todayCount: number;
  weekCount: number;
  monthCount: number;
};

export type DailyChartItem = {
  label: string;
  total: number;
};

type HabitLogLike = {
  log_date: string;
  value: number;
};

function toDateOnly(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getStartOfWeek(date = new Date()) {
  const current = new Date(date);
  const day = current.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;

  const start = new Date(current);
  start.setDate(current.getDate() + diffToMonday);
  start.setHours(0, 0, 0, 0);

  return toDateOnly(start);
}

function getStartOfMonth(date = new Date()) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  start.setHours(0, 0, 0, 0);
  return toDateOnly(start);
}

export function getInsightSummary(logs: HabitLogLike[]): InsightSummary {
  const today = toDateOnly(new Date());
  const weekStart = getStartOfWeek();
  const monthStart = getStartOfMonth();

  const todayCount = logs.filter((log) => log.log_date === today).length;

  const weekCount = logs.filter(
    (log) => log.log_date >= weekStart && log.log_date <= today
  ).length;

  const monthCount = logs.filter(
    (log) => log.log_date >= monthStart && log.log_date <= today
  ).length;

  return {
    todayCount,
    weekCount,
    monthCount,
  };
}

export function getLast7DaysChartData(logs: HabitLogLike[]): DailyChartItem[] {
  const result: DailyChartItem[] = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);

    const dateKey = toDateOnly(date);
    const label = dateKey.slice(5); // MM-DD

    const total = logs
      .filter((log) => log.log_date === dateKey)
      .reduce((sum, log) => sum + Number(log.value), 0);

    result.push({
      label,
      total,
    });
  }

  return result;
}