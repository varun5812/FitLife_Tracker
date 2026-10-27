import { getDatabase } from '../database/db';
import { SleepEntry } from '../types';
import { getProfile } from './profileService';

export async function logSleepEntry(
  sleepTime: string,
  wakeTime: string,
  date: string,
  qualityRating: number = 4,
  notes?: string
): Promise<SleepEntry> {
  const db = await getDatabase();
  const profile = await getProfile();
  const sleepGoal = profile?.sleep_target || 8.0;

  // Calculate duration in hours between sleepTime and wakeTime
  const start = new Date(sleepTime);
  const end = new Date(wakeTime);
  const diffMs = end.getTime() - start.getTime();
  let durationHours = Number((diffMs / (1000 * 60 * 60)).toFixed(1));
  if (durationHours < 0) durationHours = 0;

  const now = new Date().toISOString();

  await db.runAsync(
    `INSERT INTO sleep_entries (sleep_time, wake_time, duration_hours, sleep_goal, quality_rating, notes, date, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(date) DO UPDATE SET 
      sleep_time = excluded.sleep_time,
      wake_time = excluded.wake_time,
      duration_hours = excluded.duration_hours,
      sleep_goal = excluded.sleep_goal,
      quality_rating = excluded.quality_rating,
      notes = excluded.notes,
      created_at = excluded.created_at;`,
    [sleepTime, wakeTime, durationHours, sleepGoal, qualityRating, notes || '', date, now]
  );

  const entry = await db.getFirstAsync<SleepEntry>(
    'SELECT * FROM sleep_entries WHERE date = ?;',
    [date]
  );

  return entry!;
}

export async function getSleepByDate(date: string): Promise<SleepEntry | null> {
  const db = await getDatabase();
  const entry = await db.getFirstAsync<SleepEntry>(
    'SELECT * FROM sleep_entries WHERE date = ?;',
    [date]
  );
  return entry || null;
}

export async function getSleepHistory(limit: number = 30): Promise<SleepEntry[]> {
  const db = await getDatabase();
  return await db.getAllAsync<SleepEntry>(
    'SELECT * FROM sleep_entries ORDER BY date DESC LIMIT ?;',
    [limit]
  );
}

export async function getWeeklyAverageSleep(currentDate: string): Promise<{
  averageHours: number;
  loggedDays: number;
  goalMetDays: number;
}> {
  const db = await getDatabase();
  
  const sevenDaysAgo = new Date(currentDate);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  const startStr = sevenDaysAgo.toISOString().split('T')[0];

  const entries = await db.getAllAsync<SleepEntry>(
    'SELECT * FROM sleep_entries WHERE date >= ? AND date <= ?;',
    [startStr, currentDate]
  );

  if (entries.length === 0) {
    return { averageHours: 0, loggedDays: 0, goalMetDays: 0 };
  }

  const totalDuration = entries.reduce((acc, e) => acc + e.duration_hours, 0);
  const averageHours = Number((totalDuration / entries.length).toFixed(1));
  const goalMetDays = entries.filter(e => e.duration_hours >= e.sleep_goal).length;

  return {
    averageHours,
    loggedDays: entries.length,
    goalMetDays,
  };
}
