import { getDatabase } from '../database/db';
import { Task, TaskPriority } from '../types';

export async function addTask(
  title: string,
  dueDate: string,
  priority: TaskPriority = 'medium',
  category: string = 'General',
  dueTime?: string,
  description?: string
): Promise<Task> {
  const db = await getDatabase();
  const now = new Date().toISOString();

  const res = await db.runAsync(
    `INSERT INTO tasks (title, description, due_date, due_time, priority, category, completed, created_at)
     VALUES (?, ?, ?, ?, ?, ?, 0, ?);`,
    [title.trim(), description || '', dueDate, dueTime || '', priority, category, now]
  );

  return {
    id: res.lastInsertRowId,
    title: title.trim(),
    description,
    due_date: dueDate,
    due_time: dueTime,
    priority,
    category,
    completed: 0,
    created_at: now,
  };
}

export async function getTasksByDate(date: string): Promise<Task[]> {
  const db = await getDatabase();
  return await db.getAllAsync<Task>(
    'SELECT * FROM tasks WHERE due_date = ? ORDER BY completed ASC, priority DESC, due_time ASC;',
    [date]
  );
}

export async function getAllTasks(): Promise<Task[]> {
  const db = await getDatabase();
  return await db.getAllAsync<Task>(
    'SELECT * FROM tasks ORDER BY due_date ASC, completed ASC, priority DESC;'
  );
}

export async function toggleTask(id: number): Promise<boolean> {
  const db = await getDatabase();
  const current = await db.getFirstAsync<{ completed: number }>('SELECT completed FROM tasks WHERE id = ?;', [id]);
  if (!current) return false;

  const newStatus = current.completed === 1 ? 0 : 1;
  const completedAt = newStatus === 1 ? new Date().toISOString() : null;

  await db.runAsync('UPDATE tasks SET completed = ?, completed_at = ? WHERE id = ?;', [
    newStatus,
    completedAt,
    id,
  ]);

  return newStatus === 1;
}

export async function deleteTask(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM tasks WHERE id = ?;', [id]);
}
