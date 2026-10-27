import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { BorderRadius, Spacing, Typography } from '../../constants/theme';
import { Card } from '../common/Card';
import { CircularProgress } from '../common/CircularProgress';
import { Badge } from '../common/Badge';
import { DailySummary } from '../../types';

interface DailyScoreCardProps {
  summary: DailySummary | null;
}

export const DailyScoreCard: React.FC<DailyScoreCardProps> = ({ summary }) => {
  const { colors, isDark } = useTheme();

  const score = summary?.dailyScore ?? 0;
  const breakdown = summary?.scoreBreakdown;

  const getScoreStatus = () => {
    if (score >= 90) return { label: 'Elite Day 🔥', color: colors.fitness };
    if (score >= 70) return { label: 'Crushing It ⚡', color: colors.primary };
    if (score >= 40) return { label: 'Solid Progress 📈', color: colors.nutrition };
    if (score > 0) return { label: 'Good Start 💪', color: colors.accent };
    return { label: 'Ready to Win 🚀', color: colors.textSecondary };
  };

  const status = getScoreStatus();

  return (
    <Card variant="glow" glowColor={`${colors.primary}50`} style={styles.card}>
      <View style={styles.topRow}>
        <View>
          <Text style={[Typography.subtextBold, { color: colors.textSecondary, letterSpacing: 0.5 }]}>
            TODAY'S DAILY SCORE
          </Text>
          <Text style={[Typography.h2, { color: colors.text, marginTop: 2 }]}>
            Daily Completion
          </Text>
        </View>
        <Badge label={status.label} color={status.color} />
      </View>

      <View style={styles.contentRow}>
        <View style={styles.progressContainer}>
          {/* Subtle Ambient Halo */}
          <View
            style={[
              styles.radialHalo,
              {
                backgroundColor: `${colors.primary}25`,
                // @ts-ignore
                filter: Platform.OS === 'web' ? 'blur(20px)' : undefined,
              },
            ]}
          />
          <CircularProgress
            size={112}
            strokeWidth={10}
            progress={score}
            gradientColors={[colors.primaryLight, colors.primary]}
          >
            <Text style={[Typography.h1, { color: colors.text, fontWeight: '800' }]}>{score}%</Text>
            <Text style={[Typography.caption, { color: colors.textSecondary }]}>Score</Text>
          </CircularProgress>
        </View>

        <View style={styles.breakdownGrid}>
          {/* Fitness */}
          <View
            style={[
              styles.breakdownChip,
              {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.07)' : 'rgba(0, 0, 0, 0.06)',
              },
            ]}
          >
            <View style={[styles.dot, { backgroundColor: colors.fitness }]} />
            <Text style={[Typography.caption, { color: colors.textSecondary, flex: 1 }]}>
              Fitness
            </Text>
            <Text style={[Typography.caption, { color: colors.text, fontWeight: '700' }]}>
              {breakdown?.fitness.completed ? '✅ Done' : `${breakdown?.fitness.actual || 0}/${breakdown?.fitness.target || 1}`}
            </Text>
          </View>

          {/* Nutrition */}
          <View
            style={[
              styles.breakdownChip,
              {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.07)' : 'rgba(0, 0, 0, 0.06)',
              },
            ]}
          >
            <View style={[styles.dot, { backgroundColor: colors.nutrition }]} />
            <Text style={[Typography.caption, { color: colors.textSecondary, flex: 1 }]}>
              Calories
            </Text>
            <Text style={[Typography.caption, { color: colors.text, fontWeight: '700' }]}>
              {breakdown?.nutrition.actual || 0} kcal
            </Text>
          </View>

          {/* Protein */}
          <View
            style={[
              styles.breakdownChip,
              {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.07)' : 'rgba(0, 0, 0, 0.06)',
              },
            ]}
          >
            <View style={[styles.dot, { backgroundColor: colors.protein }]} />
            <Text style={[Typography.caption, { color: colors.textSecondary, flex: 1 }]}>
              Protein
            </Text>
            <Text style={[Typography.caption, { color: colors.text, fontWeight: '700' }]}>
              {breakdown?.protein.actual || 0}g / {breakdown?.protein.target || 140}g
            </Text>
          </View>

          {/* Water */}
          <View
            style={[
              styles.breakdownChip,
              {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.07)' : 'rgba(0, 0, 0, 0.06)',
              },
            ]}
          >
            <View style={[styles.dot, { backgroundColor: colors.water }]} />
            <Text style={[Typography.caption, { color: colors.textSecondary, flex: 1 }]}>
              Water
            </Text>
            <Text style={[Typography.caption, { color: colors.text, fontWeight: '700' }]}>
              {((breakdown?.water.actual || 0) / 1000).toFixed(1)}L
            </Text>
          </View>

          {/* Habits */}
          <View
            style={[
              styles.breakdownChip,
              {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.07)' : 'rgba(0, 0, 0, 0.06)',
              },
            ]}
          >
            <View style={[styles.dot, { backgroundColor: colors.habit }]} />
            <Text style={[Typography.caption, { color: colors.textSecondary, flex: 1 }]}>
              Habits
            </Text>
            <Text style={[Typography.caption, { color: colors.text, fontWeight: '700' }]}>
              {breakdown?.habits.actual || 0}/{breakdown?.habits.target || 0}
            </Text>
          </View>

          {/* Tasks */}
          <View
            style={[
              styles.breakdownChip,
              {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.07)' : 'rgba(0, 0, 0, 0.06)',
              },
            ]}
          >
            <View style={[styles.dot, { backgroundColor: colors.time }]} />
            <Text style={[Typography.caption, { color: colors.textSecondary, flex: 1 }]}>
              Tasks
            </Text>
            <Text style={[Typography.caption, { color: colors.text, fontWeight: '700' }]}>
              {breakdown?.tasks.actual || 0}/{breakdown?.tasks.target || 0}
            </Text>
          </View>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.sm,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  progressContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radialHalo: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 9999,
  },
  breakdownGrid: {
    flex: 1,
    gap: 5,
  },
  breakdownChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 8,
    borderWidth: 1,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: BorderRadius.full,
  },
});
