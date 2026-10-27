import { getDatabase } from '../database/db';
import { TimeRange } from '../types';

export interface ProgressDataPoint {
  label: string; // e.g. "Mon", "09/15", "Jan"
  date: string;
  value: number;
}

export function getDateRangeStart(range: TimeRange, referenceDate: Date = new Date()): string {
  const d = new Date(referenceDate);
  switch (range) {
    case '7d':
      d.setDate(d.getDate() - 6);
      break;
    case '30d':
      d.setDate(d.getDate() - 29);
      break;
    case '3m':
      d.setMonth(d.getMonth() - 3);
      break;
    case '6m':
      d.setMonth(d.getMonth() - 6);
      break;
    case '1y':
      d.setFullYear(d.getFullYear() - 1);
      break;
  }
  return d.toISOString().split('T')[0];
}

export async function getWeightProgress(range: TimeRange): Promise<ProgressDataPoint[]> {
  const db = await getDatabase();
  const startDate = getDateRangeStart(range);
  const rows = await db.getAllAsync<{ date: string; weight: number }>(
    'SELECT date, weight FROM weight_entries WHERE date >= ? ORDER BY date ASC;',
    [startDate]
  );

  return rows.map(r => ({
    date: r.date,
    label: r.date.slice(5), // "MM-DD"
    value: r.weight,
  }));
}

export async function getCalorieProgress(range: TimeRange): Promise<ProgressDataPoint[]> {
  const db = await getDatabase();
  const startDate = getDateRangeStart(range);
  const rows = await db.getAllAsync<{ date: string; total_calories: number }>(
    `SELECT date, SUM(calories) as total_calories 
     FROM food_entries 
     WHERE date >= ? 
     GROUP BY date 
     ORDER BY date ASC;`,
    [startDate]
  );

  return rows.map(r => ({
    date: r.date,
    label: r.date.slice(5),
    value: Math.round(r.total_calories),
  }));
}

export async function getProteinProgress(range: TimeRange): Promise<ProgressDataPoint[]> {
  const db = await getDatabase();
  const startDate = getDateRangeStart(range);
  const rows = await db.getAllAsync<{ date: string; total_protein: number }>(
    `SELECT date, SUM(protein) as total_protein 
     FROM food_entries 
     WHERE date >= ? 
     GROUP BY date 
     ORDER BY date ASC;`,
    [startDate]
  );

  return rows.map(r => ({
    date: r.date,
    label: r.date.slice(5),
    value: Math.round(r.total_protein),
  }));
}

export async function getWorkoutVolumeProgress(range: TimeRange): Promise<ProgressDataPoint[]> {
  const db = await getDatabase();
  const startDate = getDateRangeStart(range);
  const rows = await db.getAllAsync<{ date: string; total_volume: number }>(
    `SELECT w.date, SUM(we.sets * we.reps * we.weight) as total_volume
     FROM workouts w
     JOIN workout_exercises we ON w.id = we.workout_id
     WHERE w.date >= ?
     GROUP BY w.date
     ORDER BY w.date ASC;`,
    [startDate]
  );

  return rows.map(r => ({
    date: r.date,
    label: r.date.slice(5),
    value: Math.round(r.total_volume || 0),
  }));
}

export async function getWaterProgress(range: TimeRange): Promise<ProgressDataPoint[]> {
  const db = await getDatabase();
  const startDate = getDateRangeStart(range);
  const rows = await db.getAllAsync<{ date: string; total_water: number }>(
    `SELECT date, SUM(amount_ml) as total_water 
     FROM water_entries 
     WHERE date >= ? 
     GROUP BY date 
     ORDER BY date ASC;`,
    [startDate]
  );

  return rows.map(r => ({
    date: r.date,
    label: r.date.slice(5),
    value: Math.round(r.total_water),
  }));
}

export async function getSleepProgress(range: TimeRange): Promise<ProgressDataPoint[]> {
  const db = await getDatabase();
  const startDate = getDateRangeStart(range);
  const rows = await db.getAllAsync<{ date: string; duration_hours: number }>(
    `SELECT date, duration_hours 
     FROM sleep_entries 
     WHERE date >= ? 
     ORDER BY date ASC;`,
    [startDate]
  );

  return rows.map(r => ({
    date: r.date,
    label: r.date.slice(5),
    value: Number(r.duration_hours.toFixed(1)),
  }));
}

export async function getFocusProgress(range: TimeRange): Promise<ProgressDataPoint[]> {
  const db = await getDatabase();
  const startDate = getDateRangeStart(range);
  const rows = await db.getAllAsync<{ date: string; total_focus: number }>(
    `SELECT date, SUM(duration_minutes) as total_focus 
     FROM focus_sessions 
     WHERE date >= ? AND session_type = 'focus'
     GROUP BY date 
     ORDER BY date ASC;`,
    [startDate]
  );

  return rows.map(r => ({
    date: r.date,
    label: r.date.slice(5),
    value: Math.round(r.total_focus),
  }));
}

export async function getHabitProgress(range: TimeRange): Promise<ProgressDataPoint[]> {
  const db = await getDatabase();
  const startDate = getDateRangeStart(range);
  const rows = await db.getAllAsync<{ date: string; completed_count: number }>(
    `SELECT date, COUNT(*) as completed_count 
     FROM habit_logs 
     WHERE date >= ? AND completed = 1
     GROUP BY date 
     ORDER BY date ASC;`,
    [startDate]
  );

  return rows.map(r => ({
    date: r.date,
    label: r.date.slice(5),
    value: r.completed_count,
  }));
}
