import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { BorderRadius, Spacing, Typography } from '../../constants/theme';
import * as Haptics from 'expo-haptics';

interface ActionItem {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  route: string;
}

export const QuickActionsGrid: React.FC = () => {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const actions: ActionItem[] = [
    {
      id: 'food',
      label: 'Add Food',
      icon: 'restaurant-outline',
      color: colors.nutrition,
      route: '/quick-log?type=food',
    },
    {
      id: 'water',
      label: 'Add Water',
      icon: 'water-outline',
      color: colors.water,
      route: '/quick-log?type=water',
    },
    {
      id: 'workout',
      label: 'Workout',
      icon: 'barbell-outline',
      color: colors.fitness,
      route: '/workout-active',
    },
    {
      id: 'task',
      label: 'Add Task',
      icon: 'checkbox-outline',
      color: colors.time,
      route: '/quick-log?type=task',
    },
    {
      id: 'habit',
      label: 'New Habit',
      icon: 'flame-outline',
      color: colors.habit,
      route: '/quick-log?type=habit',
    },
    {
      id: 'focus',
      label: 'Focus',
      icon: 'timer-outline',
      color: colors.accent,
      route: '/(tabs)/time?tab=focus',
    },
  ];

  const handlePress = (route: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(route as any);
  };

  return (
    <View style={styles.container}>
      <Text style={[Typography.subtextBold, { color: colors.textSecondary, marginBottom: Spacing.sm }]}>
        QUICK ACTIONS
      </Text>

      <View style={styles.grid}>
        {actions.map(action => {
          const isHov = hoveredId === action.id;
          return (
            <TouchableOpacity
              key={action.id}
              activeOpacity={0.78}
              onPress={() => handlePress(action.route)}
              // @ts-ignore
              onMouseEnter={() => setHoveredId(action.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={[
                styles.actionButton,
                {
                  backgroundColor: colors.card,
                  borderColor: isHov ? `${action.color}70` : colors.border,
                  // @ts-ignore - Web Glassmorphism
                  backdropFilter: 'blur(18px) saturate(190%)',
                  WebkitBackdropFilter: 'blur(18px) saturate(190%)',
                  boxShadow: isHov
                    ? `0 10px 24px rgba(0, 0, 0, 0.4), 0 0 16px ${action.color}35, inset 0 1px 1px rgba(255, 255, 255, 0.22)`
                    : isDark
                      ? '0 6px 20px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.12)'
                      : '0 4px 16px rgba(100, 116, 139, 0.1), inset 0 1px 1px rgba(255, 255, 255, 0.85)',
                  transform: isHov ? 'translateY(-2px)' : 'none',
                  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                  cursor: 'pointer',
                } as any,
              ]}
            >
              <View
                style={[
                  styles.iconCircle,
                  {
                    backgroundColor: `${action.color}16`,
                    borderColor: `${action.color}35`,
                    // @ts-ignore
                    boxShadow: isHov ? `0 0 14px ${action.color}45` : 'none',
                  },
                ]}
              >
                <Ionicons name={action.icon} size={22} color={action.color} />
              </View>
              <Text style={[Typography.caption, { color: colors.text, fontWeight: '700', marginTop: Spacing.xs }]}>
                {action.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '31%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});
