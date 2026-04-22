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
  updateCategory,
  getCategoriesForActiveUser,
  initCategoryTable,
  Category,
} from '../utils/categories';
import {
  createHabit,
  updateHabit,
  getHabitsForActiveUser,
  initHabitTable,
  Habit,
} from '../utils/habits';
import {
  createHabitLog,
  deleteHabitLog,
  getHabitLogsForActiveUser,
  initHabitLogTable,
  HabitLog,
} from '../utils/habitLogs';
import {
  createTarget,
  deleteTarget,
  getTargetsForActiveUser,
  initTargetTable,
  Target,
} from '../utils/targets';
import {
  calculateTargetProgress,
  TargetProgress,
} from '../utils/targetProgress';
import {
  getInsightSummary,
  getLast7DaysChartData,
  InsightSummary,
  DailyChartItem,
} from '../utils/insights';
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
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);

  const [habitTitle, setHabitTitle] = useState('');
  const [habitDescription, setHabitDescription] = useState('');
  const [habitType, setHabitType] = useState('');
  const [habitUnit, setHabitUnit] = useState('');
  const [habitCategoryId, setHabitCategoryId] = useState('');
  const [habits, setHabits] = useState<Habit[]>([]);
  const [editingHabitId, setEditingHabitId] = useState<number | null>(null);

  const [logHabitId, setLogHabitId] = useState('');
  const [logCategoryId, setLogCategoryId] = useState('');
  const [logDate, setLogDate] = useState('');
  const [logValue, setLogValue] = useState('');
  const [logNotes, setLogNotes] = useState('');
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>([]);

  const [targetHabitId, setTargetHabitId] = useState('');
  const [targetPeriodType, setTargetPeriodType] = useState('weekly');
  const [targetType, setTargetType] = useState('count');
  const [targetValue, setTargetValue] = useState('');
  const [targets, setTargets] = useState<Target[]>([]);
  const [targetProgressMap, setTargetProgressMap] = useState<
    Record<number, TargetProgress>
  >({});

  const [logSearchText, setLogSearchText] = useState('');
  const [filterCategoryId, setFilterCategoryId] = useState('');
  const [filterFromDate, setFilterFromDate] = useState('');
  const [filterToDate, setFilterToDate] = useState('');

  const [insightSummary, setInsightSummary] = useState<InsightSummary>({
    todayCount: 0,
    weekCount: 0,
    monthCount: 0,
  });
  const [chartData, setChartData] = useState<DailyChartItem[]>([]);

  const loadCategories = async () => {
    const data = await getCategoriesForActiveUser();
    setCategories(data);
  };

  const loadHabits = async () => {
    const data = await getHabitsForActiveUser();
    setHabits(data);
  };

  const loadHabitLogs = async () => {
    const data = await getHabitLogsForActiveUser();
    setHabitLogs(data);
  };

  const loadTargets = async () => {
    const data = await getTargetsForActiveUser();
    setTargets(data);

    const progressEntries = await Promise.all(
      data.map(async (target) => {
        const progress = await calculateTargetProgress(target);
        return [target.id, progress] as const;
      })
    );

    setTargetProgressMap(Object.fromEntries(progressEntries));
  };

  const loadInsights = async () => {
    const logs = await getHabitLogsForActiveUser();
    setInsightSummary(getInsightSummary(logs));
    setChartData(getLast7DaysChartData(logs));
  };

  useEffect(() => {
    const setup = async () => {
      try {
        await initCategoryTable();
        await initHabitTable();
        await initHabitLogTable();
        await initTargetTable();

        await loadCategories();
        await loadHabits();
        await loadHabitLogs();
        await loadTargets();
        await loadInsights();
      } catch (error) {
        console.error('Dashboard setup failed:', error);
      }
    };

    setup();
  }, []);

  const handleCreateCategory = async () => {
    try {
      if (editingCategoryId) {
        await updateCategory(
          editingCategoryId,
          categoryName,
          categoryColor,
          categoryIcon
        );
        Alert.alert('Success', 'Category updated successfully.');
      } else {
        await createCategory(categoryName, categoryColor, categoryIcon);
        Alert.alert('Success', 'Category created successfully.');
      }

      setCategoryName('');
      setCategoryColor('');
      setCategoryIcon('');
      setEditingCategoryId(null);
      await loadCategories();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Could not save category.';
      Alert.alert('Error', message);
    }
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategoryId(category.id);
    setCategoryName(category.name);
    setCategoryColor(category.color);
    setCategoryIcon(category.icon);
  };

  const handleCancelEditCategory = () => {
    setEditingCategoryId(null);
    setCategoryName('');
    setCategoryColor('');
    setCategoryIcon('');
  };

  const handleCreateHabit = async () => {
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

  const handleCancelEditHabit = () => {
    setEditingHabitId(null);
    setHabitTitle('');
    setHabitDescription('');
    setHabitType('');
    setHabitUnit('');
    setHabitCategoryId('');
  };

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
      await loadTargets();
      await loadInsights();
      Alert.alert('Success', 'Habit log created successfully.');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Could not create habit log.';
      Alert.alert('Error', message);
    }
  };

  const handleCreateTarget = async () => {
    try {
      const cleanedPeriodType = targetPeriodType.trim().toLowerCase();
      const cleanedTargetType = targetType.trim().toLowerCase();

      if (cleanedPeriodType !== 'weekly' && cleanedPeriodType !== 'monthly') {
        throw new Error('Period type must be weekly or monthly.');
      }

      if (cleanedTargetType !== 'count' && cleanedTargetType !== 'sum') {
        throw new Error('Target type must be count or sum.');
      }

      await createTarget(
        Number(targetHabitId),
        cleanedPeriodType,
        cleanedTargetType,
        Number(targetValue)
      );

      setTargetHabitId('');
      setTargetPeriodType('weekly');
      setTargetType('count');
      setTargetValue('');

      await loadTargets();
      Alert.alert('Success', 'Target created successfully.');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Could not create target.';
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
            await loadTargets();
            await loadInsights();
          } catch (error) {
            const message =
              error instanceof Error ? error.message : 'Could not delete log.';
            Alert.alert('Error', message);
          }
        },
      },
    ]);
  };

  const handleDeleteTarget = (targetId: number) => {
    Alert.alert('Delete Target', 'Are you sure you want to delete this target?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteTarget(targetId);
            await loadTargets();
          } catch (error) {
            const message =
              error instanceof Error ? error.message : 'Could not delete target.';
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

  const maxChartValue = Math.max(...chartData.map((item) => item.total), 1);

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
          <Text style={styles.primaryButtonText}>
            {editingCategoryId ? 'Save Category' : 'Add Category'}
          </Text>
        </Pressable>

        {editingCategoryId ? (
          <Pressable
            style={styles.secondaryButton}
            onPress={handleCancelEditCategory}
          >
            <Text style={styles.secondaryButtonText}>Cancel Edit</Text>
          </Pressable>
        ) : null}
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

              <Pressable
                style={styles.smallEditButton}
                onPress={() => handleEditCategory(category)}
              >
                <Text style={styles.smallEditButtonText}>Edit Category</Text>
              </Pressable>
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
          <Text style={styles.primaryButtonText}>
            {editingHabitId ? 'Save Habit' : 'Add Habit'}
          </Text>
        </Pressable>

        {editingHabitId ? (
          <Pressable
            style={styles.secondaryButton}
            onPress={handleCancelEditHabit}
          >
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

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Log Habit Activity</Text>

        <FormField
          label="Habit ID"
          placeholder="Enter a habit ID from the list above"
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
        <Text style={styles.sectionTitle}>Create Target</Text>

        <FormField
          label="Habit ID"
          placeholder="Enter a habit ID from the list above"
          value={targetHabitId}
          onChangeText={setTargetHabitId}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Period Type</Text>
        <View style={styles.buttonRow}>
          <Pressable
            style={[
              styles.optionButton,
              targetPeriodType === 'weekly' && styles.optionButtonActive,
            ]}
            onPress={() => setTargetPeriodType('weekly')}
          >
            <Text
              style={[
                styles.optionButtonText,
                targetPeriodType === 'weekly' && styles.optionButtonTextActive,
              ]}
            >
              Weekly
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.optionButton,
              targetPeriodType === 'monthly' && styles.optionButtonActive,
            ]}
            onPress={() => setTargetPeriodType('monthly')}
          >
            <Text
              style={[
                styles.optionButtonText,
                targetPeriodType === 'monthly' && styles.optionButtonTextActive,
              ]}
            >
              Monthly
            </Text>
          </Pressable>
        </View>

        <Text style={styles.label}>Target Type</Text>
        <View style={styles.buttonRow}>
          <Pressable
            style={[
              styles.optionButton,
              targetType === 'count' && styles.optionButtonActive,
            ]}
            onPress={() => setTargetType('count')}
          >
            <Text
              style={[
                styles.optionButtonText,
                targetType === 'count' && styles.optionButtonTextActive,
              ]}
            >
              Count
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.optionButton,
              targetType === 'sum' && styles.optionButtonActive,
            ]}
            onPress={() => setTargetType('sum')}
          >
            <Text
              style={[
                styles.optionButtonText,
                targetType === 'sum' && styles.optionButtonTextActive,
              ]}
            >
              Sum
            </Text>
          </Pressable>
        </View>

        <FormField
          label="Target Value"
          placeholder="e.g. 4 or 30"
          value={targetValue}
          onChangeText={setTargetValue}
          keyboardType="numeric"
        />

        <Pressable style={styles.primaryButton} onPress={handleCreateTarget}>
          <Text style={styles.primaryButtonText}>Add Target</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Your Targets</Text>

        {targets.length === 0 ? (
          <Text style={styles.emptyText}>No targets yet.</Text>
        ) : (
          targets.map((target) => {
            const progress = targetProgressMap[target.id];

            return (
              <View key={target.id} style={styles.targetItem}>
                <Text style={styles.listTitle}>
                  {target.habit_title ?? `Habit ID: ${target.habit_id}`}
                </Text>

                <Text style={styles.listSubtitle}>
                  Period: {target.period_type} · Type: {target.target_type}
                </Text>

                <Text style={styles.listSubtitle}>
                  Progress: {progress ? progress.progress : 0} / {target.target_value}
                </Text>

                {progress?.status === 'exceeded' ? (
                  <Text style={styles.listSubtitle}>
                    Exceeded by: {progress.exceededBy}
                  </Text>
                ) : (
                  <Text style={styles.listSubtitle}>
                    Remaining: {progress ? progress.remaining : target.target_value}
                  </Text>
                )}

                <Text
                  style={[
                    styles.listSubtitle,
                    progress?.status === 'met' && styles.statusMet,
                    progress?.status === 'exceeded' && styles.statusExceeded,
                    (!progress || progress.status === 'unmet') &&
                      styles.statusUnmet,
                  ]}
                >
                  Status: {progress ? progress.status : 'unmet'}
                </Text>

                {progress ? (
                  <View style={styles.progressBarBackground}>
                    <View
                      style={[
                        styles.progressBarFill,
                        { width: `${progress.percent}%` },
                      ]}
                    />
                  </View>
                ) : null}

                <Pressable
                  style={styles.smallDeleteButton}
                  onPress={() => handleDeleteTarget(target.id)}
                >
                  <Text style={styles.smallDeleteButtonText}>Delete Target</Text>
                </Pressable>
              </View>
            );
          })
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Insights</Text>

        <View style={styles.insightRow}>
          <View style={styles.insightBox}>
            <Text style={styles.insightNumber}>{insightSummary.todayCount}</Text>
            <Text style={styles.insightLabel}>Today</Text>
          </View>

          <View style={styles.insightBox}>
            <Text style={styles.insightNumber}>{insightSummary.weekCount}</Text>
            <Text style={styles.insightLabel}>This Week</Text>
          </View>

          <View style={styles.insightBox}>
            <Text style={styles.insightNumber}>{insightSummary.monthCount}</Text>
            <Text style={styles.insightLabel}>This Month</Text>
          </View>
        </View>

        <Text style={styles.chartTitle}>Last 7 Days</Text>

        <View style={styles.chartContainer}>
          {chartData.map((item) => {
            const barHeight = (item.total / maxChartValue) * 120;

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
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 10,
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
  logItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  targetItem: {
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
  progressBarBackground: {
    height: 10,
    backgroundColor: '#e5e7eb',
    borderRadius: 999,
    marginTop: 10,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#2563eb',
    borderRadius: 999,
  },
  statusMet: {
    color: '#16a34a',
    fontWeight: '600',
  },
  statusExceeded: {
    color: '#2563eb',
    fontWeight: '600',
  },
  statusUnmet: {
    color: '#dc2626',
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
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
  insightRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 20,
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
  chartTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    color: '#111827',
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    minHeight: 170,
    gap: 8,
  },
  chartItem: {
    flex: 1,
    alignItems: 'center',
  },
  chartBarArea: {
    height: 120,
    justifyContent: 'flex-end',
    marginBottom: 6,
  },
  chartBar: {
    width: 22,
    maxWidth: 22,
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