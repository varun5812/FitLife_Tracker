import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useApp } from '../../context/AppContext';
import { BorderRadius, Spacing, Typography } from '../../constants/theme';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { Workout } from '../../types';
import { getAllWorkouts, deleteWorkout, getWorkoutStats } from '../../services/workoutService';
import * as Haptics from 'expo-haptics';

export default function FitnessScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { refreshKey, refreshData } = useApp();

  const [activeTab, setActiveTab] = useState<'workouts' | 'history' | 'stats'>('workouts');
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, [refreshKey, activeTab]);

  const loadData = async () => {
    const list = await getAllWorkouts();
    setWorkouts(list);
    const s = await getWorkoutStats();
    setStats(s);
  };

  const handleDelete = (id: number, name: string) => {
    Alert.alert('Delete Workout', `Are you sure you want to delete "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          await deleteWorkout(id);
          await refreshData();
        },
      },
    ]);
  };

  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: 'transparent' }]}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <View>
          <Text style={[Typography.subtextBold, { color: colors.fitness }]}>FITNESS TRACKER</Text>
          <Text style={[Typography.h1, { color: colors.text }]}>Workouts & Strength</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push('/exercise-library')}
          style={[styles.libraryBtn, { backgroundColor: colors.cardSecondary, borderColor: colors.border }]}
        >
          <Ionicons name="book-outline" size={18} color={colors.text} />
          <Text style={[Typography.caption, { color: colors.text, fontWeight: '700', marginLeft: 4 }]}>
            Library
          </Text>
        </TouchableOpacity>
      </View>

      {/* Segmented Tab Controls */}
      <View style={[styles.segmentContainer, { backgroundColor: colors.cardSecondary, borderColor: colors.border }, Platform.OS === 'web' && { backdropFilter: 'blur(16px)' } as any]}>
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setActiveTab('workouts');
          }}
          style={[
            styles.segmentBtn,
            activeTab === 'workouts' && { backgroundColor: colors.fitness },
          ]}
        >
          <Text
            style={[
              Typography.subtextBold,
              { color: activeTab === 'workouts' ? '#FFF' : colors.textSecondary },
            ]}
          >
            Start & Log
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setActiveTab('history');
          }}
          style={[
            styles.segmentBtn,
            activeTab === 'history' && { backgroundColor: colors.fitness },
          ]}
        >
          <Text
            style={[
              Typography.subtextBold,
              { color: activeTab === 'history' ? '#FFF' : colors.textSecondary },
            ]}
          >
            History ({workouts.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setActiveTab('stats');
          }}
          style={[
            styles.segmentBtn,
            activeTab === 'stats' && { backgroundColor: colors.fitness },
          ]}
        >
          <Text
            style={[
              Typography.subtextBold,
              { color: activeTab === 'stats' ? '#FFF' : colors.textSecondary },
            ]}
          >
            Stats & PRs
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {activeTab === 'workouts' && (
          <View style={styles.tabContent}>
            {/* Start Live Session Banner */}
            <Card variant="glow" glowColor={colors.fitnessGlow} style={styles.startBanner}>
              <View style={styles.bannerRow}>
                <View style={{ flex: 1 }}>
                  <Badge label="ACTIVE WORKOUT" color={colors.fitness} />
                  <Text style={[Typography.h2, { color: colors.text, marginTop: Spacing.xs }]}>
                    Crush Today's Session
                  </Text>
                  <Text style={[Typography.subtext, { color: colors.textSecondary, marginTop: 2 }]}>
                    Track exercises, sets, weights, reps, and live rest timers in real-time.
                  </Text>
                </View>
                <View style={[styles.bannerIconWrapper, { backgroundColor: colors.fitnessGlow }]}>
                  <Ionicons name="flash" size={28} color={colors.fitness} />
                </View>
              </View>

              <Button
                title="Start Workout Now ⚡"
                onPress={() => router.push('/workout-active')}
                style={{ marginTop: Spacing.lg, backgroundColor: colors.fitness }}
              />
            </Card>

            {/* Quick Workout Templates */}
            <Text style={[Typography.h3, { color: colors.text, marginTop: Spacing.lg, marginBottom: Spacing.sm }]}>
              Popular Workout Splits
            </Text>

            {[
              { title: 'Chest + Triceps', exercises: 'Bench Press, Incline DB Press, Cable Fly, Tricep Pushdown', duration: '45-60 min' },
              { title: 'Back + Biceps', exercises: 'Deadlift, Lat Pulldown, Barbell Row, Bicep Curls', duration: '50-65 min' },
              { title: 'Legs + Core', exercises: 'Squats, Romanian Deadlift, Leg Press, Hanging Leg Raises', duration: '50-60 min' },
              { title: 'Shoulders + Arms', exercises: 'Overhead Press, Lateral Raises, Face Pulls, Skull Crushers', duration: '45-55 min' },
              { title: 'Full Body Conditioning', exercises: 'Clean & Press, Kettlebell Swings, Burpees, Running', duration: '40 min' },
            ].map((split, index) => (
              <Card
                key={index}
                style={{ marginBottom: Spacing.sm }}
                onPress={() => router.push(`/workout-active?template=${encodeURIComponent(split.title)}`)}
              >
                <View style={styles.splitRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={[Typography.bodyBold, { color: colors.text }]}>{split.title}</Text>
                    <Text style={[Typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
                      {split.exercises}
                    </Text>
                  </View>
                  <Ionicons name="play-circle-outline" size={26} color={colors.fitness} />
                </View>
              </Card>
            ))}
          </View>
        )}

        {activeTab === 'history' && (
          <View style={styles.tabContent}>
            {workouts.length === 0 ? (
              <EmptyState
                icon="barbell-outline"
                title="No Workouts Yet"
                description="Start your first workout today to log exercises, sets, weights, and build your strength history."
                actionTitle="Start First Workout"
                onAction={() => router.push('/workout-active')}
              />
            ) : (
              workouts.map(w => (
                <Card key={w.id} style={{ marginBottom: Spacing.md }}>
                  <View style={styles.historyHeader}>
                    <View>
                      <Text style={[Typography.caption, { color: colors.fitness, fontWeight: '700' }]}>
                        {w.date}
                      </Text>
                      <Text style={[Typography.h3, { color: colors.text, marginTop: 2 }]}>{w.name}</Text>
                    </View>

                    <TouchableOpacity
                      onPress={() => handleDelete(w.id, w.name)}
                      style={styles.deleteBtn}
                    >
                      <Ionicons name="trash-outline" size={18} color={colors.error} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.metricsSummary}>
                    <View style={styles.metricItem}>
                      <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
                      <Text style={[Typography.caption, { color: colors.textSecondary, marginLeft: 4 }]}>
                        {w.duration_minutes} min
                      </Text>
                    </View>
                    <View style={styles.metricItem}>
                      <Ionicons name="flame-outline" size={14} color={colors.nutrition} />
                      <Text style={[Typography.caption, { color: colors.textSecondary, marginLeft: 4 }]}>
                        {w.calories_burned} kcal
                      </Text>
                    </View>
                    <View style={styles.metricItem}>
                      <Ionicons name="barbell-outline" size={14} color={colors.fitness} />
                      <Text style={[Typography.caption, { color: colors.textSecondary, marginLeft: 4 }]}>
                        {w.total_volume ? `${w.total_volume} kg vol` : '0 kg vol'}
                      </Text>
                    </View>
                  </View>

                  {/* Exercise details list */}
                  {w.exercises && w.exercises.length > 0 && (
                    <View style={[styles.exerciseList, { borderTopColor: colors.border }]}>
                      {w.exercises.map((ex, exIdx) => (
                        <View key={exIdx} style={styles.exerciseItemRow}>
                          <Text style={[Typography.caption, { color: colors.text, flex: 1, fontWeight: '600' }]}>
                            {ex.exercise_name}
                          </Text>
                          <Text style={[Typography.caption, { color: colors.fitness, fontWeight: '700' }]}>
                            {ex.sets} sets × {ex.reps} reps @ {ex.weight} kg
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
                </Card>
              ))
            )}
          </View>
        )}

        {activeTab === 'stats' && (
          <View style={styles.tabContent}>
            {/* KPI Cards Grid */}
            <View style={styles.kpiGrid}>
              <Card style={{ flex: 1 }}>
                <Text style={[Typography.caption, { color: colors.textSecondary }]}>TOTAL WORKOUTS</Text>
                <Text style={[Typography.h1, { color: colors.fitness, marginTop: 4 }]}>
                  {stats?.totalWorkouts || 0}
                </Text>
                <Text style={[Typography.caption, { color: colors.textMuted }]}>
                  {stats?.weeklyWorkoutsCount || 0} past 7 days
                </Text>
              </Card>

              <Card style={{ flex: 1 }}>
                <Text style={[Typography.caption, { color: colors.textSecondary }]}>TOTAL VOLUME</Text>
                <Text style={[Typography.h1, { color: colors.protein, marginTop: 4 }]}>
                  {stats?.totalVolumeKg ? `${Math.round(stats.totalVolumeKg / 1000)}k` : '0'} kg
                </Text>
                <Text style={[Typography.caption, { color: colors.textMuted }]}>Lifetime weight lifted</Text>
              </Card>
            </View>

            <View style={[styles.kpiGrid, { marginTop: Spacing.sm }]}>
              <Card style={{ flex: 1 }}>
                <Text style={[Typography.caption, { color: colors.textSecondary }]}>TIME TRAINED</Text>
                <Text style={[Typography.h2, { color: colors.accent, marginTop: 4 }]}>
                  {stats?.totalDurationMinutes ? `${Math.round(stats.totalDurationMinutes / 60)} hrs` : '0 min'}
                </Text>
                <Text style={[Typography.caption, { color: colors.textMuted }]}>Total duration</Text>
              </Card>

              <Card style={{ flex: 1 }}>
                <Text style={[Typography.caption, { color: colors.textSecondary }]}>CALORIES BURNED</Text>
                <Text style={[Typography.h2, { color: colors.nutrition, marginTop: 4 }]}>
                  {stats?.totalCaloriesBurned || 0} kcal
                </Text>
                <Text style={[Typography.caption, { color: colors.textMuted }]}>Estimated energy</Text>
              </Card>
            </View>

            {/* Personal Records Table */}
            <Text style={[Typography.h3, { color: colors.text, marginTop: Spacing.xl, marginBottom: Spacing.sm }]}>
              Personal Records (PRs) 🏆
            </Text>

            {stats?.personalRecords && stats.personalRecords.length > 0 ? (
              stats.personalRecords.map((pr: any, prIdx: number) => (
                <Card key={prIdx} style={{ marginBottom: Spacing.xs }}>
                  <View style={styles.prRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={[Typography.bodyBold, { color: colors.text }]}>{pr.exerciseName}</Text>
                      <Text style={[Typography.caption, { color: colors.textSecondary }]}>
                        Achieved on {pr.date}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={[Typography.h3, { color: colors.fitness }]}>{pr.maxWeight} kg</Text>
                      <Text style={[Typography.caption, { color: colors.textSecondary }]}>{pr.reps} reps</Text>
                    </View>
                  </View>
                </Card>
              ))
            ) : (
              <EmptyState
                icon="trophy-outline"
                title="No Personal Records Yet"
                description="Complete workouts with exercise weights to automatically calculate your personal bests."
              />
            )}
          </View>
        )}

        <View style={{ height: Spacing.xxxl }} />
      </ScrollView>
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
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  libraryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  segmentContainer: {
    flexDirection: 'row',
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.sm,
    padding: 4,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.lg,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 96,
  },
  tabContent: {
    marginTop: Spacing.sm,
  },
  startBanner: {
    padding: Spacing.lg,
  },
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bannerIconWrapper: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  splitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  deleteBtn: {
    padding: Spacing.xs,
  },
  metricsSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    marginTop: Spacing.sm,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exerciseList: {
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    gap: 6,
  },
  exerciseItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  kpiGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  prRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
