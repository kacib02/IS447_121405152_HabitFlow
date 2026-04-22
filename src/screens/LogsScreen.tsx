import { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  ScrollView,
} from 'react-native';
import {
  createHabitLog,
  deleteHabitLog,
  getHabitLogsForActiveUser,
  initHabitLogTable,
  HabitLog,
} from '../utils/habitLogs';
import {
  getHabitsForActiveUser,
  initHabitTable,
  Habit,
} from '../utils/habits';
import FormField from '../components/FormField';

export default function LogsScreen() {
  const [selectedHabitId, setSelectedHabitId] = useState<number | null>(null);
  const [logDate, setLogDate] = useState('');
  const [logValue, setLogValue] = useState('');
  const [logNotes, setLogNotes] = useState('');
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);

  const [logSearchText, setLogSearchText] = useState('');
  const [filterCategoryId, setFilterCategoryId] = useState('');
  const [filterFromDate, setFilterFromDate] = useState('');
  const [filterToDate, setFilterToDate] = useState('');

  const loadHabitLogs = async () => {
    const data = await getHabitLogsForActiveUser();
    setHabitLogs(data);
  };

  const loadHabits = async () => {
    const data = await getHabitsForActiveUser();
    setHabits(data);
  };

  useEffect(() => {
    const setup = async () => {
      await initHabitLogTable();
      await initHabitTable();
      await loadHabitLogs();
      await loadHabits();
    };
    setup();
  }, []);

  const selectedHabit = useMemo(
    () => habits.find((habit) => habit.id === selectedHabitId) ?? null,
    [habits, selectedHabitId]
  );

  const handleCreateHabitLog = async () => {
    try {
      if (!selectedHabit) {
        throw new Error('Please choose a habit.');
      }

      const finalValue =
        selectedHabit.habit_type === 'boolean' ? Number(logValue || '1') : Number(logValue);

      await createHabitLog(
        selectedHabit.id,
        selectedHabit.category_id,
        logDate,
        finalValue,
        logNotes
      );

      setSelectedHabitId(null);
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

        <Text style={styles.label}>Choose Habit</Text>
        {habits.length === 0 ? (
          <Text style={styles.emptyText}>No habits yet. Create a habit first.</Text>
        ) : (
          <View style={styles.choiceWrap}>
            {habits.map((habit) => (
              <Pressable
                key={habit.id}
                style={[
                  styles.choiceChip,
                  selectedHabitId === habit.id && styles.choiceChipActive,
                ]}
                onPress={() => setSelectedHabitId(habit.id)}
              >
                <Text
                  style={[
                    styles.choiceChipText,
                    selectedHabitId === habit.id && styles.choiceChipTextActive,
                  ]}
                >
                  {habit.title}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        {selectedHabit ? (
          <View style={styles.helperBox}>
            <Text style={styles.helperText}>
              Category: {selectedHabit.category_name}
            </Text>
            <Text style={styles.helperText}>
              Tracking: {selectedHabit.habit_type === 'boolean' ? 'Yes / No' : 'Number'}
            </Text>
            <Text style={styles.helperText}>
              Unit: {selectedHabit.habit_type === 'boolean' ? 'Completed' : selectedHabit.unit}
            </Text>
          </View>
        ) : null}

        <FormField
          label="Log Date"
          placeholder="YYYY-MM-DD"
          value={logDate}
          onChangeText={setLogDate}
        />

        {selectedHabit?.habit_type === 'boolean' ? (
          <>
            <Text style={styles.label}>Completed?</Text>
            <View style={styles.buttonRow}>
              <Pressable
                style={[
                  styles.optionButton,
                  logValue === '1' && styles.optionButtonActive,
                ]}
                onPress={() => setLogValue('1')}
              >
                <Text
                  style={[
                    styles.optionButtonText,
                    logValue === '1' && styles.optionButtonTextActive,
                  ]}
                >
                  Yes
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.optionButton,
                  logValue === '0' && styles.optionButtonActive,
                ]}
                onPress={() => setLogValue('0')}
              >
                <Text
                  style={[
                    styles.optionButtonText,
                    logValue === '0' && styles.optionButtonTextActive,
                  ]}
                >
                  No
                </Text>
              </Pressable>
            </View>
          </>
        ) : (
          <FormField
            label="Value"
            placeholder="e.g. 1, 3, 20"
            value={logValue}
            onChangeText={setLogValue}
            keyboardType="numeric"
          />
        )}

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
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 10,
    color: '#111827',
  },
  helperBox: {
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 12,
  },
  helperText: {
    color: '#4b5563',
    fontSize: 14,
    marginTop: 2,
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
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
  },
  optionButtonActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  optionButtonText: {
    color: '#111827',
    fontWeight: '500',
  },
  optionButtonTextActive: {
    color: '#fff',
  },
  choiceWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 8,
  },
  choiceChip: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: '#fff',
  },
  choiceChipActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  choiceChipText: {
    color: '#111827',
    fontWeight: '500',
  },
  choiceChipTextActive: {
    color: '#fff',
  },
});