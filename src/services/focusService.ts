import { getDatabase } from '../database/db';
import { FocusSession } from '../types';

export async function logFocusSession(
  tag: string = 'General',
  durationMinutes: number = 25,
  sessionType: 'focus' | 'short_break' | 'long_break' = 'focus',
  date?: string
): Promise<FocusSession> {
  const db = await getDatabase();
  const now = new Date().toISOString();
  const dateStr = date || now.split('T')[0];

  const res = await db.runAsync(
    'INSERT INTO focus_sessions (tag, duration_minutes, session_type, date, created_at) VALUES (?, ?, ?, ?, ?);',
    [tag.trim(), durationMinutes, sessionType, dateStr, now]
  );

  return {
    id: res.lastInsertRowId,
    tag: tag.trim(),
    duration_minutes: durationMinutes,
    session_type: sessionType,
    date: dateStr,
    created_at: now,
  };
}

export async function getFocusStatsByDate(date: string): Promise<{
  totalSessions: number;
  totalFocusMinutes: number;
  sessions: FocusSession[];
}> {
  const db = await getDatabase();
  const sessions = await db.getAllAsync<FocusSession>(
    'SELECT * FROM focus_sessions WHERE date = ? AND session_type = "focus" ORDER BY id DESC;',
    [date]
  );

  const totalSessions = sessions.length;
  const totalFocusMinutes = sessions.reduce((sum, s) => sum + s.duration_minutes, 0);

  return {
    totalSessions,
    totalFocusMinutes,
    sessions,
  };
}

export async function getFocusHistory(limit: number = 50): Promise<FocusSession[]> {
  const db = await getDatabase();
  return await db.getAllAsync<FocusSession>(
    'SELECT * FROM focus_sessions ORDER BY id DESC LIMIT ?;',
    [limit]
  );
}
