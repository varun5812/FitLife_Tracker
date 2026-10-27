import { getDatabase } from '../database/db';
import { ScheduleEvent, ScheduleCategory } from '../types';

export async function addScheduleEvent(
  title: string,
  startTime: string,
  endTime: string,
  category: ScheduleCategory,
  date: string,
  reminder: number = 0
): Promise<ScheduleEvent> {
  const db = await getDatabase();
  const now = new Date().toISOString();

  const res = await db.runAsync(
    `INSERT INTO schedule_events (title, start_time, end_time, category, reminder, completed, date, created_at)
     VALUES (?, ?, ?, ?, ?, 0, ?, ?);`,
    [title.trim(), startTime, endTime, category, reminder, date, now]
  );

  return {
    id: res.lastInsertRowId,
    title: title.trim(),
    start_time: startTime,
    end_time: endTime,
    category,
    reminder,
    completed: 0,
    date,
    created_at: now,
  };
}

export async function getScheduleEventsByDate(date: string): Promise<ScheduleEvent[]> {
  const db = await getDatabase();
  return await db.getAllAsync<ScheduleEvent>(
    'SELECT * FROM schedule_events WHERE date = ? ORDER BY start_time ASC;',
    [date]
  );
}

export async function toggleScheduleEvent(id: number): Promise<boolean> {
  const db = await getDatabase();
  const current = await db.getFirstAsync<{ completed: number }>(
    'SELECT completed FROM schedule_events WHERE id = ?;',
    [id]
  );
  if (!current) return false;

  const newStatus = current.completed === 1 ? 0 : 1;
  await db.runAsync('UPDATE schedule_events SET completed = ? WHERE id = ?;', [newStatus, id]);
  return newStatus === 1;
}

export async function deleteScheduleEvent(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM schedule_events WHERE id = ?;', [id]);
}

export async function getCurrentAndNextActivity(date: string): Promise<{
  current?: ScheduleEvent;
  next?: ScheduleEvent;
}> {
  const events = await getScheduleEventsByDate(date);
  if (events.length === 0) return {};

  const now = new Date();
  const currentHour = now.getHours();
  const currentMin = now.getMinutes();
  const nowMinutes = currentHour * 60 + currentMin;

  let currentActivity: ScheduleEvent | undefined;
  let nextActivity: ScheduleEvent | undefined;

  for (const event of events) {
    const [startH, startM] = event.start_time.split(':').map(Number);
    const [endH, endM] = event.end_time.split(':').map(Number);

    const startMinutes = (startH || 0) * 60 + (startM || 0);
    const endMinutes = (endH || 0) * 60 + (endM || 0);

    if (nowMinutes >= startMinutes && nowMinutes <= endMinutes) {
      currentActivity = event;
    } else if (startMinutes > nowMinutes && !nextActivity) {
      nextActivity = event;
    }
  }

  return {
    current: currentActivity,
    next: nextActivity,
  };
}
