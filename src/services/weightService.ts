import { getDatabase } from '../database/db';
import { WeightEntry } from '../types';
import { getProfile } from './profileService';

export async function logWeight(weight: number, date?: string, notes?: string): Promise<WeightEntry> {
  const db = await getDatabase();
  const now = new Date().toISOString();
  const dateStr = date || now.split('T')[0];

  await db.runAsync(
    `INSERT INTO weight_entries (weight, date, notes, created_at) 
     VALUES (?, ?, ?, ?)
     ON CONFLICT(date) DO UPDATE SET weight = excluded.weight, notes = excluded.notes, created_at = excluded.created_at;`,
    [weight, dateStr, notes || '', now]
  );

  // Also update current weight on profile
  await db.runAsync('UPDATE profile SET weight = ?, updated_at = ? WHERE id = 1;', [weight, now]);

  const entry = await db.getFirstAsync<WeightEntry>(
    'SELECT * FROM weight_entries WHERE date = ?;',
    [dateStr]
  );

  return entry!;
}

export async function getAllWeightEntries(): Promise<WeightEntry[]> {
  const db = await getDatabase();
  return await db.getAllAsync<WeightEntry>(
    'SELECT * FROM weight_entries ORDER BY date ASC;'
  );
}

export async function deleteWeightEntry(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM weight_entries WHERE id = ?;', [id]);
}

export async function getWeightProgressSummary(): Promise<{
  startingWeight: number;
  currentWeight: number;
  goalWeight: number;
  weightChange: number;
  remainingToGoal: number;
  progressPercentage: number;
  entries: WeightEntry[];
}> {
  const entries = await getAllWeightEntries();
  const profile = await getProfile();

  const startingWeight = entries.length > 0 ? entries[0].weight : (profile?.weight || 70);
  const currentWeight = entries.length > 0 ? entries[entries.length - 1].weight : (profile?.weight || 70);
  const goalWeight = profile?.goal_weight || startingWeight;

  const totalDiff = goalWeight - startingWeight;
  const currentDiff = currentWeight - startingWeight;
  const weightChange = currentWeight - startingWeight;
  const remainingToGoal = Math.abs(currentWeight - goalWeight);

  let progressPercentage = 0;
  if (Math.abs(totalDiff) > 0.01) {
    progressPercentage = Math.min(100, Math.max(0, Math.round((currentDiff / totalDiff) * 100)));
  } else {
    progressPercentage = 100;
  }

  return {
    startingWeight,
    currentWeight,
    goalWeight,
    weightChange: Number(weightChange.toFixed(1)),
    remainingToGoal: Number(remainingToGoal.toFixed(1)),
    progressPercentage,
    entries,
  };
}
