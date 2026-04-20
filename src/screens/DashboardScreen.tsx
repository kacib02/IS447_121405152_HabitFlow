import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  ScrollView,
} from 'react-native';
import { deleteCurrentUser, logoutUser } from '../utils/auth';
import {
  createCategory,
  getCategoriesForActiveUser,
  initCategoryTable,
  Category,
} from '../utils/categories';
import {
  createHabit,
  getHabitsForActiveUser,
  initHabitTable,
  Habit,
} from '../utils/habits';
import FormField from '../components/FormField';

type Props = {
  user: {
    id: number;
    name: string;
    email: string;
  };
  onLogout: () => Promise<void>;
};

export default function DashboardScreen({ user, onLogout }: Props) {
  const [categoryName, setCategoryName] = useState('');
  const [categoryColor, setCategoryColor] = useState('');
  const [categoryIcon, setCategoryIcon] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);

  const [habitTitle, setHabitTitle] = useState('');
  const [habitDescription, setHabitDescription] = useState('');
  const [habitType, setHabitType] = useState('');
  const [habitUnit, setHabitUnit] = useState('');
  const [habitCategoryId, setHabitCategoryId] = useState('');
  const [habits, setHabits] = useState<Habit[]>([]);

  const loadCategories = async () => {
    const data = await getCategoriesForActiveUser();
    setCategories(data);
  };

  const loadHabits = async () => {
    const data = await getHabitsForActiveUser();
    setHabits(data);
  };

  useEffect(() => {
    const setup = async () => {
      try {
        await initCategoryTable();
        await initHabitTable();
        await loadCategories();
        await loadHabits();
      } catch (error) {
        console.error('Dashboard setup failed:', error);
      }
    };

    setup();
  }, []);

  const handleCreateCategory = async () => {
    try {
      await createCategory(categoryName, categoryColor, categoryIcon);
      setCategoryName('');
      setCategoryColor('');
      setCategoryIcon('');
      await loadCategories();
      Alert.alert('Success', 'Category created successfully.');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Could not create category.';
      Alert.alert('Error', message);
    }
  };

  const handleCreateHabit = async () => {
    try {
      await createHabit(
        habitTitle,
        habitDescription,
        habitType,
        habitUnit,
        Number(habitCategoryId)
      );

      setHabitTitle('');
      setHabitDescription('');
      setHabitType('');
      setHabitUnit('');
      setHabitCategoryId('');
      await loadHabits();
      Alert.alert('Success', 'Habit created successfully.');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Could not create habit.';
      Alert.alert('Error', message);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    await onLogout();
  };

  const handleDeleteProfile = () => {
    Alert.alert(
      'Delete Profile',
      'Are you sure you want to delete your profile?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCurrentUser();
              await onLogout();
            } catch (error) {
              const message =
                error instanceof Error ? error.message : 'Delete failed.';
              Alert.alert('Error', message);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Welcome, {user.name}</Text>
      <Text style={styles.subtitle}>{user.email}</Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Create Category</Text>

        <FormField
          label="Category Name"
          placeholder="e.g. Health"
          value={categoryName}
          onChangeText={setCategoryName}
        />

        <FormField
          label="Colour"
          placeholder="e.g. Blue"
          value={categoryColor}
          onChangeText={setCategoryColor}
        />

        <FormField
          label="Icon"
          placeholder="e.g. heart"
          value={categoryIcon}
          onChangeText={setCategoryIcon}
        />

        <Pressable style={styles.primaryButton} onPress={handleCreateCategory}>
          <Text style={styles.primaryButtonText}>Add Category</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Your Categories</Text>

        {categories.length === 0 ? (
          <Text style={styles.emptyText}>No categories yet.</Text>
        ) : (
          categories.map((category) => (
            <View key={category.id} style={styles.listItem}>
              <Text style={styles.listTitle}>
                {category.icon} {category.name}
              </Text>
              <Text style={styles.listSubtitle}>
                {category.color} · ID: {category.id}
              </Text>
            </View>
          ))
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Create Habit</Text>

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
          placeholder="Enter a category ID from the list above"
          value={habitCategoryId}
          onChangeText={setHabitCategoryId}
          keyboardType="numeric"
        />

        <Pressable style={styles.primaryButton} onPress={handleCreateHabit}>
          <Text style={styles.primaryButtonText}>Add Habit</Text>
        </Pressable>
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
            </View>
          ))
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Account</Text>

        <Pressable style={styles.primaryButton} onPress={handleLogout}>
          <Text style={styles.primaryButtonText}>Logout</Text>
        </Pressable>

        <Pressable style={styles.deleteButton} onPress={handleDeleteProfile}>
          <Text style={styles.deleteButtonText}>Delete Profile</Text>
        </Pressable>
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
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 20,
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
  deleteButton: {
    backgroundColor: '#dc2626',
    paddingVertical: 14,
    borderRadius: 10,
  },
  deleteButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
});