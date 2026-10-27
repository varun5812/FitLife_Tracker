import { DailySummary } from '../types';
import { getProfile } from './profileService';
import { getWorkoutsByDate } from './workoutService';
import { getDailyNutritionTotals } from './foodService';
import { getTotalWaterByDate } from './waterService';
import { getHabitsWithStatus } from './habitService';
import { getTasksByDate } from './taskService';
import { getSleepByDate } from './sleepService';
import { getCurrentAndNextActivity } from './scheduleService';

export async function computeDailySummary(date: string): Promise<DailySummary> {
  const profile = await getProfile();

  // Targets from profile or standard defaults
  const calorieTarget = profile?.calorie_goal || 2200;
  const proteinTarget = profile?.protein_goal || 140;
  const waterTarget = profile?.water_target || 2500;
  const sleepTarget = profile?.sleep_target || 8.0;
  const workoutTarget = 1; // 1 workout per active day

  // Actual data from SQLite
  const [
    workouts,
    nutrition,
    waterCurrentMl,
    habits,
    tasks,
    sleepEntry,
    scheduleInfo,
  ] = await Promise.all([
    getWorkoutsByDate(date),
    getDailyNutritionTotals(date),
    getTotalWaterByDate(date),
    getHabitsWithStatus(date),
    getTasksByDate(date),
    getSleepByDate(date),
    getCurrentAndNextActivity(date),
  ]);

  // Metric 1: Fitness
  const workoutCount = workouts.length;
  const workoutDuration = workouts.reduce((sum, w) => sum + w.duration_minutes, 0);
  const workoutCalories = workouts.reduce((sum, w) => sum + w.calories_burned, 0);
  const fitnessScore = Math.min(100, Math.round((workoutCount / workoutTarget) * 100));

  // Metric 2: Calories Nutrition (aim to hit within 10% of target or not exceed excessively)
  let nutritionScore = 0;
  if (nutrition.calories > 0) {
    const calRatio = nutrition.calories / calorieTarget;
    if (calRatio <= 1) {
      nutritionScore = Math.round(calRatio * 100);
    } else {
      // Slight penalty if over by > 20%
      nutritionScore = Math.max(0, Math.round(100 - (calRatio - 1) * 100));
    }
  }

  // Metric 3: Protein
  const proteinScore = Math.min(100, Math.round((nutrition.protein / proteinTarget) * 100));

  // Metric 4: Water
  const waterScore = Math.min(100, Math.round((waterCurrentMl / waterTarget) * 100));

  // Metric 5: Habits
  const totalHabits = habits.length;
  const completedHabits = habits.filter(h => h.completed_today).length;
  const habitsScore = totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0;

  // Metric 6: Tasks
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed === 1).length;
  const tasksScore = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const upcomingTask = tasks.find(t => t.completed === 0);

  // Metric 7: Sleep
  const sleepDuration = sleepEntry ? sleepEntry.duration_hours : 0;
  const sleepScore = Math.min(100, Math.round((sleepDuration / sleepTarget) * 100));

  // Calculate Weighted Daily Score
  // Active pillars: Fitness (20%), Nutrition (20%), Water (15%), Habits (20%), Tasks (15%), Sleep (10%)
  // If user hasn't created habits or tasks yet, dynamically distribute weights across active categories
  let totalWeights = 0;
  let weightedSum = 0;

  // Fitness (Weight: 20)
  weightedSum += fitnessScore * 20;
  totalWeights += 20;

  // Nutrition (Weight: 20)
  weightedSum += nutritionScore * 20;
  totalWeights += 20;

  // Water (Weight: 15)
  weightedSum += waterScore * 15;
  totalWeights += 15;

  // Sleep (Weight: 15)
  weightedSum += sleepScore * 15;
  totalWeights += 15;

  // Habits (Weight: 15 only if habits exist)
  if (totalHabits > 0) {
    weightedSum += habitsScore * 15;
    totalWeights += 15;
  }

  // Tasks (Weight: 15 only if tasks exist for today)
  if (totalTasks > 0) {
    weightedSum += tasksScore * 15;
    totalWeights += 15;
  }

  const overallScore = totalWeights > 0 ? Math.round(weightedSum / totalWeights) : 0;

  // Average streak of habits
  const activeHabitStreaks = habits.map(h => h.current_streak || 0);
  const maxStreak = activeHabitStreaks.length > 0 ? Math.max(...activeHabitStreaks) : 0;

  return {
    date,
    dailyScore: overallScore,
    scoreBreakdown: {
      fitness: {
        score: fitnessScore,
        target: workoutTarget,
        actual: workoutCount,
        unit: 'workout',
        completed: workoutCount >= workoutTarget,
      },
      nutrition: {
        score: nutritionScore,
        target: calorieTarget,
        actual: nutrition.calories,
        unit: 'kcal',
        completed: nutritionScore >= 80,
      },
      protein: {
        score: proteinScore,
        target: proteinTarget,
        actual: nutrition.protein,
        unit: 'g',
        completed: nutrition.protein >= proteinTarget,
      },
      water: {
        score: waterScore,
        target: waterTarget,
        actual: waterCurrentMl,
        unit: 'ml',
        completed: waterCurrentMl >= waterTarget,
      },
      habits: {
        score: habitsScore,
        target: totalHabits,
        actual: completedHabits,
        unit: 'habits',
        completed: totalHabits > 0 && completedHabits === totalHabits,
      },
      tasks: {
        score: tasksScore,
        target: totalTasks,
        actual: completedTasks,
        unit: 'tasks',
        completed: totalTasks > 0 && completedTasks === totalTasks,
      },
      sleep: {
        score: sleepScore,
        target: sleepTarget,
        actual: sleepDuration,
        unit: 'hrs',
        completed: sleepDuration >= sleepTarget,
      },
    },
    workout: {
      count: workoutCount,
      durationMinutes: workoutDuration,
      caloriesBurned: workoutCalories,
      latestWorkoutName: workouts[0]?.name,
    },
    nutrition: {
      calories: nutrition.calories,
      targetCalories: calorieTarget,
      protein: nutrition.protein,
      targetProtein: proteinTarget,
      carbs: nutrition.carbs,
      fat: nutrition.fat,
      fiber: nutrition.fiber,
    },
    water: {
      currentMl: waterCurrentMl,
      targetMl: waterTarget,
      progressPercentage: waterScore,
    },
    habits: {
      total: totalHabits,
      completed: completedHabits,
      streak: maxStreak,
    },
    tasks: {
      total: totalTasks,
      completed: completedTasks,
      upcoming: upcomingTask,
    },
    sleep: {
      logged: !!sleepEntry,
      durationHours: sleepDuration,
      targetHours: sleepTarget,
      qualityRating: sleepEntry?.quality_rating,
    },
    schedule: {
      currentActivity: scheduleInfo.current,
      nextActivity: scheduleInfo.next,
    },
  };
}
