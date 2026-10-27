import { getDatabase } from '../database/db';
import { Habit, HabitFrequency } from '../types';

export async function addHabit(
  name: string,
  icon: string = 'checkmark-circle-outline',
  color: string = '#10B981',
  frequency: HabitFrequency = 'daily',
  targetDaysPerWeek: number = 7,
  reminderTime?: string
): Promise<Habit> {
  const db = await getDatabase();
  const now = new Date().toISOString();

  const res = await db.runAsync(
    `INSERT INTO habits (name, icon, color, frequency, reminder_time, target_days_per_week, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?);`,
    [name.trim(), icon, color, frequency, reminderTime || null, targetDaysPerWeek, now]
  );

  return {
    id: res.lastInsertRowId,
    name: name.trim(),
    icon,
    color,
    frequency,
    reminder_time: reminderTime,
    target_days_per_week: targetDaysPerWeek,
    created_at: now,
    completed_today: false,
    current_streak: 0,
    longest_streak: 0,
    weekly_history: [],
  };
}

export async function getHabitsWithStatus(date: string): Promise<Habit[]> {
  const db = await getDatabase();
  const habits = await db.getAllAsync<Habit>('SELECT * FROM habits ORDER BY id ASC;');

  // Prepare past 7 days dates array
  const last7Days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(date);
    d.setDate(d.getDate() - i);
    last7Days.push(d.toISOString().split('T')[0]);
  }

  for (const habit of habits) {
    // Check if completed on target date
    const todayLog = await db.getFirstAsync<{ id: number; completed: number }>(
      'SELECT id, completed FROM habit_logs WHERE habit_id = ? AND date = ?;',
      [habit.id, date]
    );
    habit.completed_today = (todayLog?.completed ?? 0) === 1;

    // Fetch past 7 days history
    const history: { date: string; completed: boolean }[] = [];
    for (const dStr of last7Days) {
      const log = await db.getFirstAsync<{ completed: number }>(
        'SELECT completed FROM habit_logs WHERE habit_id = ? AND date = ?;',
        [habit.id, dStr]
      );
      history.push({
        date: dStr,
        completed: (log?.completed ?? 0) === 1,
      });
    }
    habit.weekly_history = history;

    // Calculate current streak and longest streak from habit_logs
    const allLogs = await db.getAllAsync<{ date: string; completed: number }>(
      'SELECT date, completed FROM habit_logs WHERE habit_id = ? AND completed = 1 ORDER BY date DESC;',
      [habit.id]
    );

    const completedDates = new Set(allLogs.map(l => l.date));

    // Calculate current streak backward from today or yesterday
    let currentStreak = 0;
    const checkDate = new Date(date);
    
    // If not completed today, check if completed yesterday to maintain streak
    const checkTodayStr = checkDate.toISOString().split('T')[0];
    if (!completedDates.has(checkTodayStr)) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (true) {
      const dStr = checkDate.toISOString().split('T')[0];
      if (completedDates.has(dStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    habit.current_streak = currentStreak;

    // Calculate longest streak
    let longestStreak = 0;
    if (allLogs.length > 0) {
      const sortedDates = Array.from(completedDates).sort();
      let tempStreak = 1;
      longestStreak = 1;

      for (let i = 1; i < sortedDates.length; i++) {
        const prev = new Date(sortedDates[i - 1]);
        const curr = new Date(sortedDates[i]);
        const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 3600 * 24));

        if (diffDays === 1) {
          tempStreak++;
          if (tempStreak > longestStreak) longestStreak = tempStreak;
        } else if (diffDays > 1) {
          tempStreak = 1;
        }
      }
    }
    habit.longest_streak = Math.max(longestStreak, currentStreak);
  }

  return habits;
}

export async function toggleHabit(habitId: number, date: string): Promise<boolean> {
  const db = await getDatabase();
  const existing = await db.getFirstAsync<{ id: number; completed: number }>(
    'SELECT id, completed FROM habit_logs WHERE habit_id = ? AND date = ?;',
    [habitId, date]
  );

  const now = new Date().toISOString();

  if (existing) {
    const newStatus = existing.completed === 1 ? 0 : 1;
    await db.runAsync(
      'UPDATE habit_logs SET completed = ?, created_at = ? WHERE id = ?;',
      [newStatus, now, existing.id]
    );
    return newStatus === 1;
  } else {
    await db.runAsync(
      'INSERT INTO habit_logs (habit_id, date, completed, created_at) VALUES (?, ?, 1, ?);',
      [habitId, date, now]
    );
    return true;
  }
}

export async function deleteHabit(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM habit_logs WHERE habit_id = ?;', [id]);
  await db.runAsync('DELETE FROM habits WHERE id = ?;', [id]);
}
