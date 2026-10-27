import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useApp } from '../../context/AppContext';
import { useDeviceMode } from '../../context/DeviceModeContext';
import { BorderRadius, Spacing, Typography } from '../../constants/theme';
import { Card } from '../../components/common/Card';
import { ProgressBar } from '../../components/common/ProgressBar';
import { CircularProgress } from '../../components/common/CircularProgress';
import { EmptyState } from '../../components/common/EmptyState';
import { MealCategory, FoodEntry } from '../../types';
import { getDailyNutritionTotals, deleteFoodEntry } from '../../services/foodService';
import * as Haptics from 'expo-haptics';

export default function FoodScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { profile, refreshKey, refreshData } = useApp();
  const { mode } = useDeviceMode();
  const isLaptop = mode === 'laptop';

  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [nutritionData, setNutritionData] = useState<any>(null);

  const calorieTarget = profile?.calorie_goal || 2200;
  const proteinTarget = profile?.protein_goal || 140;
  const carbsTarget = Math.round((calorieTarget * 0.45) / 4); // 45% of calories
  const fatTarget = Math.round((calorieTarget * 0.25) / 9); // 25% of calories

  useEffect(() => {
    loadNutrition();
  }, [selectedDate, refreshKey]);

  const loadNutrition = async () => {
    const totals = await getDailyNutritionTotals(selectedDate);
    setNutritionData(totals);
  };

  const changeDate = (days: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const jumpToToday = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  const handleDeleteItem = async (id: number, name: string) => {
    const doDelete = async () => {
      // Optimistic local state update for instant UI feedback
      setNutritionData((prev: any) => {
        if (!prev) return prev;
        const newByCategory = { ...prev.byCategory };
        let removedItem: FoodEntry | null = null;
        for (const cat in newByCategory) {
          const matchIdx = newByCategory[cat].entries.findIndex((e: FoodEntry) => e.id === id);
          if (matchIdx !== -1) {
            const item = newByCategory[cat].entries[matchIdx];
            removedItem = item;
            newByCategory[cat] = {
              ...newByCategory[cat],
              entries: newByCategory[cat].entries.filter((e: FoodEntry) => e.id !== id),
              calories: Math.max(0, newByCategory[cat].calories - Math.round(item.calories)),
              protein: Math.max(0, newByCategory[cat].protein - Math.round(item.protein)),
              carbs: Math.max(0, newByCategory[cat].carbs - Math.round(item.carbs)),
              fat: Math.max(0, newByCategory[cat].fat - Math.round(item.fat)),
            };
            break;
          }
        }
        if (removedItem) {
          return {
            ...prev,
            calories: Math.max(0, prev.calories - Math.round(removedItem.calories)),
            protein: Math.max(0, prev.protein - Math.round(removedItem.protein)),
            carbs: Math.max(0, prev.carbs - Math.round(removedItem.carbs)),
            fat: Math.max(0, prev.fat - Math.round(removedItem.fat)),
            byCategory: newByCategory,
          };
        }
        return prev;
      });

      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        await deleteFoodEntry(id);
        await refreshData();
        await loadNutrition();
      } catch (err) {
        console.error('Failed to delete food entry:', err);
        await loadNutrition(); // revert on failure
      }
    };

    if (Platform.OS === 'web') {
      const confirmed = window.confirm(`Remove "${name}" from your food diary?`);
      if (confirmed) {
        await doDelete();
      }
    } else {
      Alert.alert('Delete Food', `Remove "${name}" from your diary?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: doDelete },
      ]);
    }
  };

  const isToday = selectedDate === new Date().toISOString().split('T')[0];
  const totalCalories = nutritionData?.calories || 0;
  const totalProtein = nutritionData?.protein || 0;
  const totalCarbs = nutritionData?.carbs || 0;
  const totalFat = nutritionData?.fat || 0;

  const calProgress = Math.min(100, Math.round((totalCalories / calorieTarget) * 100));
  const proteinProgress = Math.min(100, Math.round((totalProtein / proteinTarget) * 100));
  const carbsProgress = Math.min(100, Math.round((totalCarbs / carbsTarget) * 100));
  const fatProgress = Math.min(100, Math.round((totalFat / fatTarget) * 100));

  const calRemaining = calorieTarget - totalCalories;
  const isOverCalorie = totalCalories > calorieTarget;

  // Macro calorie ratios
  const proteinCal = totalProtein * 4;
  const carbsCal = totalCarbs * 4;
  const fatCal = totalFat * 9;
  const macroCalSum = proteinCal + carbsCal + fatCal || 1;
  const proteinPct = Math.round((proteinCal / macroCalSum) * 100);
  const carbsPct = Math.round((carbsCal / macroCalSum) * 100);
  const fatPct = Math.max(0, 100 - proteinPct - carbsPct);

  const mealCategories: {
    key: MealCategory;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    accentColor: string;
    bgAccent: string;
  }[] = [
    { key: 'breakfast', label: 'Breakfast', icon: 'sunny-outline', accentColor: '#F59E0B', bgAccent: 'rgba(245, 158, 11, 0.12)' },
    { key: 'lunch', label: 'Lunch', icon: 'restaurant-outline', accentColor: '#10B981', bgAccent: 'rgba(16, 185, 129, 0.12)' },
    { key: 'dinner', label: 'Dinner', icon: 'moon-outline', accentColor: '#8B5CF6', bgAccent: 'rgba(139, 92, 246, 0.12)' },
    { key: 'snack', label: 'Snacks & Supplements', icon: 'cafe-outline', accentColor: '#06B6D4', bgAccent: 'rgba(6, 182, 212, 0.12)' },
  ];

  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: 'transparent' }]}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <View>
          <View style={styles.titleBadgeRow}>
            <Text style={[Typography.subtextBold, { color: colors.nutrition, letterSpacing: 0.8 }]}>
              FOOD & NUTRITION
            </Text>
            <View style={[styles.activeStatusPill, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
              <View style={styles.statusDot} />
              <Text style={[Typography.caption, { color: '#10B981', fontSize: 11, fontWeight: '700' }]}>
                DIARY
              </Text>
            </View>
          </View>
          <Text style={[Typography.h1, { color: colors.text, fontSize: 26 }]}>Meal Diary</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.push(`/quick-log?type=food&date=${selectedDate}`)}
          style={[styles.quickAddBtn, { backgroundColor: colors.nutrition }]}
        >
          <Ionicons name="sparkles" size={16} color="#FFF" />
          <Text style={[Typography.bodyBold, { color: '#FFF', fontSize: 13, marginLeft: 6 }]}>
            + Log Food
          </Text>
        </TouchableOpacity>
      </View>

      {/* Date Switcher Bar */}
      <View style={[styles.dateBar, { backgroundColor: colors.cardSecondary, borderColor: colors.border }]}>
        <TouchableOpacity onPress={() => changeDate(-1)} style={styles.dateArrow} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={20} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.dateCenter}>
          <Ionicons name="calendar-outline" size={16} color={colors.nutrition} style={{ marginRight: 6 }} />
          <Text style={[Typography.bodyBold, { color: colors.text }]}>
            {isToday ? 'Today, ' : ''}
            {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })}
          </Text>
          {!isToday && (
            <TouchableOpacity onPress={jumpToToday} style={[styles.todayJumpBtn, { backgroundColor: colors.primary }]}>
              <Text style={[Typography.caption, { color: '#FFF', fontSize: 10, fontWeight: '700' }]}>Today</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity onPress={() => changeDate(1)} style={styles.dateArrow} activeOpacity={0.7}>
          <Ionicons name="chevron-forward" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Modern Nutrition Command Center Card */}
        <Card variant="glow" glowColor={colors.nutritionGlow} style={styles.macroHeroCard}>
          <View style={[styles.heroFlexWrapper, isLaptop && styles.heroFlexLaptop]}>
            {/* Left Column: Calorie Dial & Status */}
            <View style={styles.calorieDialSection}>
              <CircularProgress
                size={isLaptop ? 130 : 110}
                strokeWidth={11}
                progress={calProgress}
                color={isOverCalorie ? '#EF4444' : colors.nutrition}
              >
                <Text style={[Typography.h1, { color: colors.text, fontSize: isLaptop ? 26 : 22 }]}>
                  {totalCalories}
                </Text>
                <Text style={[Typography.caption, { color: colors.textSecondary }]}>
                  / {calorieTarget} kcal
                </Text>
              </CircularProgress>

              <View style={[
                styles.calorieBudgetBadge,
                { backgroundColor: isOverCalorie ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)' }
              ]}>
                <Ionicons
                  name={isOverCalorie ? 'alert-circle-outline' : 'checkmark-circle-outline'}
                  size={14}
                  color={isOverCalorie ? '#EF4444' : '#10B981'}
                />
                <Text style={[
                  Typography.caption,
                  { color: isOverCalorie ? '#EF4444' : '#10B981', fontWeight: '700', marginLeft: 4 }
                ]}>
                  {isOverCalorie ? `+${Math.abs(calRemaining)} kcal over` : `${calRemaining} kcal left`}
                </Text>
              </View>
            </View>

            {/* Right Column: 3 High-Impact Macro Cards */}
            <View style={styles.macroCardsGrid}>
              {/* Protein Card */}
              <View style={[styles.macroMiniCard, { backgroundColor: colors.cardSecondary, borderColor: colors.border }]}>
                <View style={styles.macroCardHeader}>
                  <View style={[styles.macroIconBubble, { backgroundColor: 'rgba(244, 63, 94, 0.12)' }]}>
                    <Text style={{ fontSize: 13 }}>🍗</Text>
                  </View>
                  <Text style={[Typography.caption, { color: '#F43F5E', fontWeight: '800' }]}>PROTEIN</Text>
                  <Text style={[Typography.caption, { color: colors.textSecondary, marginLeft: 'auto', fontWeight: '700' }]}>
                    {proteinProgress}%
                  </Text>
                </View>
                <View style={styles.macroValueRow}>
                  <Text style={[Typography.h2, { color: colors.text, fontSize: 18 }]}>{totalProtein}g</Text>
                  <Text style={[Typography.caption, { color: colors.textSecondary }]}>/ {proteinTarget}g</Text>
                </View>
                <ProgressBar progress={proteinProgress} color="#F43F5E" height={6} />
              </View>

              {/* Carbs Card */}
              <View style={[styles.macroMiniCard, { backgroundColor: colors.cardSecondary, borderColor: colors.border }]}>
                <View style={styles.macroCardHeader}>
                  <View style={[styles.macroIconBubble, { backgroundColor: 'rgba(59, 130, 246, 0.12)' }]}>
                    <Text style={{ fontSize: 13 }}>🌾</Text>
                  </View>
                  <Text style={[Typography.caption, { color: '#3B82F6', fontWeight: '800' }]}>CARBS</Text>
                  <Text style={[Typography.caption, { color: colors.textSecondary, marginLeft: 'auto', fontWeight: '700' }]}>
                    {carbsProgress}%
                  </Text>
                </View>
                <View style={styles.macroValueRow}>
                  <Text style={[Typography.h2, { color: colors.text, fontSize: 18 }]}>{totalCarbs}g</Text>
                  <Text style={[Typography.caption, { color: colors.textSecondary }]}>/ {carbsTarget}g</Text>
                </View>
                <ProgressBar progress={carbsProgress} color="#3B82F6" height={6} />
              </View>

              {/* Fat Card */}
              <View style={[styles.macroMiniCard, { backgroundColor: colors.cardSecondary, borderColor: colors.border }]}>
                <View style={styles.macroCardHeader}>
                  <View style={[styles.macroIconBubble, { backgroundColor: 'rgba(245, 158, 11, 0.12)' }]}>
                    <Text style={{ fontSize: 13 }}>🥑</Text>
                  </View>
                  <Text style={[Typography.caption, { color: '#F59E0B', fontWeight: '800' }]}>FAT</Text>
                  <Text style={[Typography.caption, { color: colors.textSecondary, marginLeft: 'auto', fontWeight: '700' }]}>
                    {fatProgress}%
                  </Text>
                </View>
                <View style={styles.macroValueRow}>
                  <Text style={[Typography.h2, { color: colors.text, fontSize: 18 }]}>{totalFat}g</Text>
                  <Text style={[Typography.caption, { color: colors.textSecondary }]}>/ {fatTarget}g</Text>
                </View>
                <ProgressBar progress={fatProgress} color="#F59E0B" height={6} />
              </View>
            </View>
          </View>

          {/* Caloric Distribution Breakdown Bar */}
          {totalCalories > 0 && (
            <View style={[styles.macroRatioContainer, { borderTopColor: colors.border }]}>
              <View style={styles.ratioHeader}>
                <Text style={[Typography.caption, { color: colors.textSecondary, fontWeight: '700' }]}>
                  CALORIC RATIO
                </Text>
                <Text style={[Typography.caption, { color: colors.textMuted }]}>
                  🍗 {proteinPct}% P  •  🌾 {carbsPct}% C  •  🥑 {fatPct}% F
                </Text>
              </View>
              <View style={styles.ratioBarOuter}>
                <View style={[styles.ratioBarSegment, { width: `${proteinPct}%`, backgroundColor: '#F43F5E' }]} />
                <View style={[styles.ratioBarSegment, { width: `${carbsPct}%`, backgroundColor: '#3B82F6' }]} />
                <View style={[styles.ratioBarSegment, { width: `${fatPct}%`, backgroundColor: '#F59E0B' }]} />
              </View>
            </View>
          )}
        </Card>

        {/* Meal Categories Sections */}
        <View style={isLaptop ? styles.mealsGridLaptop : styles.mealsListMobile}>
          {mealCategories.map(cat => {
            const categoryData = nutritionData?.byCategory?.[cat.key];
            const entries: FoodEntry[] = categoryData?.entries || [];
            const catCalories = categoryData?.calories || 0;
            const catProtein = categoryData?.protein || 0;

            return (
              <Card
                key={cat.key}
                style={[
                  styles.mealSectionCard,
                  isLaptop && styles.mealCardLaptop,
                  { borderColor: colors.border }
                ]}
              >
                {/* Meal Header */}
                <View style={styles.mealHeader}>
                  <View style={styles.mealTitleRow}>
                    <View style={[styles.mealIconWrapper, { backgroundColor: cat.bgAccent }]}>
                      <Ionicons name={cat.icon} size={18} color={cat.accentColor} />
                    </View>
                    <View>
                      <Text style={[Typography.bodyBold, { color: colors.text, fontSize: 16 }]}>
                        {cat.label}
                      </Text>
                      <Text style={[Typography.caption, { color: colors.textSecondary, fontSize: 12 }]}>
                        {entries.length} {entries.length === 1 ? 'item' : 'items'} •{' '}
                        <Text style={{ color: colors.nutrition, fontWeight: '700' }}>{catCalories} kcal</Text>
                        {catProtein > 0 ? ` • ${catProtein}g P` : ''}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    activeOpacity={0.75}
                    onPress={() =>
                      router.push(
                        `/quick-log?type=food&category=${cat.key}&date=${selectedDate}`
                      )
                    }
                    style={[styles.addFoodBtn, { borderColor: cat.accentColor, backgroundColor: cat.bgAccent }]}
                  >
                    <Ionicons name="add" size={16} color={cat.accentColor} />
                    <Text style={[Typography.caption, { color: cat.accentColor, fontWeight: '700' }]}>
                      + Add
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Food Items List */}
                {entries.length > 0 ? (
                  <View style={styles.entriesList}>
                    {entries.map(item => (
                      <View
                        key={item.id}
                        style={[styles.foodItemRow, { borderTopColor: colors.border }]}
                      >
                        <View style={{ flex: 1, paddingRight: Spacing.sm }}>
                          <Text style={[Typography.bodyBold, { color: colors.text, fontSize: 14 }]} numberOfLines={2}>
                            {item.name}
                          </Text>
                          {/* Macro Nutrient Tags */}
                          <View style={styles.macroPillsRow}>
                            <View style={[styles.macroPill, { backgroundColor: colors.cardSecondary }]}>
                              <Text style={[Typography.caption, { color: colors.textMuted, fontSize: 11 }]}>
                                {item.quantity} {item.unit}
                              </Text>
                            </View>
                            <View style={[styles.macroPill, { backgroundColor: 'rgba(244, 63, 94, 0.09)' }]}>
                              <Text style={[Typography.caption, { color: '#F43F5E', fontSize: 11, fontWeight: '700' }]}>
                                {Math.round(item.protein)}g P
                              </Text>
                            </View>
                            <View style={[styles.macroPill, { backgroundColor: 'rgba(59, 130, 246, 0.09)' }]}>
                              <Text style={[Typography.caption, { color: '#3B82F6', fontSize: 11, fontWeight: '700' }]}>
                                {Math.round(item.carbs)}g C
                              </Text>
                            </View>
                            <View style={[styles.macroPill, { backgroundColor: 'rgba(245, 158, 11, 0.09)' }]}>
                              <Text style={[Typography.caption, { color: '#F59E0B', fontSize: 11, fontWeight: '700' }]}>
                                {Math.round(item.fat)}g F
                              </Text>
                            </View>
                          </View>
                        </View>

                        {/* Right: Calories + Reliable Delete Button */}
                        <View style={styles.calorieRow}>
                          <View style={[styles.calorieBadge, { backgroundColor: 'rgba(245, 158, 11, 0.12)' }]}>
                            <Text style={[Typography.bodyBold, { color: colors.nutrition, fontSize: 13 }]}>
                              {Math.round(item.calories)} kcal
                            </Text>
                          </View>

                          <TouchableOpacity
                            activeOpacity={0.6}
                            onPress={() => handleDeleteItem(item.id, item.name)}
                            style={[styles.deleteItemBtn, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}
                            accessibilityLabel={`Delete ${item.name}`}
                          >
                            <Ionicons name="trash-outline" size={16} color="#EF4444" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                  </View>
                ) : (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() =>
                      router.push(
                        `/quick-log?type=food&category=${cat.key}&date=${selectedDate}`
                      )
                    }
                    style={[styles.emptyMealSlot, { borderColor: colors.border }]}
                  >
                    <Ionicons name="add-circle-outline" size={16} color={colors.textMuted} />
                    <Text style={[Typography.caption, { color: colors.textMuted, marginLeft: 6 }]}>
                      No {cat.label.toLowerCase()} logged yet • Tap to add
                    </Text>
                  </TouchableOpacity>
                )}
              </Card>
            );
          })}
        </View>

        {totalCalories === 0 && (
          <EmptyState
            icon="nutrition-outline"
            title="No Meals Logged Today"
            description="Track your breakfast, lunch, dinner, or snacks to calculate your daily calories, protein, and macros with AI."
            actionTitle="Log Your First Meal ✨"
            onAction={() => router.push(`/quick-log?type=food&date=${selectedDate}`)}
          />
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
  titleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  activeStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  quickAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    // @ts-ignore
    boxShadow: '0 4px 14px rgba(245, 158, 11, 0.35)',
  },
  dateBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.sm,
    paddingVertical: Spacing.xs + 2,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  dateCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  todayJumpBtn: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  dateArrow: {
    padding: Spacing.xs,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 96,
  },
  macroHeroCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  heroFlexWrapper: {
    flexDirection: 'column',
    gap: Spacing.md,
  },
  heroFlexLaptop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  calorieDialSection: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 150,
  },
  calorieBudgetBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.sm,
  },
  macroCardsGrid: {
    flex: 1,
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  macroMiniCard: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: 6,
  },
  macroCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  macroIconBubble: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  macroValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginVertical: 2,
  },
  macroRatioContainer: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
  },
  ratioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  ratioBarOuter: {
    height: 8,
    borderRadius: 4,
    flexDirection: 'row',
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  ratioBarSegment: {
    height: '100%',
  },
  mealsListMobile: {
    flexDirection: 'column',
    gap: Spacing.sm,
  },
  mealsGridLaptop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  mealSectionCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  mealCardLaptop: {
    width: '49%',
    flexGrow: 1,
  },
  mealHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mealTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  mealIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addFoodBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm + 4,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    gap: 2,
  },
  entriesList: {
    marginTop: Spacing.sm,
  },
  foodItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm + 2,
    borderTopWidth: 1,
  },
  macroPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 4,
  },
  macroPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  calorieRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  calorieBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.md,
  },
  deleteItemBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyMealSlot: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
});
