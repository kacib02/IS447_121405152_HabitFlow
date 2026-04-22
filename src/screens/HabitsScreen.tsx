import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, ScrollView } from 'react-native';
import {
  createHabit,
  updateHabit,
  getHabitsForActiveUser,
  initHabitTable,
  Habit,
} from '../utils/habits';
import FormField from '../components/FormField';

export default function HabitsScreen() {
  const [habitTitle, setHabitTitle] = useState('');
  const [habitDescription, setHabitDescription] = useState('');
  const [habitType, setHabitType] = useState('');
  const [habitUnit, setHabitUnit] = useState('');
  const [habitCategoryId, setHabitCategoryId] = useState('');
  const [habits, setHabits] = useState<Habit[]>([]);
  const [editingHabitId, setEditingHabitId] = useState<number | null>(null);

  const loadHabits = async () => {
    const data = await getHabitsForActiveUser();
    setHabits(data);
  };

  useEffect(() => {
    const setup = async () => {
      await initHabitTable();
      await loadHabits();
    };
    setup();
  }, []);

  const handleSaveHabit = async () => {
    try {
      if (editingHabitId) {
        await updateHabit(
          editingHabitId,
          habitTitle,
          habitDescription,
          habitType,
          habitUnit,
          Number(habitCategoryId)
        );
        Alert.alert('Success', 'Habit updated successfully.');
      } else {
        await createHabit(
          habitTitle,
          habitDescription,
          habitType,
          habitUnit,
          Number(habitCategoryId)
        );
        Alert.alert('Success', 'Habit created successfully.');
      }

      setHabitTitle('');
      setHabitDescription('');
      setHabitType('');
      setHabitUnit('');
      setHabitCategoryId('');
      setEditingHabitId(null);
      await loadHabits();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Could not save habit.';
      Alert.alert('Error', message);
    }
  };

  const handleEditHabit = (habit: Habit) => {
    setEditingHabitId(habit.id);
    setHabitTitle(habit.title);
    setHabitDescription(habit.description ?? '');
    setHabitType(habit.habit_type);
    setHabitUnit(habit.unit);
    setHabitCategoryId(String(habit.category_id));
  };

  const handleCancelEdit = () => {
    setEditingHabitId(null);
    setHabitTitle('');
    setHabitDescription('');
    setHabitType('');
    setHabitUnit('');
    setHabitCategoryId('');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Habits</Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          {editingHabitId ? 'Edit Habit' : 'Create Habit'}
        </Text>

        <FormField
          label="Habit Title"
          placeholder="e.g. Drink Water"
          value={habitTitle}
          onChangeText={setHabitTitle}
        />

        <FormField
          label="Description"
          placeholder="e.g. Stay hydrated every day"
          value={habitDescription}
          onChangeText={setHabitDescription}
        />

        <FormField
          label="Habit Type"
          placeholder="boolean or count"
          value={habitType}
          onChangeText={setHabitType}
        />

        <FormField
          label="Unit"
          placeholder="e.g. glasses, minutes, times"
          value={habitUnit}
          onChangeText={setHabitUnit}
        />

        <FormField
          label="Category ID"
          placeholder="Enter a category ID"
          value={habitCategoryId}
          onChangeText={setHabitCategoryId}
          keyboardType="numeric"
        />

        <Pressable style={styles.primaryButton} onPress={handleSaveHabit}>
          <Text style={styles.primaryButtonText}>
            {editingHabitId ? 'Save Habit' : 'Add Habit'}
          </Text>
        </Pressable>

        {editingHabitId ? (
          <Pressable style={styles.secondaryButton} onPress={handleCancelEdit}>
            <Text style={styles.secondaryButtonText}>Cancel Edit</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Your Habits</Text>

        {habits.length === 0 ? (
          <Text style={styles.emptyText}>No habits yet.</Text>
        ) : (
          habits.map((habit) => (
            <View key={habit.id} style={styles.listItem}>
              <Text style={styles.listTitle}>{habit.title}</Text>
              <Text style={styles.listSubtitle}>
                Type: {habit.habit_type} · Unit: {habit.unit}
              </Text>
              <Text style={styles.listSubtitle}>
                Category: {habit.category_name}
              </Text>
              {habit.description ? (
                <Text style={styles.listSubtitle}>
                  Description: {habit.description}
                </Text>
              ) : null}
              <Text style={styles.listSubtitle}>Habit ID: {habit.id}</Text>

              <Pressable
                style={styles.smallEditButton}
                onPress={() => handleEditHabit(habit)}
              >
                <Text style={styles.smallEditButtonText}>Edit Habit</Text>
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
  listItem: {
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
  smallEditButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
  },
  smallEditButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});