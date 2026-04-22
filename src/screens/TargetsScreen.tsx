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
  getHabitsForActiveUser,
  initHabitTable,
  Habit,
} from '../utils/habits';
import FormField from '../components/FormField';

export default function TargetsScreen() {
  const [selectedHabitId, setSelectedHabitId] = useState<number | null>(null);
  const [targetPeriodType, setTargetPeriodType] = useState('weekly');
  const [targetType, setTargetType] = useState('count');
  const [targetValue, setTargetValue] = useState('');
  const [targets, setTargets] = useState<Target[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [targetProgressMap, setTargetProgressMap] = useState<
    Record<number, TargetProgress>
  >({});

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

  const loadHabits = async () => {
    const data = await getHabitsForActiveUser();
    setHabits(data);
  };

  useEffect(() => {
    const setup = async () => {
      await initTargetTable();
      await initHabitTable();
      await loadTargets();
      await loadHabits();
    };
    setup();
  }, []);

  const selectedHabit = useMemo(
    () => habits.find((habit) => habit.id === selectedHabitId) ?? null,
    [habits, selectedHabitId]
  );

  useEffect(() => {
    if (selectedHabit?.habit_type === 'boolean') {
      setTargetType('count');
    }
  }, [selectedHabit]);

  const handleCreateTarget = async () => {
    try {
      if (!selectedHabitId) {
        throw new Error('Please choose a habit.');
      }

      const cleanedPeriodType = targetPeriodType.trim().toLowerCase();
      const cleanedTargetType = targetType.trim().toLowerCase();

      if (cleanedPeriodType !== 'weekly' && cleanedPeriodType !== 'monthly') {
        throw new Error('Period type must be weekly or monthly.');
      }

      if (cleanedTargetType !== 'count' && cleanedTargetType !== 'sum') {
        throw new Error('Target type must be count or sum.');
      }

      await createTarget(
        selectedHabitId,
        cleanedPeriodType,
        cleanedTargetType,
        Number(targetValue)
      );

      setSelectedHabitId(null);
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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Targets</Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Create Target</Text>

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
              Tracking: {selectedHabit.habit_type === 'boolean' ? 'Yes / No' : 'Number'}
            </Text>
            <Text style={styles.helperText}>
              Unit: {selectedHabit.habit_type === 'boolean' ? 'Completed' : selectedHabit.unit}
            </Text>
          </View>
        ) : null}

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

        {selectedHabit?.habit_type === 'count' ? (
          <>
            <Text style={styles.label}>Tracking Goal</Text>
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
                  Number of times
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
                  Total amount
                </Text>
              </Pressable>
            </View>
          </>
        ) : (
          <View style={styles.helperBox}>
            <Text style={styles.helperText}>
              This target will count how many times the habit was completed.
            </Text>
          </View>
        )}

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
                  Period: {target.period_type} · Goal:{' '}
                  {target.target_type === 'count' ? 'Number of times' : 'Total amount'}
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