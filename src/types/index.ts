export type FitnessGoal = 'weight_loss' | 'muscle_gain' | 'maintenance' | 'general_fitness';
export type ActivityLevel = 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active';
export type MealCategory = 'breakfast' | 'lunch' | 'dinner' | 'snack';
export type TaskPriority = 'low' | 'medium' | 'high';
export type ScheduleCategory = 'work' | 'gym' | 'study' | 'meals' | 'sleep' | 'family' | 'personal' | 'other';
export type HabitFrequency = 'daily' | 'weekdays' | 'weekends' | 'custom';
export type TimeRange = '7d' | '30d' | '3m' | '6m' | '1y';

export interface UserProfile {
  id: number;
  name: string;
  age: number;
  height: number; // in cm
  weight: number; // in kg
  goal_weight: number; // in kg
  fitness_goal: FitnessGoal;
  activity_level: ActivityLevel;
  workout_frequency: number; // days per week
  water_target: number; // in ml
  sleep_target: number; // in hours
  calorie_goal: number;
  protein_goal: number;
  step_goal: number;
  created_at: string;
  updated_at: string;
}

export interface Exercise {
  id: number;
  name: string;
  category: string; // 'Chest' | 'Back' | 'Shoulders' | 'Arms' | 'Legs' | 'Core' | 'Cardio' | 'Full Body'
  description?: string;
  is_custom: number;
}

export interface WorkoutExercise {
  id?: number;
  workout_id?: number;
  exercise_id: number;
  exercise_name: string;
  sets: number;
  reps: number;
  weight: number; // in kg
  rest_time_seconds: number;
  notes?: string;
  completed: number; // 0 or 1
}

export interface Workout {
  id: number;
  name: string;
  date: string; // YYYY-MM-DD
  duration_minutes: number;
  calories_burned: number;
  notes?: string;
  created_at: string;
  exercises?: WorkoutExercise[];
  total_volume?: number;
}

export interface FoodItem {
  id: number;
  name: string;
  category: string;
  default_serving: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  is_custom: number;
}

export interface FoodEntry {
  id: number;
  meal_id?: number;
  name: string;
  category: MealCategory;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  date: string; // YYYY-MM-DD
  notes?: string;
  created_at: string;
}

export interface Meal {
  id: number;
  name: string;
  category: MealCategory;
  date: string;
  time: string;
  created_at: string;
  entries?: FoodEntry[];
}

export interface WaterEntry {
  id: number;
  amount_ml: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  created_at: string;
}

export interface WeightEntry {
  id: number;
  weight: number;
  date: string; // YYYY-MM-DD
  notes?: string;
  created_at: string;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  due_date: string; // YYYY-MM-DD
  due_time?: string; // HH:MM
  priority: TaskPriority;
  category: string;
  completed: number; // 0 or 1
  completed_at?: string;
  created_at: string;
}

export interface ScheduleEvent {
  id: number;
  title: string;
  start_time: string; // HH:MM
  end_time: string; // HH:MM
  category: ScheduleCategory;
  reminder: number;
  completed: number;
  date: string; // YYYY-MM-DD
  created_at: string;
}

export interface Habit {
  id: number;
  name: string;
  icon: string;
  color: string;
  frequency: HabitFrequency;
  reminder_time?: string;
  target_days_per_week: number;
  created_at: string;
  // Computed fields
  completed_today?: boolean;
  current_streak?: number;
  longest_streak?: number;
  weekly_history?: { date: string; completed: boolean }[];
}

export interface HabitLog {
  id: number;
  habit_id: number;
  date: string; // YYYY-MM-DD
  completed: number;
  notes?: string;
  created_at: string;
}

export interface SleepEntry {
  id: number;
  sleep_time: string; // YYYY-MM-DD HH:MM
  wake_time: string; // YYYY-MM-DD HH:MM
  duration_hours: number;
  sleep_goal: number;
  quality_rating?: number; // 1-5
  notes?: string;
  date: string; // YYYY-MM-DD
  created_at: string;
}

export interface FocusSession {
  id: number;
  tag: string;
  duration_minutes: number;
  session_type: 'focus' | 'short_break' | 'long_break';
  date: string; // YYYY-MM-DD
  created_at: string;
}

export interface DailySummary {
  date: string;
  dailyScore: number;
  scoreBreakdown: {
    fitness: { score: number; target: number; actual: number; unit: string; completed: boolean };
    nutrition: { score: number; target: number; actual: number; unit: string; completed: boolean };
    protein: { score: number; target: number; actual: number; unit: string; completed: boolean };
    water: { score: number; target: number; actual: number; unit: string; completed: boolean };
    habits: { score: number; target: number; actual: number; unit: string; completed: boolean };
    tasks: { score: number; target: number; actual: number; unit: string; completed: boolean };
    sleep: { score: number; target: number; actual: number; unit: string; completed: boolean };
  };
  workout: {
    count: number;
    durationMinutes: number;
    caloriesBurned: number;
    latestWorkoutName?: string;
  };
  nutrition: {
    calories: number;
    targetCalories: number;
    protein: number;
    targetProtein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  water: {
    currentMl: number;
    targetMl: number;
    progressPercentage: number;
  };
  habits: {
    total: number;
    completed: number;
    streak: number;
  };
  tasks: {
    total: number;
    completed: number;
    upcoming?: Task;
  };
  sleep: {
    logged: boolean;
    durationHours: number;
    targetHours: number;
    qualityRating?: number;
  };
  schedule: {
    currentActivity?: ScheduleEvent;
    nextActivity?: ScheduleEvent;
  };
}
