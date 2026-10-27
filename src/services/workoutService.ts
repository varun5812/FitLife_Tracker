import { getDatabase } from '../database/db';
import { Workout, WorkoutExercise, Exercise } from '../types';

export async function getExercises(category?: string): Promise<Exercise[]> {
  const db = await getDatabase();
  if (category && category !== 'All') {
    return await db.getAllAsync<Exercise>(
      'SELECT * FROM exercises WHERE category = ? ORDER BY name ASC;',
      [category]
    );
  }
  return await db.getAllAsync<Exercise>('SELECT * FROM exercises ORDER BY category, name ASC;');
}

export async function addCustomExercise(name: string, category: string, description?: string): Promise<Exercise> {
  const db = await getDatabase();
  const res = await db.runAsync(
    'INSERT INTO exercises (name, category, description, is_custom) VALUES (?, ?, ?, 1);',
    [name.trim(), category, description || '']
  );
  return {
    id: res.lastInsertRowId,
    name: name.trim(),
    category,
    description,
    is_custom: 1,
  };
}

export async function createWorkout(
  name: string,
  date: string,
  durationMinutes: number,
  caloriesBurned: number,
  exercises: Omit<WorkoutExercise, 'id' | 'workout_id'>[],
  notes?: string
): Promise<Workout> {
  const db = await getDatabase();
  const now = new Date().toISOString();

  const res = await db.runAsync(
    'INSERT INTO workouts (name, date, duration_minutes, calories_burned, notes, created_at) VALUES (?, ?, ?, ?, ?, ?);',
    [name, date, durationMinutes, caloriesBurned, notes || '', now]
  );

  const workoutId = res.lastInsertRowId;

  const savedExercises: WorkoutExercise[] = [];
  for (const ex of exercises) {
    const exRes = await db.runAsync(
      `INSERT INTO workout_exercises (
        workout_id, exercise_id, exercise_name, sets, reps, weight, rest_time_seconds, notes, completed
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        workoutId,
        ex.exercise_id,
        ex.exercise_name,
        ex.sets,
        ex.reps,
        ex.weight,
        ex.rest_time_seconds,
        ex.notes || '',
        ex.completed ?? 1,
      ]
    );
    savedExercises.push({
      id: exRes.lastInsertRowId,
      workout_id: workoutId,
      ...ex,
    });
  }

  const totalVolume = savedExercises.reduce((sum, ex) => sum + (ex.sets * ex.reps * ex.weight), 0);

  return {
    id: workoutId,
    name,
    date,
    duration_minutes: durationMinutes,
    calories_burned: caloriesBurned,
    notes,
    created_at: now,
    exercises: savedExercises,
    total_volume: totalVolume,
  };
}

export async function getWorkoutsByDate(date: string): Promise<Workout[]> {
  const db = await getDatabase();
  const workouts = await db.getAllAsync<Workout>(
    'SELECT * FROM workouts WHERE date = ? ORDER BY id DESC;',
    [date]
  );

  for (const w of workouts) {
    const exercises = await db.getAllAsync<WorkoutExercise>(
      'SELECT * FROM workout_exercises WHERE workout_id = ? ORDER BY id ASC;',
      [w.id]
    );
    w.exercises = exercises;
    w.total_volume = exercises.reduce((sum, ex) => sum + (ex.sets * ex.reps * ex.weight), 0);
  }

  return workouts;
}

export async function getAllWorkouts(): Promise<Workout[]> {
  const db = await getDatabase();
  const workouts = await db.getAllAsync<Workout>(
    'SELECT * FROM workouts ORDER BY date DESC, id DESC;'
  );

  for (const w of workouts) {
    const exercises = await db.getAllAsync<WorkoutExercise>(
      'SELECT * FROM workout_exercises WHERE workout_id = ? ORDER BY id ASC;',
      [w.id]
    );
    w.exercises = exercises;
    w.total_volume = exercises.reduce((sum, ex) => sum + (ex.sets * ex.reps * ex.weight), 0);
  }

  return workouts;
}

export async function deleteWorkout(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM workout_exercises WHERE workout_id = ?;', [id]);
  await db.runAsync('DELETE FROM workouts WHERE id = ?;', [id]);
}

export async function getWorkoutStats(): Promise<{
  totalWorkouts: number;
  totalDurationMinutes: number;
  totalCaloriesBurned: number;
  totalVolumeKg: number;
  weeklyWorkoutsCount: number;
  monthlyWorkoutsCount: number;
  personalRecords: { exerciseName: string; maxWeight: number; reps: number; date: string }[];
}> {
  const db = await getDatabase();
  
  const allWorkouts = await getAllWorkouts();
  const totalWorkouts = allWorkouts.length;
  const totalDurationMinutes = allWorkouts.reduce((acc, w) => acc + (w.duration_minutes || 0), 0);
  const totalCaloriesBurned = allWorkouts.reduce((acc, w) => acc + (w.calories_burned || 0), 0);
  const totalVolumeKg = allWorkouts.reduce((acc, w) => acc + (w.total_volume || 0), 0);

  // Past 7 days count
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const sevenDaysStr = sevenDaysAgo.toISOString().split('T')[0];

  const weeklyWorkoutsCount = allWorkouts.filter(w => w.date >= sevenDaysStr).length;

  // Past 30 days count
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyDaysStr = thirtyDaysAgo.toISOString().split('T')[0];

  const monthlyWorkoutsCount = allWorkouts.filter(w => w.date >= thirtyDaysStr).length;

  // Calculate PRs per exercise from workout_exercises join workouts
  const prRows = await db.getAllAsync<{
    exercise_name: string;
    max_weight: number;
    reps: number;
    date: string;
  }>(`
    SELECT we.exercise_name, we.weight as max_weight, we.reps, w.date
    FROM workout_exercises we
    JOIN workouts w ON we.workout_id = w.id
    WHERE we.weight = (
      SELECT MAX(we2.weight) 
      FROM workout_exercises we2 
      WHERE we2.exercise_name = we.exercise_name
    ) AND we.weight > 0
    GROUP BY we.exercise_name
    ORDER BY we.weight DESC
    LIMIT 10;
  `);

  const personalRecords = prRows.map(r => ({
    exerciseName: r.exercise_name,
    maxWeight: r.max_weight,
    reps: r.reps,
    date: r.date,
  }));

  return {
    totalWorkouts,
    totalDurationMinutes,
    totalCaloriesBurned,
    totalVolumeKg,
    weeklyWorkoutsCount,
    monthlyWorkoutsCount,
    personalRecords,
  };
}
