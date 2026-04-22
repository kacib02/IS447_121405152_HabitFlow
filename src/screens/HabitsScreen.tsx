import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, ScrollView } from 'react-native';
import { createHabit, updateHabit, deleteHabit, getHabitsForActiveUser, initHabitTable, Habit } from '../utils/habits';
import { getCategoriesForActiveUser, initCategoryTable, Category } from '../utils/categories';
import FormField from '../components/FormField';
import { g, lightColors, darkColors } from '../styles/GlobalStyles';
import { useTheme } from '../context/ThemeContext';

export default function HabitsScreen() {
  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkColors : lightColors;

  const [habitTitle, setHabitTitle] = useState('');
  const [habitDescription, setHabitDescription] = useState('');
  const [trackingStyle, setTrackingStyle] = useState<'boolean' | 'count'>('count');
  const [habitUnit, setHabitUnit] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingHabitId, setEditingHabitId] = useState<number | null>(null);

  const loadHabits = async () => { setHabits(await getHabitsForActiveUser()); };
  const loadCategories = async () => { setCategories(await getCategoriesForActiveUser()); };

  useEffect(() => {
    const setup = async () => {
      await initHabitTable();
      await initCategoryTable();
      await loadHabits();
      await loadCategories();
    };
    setup();
  }, []);

  const handleSaveHabit = async () => {
    try {
      const finalUnit = trackingStyle === 'boolean' ? 'completed' : habitUnit;
      if (!selectedCategoryId) throw new Error('Please choose a category.');
      if (editingHabitId) {
        await updateHabit(editingHabitId, habitTitle, habitDescription, trackingStyle, finalUnit, selectedCategoryId);
      } else {
        await createHabit(habitTitle, habitDescription, trackingStyle, finalUnit, selectedCategoryId);
      }
      setHabitTitle('');
      setHabitDescription('');
      setTrackingStyle('count');
      setHabitUnit('');
      setSelectedCategoryId(null);
      setEditingHabitId(null);
      await loadHabits();
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Could not save habit.');
    }
  };

  const handleEditHabit = (habit: Habit) => {
    setEditingHabitId(habit.id);
    setHabitTitle(habit.title);
    setHabitDescription(habit.description ?? '');
    setTrackingStyle(habit.habit_type === 'boolean' ? 'boolean' : 'count');
    setHabitUnit(habit.habit_type === 'boolean' ? '' : habit.unit);
    setSelectedCategoryId(habit.category_id);
  };

  const handleDeleteHabit = (habitId: number) => {
    Alert.alert('Delete Habit', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteHabit(habitId);
            if (editingHabitId === habitId) handleCancelEdit();
            await loadHabits();
          } catch (error) {
            Alert.alert('Error', error instanceof Error ? error.message : 'Could not delete habit.');
          }
        },
      },
    ]);
  };

  const handleCancelEdit = () => {
    setEditingHabitId(null);
    setHabitTitle('');
    setHabitDescription('');
    setTrackingStyle('count');
    setHabitUnit('');
    setSelectedCategoryId(null);
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[g.pageTitle, { color: colors.black }]}>Habits</Text>

      <View style={[g.section, { borderTopColor: colors.border }]}>
        <Text style={[g.sectionTitle, { color: colors.black }]}>
          {editingHabitId ? 'Edit Habit' : 'New Habit'}
        </Text>

        <FormField
          label="Title"
          placeholder="e.g. Drink Water"
          value={habitTitle}
          onChangeText={setHabitTitle}
        />
        <FormField
          label="Description"
          placeholder="Optional description"
          value={habitDescription}
          onChangeText={setHabitDescription}
        />

        <Text style={[g.label, { color: colors.black }]}>Tracking Style</Text>
        <View style={g.toggleRow}>
          <Pressable
            style={[
              g.toggleBtn,
              { borderColor: colors.border, backgroundColor: colors.white },
              trackingStyle === 'count' && g.toggleBtnActive,
            ]}
            onPress={() => setTrackingStyle('count')}
            accessibilityLabel="Track by number"
            accessibilityRole="button"
          >
            <Text
              style={[
                g.toggleBtnText,
                { color: colors.black },
                trackingStyle === 'count' && g.toggleBtnTextActive,
              ]}
            >
              Number
            </Text>
          </Pressable>

          <Pressable
            style={[
              g.toggleBtn,
              { borderColor: colors.border, backgroundColor: colors.white },
              trackingStyle === 'boolean' && g.toggleBtnActive,
            ]}
            onPress={() => setTrackingStyle('boolean')}
            accessibilityLabel="Track yes or no"
            accessibilityRole="button"
          >
            <Text
              style={[
                g.toggleBtnText,
                { color: colors.black },
                trackingStyle === 'boolean' && g.toggleBtnTextActive,
              ]}
            >
              Yes / No
            </Text>
          </Pressable>
        </View>

        {trackingStyle === 'count' && (
          <FormField
            label="Unit"
            placeholder="e.g. glasses, minutes"
            value={habitUnit}
            onChangeText={setHabitUnit}
          />
        )}

        <Text style={[g.label, { color: colors.black }]}>Category</Text>
        {categories.length === 0 ? (
          <Text style={[g.emptyText, { color: colors.black }]}>
            No categories yet. Create one first.
          </Text>
        ) : (
          <View style={g.chipRow}>
            {categories.map((cat) => (
              <Pressable
                key={cat.id}
                style={[
                  g.chip,
                  { borderColor: colors.border, backgroundColor: colors.white },
                  selectedCategoryId === cat.id && g.chipActive,
                ]}
                onPress={() => setSelectedCategoryId(cat.id)}
                accessibilityLabel={`Select category ${cat.name}`}
                accessibilityRole="button"
              >
                <Text
                  style={[
                    g.chipText,
                    { color: colors.black },
                    selectedCategoryId === cat.id && g.chipTextActive,
                  ]}
                >
                  {cat.name}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        <Pressable
          style={g.primaryButton}
          onPress={handleSaveHabit}
          accessibilityLabel={editingHabitId ? 'Save habit' : 'Add habit'}
          accessibilityRole="button"
        >
          <Text style={g.primaryButtonText}>{editingHabitId ? 'Save' : 'Add Habit'}</Text>
        </Pressable>

        {editingHabitId ? (
          <Pressable
            style={[g.secondaryButton, { backgroundColor: colors.white, borderColor: colors.border }]}
            onPress={handleCancelEdit}
            accessibilityLabel="Cancel edit"
            accessibilityRole="button"
          >
            <Text style={[g.secondaryButtonText, { color: colors.black }]}>Cancel</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={[g.section, { borderTopColor: colors.border }]}>
        <Text style={[g.sectionTitle, { color: colors.black }]}>Your Habits</Text>

        {habits.length === 0 ? (
          <Text style={[g.emptyText, { color: colors.black }]}>No habits yet.</Text>
        ) : (
          habits.map((habit) => (
            <View key={habit.id} style={[g.listItem, { borderBottomColor: colors.border }]}>
              <Text style={[g.listTitle, { color: colors.black }]}>{habit.title}</Text>
              <Text style={[g.bodyText, { color: colors.black }]}>
                Category: {habit.category_name}
              </Text>
              <Text style={[g.bodyText, { color: colors.black }]}>
                Tracking: {habit.habit_type === 'boolean' ? 'Yes / No' : `Number (${habit.unit})`}
              </Text>
              {habit.description ? (
                <Text style={[g.bodyText, { color: colors.black }]}>{habit.description}</Text>
              ) : null}

              <View style={g.actionRow}>
                <Pressable
                  style={g.smallPrimaryButton}
                  onPress={() => handleEditHabit(habit)}
                  accessibilityLabel={`Edit ${habit.title}`}
                  accessibilityRole="button"
                >
                  <Text style={g.smallPrimaryButtonText}>Edit</Text>
                </Pressable>

                <Pressable
                  style={g.smallDangerButton}
                  onPress={() => handleDeleteHabit(habit.id)}
                  accessibilityLabel={`Delete ${habit.title}`}
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