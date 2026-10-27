import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useApp } from '../../context/AppContext';
import { BorderRadius, Spacing, Typography } from '../../constants/theme';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { PomodoroDial } from '../../components/time/PomodoroDial';
import { ScheduleEvent, Task, Habit } from '../../types';
import { getScheduleEventsByDate, toggleScheduleEvent, deleteScheduleEvent } from '../../services/scheduleService';
import { getTasksByDate, toggleTask, deleteTask } from '../../services/taskService';
import { getHabitsWithStatus, toggleHabit, deleteHabit } from '../../services/habitService';
import * as Haptics from 'expo-haptics';

export default function TimeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { colors } = useTheme();
  const { currentDate, refreshKey, refreshData } = useApp();

  const [activeTab, setActiveTab] = useState<'schedule' | 'tasks' | 'focus' | 'habits'>('schedule');
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);

  useEffect(() => {
    if (params.tab === 'focus') {
      setActiveTab('focus');
    }
  }, [params.tab]);

  useEffect(() => {
    loadData();
  }, [currentDate, refreshKey, activeTab]);

  const loadData = async () => {
    const ev = await getScheduleEventsByDate(currentDate);
    setEvents(ev);
    const ts = await getTasksByDate(currentDate);
    setTasks(ts);
    const hb = await getHabitsWithStatus(currentDate);
    setHabits(hb);
  };

  const handleToggleEvent = async (id: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await toggleScheduleEvent(id);
    await refreshData();
  };

  const handleDeleteEvent = (id: number, title: string) => {
    Alert.alert('Delete Event', `Delete "${title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          await deleteScheduleEvent(id);
          await refreshData();
        },
      },
    ]);
  };

  const handleToggleTask = async (id: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await toggleTask(id);
    await refreshData();
  };

  const handleDeleteTask = (id: number, title: string) => {
    Alert.alert('Delete Task', `Delete "${title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          await deleteTask(id);
          await refreshData();
        },
      },
    ]);
  };

  const handleToggleHabit = async (id: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await toggleHabit(id, currentDate);
    await refreshData();
  };

  const handleDeleteHabit = (id: number, name: string) => {
    Alert.alert('Delete Habit', `Remove "${name}" habit?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          await deleteHabit(id);
          await refreshData();
        },
      },
    ]);
  };

  const getPriorityColor = (p: string) => {
    if (p === 'high') return colors.error;
    if (p === 'medium') return colors.warning;
    return colors.success;
  };

  const getCategoryColor = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'gym':
        return colors.fitness;
      case 'meals':
        return colors.nutrition;
      case 'work':
      case 'study':
        return colors.accent;
      case 'sleep':
        return colors.sleep;
      case 'personal':
      case 'family':
        return colors.habit;
      default:
        return colors.time;
    }
  };

  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: 'transparent' }]}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <View>
          <Text style={[Typography.subtextBold, { color: colors.time }]}>TIME & PRODUCTIVITY</Text>
          <Text style={[Typography.h1, { color: colors.text }]}>Daily Management</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            if (activeTab === 'schedule') router.push('/quick-log?type=event');
            else if (activeTab === 'tasks') router.push('/quick-log?type=task');
            else if (activeTab === 'habits') router.push('/quick-log?type=habit');
            else router.push('/quick-log?type=task');
          }}
          style={[styles.quickAddBtn, { backgroundColor: colors.time }]}
        >
          <Ionicons name="add" size={20} color="#FFF" />
          <Text style={[Typography.caption, { color: '#FFF', fontWeight: '700', marginLeft: 2 }]}>
            {activeTab === 'schedule' ? 'Event' : activeTab === 'tasks' ? 'Task' : activeTab === 'habits' ? 'Habit' : 'New'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Segmented Controls */}
      <View style={[styles.segmentContainer, { backgroundColor: colors.cardSecondary, borderColor: colors.border }, Platform.OS === 'web' && { backdropFilter: 'blur(16px)' } as any]}>
        {(['schedule', 'tasks', 'focus', 'habits'] as const).map(tab => (
          <TouchableOpacity
            key={tab}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setActiveTab(tab);
            }}
            style={[styles.segmentBtn, activeTab === tab && { backgroundColor: colors.time }]}
          >
            <Text
              style={[
                Typography.caption,
                {
                  color: activeTab === tab ? '#FFF' : colors.textSecondary,
                  fontWeight: '700',
                  textTransform: 'capitalize',
                },
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <View style={styles.tabContent}>
            {events.length === 0 ? (
              <EmptyState
                icon="calendar-outline"
                title="No Schedule Events Today"
                description="Plan your daily blocks (Work, Gym, Study, Meals, Sleep) to keep your routine structured."
                actionTitle="Add Schedule Block"
                onAction={() => router.push('/quick-log?type=event')}
              />
            ) : (
              events.map(ev => {
                const catColor = getCategoryColor(ev.category);
                return (
                  <Card key={ev.id} style={{ marginBottom: Spacing.sm }}>
                    <View style={styles.eventRow}>
                      <TouchableOpacity
                        onPress={() => handleToggleEvent(ev.id)}
                        style={[
                          styles.checkbox,
                          {
                            borderColor: catColor,
                            backgroundColor: ev.completed ? catColor : 'transparent',
                          },
                        ]}
                      >
                        {ev.completed ? <Ionicons name="checkmark" size={14} color="#FFF" /> : null}
                      </TouchableOpacity>

                      <View style={{ flex: 1 }}>
                        <Text
                          style={[
                            Typography.bodyBold,
                            {
                              color: colors.text,
                              textDecorationLine: ev.completed ? 'line-through' : 'none',
                              opacity: ev.completed ? 0.6 : 1,
                            },
                          ]}
                        >
                          {ev.title}
                        </Text>
                        <Text style={[Typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
                          ⏰ {ev.start_time} - {ev.end_time}
                        </Text>
                      </View>

                      <Badge label={ev.category.toUpperCase()} color={catColor} />

                      <TouchableOpacity
                        onPress={() => handleDeleteEvent(ev.id, ev.title)}
                        style={{ marginLeft: Spacing.sm }}
                      >
                        <Ionicons name="trash-outline" size={18} color={colors.textMuted} />
                      </TouchableOpacity>
                    </View>
                  </Card>
                );
              })
            )}
          </View>
        )}

        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <View style={styles.tabContent}>
            {tasks.length === 0 ? (
              <EmptyState
                icon="checkbox-outline"
                title="No Tasks for Today"
                description="Create daily tasks with high, medium, or low priority to stay on top of your responsibilities."
                actionTitle="Add New Task"
                onAction={() => router.push('/quick-log?type=task')}
              />
            ) : (
              tasks.map(task => {
                const pColor = getPriorityColor(task.priority);
                return (
                  <Card key={task.id} style={{ marginBottom: Spacing.sm }}>
                    <View style={styles.taskRow}>
                      <TouchableOpacity
                        onPress={() => handleToggleTask(task.id)}
                        style={[
                          styles.checkbox,
                          {
                            borderColor: pColor,
                            backgroundColor: task.completed ? pColor : 'transparent',
                          },
                        ]}
                      >
                        {task.completed ? <Ionicons name="checkmark" size={14} color="#FFF" /> : null}
                      </TouchableOpacity>

                      <View style={{ flex: 1 }}>
                        <Text
                          style={[
                            Typography.bodyBold,
                            {
                              color: colors.text,
                              textDecorationLine: task.completed ? 'line-through' : 'none',
                              opacity: task.completed ? 0.6 : 1,
                            },
                          ]}
                        >
                          {task.title}
                        </Text>
                        {task.description ? (
                          <Text style={[Typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
                            {task.description}
                          </Text>
                        ) : null}
                        {task.due_time && (
                          <Text style={[Typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
                            🕒 Due by {task.due_time}
                          </Text>
                        )}
                      </View>

                      <Badge label={task.priority.toUpperCase()} color={pColor} />

                      <TouchableOpacity
                        onPress={() => handleDeleteTask(task.id, task.title)}
                        style={{ marginLeft: Spacing.sm }}
                      >
                        <Ionicons name="trash-outline" size={18} color={colors.textMuted} />
                      </TouchableOpacity>
                    </View>
                  </Card>
                );
              })
            )}
          </View>
        )}

        {/* Focus Tab */}
        {activeTab === 'focus' && (
          <View style={styles.tabContent}>
            <PomodoroDial />
          </View>
        )}

        {/* Habits Tab */}
        {activeTab === 'habits' && (
          <View style={styles.tabContent}>
            {habits.length === 0 ? (
              <EmptyState
                icon="flame-outline"
                title="No Habits Tracked"
                description="Build life-changing daily habits like drinking water, gym, reading, meditation, or sleeping on time."
                actionTitle="Create First Habit"
                onAction={() => router.push('/quick-log?type=habit')}
              />
            ) : (
              habits.map(habit => {
                const isDone = habit.completed_today;
                return (
                  <Card key={habit.id} style={{ marginBottom: Spacing.sm }}>
                    <View style={styles.habitMainRow}>
                      <TouchableOpacity
                        onPress={() => handleToggleHabit(habit.id)}
                        style={[
                          styles.habitCheckbox,
                          {
                            borderColor: habit.color || colors.habit,
                            backgroundColor: isDone ? habit.color || colors.habit : 'transparent',
                          },
                        ]}
                      >
                        {isDone ? <Ionicons name="checkmark" size={16} color="#FFF" /> : null}
                      </TouchableOpacity>

                      <View style={{ flex: 1 }}>
                        <Text style={[Typography.bodyBold, { color: colors.text }]}>{habit.name}</Text>
                        <Text style={[Typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
                          Frequency: {habit.frequency} • Target: {habit.target_days_per_week} days/wk
                        </Text>
                      </View>

                      <View style={{ alignItems: 'flex-end', gap: 2 }}>
                        <Badge label={`🔥 ${habit.current_streak || 0}d streak`} color={habit.color || colors.habit} />
                        <Text style={[Typography.caption, { color: colors.textMuted, fontSize: 10 }]}>
                          Best: {habit.longest_streak || 0}d
                        </Text>
                      </View>

                      <TouchableOpacity
                        onPress={() => handleDeleteHabit(habit.id, habit.name)}
                        style={{ marginLeft: Spacing.sm }}
                      >
                        <Ionicons name="trash-outline" size={18} color={colors.textMuted} />
                      </TouchableOpacity>
                    </View>

                    {/* 7-Day History Bubbles */}
                    {habit.weekly_history && (
                      <View style={[styles.weekRow, { borderTopColor: colors.border }]}>
                        {habit.weekly_history.map((day, dIdx) => (
                          <View key={dIdx} style={styles.dayCol}>
                            <Text style={[Typography.caption, { color: colors.textMuted, fontSize: 10 }]}>
                              {new Date(day.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'narrow' })}
                            </Text>
                            <View
                              style={[
                                styles.dayCircle,
                                {
                                  backgroundColor: day.completed ? habit.color || colors.habit : colors.cardSecondary,
                                  borderColor: colors.border,
                                },
                              ]}
                            />
                          </View>
                        ))}
                      </View>
                    )}
                  </Card>
                );
              })
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
    paddingBottom: Spacing.xs,
  },
  quickAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 3,
    borderRadius: BorderRadius.full,
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
    marginTop: Spacing.xs,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.xs,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  habitMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  habitCheckbox: {
    width: 26,
    height: 26,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
  },
  dayCol: {
    alignItems: 'center',
    gap: 4,
  },
  dayCircle: {
    width: 18,
    height: 18,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
});
