import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useApp } from '../../context/AppContext';
import { BorderRadius, Spacing, Typography } from '../../constants/theme';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { toggleTask } from '../../services/taskService';
import * as Haptics from 'expo-haptics';

export const ScheduleDashboardCard: React.FC = () => {
  const router = useRouter();
  const { colors } = useTheme();
  const { todaySummary, refreshData } = useApp();

  const currentActivity = todaySummary?.schedule?.currentActivity;
  const nextActivity = todaySummary?.schedule?.nextActivity;
  const upcomingTask = todaySummary?.tasks?.upcoming;

  const handleToggleTask = async (id: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await toggleTask(id);
    await refreshData();
  };

  return (
    <Card
      onPress={() => router.push('/(tabs)/time')}
      style={styles.card}
    >
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={[styles.iconWrapper, { backgroundColor: colors.timeGlow }]}>
            <Ionicons name="calendar-outline" size={20} color={colors.time} />
          </View>
          <View>
            <Text style={[Typography.subtextBold, { color: colors.textSecondary }]}>SCHEDULE & TASKS</Text>
            <Text style={[Typography.h3, { color: colors.text }]}>Today's Focus</Text>
          </View>
        </View>

        <TouchableOpacity onPress={() => router.push('/(tabs)/time')}>
          <Text style={[Typography.subtextBold, { color: colors.time }]}>View All →</Text>
        </TouchableOpacity>
      </View>

      {/* Current / Next Activity */}
      {currentActivity ? (
        <View style={[styles.activityRow, { backgroundColor: colors.cardSecondary, borderColor: colors.border }]}>
          <View style={styles.timeTag}>
            <Text style={[Typography.caption, { color: colors.time, fontWeight: '700' }]}>
              NOW ({currentActivity.start_time} - {currentActivity.end_time})
            </Text>
          </View>
          <Text style={[Typography.bodyBold, { color: colors.text, marginTop: 2 }]}>
            {currentActivity.title}
          </Text>
        </View>
      ) : nextActivity ? (
        <View style={[styles.activityRow, { backgroundColor: colors.cardSecondary, borderColor: colors.border }]}>
          <View style={styles.timeTag}>
            <Text style={[Typography.caption, { color: colors.textSecondary, fontWeight: '700' }]}>
              NEXT AT {nextActivity.start_time}
            </Text>
          </View>
          <Text style={[Typography.bodyBold, { color: colors.text, marginTop: 2 }]}>
            {nextActivity.title}
          </Text>
        </View>
      ) : null}

      {/* Top Upcoming Task */}
      {upcomingTask ? (
        <View style={[styles.taskRow, { borderColor: colors.border }]}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => handleToggleTask(upcomingTask.id)}
            style={[
              styles.checkbox,
              {
                borderColor: colors.time,
                backgroundColor: upcomingTask.completed ? colors.time : 'transparent',
              },
            ]}
          >
            {upcomingTask.completed ? <Ionicons name="checkmark" size={14} color="#FFF" /> : null}
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={[Typography.bodyBold, { color: colors.text }]}>{upcomingTask.title}</Text>
            {upcomingTask.due_time && (
              <Text style={[Typography.caption, { color: colors.textSecondary }]}>
                Due by {upcomingTask.due_time}
              </Text>
            )}
          </View>
          <Badge
            label={upcomingTask.priority.toUpperCase()}
            color={
              upcomingTask.priority === 'high'
                ? colors.error
                : upcomingTask.priority === 'medium'
                ? colors.warning
                : colors.success
            }
          />
        </View>
      ) : (
        !currentActivity &&
        !nextActivity && (
          <View style={styles.emptyContainer}>
            <Text style={[Typography.subtext, { color: colors.textSecondary }]}>
              No events or pending tasks for today.
            </Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/time')}>
              <Text style={[Typography.subtextBold, { color: colors.time }]}>Add Event +</Text>
            </TouchableOpacity>
          </View>
        )
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
  activityRow: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.xs,
  },
  timeTag: {
    marginBottom: 2,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
    borderTopWidth: 1,
    marginTop: Spacing.xs,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: BorderRadius.xs,
    borderWidth: 1.5,
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
