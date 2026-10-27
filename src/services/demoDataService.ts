import { saveProfile } from './profileService';
import { createWorkout } from './workoutService';
import { addFoodEntry } from './foodService';
import { addWaterEntry } from './waterService';
import { logWeight } from './weightService';
import { addTask } from './taskService';
import { addHabit, toggleHabit } from './habitService';
import { logSleepEntry } from './sleepService';
import { logFocusSession } from './focusService';
import { addScheduleEvent } from './scheduleService';
import { UserProfile } from '../types';

export async function seedDemoUserData(): Promise<UserProfile> {
  const today = new Date().toISOString().split('T')[0];

  // 1. Save Profile
  const profile = await saveProfile({
    name: 'Alex Walker',
    age: 26,
    height: 178,
    weight: 74.2,
    goal_weight: 70.0,
    fitness_goal: 'weight_loss',
    activity_level: 'moderately_active',
    workout_frequency: 4,
    water_target: 2500,
    sleep_target: 8.0,
    calorie_goal: 2150,
    protein_goal: 155,
    step_goal: 10000,
  });

  // 2. Log Past Weight entries to show a 7-day progress trend
  const d3 = new Date(); d3.setDate(d3.getDate() - 6);
  const d2 = new Date(); d2.setDate(d2.getDate() - 3);
  await logWeight(75.5, d3.toISOString().split('T')[0], 'Starting week check-in');
  await logWeight(74.8, d2.toISOString().split('T')[0], 'Down 0.7kg, consistent deficit');
  await logWeight(74.2, today, 'Official weekly weigh-in');

  // 3. Log Completed Push Workout for Today
  await createWorkout(
    'Push Day Hypertrophy',
    today,
    52,
    420,
    [
      {
        exercise_id: 1,
        exercise_name: 'Barbell Bench Press',
        sets: 4,
        reps: 10,
        weight: 80,
        rest_time_seconds: 90,
        completed: 1,
      },
      {
        exercise_id: 2,
        exercise_name: 'Incline Dumbbell Press',
        sets: 3,
        reps: 12,
        weight: 26,
        rest_time_seconds: 75,
        completed: 1,
      },
      {
        exercise_id: 11,
        exercise_name: 'Dumbbell Lateral Raise',
        sets: 4,
        reps: 15,
        weight: 12,
        rest_time_seconds: 45,
        completed: 1,
      },
      {
        exercise_id: 26,
        exercise_name: 'Tricep Rope Pushdown',
        sets: 3,
        reps: 12,
        weight: 28,
        rest_time_seconds: 60,
        completed: 1,
      },
    ],
    'Felt strong on bench press. Good shoulder pump.'
  );

  // 4. Log Meals for Today
  await addFoodEntry({
    name: 'Oats (Rolled) with Scoop Whey',
    category: 'breakfast',
    quantity: 1,
    unit: 'bowl',
    calories: 380,
    protein: 34,
    carbs: 45,
    fat: 6,
    fiber: 5,
    date: today,
    notes: 'Breakfast with almond milk',
  });

  await addFoodEntry({
    name: 'Grilled Chicken Breast & Brown Rice',
    category: 'lunch',
    quantity: 1,
    unit: 'plate',
    calories: 520,
    protein: 52,
    carbs: 58,
    fat: 9,
    fiber: 4,
    date: today,
    notes: 'Steamed greens on the side',
  });

  await addFoodEntry({
    name: 'Greek Yogurt 0% & Fresh Blueberries',
    category: 'snack',
    quantity: 1,
    unit: 'serving',
    calories: 165,
    protein: 18,
    carbs: 18,
    fat: 1,
    fiber: 3,
    date: today,
    notes: 'Post workout protein fuel',
  });

  // 5. Water Entries (2,000 ml logged)
  await addWaterEntry(500, today);
  await addWaterEntry(500, today);
  await addWaterEntry(500, today);
  await addWaterEntry(500, today);

  // 6. Habits & Completion
  const habitWater = await addHabit('Drink 2.5L Water', 'water-outline', '#3B82F6', 'daily', 7);
  const habitWorkout = await addHabit('Daily Workout', 'barbell-outline', '#10B981', 'daily', 5);
  const habitReading = await addHabit('Read 15 Mins', 'book-outline', '#8B5CF6', 'daily', 7);
  await addHabit('Sleep by 11:00 PM', 'moon-outline', '#F59E0B', 'daily', 7);

  await toggleHabit(habitWater.id, today);
  await toggleHabit(habitWorkout.id, today);
  await toggleHabit(habitReading.id, today);

  // 7. Priority Daily Tasks
  await addTask('Morning hydration & electrolytes', today, 'high', 'Health', '07:30', 'Drink 500ml water');
  await addTask('Chest & Triceps workout session', today, 'high', 'Fitness', '17:00', 'Gym session');
  await addTask('Prep high-protein meals for tomorrow', today, 'medium', 'Nutrition', '20:00', 'Grill chicken breast');

  // 8. Sleep Entry
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const sleepStart = `${yesterday.toISOString().split('T')[0]}T23:15:00.000Z`;
  const wakeEnd = `${today}T07:00:00.000Z`;
  await logSleepEntry(sleepStart, wakeEnd, today, 4, 'Woke up refreshed and ready');

  // 9. Focus Pomodoro Session
  await logFocusSession('Workout Session', 45, 'focus', today);

  // 10. Schedule Events
  await addScheduleEvent('Morning Routine & Hydration', '07:00', '08:00', 'personal', today);
  await addScheduleEvent('Work & Deep Focus Block', '09:00', '13:00', 'work', today);
  await addScheduleEvent('Gym Session (Push Day)', '17:00', '18:15', 'gym', today);
  await addScheduleEvent('Dinner & Protein Recovery', '19:00', '20:00', 'meals', today);

  return profile;
}
