import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { getHabitLogsForActiveUser } from '../utils/habitLogs';
import {
  getInsightSummary,
  getLast7DaysChartData,
  InsightSummary,
  DailyChartItem,
} from '../utils/insights';

export default function InsightsScreen() {
  const [summary, setSummary] = useState<InsightSummary>({
    todayCount: 0,
    weekCount: 0,
    monthCount: 0,
  });
  const [chartData, setChartData] = useState<DailyChartItem[]>([]);

  useEffect(() => {
    const load = async () => {
      const logs = await getHabitLogsForActiveUser();
      setSummary(getInsightSummary(logs));
      setChartData(getLast7DaysChartData(logs));
    };

    load();
  }, []);

  const maxChartValue = Math.max(...chartData.map((item) => item.total), 1);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Insights</Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Summary</Text>

        <View style={styles.insightRow}>
          <View style={styles.insightBox}>
            <Text style={styles.insightNumber}>{summary.todayCount}</Text>
            <Text style={styles.insightLabel}>Today</Text>
          </View>

          <View style={styles.insightBox}>
            <Text style={styles.insightNumber}>{summary.weekCount}</Text>
            <Text style={styles.insightLabel}>This Week</Text>
          </View>

          <View style={styles.insightBox}>
            <Text style={styles.insightNumber}>{summary.monthCount}</Text>
            <Text style={styles.insightLabel}>This Month</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Last 7 Days</Text>

        <View style={styles.chartContainer}>
          {chartData.map((item) => {
            const barHeight = (item.total / maxChartValue) * 140;

            return (
              <View key={item.label} style={styles.chartItem}>
                <View style={styles.chartBarArea}>
                  <View style={[styles.chartBar, { height: barHeight }]} />
                </View>
                <Text style={styles.chartValue}>{item.total}</Text>
                <Text style={styles.chartLabel}>{item.label}</Text>
              </View>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f9fafb',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: 40,
    marginBottom: 16,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 14,
    color: '#111827',
  },
  insightRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  insightBox: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  insightNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
  insightLabel: {
    marginTop: 4,
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    minHeight: 190,
    gap: 8,
  },
  chartItem: {
    flex: 1,
    alignItems: 'center',
  },
  chartBarArea: {
    height: 140,
    justifyContent: 'flex-end',
    marginBottom: 6,
  },
  chartBar: {
    width: 26,
    maxWidth: 26,
    minHeight: 4,
    backgroundColor: '#2563eb',
    borderRadius: 6,
  },
  chartValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  chartLabel: {
    fontSize: 11,
    color: '#6b7280',
  },
});