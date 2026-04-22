import { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, ScrollView } from 'react-native';
import { createTarget, deleteTarget, getTargetsForActiveUser, initTargetTable, Target } from '../utils/targets';
import { calculateTargetProgress, TargetProgress } from '../utils/targetProgress';
import { getHabitsForActiveUser, initHabitTable, Habit } from '../utils/habits';
import FormField from '../components/FormField';
import { g, lightColors, darkColors } from '../styles/GlobalStyles';
import { useTheme } from '../context/ThemeContext';

export default function TargetsScreen() {
  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkColors : lightColors;

  const [selectedHabitId, setSelectedHabitId] = useState<number | null>(null);
  const [targetPeriodType, setTargetPeriodType] = useState('weekly');
  const [targetType, setTargetType] = useState('count');
  const [targetValue, setTargetValue] = useState('');
  const [targets, setTargets] = useState<Target[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [targetProgressMap, setTargetProgressMap] = useState<Record<number, TargetProgress>>({});

  const loadTargets = async () => {
    const data = await getTargetsForActiveUser();
    setTargets(data);
    const entries = await Promise.all(
      data.map(async (t) => [t.id, await calculateTargetProgress(t)] as const)
    );
    setTargetProgressMap(Object.fromEntries(entries));
  };

  const loadHabits = async () => {
    setHabits(await getHabitsForActiveUser());
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
    () => habits.find((h) => h.id === selectedHabitId) ?? null,
    [habits, selectedHabitId]
  );

  useEffect(() => {
    if (selectedHabit?.habit_type === 'boolean') setTargetType('count');
  }, [selectedHabit]);

  const handleCreateTarget = async () => {
    try {
      if (!selectedHabitId) throw new Error('Please choose a habit.');

      const pt = targetPeriodType.trim().toLowerCase();
      const tt = targetType.trim().toLowerCase();

      if (pt !== 'weekly' && pt !== 'monthly') throw new Error('Invalid period type.');
      if (tt !== 'count' && tt !== 'sum') throw new Error('Invalid target type.');

      await createTarget(selectedHabitId, pt, tt, Number(targetValue));
      setSelectedHabitId(null);
      setTargetPeriodType('weekly');
      setTargetType('count');
      setTargetValue('');
      await loadTargets();
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Could not create target.');
    }
  };

  const handleDeleteTarget = (targetId: number) => {
    Alert.alert('Delete Target', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteTarget(targetId);
            await loadTargets();
          } catch (error) {
            Alert.alert('Error', error instanceof Error ? error.message : 'Could not delete.');
          }
        },
      },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[g.pageTitle, { color: colors.black }]}>Targets</Text>

      <View style={[g.section, { borderTopColor: colors.border }]}>
        <Text style={[g.sectionTitle, { color: colors.black }]}>New Target</Text>

        <Text style={[g.label, { color: colors.black }]}>Habit</Text>
        {habits.length === 0 ? (
          <Text style={[g.emptyText, { color: colors.black }]}>
            No habits yet. Create a habit first.
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

        <Text style={[g.label, { color: colors.black }]}>Period</Text>
        <View style={g.toggleRow}>
          <Pressable
            style={[
              g.toggleBtn,
              { borderColor: colors.border, backgroundColor: colors.white },
              targetPeriodType === 'weekly' && g.toggleBtnActive,
            ]}
            onPress={() => setTargetPeriodType('weekly')}
            accessibilityLabel="Weekly"
            accessibilityRole="button"
          >
            <Text
              style={[
                g.toggleBtnText,
                { color: colors.black },
                targetPeriodType === 'weekly' && g.toggleBtnTextActive,
              ]}
            >
              Weekly
            </Text>
          </Pressable>

          <Pressable
            style={[
              g.toggleBtn,
              { borderColor: colors.border, backgroundColor: colors.white },
              targetPeriodType === 'monthly' && g.toggleBtnActive,
            ]}
            onPress={() => setTargetPeriodType('monthly')}
            accessibilityLabel="Monthly"
            accessibilityRole="button"
          >
            <Text
              style={[
                g.toggleBtnText,
                { color: colors.black },
                targetPeriodType === 'monthly' && g.toggleBtnTextActive,
              ]}
            >
              Monthly
            </Text>
          </Pressable>
        </View>

        {selectedHabit?.habit_type === 'count' ? (
          <>
            <Text style={[g.label, { color: colors.black }]}>Goal Type</Text>
            <View style={g.toggleRow}>
              <Pressable
                style={[
                  g.toggleBtn,
                  { borderColor: colors.border, backgroundColor: colors.white },
                  targetType === 'count' && g.toggleBtnActive,
                ]}
                onPress={() => setTargetType('count')}
                accessibilityLabel="Number of times"
                accessibilityRole="button"
              >
                <Text
                  style={[
                    g.toggleBtnText,
                    { color: colors.black },
                    targetType === 'count' && g.toggleBtnTextActive,
                  ]}
                >
                  No. of times
                </Text>
              </Pressable>

              <Pressable
                style={[
                  g.toggleBtn,
                  { borderColor: colors.border, backgroundColor: colors.white },
                  targetType === 'sum' && g.toggleBtnActive,
                ]}
                onPress={() => setTargetType('sum')}
                accessibilityLabel="Total amount"
                accessibilityRole="button"
              >
                <Text
                  style={[
                    g.toggleBtnText,
                    { color: colors.black },
                    targetType === 'sum' && g.toggleBtnTextActive,
                  ]}
                >
                  Total amount
                </Text>
              </Pressable>
            </View>
          </>
        ) : null}

        <FormField
          label="Target Value"
          placeholder="e.g. 5 or 30"
          value={targetValue}
          onChangeText={setTargetValue}
          keyboardType="numeric"
        />

        <Pressable
          style={g.primaryButton}
          onPress={handleCreateTarget}
          accessibilityLabel="Add target"
          accessibilityRole="button"
        >
          <Text style={g.primaryButtonText}>Add Target</Text>
        </Pressable>
      </View>

      <View style={[g.section, { borderTopColor: colors.border }]}>
        <Text style={[g.sectionTitle, { color: colors.black }]}>Your Targets</Text>

        {targets.length === 0 ? (
          <Text style={[g.emptyText, { color: colors.black }]}>No targets yet.</Text>
        ) : (
          targets.map((target) => {
            const progress = targetProgressMap[target.id];

            return (
              <View key={target.id} style={[g.listItem, { borderBottomColor: colors.border }]}>
                <Text style={[g.listTitle, { color: colors.black }]}>
                  {target.habit_title ?? `Habit #${target.habit_id}`}
                </Text>

                <Text style={[g.bodyText, { color: colors.black }]}>
                  {target.period_type} ·{' '}
                  {target.target_type === 'count' ? 'No. of times' : 'Total amount'}
                </Text>

                <Text style={[g.bodyText, { color: colors.black }]}>
                  Progress: {progress ? progress.progress : 0} / {target.target_value}
                </Text>

                {progress?.status === 'exceeded' ? (
                  <Text style={[g.bodyText, { color: colors.black }]}>
                    Exceeded by: {progress.exceededBy}
                  </Text>
                ) : (
                  <Text style={[g.bodyText, { color: colors.black }]}>
                    Remaining: {progress ? progress.remaining : target.target_value}
                  </Text>
                )}

                <Text
                  style={[
                    g.bodyText,
                    progress?.status === 'met' && g.statusMet,
                    progress?.status === 'exceeded' && g.statusExceeded,
                    (!progress || progress.status === 'unmet') && g.statusUnmet,
                  ]}
                >
                  Status: {progress ? progress.status : 'unmet'}
                </Text>

                {progress ? (
                  <View style={[g.progressBg, { backgroundColor: colors.progressBg }]}>
                    <View style={[g.progressFill, { width: `${progress.percent}%` as any }]} />
                  </View>
                ) : null}

                <Pressable
                  style={[g.smallDangerButton, { marginTop: 10, alignSelf: 'flex-start' }]}
                  onPress={() => handleDeleteTarget(target.id)}
                  accessibilityLabel={`Delete target for ${target.habit_title}`}
                  accessibilityRole="button"
                >
                  <Text style={g.smallDangerButtonText}>Delete</Text>
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
    padding: 16,
  },
});