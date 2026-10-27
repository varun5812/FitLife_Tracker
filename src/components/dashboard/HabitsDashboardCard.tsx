import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useApp } from '../../context/AppContext';
import { BorderRadius, Spacing, Typography } from '../../constants/theme';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Habit } from '../../types';
import { getHabitsWithStatus, toggleHabit } from '../../services/habitService';
import * as Haptics from 'expo-haptics';

export const HabitsDashboardCard: React.FC = () => {
  const router = useRouter();
  const { colors } = useTheme();
  const { currentDate, refreshKey, refreshData } = useApp();
  const [habits, setHabits] = useState<Habit[]>([]);

  useEffect(() => {
    getHabitsWithStatus(currentDate).then(setHabits);
  }, [currentDate, refreshKey]);

  const handleToggle = async (habitId: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await toggleHabit(habitId, currentDate);
    await refreshData();
  };

  const completedCount = habits.filter(h => h.completed_today).length;

  return (
    <Card
      onPress={() => router.push('/(tabs)/time')}
      style={styles.card}
    >
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={[styles.iconWrapper, { backgroundColor: colors.habitGlow }]}>
            <Ionicons name="flame-outline" size={20} color={colors.habit} />
          </View>
          <View>
            <Text style={[Typography.subtextBold, { color: colors.textSecondary }]}>HABITS</Text>
            <Text style={[Typography.h3, { color: colors.text }]}>Daily Rituals</Text>
          </View>
        </View>

        <Badge
          label={`${completedCount}/${habits.length} Done`}
          color={completedCount === habits.length && habits.length > 0 ? colors.fitness : colors.habit}
        />
      </View>

      {habits.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.habitsScroll}
        >
          {habits.map(habit => {
            const isDone = habit.completed_today;
            return (
              <TouchableOpacity
                key={habit.id}
                activeOpacity={0.7}
                onPress={() => handleToggle(habit.id)}
                style={[
                  styles.habitChip,
                  {
                    backgroundColor: isDone ? `${colors.habit}20` : colors.cardSecondary,
                    borderColor: isDone ? colors.habit : colors.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.habitIconCircle,
                    { backgroundColor: isDone ? colors.habit : colors.card },
                  ]}
                >
                  <Ionicons
                    name={isDone ? 'checkmark' : 'flame'}
                    size={14}
                    color={isDone ? '#FFF' : colors.habit}
                  />
                </View>
                <View>
                  <Text
                    style={[
                      Typography.caption,
                      { color: isDone ? colors.text : colors.textSecondary, fontWeight: '700' },
                    ]}
                  >
                    {habit.name}
                  </Text>
                  <Text style={[Typography.caption, { color: colors.habit, fontSize: 10 }]}>
                    🔥 {habit.current_streak || 0} streak
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={[Typography.subtext, { color: colors.textSecondary }]}>
            No habits created yet. Build consistent routines!
          </Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/time')}>
            <Text style={[Typography.subtextBold, { color: colors.habit }]}>Add Habit +</Text>
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
  habitsScroll: {
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  habitChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    gap: Spacing.sm,
  },
  habitIconCircle: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs,
  },
});
