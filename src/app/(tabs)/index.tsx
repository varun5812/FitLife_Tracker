import React, { useState } from 'react';
import { ScrollView, RefreshControl, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useApp } from '../../context/AppContext';
import { Header } from '../../components/common/Header';
import { DailyScoreCard } from '../../components/dashboard/DailyScoreCard';
import { QuickActionsGrid } from '../../components/dashboard/QuickActionsGrid';
import { FitnessDashboardCard } from '../../components/dashboard/FitnessDashboardCard';
import { NutritionDashboardCard } from '../../components/dashboard/NutritionDashboardCard';
import { WaterDashboardCard } from '../../components/dashboard/WaterDashboardCard';
import { ScheduleDashboardCard } from '../../components/dashboard/ScheduleDashboardCard';
import { HabitsDashboardCard } from '../../components/dashboard/HabitsDashboardCard';
import { SleepDashboardCard } from '../../components/dashboard/SleepDashboardCard';
import { Spacing } from '../../constants/theme';

export default function HomeScreen() {
  const { colors } = useTheme();
  const { todaySummary, refreshData } = useApp();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Header */}
        <Header />

        {/* Daily Score Overall Progress */}
        <DailyScoreCard summary={todaySummary} />

        {/* Quick Actions Grid */}
        <QuickActionsGrid />

        {/* Fitness Card */}
        <FitnessDashboardCard summary={todaySummary} />

        {/* Nutrition Card */}
        <NutritionDashboardCard summary={todaySummary} />

        {/* Water Card */}
        <WaterDashboardCard />

        {/* Schedule & Task Card */}
        <ScheduleDashboardCard />

        {/* Habits Card */}
        <HabitsDashboardCard />

        {/* Sleep Card */}
        <SleepDashboardCard />

        <View style={{ height: Spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    paddingBottom: 96,
  },
});
