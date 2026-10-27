import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { BorderRadius, Spacing, Typography } from '../../constants/theme';
import { Card } from '../common/Card';
import { ProgressBar } from '../common/ProgressBar';
import { DailySummary } from '../../types';

interface NutritionDashboardCardProps {
  summary: DailySummary | null;
}

export const NutritionDashboardCard: React.FC<NutritionDashboardCardProps> = ({ summary }) => {
  const router = useRouter();
  const { colors } = useTheme();

  const nutrition = summary?.nutrition;
  const calories = nutrition?.calories || 0;
  const targetCalories = nutrition?.targetCalories || 2200;
  const remainingCalories = Math.max(0, targetCalories - calories);
  const caloriePercent = Math.min(100, Math.round((calories / targetCalories) * 100));

  const protein = nutrition?.protein || 0;
  const targetProtein = nutrition?.targetProtein || 140;
  const proteinPercent = Math.min(100, Math.round((protein / targetProtein) * 100));

  const carbs = nutrition?.carbs || 0;
  const fat = nutrition?.fat || 0;

  return (
    <Card
      onPress={() => router.push('/(tabs)/food')}
      style={styles.card}
    >
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={[styles.iconWrapper, { backgroundColor: colors.nutritionGlow }]}>
            <Ionicons name="nutrition-outline" size={20} color={colors.nutrition} />
          </View>
          <View>
            <Text style={[Typography.subtextBold, { color: colors.textSecondary }]}>NUTRITION</Text>
            <Text style={[Typography.h3, { color: colors.text }]}>Food & Macros</Text>
          </View>
        </View>

        <Text style={[Typography.subtextBold, { color: colors.nutrition }]}>
          {remainingCalories} kcal left
        </Text>
      </View>

      {/* Calories Track */}
      <View style={styles.caloriesSection}>
        <View style={styles.macroLabelRow}>
          <Text style={[Typography.bodyBold, { color: colors.text }]}>
            {calories} <Text style={[Typography.subtext, { color: colors.textSecondary }]}>/ {targetCalories} kcal</Text>
          </Text>
          <Text style={[Typography.caption, { color: colors.textSecondary, fontWeight: '700' }]}>
            {caloriePercent}%
          </Text>
        </View>
        <ProgressBar progress={caloriePercent} color={colors.nutrition} height={8} />
      </View>

      {/* Mini Macro Breakdown */}
      <View style={styles.macroPillRow}>
        {/* Protein */}
        <View style={[styles.macroPill, { backgroundColor: `${colors.protein}15`, borderColor: `${colors.protein}30` }]}>
          <Text style={[Typography.caption, { color: colors.protein, fontWeight: '700' }]}>
            Protein: {protein}g / {targetProtein}g
          </Text>
        </View>

        {/* Carbs */}
        <View style={[styles.macroPill, { backgroundColor: `${colors.carbs}15`, borderColor: `${colors.carbs}30` }]}>
          <Text style={[Typography.caption, { color: colors.carbs, fontWeight: '700' }]}>
            Carbs: {carbs}g
          </Text>
        </View>

        {/* Fat */}
        <View style={[styles.macroPill, { backgroundColor: `${colors.fat}15`, borderColor: `${colors.fat}30` }]}>
          <Text style={[Typography.caption, { color: colors.fat, fontWeight: '700' }]}>
            Fat: {fat}g
          </Text>
        </View>
      </View>
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
    marginBottom: Spacing.md,
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
  caloriesSection: {
    marginBottom: Spacing.md,
  },
  macroLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  macroPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    flexWrap: 'wrap',
  },
  macroPill: {
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
});
