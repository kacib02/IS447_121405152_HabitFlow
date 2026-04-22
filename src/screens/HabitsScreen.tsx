import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  ScrollView,
} from 'react-native';
import {
  createHabit,
  updateHabit,
  deleteHabit,
  getHabitsForActiveUser,
  initHabitTable,
  Habit,
} from '../utils/habits';
import FormField from '../components/FormField';

export default function HabitsScreen() {
  const [habitTitle, setHabitTitle] = useState('');
  const [habitDescription, setHabitDescription] = useState('');
  const [trackingStyle, setTrackingStyle] = useState<'boolean' | 'count'>('count');
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
      const finalUnit = trackingStyle === 'boolean' ? 'times' : habitUnit;

      if (editingHabitId) {
        await updateHabit(
          editingHabitId,
          habitTitle,
          habitDescription,
          trackingStyle,
          finalUnit,
          Number(habitCategoryId)
        );
        Alert.alert('Success', 'Habit updated successfully.');
      } else {
        await createHabit(
          habitTitle,
          habitDescription,
          trackingStyle,
          finalUnit,
          Number(habitCategoryId)
        );
        Alert.alert('Success', 'Habit created successfully.');
      }

      setHabitTitle('');
      setHabitDescription('');
      setTrackingStyle('count');
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
    setTrackingStyle(habit.habit_type === 'boolean' ? 'boolean' : 'count');
    setHabitUnit(habit.habit_type === 'boolean' ? '' : habit.unit);
    setHabitCategoryId(String(habit.category_id));
  };

  const handleDeleteHabit = (habitId: number) => {
    Alert.alert(
      'Delete Habit',
      'Are you sure you want to delete this habit?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteHabit(habitId);
              if (editingHabitId === habitId) {
                handleCancelEdit();
              }
              await loadHabits();
            } catch (error) {
              const message =
                error instanceof Error ? error.message : 'Could not delete habit.';
              Alert.alert('Error', message);
            }
          },
        },
      ]
    );
  };

  const handleCancelEdit = () => {
    setEditingHabitId(null);
    setHabitTitle('');
    setHabitDescription('');
    setTrackingStyle('count');
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

        <Text style={styles.label}>Tracking Style</Text>
        <View style={styles.buttonRow}>
          <Pressable
            style={[
              styles.optionButton,
              trackingStyle === 'count' && styles.optionButtonActive,
            ]}
            onPress={() => setTrackingStyle('count')}
          >
            <Text
              style={[
                styles.optionButtonText,
                trackingStyle === 'count' && styles.optionButtonTextActive,
              ]}
            >
              Number
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.optionButton,
              trackingStyle === 'boolean' && styles.optionButtonActive,
            ]}
            onPress={() => setTrackingStyle('boolean')}
          >
            <Text
              style={[
                styles.optionButtonText,
                trackingStyle === 'boolean' && styles.optionButtonTextActive,
              ]}
            >
              Yes / No
            </Text>
          </Pressable>
        </View>

        {trackingStyle === 'count' ? (
          <FormField
            label="Unit"
            placeholder="e.g. glasses, minutes, euro"
            value={habitUnit}
            onChangeText={setHabitUnit}
          />
        ) : (
          <View style={styles.helperBox}>
            <Text style={styles.helperText}>
              This habit will be tracked as completed or not completed for each log.
            </Text>
          </View>
        )}

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
                Tracking: {habit.habit_type === 'boolean' ? 'Yes / No' : 'Number'}
              </Text>
              <Text style={styles.listSubtitle}>
                Unit: {habit.habit_type === 'boolean' ? 'Completed' : habit.unit}
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

              <View style={styles.actionRow}>
                <Pressable
                  style={styles.smallEditButton}
                  onPress={() => handleEditHabit(habit)}
                >
                  <Text style={styles.smallEditButtonText}>Edit</Text>
                </Pressable>

                <Pressable
                  style={styles.smallDeleteButton}
                  onPress={() => handleDeleteHabit(habit.id)}
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
    marginBottom: 12,
  },
  helperText: {
    color: '#4b5563',
    fontSize: 14,
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
});