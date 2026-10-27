import { getDatabase } from '../database/db';
import { UserProfile, FitnessGoal, ActivityLevel } from '../types';

export function calculateNutritionTargets(
  weightKg: number,
  heightCm: number,
  age: number,
  goal: FitnessGoal,
  activity: ActivityLevel
): { calories: number; protein: number; waterMl: number } {
  // Mifflin-St Jeor Equation for BMR (using standard neutral formula)
  const bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;

  let activityMultiplier = 1.2;
  switch (activity) {
    case 'sedentary':
      activityMultiplier = 1.2;
      break;
    case 'lightly_active':
      activityMultiplier = 1.375;
      break;
    case 'moderately_active':
      activityMultiplier = 1.55;
      break;
    case 'very_active':
      activityMultiplier = 1.725;
      break;
    case 'extra_active':
      activityMultiplier = 1.9;
      break;
  }

  const tdee = bmr * activityMultiplier;

  let calorieTarget = Math.round(tdee);
  let proteinTarget = Math.round(weightKg * 1.8); // 1.8g per kg bodyweight base

  switch (goal) {
    case 'weight_loss':
      calorieTarget = Math.round(tdee - 500); // 500 kcal deficit
      proteinTarget = Math.round(weightKg * 2.0); // Higher protein to preserve lean mass
      break;
    case 'muscle_gain':
      calorieTarget = Math.round(tdee + 300); // Clean surplus
      proteinTarget = Math.round(weightKg * 2.2);
      break;
    case 'maintenance':
      calorieTarget = Math.round(tdee);
      proteinTarget = Math.round(weightKg * 1.8);
      break;
    case 'general_fitness':
      calorieTarget = Math.round(tdee);
      proteinTarget = Math.round(weightKg * 1.6);
      break;
  }

  // Water calculation: 35ml per kg bodyweight
  const waterTarget = Math.round(Math.max(2000, weightKg * 35));

  return {
    calories: Math.max(1200, calorieTarget),
    protein: Math.max(50, proteinTarget),
    waterMl: waterTarget,
  };
}

export async function getProfile(): Promise<UserProfile | null> {
  const db = await getDatabase();
  const profile = await db.getFirstAsync<UserProfile>('SELECT * FROM profile ORDER BY id ASC LIMIT 1;');
  return profile || null;
}

export async function saveProfile(profileData: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>): Promise<UserProfile> {
  const db = await getDatabase();
  const now = new Date().toISOString();
  
  const existing = await getProfile();

  if (existing) {
    await db.runAsync(
      `UPDATE profile SET 
        name = ?, age = ?, height = ?, weight = ?, goal_weight = ?, 
        fitness_goal = ?, activity_level = ?, workout_frequency = ?, 
        water_target = ?, sleep_target = ?, calorie_goal = ?, 
        protein_goal = ?, step_goal = ?, updated_at = ?
      WHERE id = ?;`,
      [
        profileData.name,
        profileData.age,
        profileData.height,
        profileData.weight,
        profileData.goal_weight,
        profileData.fitness_goal,
        profileData.activity_level,
        profileData.workout_frequency,
        profileData.water_target,
        profileData.sleep_target,
        profileData.calorie_goal,
        profileData.protein_goal,
        profileData.step_goal,
        now,
        existing.id,
      ]
    );

    return {
      ...existing,
      ...profileData,
      updated_at: now,
    };
  } else {
    const result = await db.runAsync(
      `INSERT INTO profile (
        name, age, height, weight, goal_weight, fitness_goal, 
        activity_level, workout_frequency, water_target, sleep_target, 
        calorie_goal, protein_goal, step_goal, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        profileData.name,
        profileData.age,
        profileData.height,
        profileData.weight,
        profileData.goal_weight,
        profileData.fitness_goal,
        profileData.activity_level,
        profileData.workout_frequency,
        profileData.water_target,
        profileData.sleep_target,
        profileData.calorie_goal,
        profileData.protein_goal,
        profileData.step_goal,
        now,
        now,
      ]
    );

    // Also log initial weight to weight_entries if not present
    const today = now.split('T')[0];
    await db.runAsync(
      `INSERT OR IGNORE INTO weight_entries (weight, date, notes, created_at) VALUES (?, ?, 'Initial Onboarding Weight', ?);`,
      [profileData.weight, today, now]
    );

    return {
      id: result.lastInsertRowId,
      ...profileData,
      created_at: now,
      updated_at: now,
    };
  }
}
