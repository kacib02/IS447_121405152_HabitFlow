import { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, ScrollView } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { createHabitLog, deleteHabitLog, getHabitLogsForActiveUser, initHabitLogTable, HabitLog } from '../utils/habitLogs';
import { getHabitsForActiveUser, initHabitTable, Habit } from '../utils/habits';
import { getCategoriesForActiveUser, initCategoryTable, Category } from '../utils/categories';
import FormField from '../components/FormField';
import { g, lightColors, darkColors } from '../styles/GlobalStyles';
import { useTheme } from '../context/ThemeContext';

const db = SQLite.openDatabaseSync('habitflow.db');

async function updateHabitLog(logId: number, logDate: string, value: number, notes: string) {
  await db.runAsync(
    `UPDATE habit_logs SET log_date = ?, value = ?, notes = ? WHERE id = ?;`,
    [logDate.trim(), value, notes.trim() || null, logId]
  );
}

export default function LogsScreen() {
  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkColors : lightColors;

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
    setHabitLogs(await getHabitLogsForActiveUser());
  };

  const loadHabits = async () => {
    setHabits(await getHabitsForActiveUser());
  };

  const loadCategories = async () => {
    setCategories(await getCategoriesForActiveUser());
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
    () => habits.find((h) => h.id === selectedHabitId) ?? null,
    [habits, selectedHabitId]
  );

  const editingLog = habitLogs.find((l) => l.id === editingLogId) ?? null;

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
          habit?.habit_type === 'boolean' ? Number(logValue || '1') : Number(logValue);

        if (!logDate.trim()) throw new Error('Date is required.');
        if (Number.isNaN(finalValue)) throw new Error('Value must be a number.');

        await updateHabitLog(editingLogId, logDate, finalValue, logNotes);
      } else {
        if (!selectedHabit) throw new Error('Please choose a habit.');
        const finalValue =
          selectedHabit.habit_type === 'boolean' ? Number(logValue || '1') : Number(logValue);

        await createHabitLog(
          selectedHabit.id,
          selectedHabit.category_id,
          logDate,
          finalValue,
          logNotes
        );
      }

      setEditingLogId(null);
      setSelectedHabitId(null);
      setLogDate('');
      setLogValue('');
      setLogNotes('');
      await loadHabitLogs();
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Could not save log.');
    }
  };

  const handleDeleteLog = (logId: number) => {
    Alert.alert('Delete Log', 'Are you sure?', [
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
            Alert.alert('Error', error instanceof Error ? error.message : 'Could not delete log.');
          }
        },
      },
    ]);
  };

  const filteredHabitLogs = habitLogs.filter((log) => {
    const s = logSearchText.trim().toLowerCase();
    return (
      (s === '' ||
        log.habit_title?.toLowerCase().includes(s) ||
        log.category_name?.toLowerCase().includes(s) ||
        log.notes?.toLowerCase().includes(s)) &&
      (filterCategoryIdNum === null || log.category_id === filterCategoryIdNum) &&
      (filterFromDate.trim() === '' || log.log_date >= filterFromDate.trim()) &&
      (filterToDate.trim() === '' || log.log_date <= filterToDate.trim())
    );
  });

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[g.pageTitle, { color: colors.black }]}>Logs</Text>

      <View style={[g.section, { borderTopColor: colors.border }]}>
        <Text style={[g.sectionTitle, { color: colors.black }]}>
          {editingLogId ? 'Edit Log' : 'New Log'}
        </Text>

        {editingLog ? (
          <Text style={[g.bodyText, { color: colors.black }]}>
            Editing: {editingLog.habit_title} · {editingLog.log_date}
          </Text>
        ) : (
          <>
            <Text style={[g.label, { color: colors.black }]}>Habit</Text>

            {habits.length === 0 ? (
              <Text style={[g.emptyText, { color: colors.black }]}>
                No habits yet. Create one first.
              </Text>
            ) : (
              <View style={g.chipRow}>
                {habits.map((habit) => (
                  <Pressable
                    key={habit.id}
                    style={[
                      g.chip,
                      { borderColor: colors.border, backgroundColor: colors.white },
                      selectedHabitId === habit.id && g.chipActive,
                    ]}
                    onPress={() => setSelectedHabitId(habit.id)}
                    accessibilityLabel={`Select habit ${habit.title}`}
                    accessibilityRole="button"
                  >
                    <Text
                      style={[
                        g.chipText,
                        { color: colors.black },
                        selectedHabitId === habit.id && g.chipTextActive,
                      ]}
                    >
                      {habit.title}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}

            {selectedHabit ? (
              <Text style={[g.bodyText, { color: colors.black }]}>
                Category: {selectedHabit.category_name} ·{' '}
                {selectedHabit.habit_type === 'boolean'
                  ? 'Yes / No'
                  : `Number (${selectedHabit.unit})`}
              </Text>
            ) : null}
          </>
        )}

        <FormField
          label="Date"
          placeholder="YYYY-MM-DD"
          value={logDate}
          onChangeText={setLogDate}
        />

        {selectedHabit?.habit_type === 'boolean' && !editingLog ? (
          <>
            <Text style={[g.label, { color: colors.black }]}>Completed?</Text>
            <View style={g.toggleRow}>
              <Pressable
                style={[
                  g.toggleBtn,
                  { borderColor: colors.border, backgroundColor: colors.white },
                  logValue === '1' && g.toggleBtnActive,
                ]}
                onPress={() => setLogValue('1')}
                accessibilityLabel="Yes"
                accessibilityRole="button"
              >
                <Text
                  style={[
                    g.toggleBtnText,
                    { color: colors.black },
                    logValue === '1' && g.toggleBtnTextActive,
                  ]}
                >
                  Yes
                </Text>
              </Pressable>

              <Pressable
                style={[
                  g.toggleBtn,
                  { borderColor: colors.border, backgroundColor: colors.white },
                  logValue === '0' && g.toggleBtnActive,
                ]}
                onPress={() => setLogValue('0')}
                accessibilityLabel="No"
                accessibilityRole="button"
              >
                <Text
                  style={[
                    g.toggleBtnText,
                    { color: colors.black },
                    logValue === '0' && g.toggleBtnTextActive,
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

        <Pressable
          style={g.primaryButton}
          onPress={handleSaveLog}
          accessibilityLabel={editingLogId ? 'Save changes' : 'Add log'}
          accessibilityRole="button"
        >
          <Text style={g.primaryButtonText}>
            {editingLogId ? 'Save Changes' : 'Add Log'}
          </Text>
        </Pressable>

        {editingLogId ? (
          <Pressable
            style={[
              g.secondaryButton,
              { backgroundColor: colors.white, borderColor: colors.border },
            ]}
            onPress={handleCancelEdit}
            accessibilityLabel="Cancel edit"
            accessibilityRole="button"
          >
            <Text style={[g.secondaryButtonText, { color: colors.black }]}>Cancel</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={[g.section, { borderTopColor: colors.border }]}>
        <Text style={[g.sectionTitle, { color: colors.black }]}>Filter</Text>

        <FormField
          label="Search"
          placeholder="Search by habit, category or notes"
          value={logSearchText}
          onChangeText={setLogSearchText}
        />

        <Text style={[g.label, { color: colors.black }]}>Category</Text>

        {categories.length === 0 ? (
          <Text style={[g.emptyText, { color: colors.black }]}>No categories yet.</Text>
        ) : (
          <View style={g.chipRow}>
            {categories.map((cat) => (
              <Pressable
                key={cat.id}
                style={[
                  g.chip,
                  { borderColor: colors.border, backgroundColor: colors.white },
                  filterCategoryIdNum === cat.id && g.chipActive,
                ]}
                onPress={() =>
                  setFilterCategoryIdNum(filterCategoryIdNum === cat.id ? null : cat.id)
                }
                accessibilityLabel={`Filter by ${cat.name}`}
                accessibilityRole="button"
              >
                <Text
                  style={[
                    g.chipText,
                    { color: colors.black },
                    filterCategoryIdNum === cat.id && g.chipTextActive,
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

        <Pressable
          style={[
            g.secondaryButton,
            { backgroundColor: colors.white, borderColor: colors.border },
          ]}
          onPress={() => {
            setLogSearchText('');
            setFilterCategoryIdNum(null);
            setFilterFromDate('');
            setFilterToDate('');
          }}
          accessibilityLabel="Reset filters"
          accessibilityRole="button"
        >
          <Text style={[g.secondaryButtonText, { color: colors.black }]}>
            Reset Filters
          </Text>
        </Pressable>
      </View>

      <View style={[g.section, { borderTopColor: colors.border }]}>
        <Text style={[g.sectionTitle, { color: colors.black }]}>Log History</Text>

        {habitLogs.length === 0 ? (
          <Text style={[g.emptyText, { color: colors.black }]}>No logs yet.</Text>
        ) : filteredHabitLogs.length === 0 ? (
          <Text style={[g.emptyText, { color: colors.black }]}>
            No logs match your filters.
          </Text>
        ) : (
          filteredHabitLogs.map((log) => (
            <View key={log.id} style={[g.listItem, { borderBottomColor: colors.border }]}>
              <Text style={[g.listTitle, { color: colors.black }]}>
                {log.habit_title} · {log.log_date}
              </Text>
              <Text style={[g.bodyText, { color: colors.black }]}>
                Category: {log.category_name}
              </Text>
              <Text style={[g.bodyText, { color: colors.black }]}>Value: {log.value}</Text>
              {log.notes ? (
                <Text style={[g.bodyText, { color: colors.black }]}>
                  Notes: {log.notes}
                </Text>
              ) : null}

              <View style={g.actionRow}>
                <Pressable
                  style={g.smallPrimaryButton}
                  onPress={() => handleEditLog(log)}
                  accessibilityLabel={`Edit log from ${log.log_date}`}
                  accessibilityRole="button"
                >
                  <Text style={g.smallPrimaryButtonText}>Edit</Text>
                </Pressable>

                <Pressable
                  style={g.smallDangerButton}
                  onPress={() => handleDeleteLog(log.id)}
                  accessibilityLabel={`Delete log from ${log.log_date}`}
                  accessibilityRole="button"
                >
                  <Text style={g.smallDangerButtonText}>Delete</Text>
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
    padding: 16,
  },
});