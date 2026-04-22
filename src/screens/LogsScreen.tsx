import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, ScrollView } from 'react-native';
import {
  createHabitLog,
  deleteHabitLog,
  getHabitLogsForActiveUser,
  initHabitLogTable,
  HabitLog,
} from '../utils/habitLogs';
import FormField from '../components/FormField';

export default function LogsScreen() {
  const [logHabitId, setLogHabitId] = useState('');
  const [logCategoryId, setLogCategoryId] = useState('');
  const [logDate, setLogDate] = useState('');
  const [logValue, setLogValue] = useState('');
  const [logNotes, setLogNotes] = useState('');
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>([]);

  const [logSearchText, setLogSearchText] = useState('');
  const [filterCategoryId, setFilterCategoryId] = useState('');
  const [filterFromDate, setFilterFromDate] = useState('');
  const [filterToDate, setFilterToDate] = useState('');

  const loadHabitLogs = async () => {
    const data = await getHabitLogsForActiveUser();
    setHabitLogs(data);
  };

  useEffect(() => {
    const setup = async () => {
      await initHabitLogTable();
      await loadHabitLogs();
    };
    setup();
  }, []);

  const handleCreateHabitLog = async () => {
    try {
      await createHabitLog(
        Number(logHabitId),
        Number(logCategoryId),
        logDate,
        Number(logValue),
        logNotes
      );

      setLogHabitId('');
      setLogCategoryId('');
      setLogDate('');
      setLogValue('');
      setLogNotes('');
      await loadHabitLogs();
      Alert.alert('Success', 'Habit log created successfully.');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Could not create habit log.';
      Alert.alert('Error', message);
    }
  };

  const handleDeleteLog = (logId: number) => {
    Alert.alert('Delete Log', 'Are you sure you want to delete this log?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteHabitLog(logId);
            await loadHabitLogs();
          } catch (error) {
            const message =
              error instanceof Error ? error.message : 'Could not delete log.';
            Alert.alert('Error', message);
          }
        },
      },
    ]);
  };

  const handleResetLogFilters = () => {
    setLogSearchText('');
    setFilterCategoryId('');
    setFilterFromDate('');
    setFilterToDate('');
  };

  const filteredHabitLogs = habitLogs.filter((log) => {
    const searchValue = logSearchText.trim().toLowerCase();

    const matchesSearch =
      searchValue === '' ||
      log.habit_title?.toLowerCase().includes(searchValue) ||
      log.category_name?.toLowerCase().includes(searchValue) ||
      log.notes?.toLowerCase().includes(searchValue);

    const matchesCategory =
      filterCategoryId.trim() === '' ||
      log.category_id === Number(filterCategoryId);

    const matchesFromDate =
      filterFromDate.trim() === '' || log.log_date >= filterFromDate.trim();

    const matchesToDate =
      filterToDate.trim() === '' || log.log_date <= filterToDate.trim();

    return (
      matchesSearch &&
      matchesCategory &&
      matchesFromDate &&
      matchesToDate
    );
  });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Logs</Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Log Habit Activity</Text>

        <FormField
          label="Habit ID"
          placeholder="Enter a habit ID"
          value={logHabitId}
          onChangeText={setLogHabitId}
          keyboardType="numeric"
        />

        <FormField
          label="Category ID"
          placeholder="Enter the related category ID"
          value={logCategoryId}
          onChangeText={setLogCategoryId}
          keyboardType="numeric"
        />

        <FormField
          label="Log Date"
          placeholder="YYYY-MM-DD"
          value={logDate}
          onChangeText={setLogDate}
        />

        <FormField
          label="Value"
          placeholder="e.g. 1, 3, 20"
          value={logValue}
          onChangeText={setLogValue}
          keyboardType="numeric"
        />

        <FormField
          label="Notes"
          placeholder="Optional notes"
          value={logNotes}
          onChangeText={setLogNotes}
        />

        <Pressable style={styles.primaryButton} onPress={handleCreateHabitLog}>
          <Text style={styles.primaryButtonText}>Add Habit Log</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Search & Filter Logs</Text>

        <FormField
          label="Search Text"
          placeholder="Search by habit, category, or notes"
          value={logSearchText}
          onChangeText={setLogSearchText}
        />

        <FormField
          label="Category ID"
          placeholder="Filter by category ID"
          value={filterCategoryId}
          onChangeText={setFilterCategoryId}
          keyboardType="numeric"
        />

        <FormField
          label="From Date"
          placeholder="YYYY-MM-DD"
          value={filterFromDate}
          onChangeText={setFilterFromDate}
        />

        <FormField
          label="To Date"
          placeholder="YYYY-MM-DD"
          value={filterToDate}
          onChangeText={setFilterToDate}
        />

        <Pressable
          style={styles.secondaryButton}
          onPress={handleResetLogFilters}
        >
          <Text style={styles.secondaryButtonText}>Reset Filters</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Habit Log History</Text>

        {habitLogs.length === 0 ? (
          <Text style={styles.emptyText}>No habit logs yet.</Text>
        ) : filteredHabitLogs.length === 0 ? (
          <Text style={styles.emptyText}>
            No habit logs match your current filters.
          </Text>
        ) : (
          filteredHabitLogs.map((log) => (
            <View key={log.id} style={styles.logItem}>
              <Text style={styles.listTitle}>
                {log.habit_title} · {log.log_date}
              </Text>
              <Text style={styles.listSubtitle}>
                Category: {log.category_name}
              </Text>
              <Text style={styles.listSubtitle}>Value: {log.value}</Text>
              {log.notes ? (
                <Text style={styles.listSubtitle}>Notes: {log.notes}</Text>
              ) : null}

              <Pressable
                style={styles.smallDeleteButton}
                onPress={() => handleDeleteLog(log.id)}
              >
                <Text style={styles.smallDeleteButtonText}>Delete Log</Text>
              </Pressable>
            </View>
          ))
        )}
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
  emptyText: {
    color: '#6b7280',
    fontSize: 15,
  },
  logItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  listSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 4,
    marginBottom: 10,
  },
  primaryButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: '#e5e7eb',
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 4,
  },
  secondaryButtonText: {
    color: '#111827',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
  smallDeleteButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
  },
  smallDeleteButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});