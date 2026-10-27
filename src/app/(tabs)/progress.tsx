import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useApp } from '../../context/AppContext';
import { BorderRadius, Spacing, Typography } from '../../constants/theme';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { StatChart } from '../../components/progress/StatChart';
import { TimeRange } from '../../types';
import {
  getWeightProgress,
  getCalorieProgress,
  getProteinProgress,
  getWorkoutVolumeProgress,
  getWaterProgress,
  getSleepProgress,
  getFocusProgress,
  getHabitProgress,
  ProgressDataPoint,
} from '../../services/progressService';
import { getWeightProgressSummary } from '../../services/weightService';
import * as Haptics from 'expo-haptics';

export default function ProgressScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { refreshKey } = useApp();

  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const [weightSummary, setWeightSummary] = useState<any>(null);

  const [weightData, setWeightData] = useState<ProgressDataPoint[]>([]);
  const [calorieData, setCalorieData] = useState<ProgressDataPoint[]>([]);
  const [proteinData, setProteinData] = useState<ProgressDataPoint[]>([]);
  const [workoutData, setWorkoutData] = useState<ProgressDataPoint[]>([]);
  const [waterData, setWaterData] = useState<ProgressDataPoint[]>([]);
  const [sleepData, setSleepData] = useState<ProgressDataPoint[]>([]);
  const [focusData, setFocusData] = useState<ProgressDataPoint[]>([]);
  const [habitData, setHabitData] = useState<ProgressDataPoint[]>([]);

  useEffect(() => {
    loadAllProgress();
  }, [timeRange, refreshKey]);

  const loadAllProgress = async () => {
    const wSummary = await getWeightProgressSummary();
    setWeightSummary(wSummary);

    const [wPts, cPts, pPts, woPts, waPts, sPts, fPts, hPts] = await Promise.all([
      getWeightProgress(timeRange),
      getCalorieProgress(timeRange),
      getProteinProgress(timeRange),
      getWorkoutVolumeProgress(timeRange),
      getWaterProgress(timeRange),
      getSleepProgress(timeRange),
      getFocusProgress(timeRange),
      getHabitProgress(timeRange),
    ]);

    setWeightData(wPts);
    setCalorieData(cPts);
    setProteinData(pPts);
    setWorkoutData(woPts);
    setWaterData(waPts);
    setSleepData(sPts);
    setFocusData(fPts);
    setHabitData(hPts);
  };

  const ranges: { key: TimeRange; label: string }[] = [
    { key: '7d', label: '7D' },
    { key: '30d', label: '30D' },
    { key: '3m', label: '3M' },
    { key: '6m', label: '6M' },
    { key: '1y', label: '1Y' },
  ];

  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: 'transparent' }]}>
      {/* Header */}
      <View style={styles.topHeader}>
        <View>
          <Text style={[Typography.subtextBold, { color: colors.primary }]}>PROGRESS & ANALYTICS</Text>
          <Text style={[Typography.h1, { color: colors.text }]}>Body & Performance</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push('/quick-log?type=weight')}
          style={[styles.logWeightBtn, { backgroundColor: colors.primary }]}
        >
          <Ionicons name="scale-outline" size={18} color="#FFF" />
          <Text style={[Typography.caption, { color: '#FFF', fontWeight: '700', marginLeft: 4 }]}>
            Log Weight
          </Text>
        </TouchableOpacity>
      </View>

      {/* Time Range Filter Pills */}
      <View style={styles.rangeRow}>
        {ranges.map(r => (
          <TouchableOpacity
            key={r.key}
            activeOpacity={0.7}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setTimeRange(r.key);
            }}
            style={[
              styles.rangePill,
              {
                backgroundColor: timeRange === r.key ? colors.primary : colors.cardSecondary,
                borderColor: timeRange === r.key ? colors.primary : colors.border,
              },
              Platform.OS === 'web' && ({ backdropFilter: 'blur(16px)' } as any),
            ]}
          >
            <Text
              style={[
                Typography.caption,
                { color: timeRange === r.key ? '#FFF' : colors.textSecondary, fontWeight: '700' },
              ]}
            >
              {r.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Weight Tracker KPI Card */}
        <Card variant="glow" glowColor={`${colors.primary}30`} style={styles.metricCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <View style={[styles.iconBox, { backgroundColor: `${colors.primary}18` }]}>
                <Ionicons name="scale-outline" size={20} color={colors.primary} />
              </View>
              <View>
                <Text style={[Typography.bodyBold, { color: colors.text }]}>Body Weight Goal</Text>
                <Text style={[Typography.caption, { color: colors.textSecondary }]}>
                  Current: {weightSummary?.currentWeight || 0} kg • Goal: {weightSummary?.goalWeight || 0} kg
                </Text>
              </View>
            </View>

            <Badge
              label={`${weightSummary?.progressPercentage || 0}%`}
              color={colors.primary}
            />
          </View>

          {/* Weight Stats Grid */}
          <View style={styles.weightStatsGrid}>
            <View style={styles.weightStatCol}>
              <Text style={[Typography.caption, { color: colors.textSecondary }]}>Start</Text>
              <Text style={[Typography.bodyBold, { color: colors.text }]}>
                {weightSummary?.startingWeight || 0} kg
              </Text>
            </View>

            <View style={styles.weightStatCol}>
              <Text style={[Typography.caption, { color: colors.textSecondary }]}>Change</Text>
              <Text
                style={[
                  Typography.bodyBold,
                  {
                    color:
                      (weightSummary?.weightChange || 0) < 0
                        ? colors.fitness
                        : (weightSummary?.weightChange || 0) > 0
                        ? colors.nutrition
                        : colors.text,
                  },
                ]}
              >
                {(weightSummary?.weightChange || 0) > 0 ? '+' : ''}
                {weightSummary?.weightChange || 0} kg
              </Text>
            </View>

            <View style={styles.weightStatCol}>
              <Text style={[Typography.caption, { color: colors.textSecondary }]}>To Goal</Text>
              <Text style={[Typography.bodyBold, { color: colors.primary }]}>
                {weightSummary?.remainingToGoal || 0} kg
              </Text>
            </View>
          </View>

          <StatChart
            data={weightData}
            color={colors.primary}
            type="line"
            unit="kg"
            emptyMessage="No weight logs recorded in this period yet. Tap 'Log Weight' to track your body weight trend."
          />
        </Card>

        {/* Calorie Trends */}
        <Card style={styles.metricCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <View style={[styles.iconBox, { backgroundColor: `${colors.nutrition}18` }]}>
                <Ionicons name="flame-outline" size={20} color={colors.nutrition} />
              </View>
              <View>
                <Text style={[Typography.bodyBold, { color: colors.text }]}>Calories Consumed</Text>
                <Text style={[Typography.caption, { color: colors.textSecondary }]}>Daily nutrition intake</Text>
              </View>
            </View>
          </View>

          <StatChart
            data={calorieData}
            color={colors.nutrition}
            type="bar"
            unit="kcal"
            emptyMessage="No food entries logged in this period."
          />
        </Card>

        {/* Protein Trends */}
        <Card style={styles.metricCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <View style={[styles.iconBox, { backgroundColor: `${colors.protein}18` }]}>
                <Ionicons name="restaurant-outline" size={20} color={colors.protein} />
              </View>
              <View>
                <Text style={[Typography.bodyBold, { color: colors.text }]}>Protein Intake</Text>
                <Text style={[Typography.caption, { color: colors.textSecondary }]}>Grams per day</Text>
              </View>
            </View>
          </View>

          <StatChart
            data={proteinData}
            color={colors.protein}
            type="line"
            unit="g"
            emptyMessage="No protein entries logged in this period."
          />
        </Card>

        {/* Workout Volume */}
        <Card style={styles.metricCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <View style={[styles.iconBox, { backgroundColor: `${colors.fitness}18` }]}>
                <Ionicons name="barbell-outline" size={20} color={colors.fitness} />
              </View>
              <View>
                <Text style={[Typography.bodyBold, { color: colors.text }]}>Workout Volume</Text>
                <Text style={[Typography.caption, { color: colors.textSecondary }]}>Total kg moved per session</Text>
              </View>
            </View>
          </View>

          <StatChart
            data={workoutData}
            color={colors.fitness}
            type="bar"
            unit="kg"
            emptyMessage="No workout volume logged in this period."
          />
        </Card>

        {/* Water Intake */}
        <Card style={styles.metricCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <View style={[styles.iconBox, { backgroundColor: `${colors.water}18` }]}>
                <Ionicons name="water-outline" size={20} color={colors.water} />
              </View>
              <View>
                <Text style={[Typography.bodyBold, { color: colors.text }]}>Hydration Trend</Text>
                <Text style={[Typography.caption, { color: colors.textSecondary }]}>Milliliters logged per day</Text>
              </View>
            </View>
          </View>

          <StatChart
            data={waterData}
            color={colors.water}
            type="bar"
            unit="ml"
            emptyMessage="No water logged in this period."
          />
        </Card>

        {/* Sleep Duration */}
        <Card style={styles.metricCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <View style={[styles.iconBox, { backgroundColor: `${colors.sleep}18` }]}>
                <Ionicons name="moon-outline" size={20} color={colors.sleep} />
              </View>
              <View>
                <Text style={[Typography.bodyBold, { color: colors.text }]}>Sleep Duration</Text>
                <Text style={[Typography.caption, { color: colors.textSecondary }]}>Hours of rest per night</Text>
              </View>
            </View>
          </View>

          <StatChart
            data={sleepData}
            color={colors.sleep}
            type="line"
            unit="hrs"
            emptyMessage="No sleep logged in this period."
          />
        </Card>

        {/* Focus Time */}
        <Card style={styles.metricCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <View style={[styles.iconBox, { backgroundColor: `${colors.accent}18` }]}>
                <Ionicons name="timer-outline" size={20} color={colors.accent} />
              </View>
              <View>
                <Text style={[Typography.bodyBold, { color: colors.text }]}>Focus & Pomodoro</Text>
                <Text style={[Typography.caption, { color: colors.textSecondary }]}>Minutes focused per day</Text>
              </View>
            </View>
          </View>

          <StatChart
            data={focusData}
            color={colors.accent}
            type="bar"
            unit="min"
            emptyMessage="No focus sessions recorded in this period."
          />
        </Card>

        {/* Habit Completion */}
        <Card style={styles.metricCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <View style={[styles.iconBox, { backgroundColor: `${colors.habit}18` }]}>
                <Ionicons name="flame-outline" size={20} color={colors.habit} />
              </View>
              <View>
                <Text style={[Typography.bodyBold, { color: colors.text }]}>Habit Consistency</Text>
                <Text style={[Typography.caption, { color: colors.textSecondary }]}>Completed habits per day</Text>
              </View>
            </View>
          </View>

          <StatChart
            data={habitData}
            color={colors.habit}
            type="bar"
            unit="habits"
            emptyMessage="No habits completed in this period."
          />
        </Card>

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
  logWeightBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 3,
    borderRadius: BorderRadius.full,
  },
  rangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.sm,
    gap: Spacing.xs,
  },
  rangePill: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 96,
  },
  metricCard: {
    marginBottom: Spacing.md,
    padding: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weightStatsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  weightStatCol: {
    alignItems: 'center',
  },
});
