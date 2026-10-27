import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { BorderRadius, Spacing, Typography } from '../../constants/theme';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { DailySummary } from '../../types';

interface FitnessDashboardCardProps {
  summary: DailySummary | null;
}

export const FitnessDashboardCard: React.FC<FitnessDashboardCardProps> = ({ summary }) => {
  const router = useRouter();
  const { colors } = useTheme();

  const workout = summary?.workout;
  const hasWorkout = workout && workout.count > 0;

  return (
    <Card
      onPress={() => router.push('/(tabs)/fitness')}
      style={styles.card}
    >
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={[styles.iconWrapper, { backgroundColor: colors.fitnessGlow }]}>
            <Ionicons name="barbell-outline" size={20} color={colors.fitness} />
          </View>
          <View>
            <Text style={[Typography.subtextBold, { color: colors.textSecondary }]}>FITNESS</Text>
            <Text style={[Typography.h3, { color: colors.text }]}>Today's Workout</Text>
          </View>
        </View>

        {hasWorkout ? (
          <Badge label="Completed" color={colors.fitness} />
        ) : (
          <Badge label="Pending" color={colors.textSecondary} />
        )}
      </View>

      {hasWorkout ? (
        <View style={styles.statsContainer}>
          <Text style={[Typography.bodyBold, { color: colors.text, marginBottom: Spacing.xs }]}>
            {workout.latestWorkoutName || 'Strength Session'}
          </Text>
          <View style={styles.metricsRow}>
            <View style={styles.metric}>
              <Ionicons name="time-outline" size={15} color={colors.fitness} />
              <Text style={[Typography.subtextBold, { color: colors.text, marginLeft: 4 }]}>
                {workout.durationMinutes} min
              </Text>
            </View>
            <View style={styles.metric}>
              <Ionicons name="flame-outline" size={15} color={colors.nutrition} />
              <Text style={[Typography.subtextBold, { color: colors.text, marginLeft: 4 }]}>
                {workout.caloriesBurned} kcal
              </Text>
            </View>
            <View style={styles.metric}>
              <Ionicons name="checkmark-done-circle-outline" size={15} color={colors.fitness} />
              <Text style={[Typography.subtextBold, { color: colors.text, marginLeft: 4 }]}>
                {workout.count} logged
              </Text>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={[Typography.subtext, { color: colors.textSecondary }]}>
            No workout logged yet today. Push your limits!
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/fitness')}
            style={[styles.actionLink, { borderColor: colors.fitness }]}
          >
            <Text style={[Typography.subtextBold, { color: colors.fitness }]}>Start Workout +</Text>
          </TouchableOpacity>
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsContainer: {
    marginTop: Spacing.xs,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    marginTop: 4,
  },
  metric: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
  },
  actionLink: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
});
