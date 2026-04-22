import { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  ScrollView,
} from 'react-native';
import * as SQLite from 'expo-sqlite';
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
import {
  getCategoriesForActiveUser,
  initCategoryTable,
  Category,
} from '../utils/categories';
import FormField from '../components/FormField';

const db = SQLite.openDatabaseSync('habitflow.db');

async function updateHabitLog(
  logId: number,
  logDate: string,
  value: number,
  notes: string
) {
  await db.runAsync(
    `UPDATE habit_logs SET log_date = ?, value = ?, notes = ? WHERE id = ?;`,
    [logDate.trim(), value, notes.trim() || null, logId]
  );
}

export default function LogsScreen() {
  const [selectedHabitId, setSelectedHabitId] = useState<number | null>(null);
  const [logDate, setLogDate] = useState('');
  const [logValue, setLogValue] = useState('');
  const [logNotes, setLogNotes] = useState('');
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingLogId, setEditingLogId] = useState<number | null>(null);

  const [logSearchText, setLogSearchText] = useState('');
  const [filterCategoryIdNum, setFilterCategoryIdNum] = useState<number | null>(null);
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

  const loadCategories = async () => {
    const data = await getCategoriesForActiveUser();
    setCategories(data);
  };

  useEffect(() => {
    const setup = async () => {
      await initHabitLogTable();
      await initHabitTable();
      await initCategoryTable();
      await loadHabitLogs();
      await loadHabits();
      await loadCategories();
    };
    setup();
  }, []);

  const selectedHabit = useMemo(
    () => habits.find((habit) => habit.id === selectedHabitId) ?? null,
    [habits, selectedHabitId]
  );

  const handleCancelEdit = () => {
    setEditingLogId(null);
    setSelectedHabitId(null);
    setLogDate('');
    setLogValue('');
    setLogNotes('');
  };

  const handleEditLog = (log: HabitLog) => {
    setEditingLogId(log.id);
    setSelectedHabitId(log.habit_id);
    setLogDate(log.log_date);
    setLogValue(String(log.value));
    setLogNotes(log.notes ?? '');
  };

  const handleSaveLog = async () => {
    try {
      if (editingLogId) {
        const habit = habits.find((h) => h.id === selectedHabitId);
        const finalValue =
          habit?.habit_type === 'boolean'
            ? Number(logValue || '1')
            : Number(logValue);

        if (!logDate.trim()) throw new Error('Date is required.');
        if (Number.isNaN(finalValue)) throw new Error('Value must be a number.');

        await updateHabitLog(editingLogId, logDate, finalValue, logNotes);
        Alert.alert('Success', 'Log updated successfully.');
      } else {
        if (!selectedHabit) throw new Error('Please choose a habit.');

        const finalValue =
          selectedHabit.habit_type === 'boolean'
            ? Number(logValue || '1')
            : Number(logValue);

        await createHabitLog(
          selectedHabit.id,
          selectedHabit.category_id,
          logDate,
          finalValue,
          logNotes
        );
        Alert.alert('Success', 'Habit log created successfully.');
      }

      setEditingLogId(null);
      setSelectedHabitId(null);
      setLogDate('');
      setLogValue('');
      setLogNotes('');
      await loadHabitLogs();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Could not save log.';
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
            if (editingLogId === logId) handleCancelEdit();
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
    setFilterCategoryIdNum(null);
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
      filterCategoryIdNum === null ||
      log.category_id === filterCategoryIdNum;

    const matchesFromDate =
      filterFromDate.trim() === '' || log.log_date >= filterFromDate.trim();

    const matchesToDate =
      filterToDate.trim() === '' || log.log_date <= filterToDate.trim();

    return matchesSearch && matchesCategory && matchesFromDate && matchesToDate;
  });

  const editingLog = habitLogs.find((l) => l.id === editingLogId) ?? null;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Logs</Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          {editingLogId ? 'Edit Log' : 'Log Habit Activity'}
        </Text>

        {editingLog ? (
          <View style={styles.helperBox}>
            <Text style={styles.helperText}>
              Editing: {editingLog.habit_title} · {editingLog.log_date}
            </Text>
          </View>
        ) : (
          <>
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
          </>
        )}

        <FormField
          label="Log Date"
          placeholder="YYYY-MM-DD"
          value={logDate}
          onChangeText={setLogDate}
        />

        {selectedHabit?.habit_type === 'boolean' || editingLog ? (
          editingLog ? (
            <FormField
              label="Value"
              placeholder="e.g. 1"
              value={logValue}
              onChangeText={setLogValue}
              keyboardType="numeric"
            />
          ) : (
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
          )
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

        <Pressable style={styles.primaryButton} onPress={handleSaveLog}>
          <Text style={styles.primaryButtonText}>
            {editingLogId ? 'Save Changes' : 'Add Habit Log'}
          </Text>
        </Pressable>

        {editingLogId ? (
          <Pressable style={styles.secondaryButton} onPress={handleCancelEdit}>
            <Text style={styles.secondaryButtonText}>Cancel Edit</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Search & Filter Logs</Text>

        <FormField
          label="Search Text"
          placeholder="Search by habit, category, or notes"
          value={logSearchText}
          onChangeText={setLogSearchText}
        />

        <Text style={styles.label}>Filter by Category</Text>
        {categories.length === 0 ? (
          <Text style={styles.emptyText}>No categories yet.</Text>
        ) : (
          <View style={styles.choiceWrap}>
            {categories.map((cat) => (
              <Pressable
                key={cat.id}
                style={[
                  styles.choiceChip,
                  filterCategoryIdNum === cat.id && styles.choiceChipActive,
                ]}
                onPress={() =>
                  setFilterCategoryIdNum(
                    filterCategoryIdNum === cat.id ? null : cat.id
                  )
                }
              >
                <View style={[styles.colorDot, { backgroundColor: cat.color }]} />
                <Text
                  style={[
                    styles.choiceChipText,
                    filterCategoryIdNum === cat.id && styles.choiceChipTextActive,
                  ]}
                >
                  {cat.name}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

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

        <Pressable style={styles.secondaryButton} onPress={handleResetLogFilters}>
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

              <View style={styles.actionRow}>
                <Pressable
                  style={styles.smallEditButton}
                  onPress={() => handleEditLog(log)}
                >
                  <Text style={styles.smallEditButtonText}>Edit</Text>
                </Pressable>

                <Pressable
                  style={styles.smallDeleteButton}
                  onPress={() => handleDeleteLog(log.id)}
                >
                  <Text style={styles.smallDeleteButtonText}>Delete</Text>
                </Pressable>
              </View>
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
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  smallEditButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 10,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  smallEditButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  smallDeleteButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 10,
    borderRadius: 8,
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
    flexDirection: 'row',
    alignItems: 'center',
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
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    marginRight: 6,
  },
});