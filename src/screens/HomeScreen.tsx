import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getHabitLogsForActiveUser } from '../utils/habitLogs';
import { getHabitsForActiveUser } from '../utils/habits';
import { getTargetsForActiveUser } from '../utils/targets';
import { getCategoriesForActiveUser } from '../utils/categories';
import { getInsightSummary } from '../utils/insights';
import { calculateTargetProgress } from '../utils/targetProgress';
import type { Target } from '../utils/targets';

type TargetWithProgress = Target & {
  progress: number;
  percent: number;
  status: 'unmet' | 'met' | 'exceeded';
};

export default function HomeScreen() {
  const [userName, setUserName] = useState('');
  const [todayCount, setTodayCount] = useState(0);
  const [weekCount, setWeekCount] = useState(0);
  const [habitCount, setHabitCount] = useState(0);
  const [categoryCount, setCategoryCount] = useState(0);
  const [topTargets, setTopTargets] = useState<TargetWithProgress[]>([]);
  const [recentDays, setRecentDays] = useState<{ label: string; total: number }[]>([]);

  useEffect(() => {
    const load = async () => {
      const [logs, habits, targets, categories] = await Promise.all([
        getHabitLogsForActiveUser(),
        getHabitsForActiveUser(),
        getTargetsForActiveUser(),
        getCategoriesForActiveUser(),
      ]);

      const summary = getInsightSummary(logs);
      setTodayCount(summary.todayCount);
      setWeekCount(summary.weekCount);
      setHabitCount(habits.length);
      setCategoryCount(categories.length);

      // Last 7 days mini chart
      const today = new Date();
      const days: { label: string; total: number }[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const dateKey = d.toISOString().slice(0, 10);
        const dayLogs = logs.filter((l) => l.log_date === dateKey);
        const dayLabels = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
        days.push({ label: dayLabels[d.getDay()], total: dayLogs.length });
      }
      setRecentDays(days);

      // Top 3 targets with progress
      const targetsWithProgress: TargetWithProgress[] = [];
      for (const target of targets.slice(0, 3)) {
        try {
          const prog = await calculateTargetProgress(target);
          targetsWithProgress.push({
            ...target,
            progress: prog.progress,
            percent: prog.percent,
            status: prog.status,
          });
        } catch {
          // skip if progress calc fails
        }
      }
      setTopTargets(targetsWithProgress);
    };

    load();
  }, []);

  const todayDate = new Date().toLocaleDateString('en-IE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const maxBar = Math.max(...recentDays.map((d) => d.total), 1);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>HabitFlow 🌱</Text>
          <Text style={styles.date}>{todayDate}</Text>
        </View>
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: '#eff6ff' }]}>
          <Ionicons name="checkmark-circle" size={22} color="#2563eb" />
          <Text style={styles.statNumber}>{todayCount}</Text>
          <Text style={styles.statLabel}>Today</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#f0fdf4' }]}>
          <Ionicons name="calendar" size={22} color="#16a34a" />
          <Text style={styles.statNumber}>{weekCount}</Text>
          <Text style={styles.statLabel}>This Week</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#faf5ff' }]}>
          <Ionicons name="list" size={22} color="#7c3aed" />
          <Text style={styles.statNumber}>{habitCount}</Text>
          <Text style={styles.statLabel}>Habits</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#fff7ed' }]}>
          <Ionicons name="grid" size={22} color="#ea580c" />
          <Text style={styles.statNumber}>{categoryCount}</Text>
          <Text style={styles.statLabel}>Categories</Text>
        </View>
      </View>

      {/* Mini activity chart */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Activity — Last 7 Days</Text>
        <View style={styles.miniChart}>
          {recentDays.map((day, i) => {
            const isToday = i === 6;
            const barH = day.total > 0 ? Math.max((day.total / maxBar) * 60, 8) : 4;
            return (
              <View key={i} style={styles.miniChartItem}>
                <View style={styles.miniBarArea}>
                  <View
                    style={[
                      styles.miniBar,
                      { height: barH },
                      isToday && styles.miniBarToday,
                      day.total === 0 && styles.miniBarEmpty,
                    ]}
                  />
                </View>
                <Text style={[styles.miniChartLabel, isToday && styles.miniChartLabelToday]}>
                  {day.label}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Target progress */}
      {topTargets.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Target Progress</Text>
          {topTargets.map((target) => (
            <View key={target.id} style={styles.targetRow}>
              <View style={styles.targetHeader}>
                <Text style={styles.targetTitle} numberOfLines={1}>
                  {target.habit_title ?? 'Habit'}
                </Text>
                <Text
                  style={[
                    styles.targetBadge,
                    target.status === 'met' && styles.badgeMet,
                    target.status === 'exceeded' && styles.badgeExceeded,
                    target.status === 'unmet' && styles.badgeUnmet,
                  ]}
                >
                  {target.status === 'exceeded'
                    ? '🎉 Exceeded'
                    : target.status === 'met'
                    ? '✅ Met'
                    : `${Math.round(target.percent)}%`}
                </Text>
              </View>
              <View style={styles.progressBg}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${target.percent}%` as any },
                    target.status !== 'unmet' && styles.progressFillGreen,
                  ]}
                />
              </View>
              <Text style={styles.targetSub}>
                {target.progress} / {target.target_value} · {target.period_type}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Quick tips empty state */}
      {todayCount === 0 && (
        <View style={styles.emptyCard}>
          <Ionicons name="sunny-outline" size={32} color="#f59e0b" />
          <Text style={styles.emptyTitle}>No logs yet today</Text>
          <Text style={styles.emptyText}>
            Head to the Logs tab to record your first habit for today.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: '#f9fafb',
  },
  header: {
    marginTop: 48,
    marginBottom: 20,
  },
  greeting: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111827',
  },
  date: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    gap: 4,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  statLabel: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 14,
  },
  miniChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 80,
  },
  miniChartItem: {
    flex: 1,
    alignItems: 'center',
  },
  miniBarArea: {
    height: 60,
    justifyContent: 'flex-end',
    marginBottom: 4,
  },
  miniBar: {
    width: 18,
    backgroundColor: '#bfdbfe',
    borderRadius: 4,
    minHeight: 4,
  },
  miniBarToday: {
    backgroundColor: '#2563eb',
  },
  miniBarEmpty: {
    backgroundColor: '#e5e7eb',
    height: 4,
  },
  miniChartLabel: {
    fontSize: 11,
    color: '#9ca3af',
  },
  miniChartLabelToday: {
    color: '#2563eb',
    fontWeight: '700',
  },
  targetRow: {
    marginBottom: 14,
  },
  targetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  targetTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  targetBadge: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: '#fee2e2',
    color: '#dc2626',
  },
  badgeMet: {
    backgroundColor: '#dcfce7',
    color: '#16a34a',
  },
  badgeExceeded: {
    backgroundColor: '#dbeafe',
    color: '#2563eb',
  },
  badgeUnmet: {
    backgroundColor: '#f3f4f6',
    color: '#6b7280',
  },
  progressBg: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2563eb',
    borderRadius: 999,
  },
  progressFillGreen: {
    backgroundColor: '#16a34a',
  },
  targetSub: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  emptyCard: {
    backgroundColor: '#fffbeb',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fde68a',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400e',
  },
  emptyText: {
    fontSize: 14,
    color: '#92400e',
    textAlign: 'center',
  },
});
