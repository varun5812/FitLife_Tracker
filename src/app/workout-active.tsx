import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { BorderRadius, Spacing, Typography } from '../constants/theme';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Exercise, WorkoutExercise } from '../types';
import { getExercises, createWorkout } from '../services/workoutService';
import * as Haptics from 'expo-haptics';

interface ActiveExerciseItem {
  exercise_id: number;
  exercise_name: string;
  category: string;
  sets: { setNum: number; weight: string; reps: string; completed: boolean }[];
  restTimeSeconds: number;
}

export default function WorkoutActiveScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { colors } = useTheme();
  const { currentDate, refreshData } = useApp();

  const [workoutName, setWorkoutName] = useState<string>((params.template as string) || 'Push Session');
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);

  // Active exercises in current session
  const [sessionExercises, setSessionExercises] = useState<ActiveExerciseItem[]>([]);

  // Rest Timer State
  const [restSecondsRemaining, setRestSecondsRemaining] = useState<number>(0);
  const [restTimerTotal, setRestTimerTotal] = useState<number>(60);
  const [isRestActive, setIsRestActive] = useState<boolean>(false);

  // Exercise Selector Modal
  const [isExerciseModalVisible, setIsExerciseModalVisible] = useState<boolean>(false);
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const stopwatchInterval = useRef<any>(null);
  const restInterval = useRef<any>(null);

  // Initialize stopwatch
  useEffect(() => {
    stopwatchInterval.current = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);

    return () => clearInterval(stopwatchInterval.current);
  }, []);

  // Rest Timer Countdown
  useEffect(() => {
    if (isRestActive && restSecondsRemaining > 0) {
      restInterval.current = setInterval(() => {
        setRestSecondsRemaining(prev => {
          if (prev <= 1) {
            clearInterval(restInterval.current);
            setIsRestActive(false);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(restInterval.current);
    }

    return () => clearInterval(restInterval.current);
  }, [isRestActive, restSecondsRemaining]);

  // Load exercises for picker
  useEffect(() => {
    getExercises(selectedCategory).then(setAvailableExercises);
  }, [selectedCategory]);

  // If template is passed, pre-populate default exercises
  useEffect(() => {
    if (params.template && sessionExercises.length === 0) {
      getExercises('All').then(all => {
        const title = (params.template as string).toLowerCase();
        let matched: Exercise[] = [];
        if (title.includes('chest')) {
          matched = all.filter(e => e.category === 'Chest' || e.name.includes('Tricep')).slice(0, 4);
        } else if (title.includes('back')) {
          matched = all.filter(e => e.category === 'Back' || e.name.includes('Bicep')).slice(0, 4);
        } else if (title.includes('leg')) {
          matched = all.filter(e => e.category === 'Legs' || e.category === 'Core').slice(0, 4);
        } else {
          matched = all.slice(0, 3);
        }

        const initialList: ActiveExerciseItem[] = matched.map(ex => ({
          exercise_id: ex.id,
          exercise_name: ex.name,
          category: ex.category,
          restTimeSeconds: 60,
          sets: [
            { setNum: 1, weight: '60', reps: '10', completed: false },
            { setNum: 2, weight: '60', reps: '10', completed: false },
            { setNum: 3, weight: '60', reps: '10', completed: false },
          ],
        }));
        setSessionExercises(initialList);
      });
    }
  }, [params.template]);

  const addExerciseToSession = (ex: Exercise) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSessionExercises(prev => [
      ...prev,
      {
        exercise_id: ex.id,
        exercise_name: ex.name,
        category: ex.category,
        restTimeSeconds: 60,
        sets: [
          { setNum: 1, weight: '50', reps: '10', completed: false },
          { setNum: 2, weight: '50', reps: '10', completed: false },
          { setNum: 3, weight: '50', reps: '10', completed: false },
        ],
      },
    ]);
    setIsExerciseModalVisible(false);
  };

  const addSet = (exerciseIndex: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSessionExercises(prev => {
      const updated = [...prev];
      const currentSets = updated[exerciseIndex].sets;
      const lastSet = currentSets[currentSets.length - 1];
      currentSets.push({
        setNum: currentSets.length + 1,
        weight: lastSet ? lastSet.weight : '50',
        reps: lastSet ? lastSet.reps : '10',
        completed: false,
      });
      return updated;
    });
  };

  const toggleSetComplete = (exerciseIndex: number, setIndex: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSessionExercises(prev => {
      const updated = [...prev];
      const targetSet = updated[exerciseIndex].sets[setIndex];
      targetSet.completed = !targetSet.completed;

      // If completing set, trigger rest timer automatically!
      if (targetSet.completed) {
        setRestTimerTotal(60);
        setRestSecondsRemaining(60);
        setIsRestActive(true);
      }
      return updated;
    });
  };

  const updateSetField = (
    exerciseIndex: number,
    setIndex: number,
    field: 'weight' | 'reps',
    value: string
  ) => {
    setSessionExercises(prev => {
      const updated = [...prev];
      updated[exerciseIndex].sets[setIndex][field] = value;
      return updated;
    });
  };

  const removeExercise = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSessionExercises(prev => prev.filter((_, idx) => idx !== index));
  };

  const formatStopwatch = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleFinishWorkout = async () => {
    if (sessionExercises.length === 0) {
      Alert.alert('Empty Workout', 'Please add at least one exercise before saving.');
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const durationMinutes = Math.max(1, Math.round(elapsedSeconds / 60));
    // Estimate calories burned (~6.5 kcal per minute of strength training)
    const estimatedCalories = Math.round(durationMinutes * 6.5);

    const formattedExercises: Omit<WorkoutExercise, 'id' | 'workout_id'>[] = sessionExercises.map(ex => {
      const completedSets = ex.sets.filter(s => s.completed);
      const activeSets = completedSets.length > 0 ? completedSets : ex.sets;
      const avgWeight = activeSets.reduce((sum, s) => sum + (parseFloat(s.weight) || 0), 0) / activeSets.length;
      const avgReps = Math.round(
        activeSets.reduce((sum, s) => sum + (parseInt(s.reps, 10) || 0), 0) / activeSets.length
      );

      return {
        exercise_id: ex.exercise_id,
        exercise_name: ex.exercise_name,
        sets: activeSets.length,
        reps: avgReps || 10,
        weight: avgWeight || 0,
        rest_time_seconds: ex.restTimeSeconds || 60,
        completed: 1,
      };
    });

    await createWorkout(
      workoutName.trim() || 'Workout Session',
      currentDate,
      durationMinutes,
      estimatedCalories,
      formattedExercises
    );

    await refreshData();
    Alert.alert('Workout Saved! 🏆', `Great job! You crushed ${durationMinutes} minutes.`);
    router.back();
  };

  const categories = ['All', 'Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core', 'Cardio'];

  return (
    <SafeAreaView edges={['top', 'bottom']} style={[styles.container, { backgroundColor: 'transparent' }]}>
      {/* Active Workout Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          onPress={() => {
            Alert.alert('Discard Workout?', 'Are you sure you want to exit without saving?', [
              { text: 'Keep Training', style: 'cancel' },
              { text: 'Discard', style: 'destructive', onPress: () => router.back() },
            ]);
          }}
          style={styles.closeBtn}
        >
          <Ionicons name="chevron-down" size={26} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.timerBadge}>
          <Ionicons name="time" size={16} color={colors.fitness} />
          <Text style={[Typography.bodyBold, { color: colors.fitness, marginLeft: 4 }]}>
            {formatStopwatch(elapsedSeconds)}
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleFinishWorkout}
          style={[styles.finishBtn, { backgroundColor: colors.fitness }]}
        >
          <Text style={[Typography.caption, { color: '#FFF', fontWeight: '700' }]}>Finish 🏁</Text>
        </TouchableOpacity>
      </View>

      {/* Rest Timer Floating Banner (when active) */}
      {isRestActive && (
        <View style={[styles.restBanner, { backgroundColor: colors.cardSecondary, borderColor: colors.fitness }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="timer-outline" size={20} color={colors.fitness} />
            <Text style={[Typography.bodyBold, { color: colors.text, marginLeft: Spacing.sm }]}>
              REST TIMER: {restSecondsRemaining}s
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setIsRestActive(false)}
            style={[styles.skipRestBtn, { borderColor: colors.border }]}
          >
            <Text style={[Typography.caption, { color: colors.textSecondary }]}>Skip</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Workout Name Input */}
        <TextInput
          style={[styles.titleInput, { color: colors.text }]}
          value={workoutName}
          onChangeText={setWorkoutName}
          placeholder="Workout Name"
          placeholderTextColor={colors.textMuted}
        />

        {/* Exercises List */}
        {sessionExercises.map((exItem, exIdx) => (
          <Card key={exIdx} style={styles.exerciseCard}>
            <View style={styles.exerciseHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[Typography.h3, { color: colors.text }]}>{exItem.exercise_name}</Text>
                <Badge label={exItem.category} color={colors.fitness} style={{ marginTop: 2 }} />
              </View>

              <TouchableOpacity onPress={() => removeExercise(exIdx)} style={{ padding: Spacing.xs }}>
                <Ionicons name="trash-outline" size={18} color={colors.error} />
              </TouchableOpacity>
            </View>

            {/* Sets Header */}
            <View style={styles.setsHeaderRow}>
              <Text style={[Typography.caption, { color: colors.textSecondary, width: 40 }]}>SET</Text>
              <Text style={[Typography.caption, { color: colors.textSecondary, flex: 1, textAlign: 'center' }]}>
                KG
              </Text>
              <Text style={[Typography.caption, { color: colors.textSecondary, flex: 1, textAlign: 'center' }]}>
                REPS
              </Text>
              <Text style={[Typography.caption, { color: colors.textSecondary, width: 40, textAlign: 'center' }]}>
                DONE
              </Text>
            </View>

            {/* Sets Rows */}
            {exItem.sets.map((set, sIdx) => (
              <View
                key={sIdx}
                style={[
                  styles.setRow,
                  set.completed && { backgroundColor: `${colors.fitness}12`, borderRadius: BorderRadius.md },
                ]}
              >
                <Text style={[Typography.bodyBold, { color: colors.text, width: 40 }]}>{set.setNum}</Text>

                <TextInput
                  style={[
                    styles.setInput,
                    { backgroundColor: colors.cardSecondary, borderColor: colors.border, color: colors.text },
                  ]}
                  value={set.weight}
                  onChangeText={val => updateSetField(exIdx, sIdx, 'weight', val)}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={colors.textMuted}
                />

                <TextInput
                  style={[
                    styles.setInput,
                    { backgroundColor: colors.cardSecondary, borderColor: colors.border, color: colors.text },
                  ]}
                  value={set.reps}
                  onChangeText={val => updateSetField(exIdx, sIdx, 'reps', val)}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={colors.textMuted}
                />

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => toggleSetComplete(exIdx, sIdx)}
                  style={[
                    styles.setCheckBtn,
                    {
                      borderColor: colors.fitness,
                      backgroundColor: set.completed ? colors.fitness : 'transparent',
                    },
                  ]}
                >
                  {set.completed ? <Ionicons name="checkmark" size={16} color="#FFF" /> : null}
                </TouchableOpacity>
              </View>
            ))}

            <Button
              title="+ Add Set"
              onPress={() => addSet(exIdx)}
              variant="outline"
              size="sm"
              style={{ marginTop: Spacing.sm }}
            />
          </Card>
        ))}

        {/* Add Exercise Button */}
        <Button
          title="+ Add Exercise"
          onPress={() => setIsExerciseModalVisible(true)}
          style={{ marginVertical: Spacing.lg, backgroundColor: colors.fitness }}
        />

        <View style={{ height: Spacing.xxxl }} />
      </ScrollView>

      {/* Exercise Picker Modal */}
      <Modal visible={isExerciseModalVisible} animationType="slide" transparent={false}>
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[Typography.h2, { color: colors.text }]}>Select Exercise</Text>
            <TouchableOpacity
              onPress={() => setIsExerciseModalVisible(false)}
              style={[styles.closeBtn, { backgroundColor: colors.cardSecondary }]}
            >
              <Ionicons name="close" size={22} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Search Box */}
          <View style={[styles.searchBox, { backgroundColor: colors.cardSecondary, borderColor: colors.border }]}>
            <Ionicons name="search" size={18} color={colors.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search exercise..."
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Muscle Categories */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catsRow}>
            {categories.map(cat => (
              <TouchableOpacity
                key={cat}
                onPress={() => setSelectedCategory(cat)}
                style={[
                  styles.catPill,
                  {
                    backgroundColor: selectedCategory === cat ? colors.fitness : colors.cardSecondary,
                    borderColor: selectedCategory === cat ? colors.fitness : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    Typography.caption,
                    { color: selectedCategory === cat ? '#FFF' : colors.text, fontWeight: '700' },
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Exercises List */}
          <ScrollView contentContainerStyle={styles.exerciseListContent}>
            {availableExercises
              .filter(e => e.name.toLowerCase().includes(searchQuery.toLowerCase()))
              .map(ex => (
                <TouchableOpacity
                  key={ex.id}
                  activeOpacity={0.7}
                  onPress={() => addExerciseToSession(ex)}
                  style={[styles.exercisePickRow, { backgroundColor: colors.card, borderColor: colors.border }]}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[Typography.bodyBold, { color: colors.text }]}>{ex.name}</Text>
                    <Text style={[Typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
                      {ex.category} {ex.description ? `• ${ex.description}` : ''}
                    </Text>
                  </View>
                  <Ionicons name="add-circle" size={24} color={colors.fitness} />
                </TouchableOpacity>
              ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  closeBtn: {
    padding: Spacing.xs,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  finishBtn: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  restBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  skipRestBtn: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: '700',
    marginVertical: Spacing.md,
  },
  exerciseCard: {
    marginBottom: Spacing.md,
    padding: Spacing.md,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  setsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: '#243046',
    marginBottom: Spacing.xs,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    gap: Spacing.sm,
  },
  setInput: {
    flex: 1,
    height: 38,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '600',
  },
  setCheckBtn: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    height: 46,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontSize: 14,
  },
  catsRow: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.xs,
    paddingBottom: Spacing.sm,
  },
  catPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  exerciseListContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.xs,
    paddingBottom: Spacing.xxl,
  },
  exercisePickRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
});
