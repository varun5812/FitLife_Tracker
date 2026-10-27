import { getDatabase } from '../database/db';
import { WaterEntry } from '../types';

export async function addWaterEntry(amountMl: number, date?: string): Promise<WaterEntry> {
  const db = await getDatabase();
  const now = new Date();
  const dateStr = date || now.toISOString().split('T')[0];
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const nowIso = now.toISOString();

  const res = await db.runAsync(
    'INSERT INTO water_entries (amount_ml, date, time, created_at) VALUES (?, ?, ?, ?);',
    [amountMl, dateStr, timeStr, nowIso]
  );

  return {
    id: res.lastInsertRowId,
    amount_ml: amountMl,
    date: dateStr,
    time: timeStr,
    created_at: nowIso,
  };
}

export async function getWaterEntriesByDate(date: string): Promise<WaterEntry[]> {
  const db = await getDatabase();
  return await db.getAllAsync<WaterEntry>(
    'SELECT * FROM water_entries WHERE date = ? ORDER BY id DESC;',
    [date]
  );
}

export async function getTotalWaterByDate(date: string): Promise<number> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ total: number }>(
    'SELECT SUM(amount_ml) as total FROM water_entries WHERE date = ?;',
    [date]
  );
  return row?.total || 0;
}

export async function deleteWaterEntry(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM water_entries WHERE id = ?;', [id]);
}
