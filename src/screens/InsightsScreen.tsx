import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { getHabitLogsForActiveUser } from '../utils/habitLogs';
import {
  getInsightSummary,
  getLast7DaysChartData,
  InsightSummary,
  DailyChartItem,
} from '../utils/insights';
import { lightColors, darkColors } from '../styles/GlobalStyles';
import { useTheme } from '../context/ThemeContext';

export default function InsightsScreen() {
  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkColors : lightColors;

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
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.black }]}>Insights</Text>

      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: colors.black }]}>Summary</Text>

        <View style={styles.insightRow}>
          <View style={[styles.insightBox, { backgroundColor: colors.muted }]}>
            <Text style={[styles.insightNumber, { color: colors.black }]}>
              {summary.todayCount}
            </Text>
            <Text style={[styles.insightLabel, { color: colors.black }]}>Today</Text>
          </View>

          <View style={[styles.insightBox, { backgroundColor: colors.muted }]}>
            <Text style={[styles.insightNumber, { color: colors.black }]}>
              {summary.weekCount}
            </Text>
            <Text style={[styles.insightLabel, { color: colors.black }]}>This Week</Text>
          </View>

          <View style={[styles.insightBox, { backgroundColor: colors.muted }]}>
            <Text style={[styles.insightNumber, { color: colors.black }]}>
              {summary.monthCount}
            </Text>
            <Text style={[styles.insightLabel, { color: colors.black }]}>This Month</Text>
          </View>
        </View>
      </View>

      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: colors.black }]}>Last 7 Days</Text>

        <View style={styles.chartContainer}>
          {chartData.map((item) => {
            const barHeight = (item.total / maxChartValue) * 140;

            return (
              <View key={item.label} style={styles.chartItem}>
                <View style={styles.chartBarArea}>
                  <View
                    style={[
                      styles.chartBar,
                      {
                        height: barHeight,
                        backgroundColor: colors.primary,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.chartValue, { color: colors.black }]}>
                  {item.total}
                </Text>
                <Text style={[styles.chartLabel, { color: colors.black }]}>
                  {item.label}
                </Text>
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
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: 40,
    marginBottom: 16,
    textAlign: 'center',
  },
  card: {
    padding: 16,
    borderRadius: 14,
    marginBottom: 16,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 14,
  },
  insightRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  insightBox: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  insightNumber: {
    fontSize: 22,
    fontWeight: '700',
  },
  insightLabel: {
    marginTop: 4,
    fontSize: 13,
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
    borderRadius: 6,
  },
  chartValue: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  chartLabel: {
    fontSize: 11,
  },
});