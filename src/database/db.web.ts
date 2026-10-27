import AsyncStorage from '@react-native-async-storage/async-storage';
import { INITIAL_EXERCISES, INITIAL_FOOD_DATABASE } from './seedData';

const WEB_STORAGE_PREFIX = '@fitlife_web_db_';

interface DatabaseTableStore {
  [tableName: string]: any[];
}

let tableData: DatabaseTableStore = {};
let isInitialized = false;

async function saveTable(tableName: string) {
  try {
    await AsyncStorage.setItem(
      `${WEB_STORAGE_PREFIX}${tableName}`,
      JSON.stringify(tableData[tableName] || [])
    );
  } catch (e) {
    console.warn('Web storage save error', e);
  }
}

async function loadAllTables() {
  const tables = [
    'profile',
    'exercises',
    'workouts',
    'workout_exercises',
    'food_database',
    'meals',
    'food_entries',
    'water_entries',
    'weight_entries',
    'tasks',
    'schedule_events',
    'habits',
    'habit_logs',
    'sleep_entries',
    'focus_sessions',
    'daily_goals',
  ];

  for (const t of tables) {
    try {
      const stored = await AsyncStorage.getItem(`${WEB_STORAGE_PREFIX}${t}`);
      tableData[t] = stored ? JSON.parse(stored) : [];
    } catch {
      tableData[t] = [];
    }
  }

  // Seed default exercises if empty
  if (tableData['exercises'].length === 0) {
    tableData['exercises'] = INITIAL_EXERCISES.map((ex, idx) => ({
      id: idx + 1,
      name: ex.name,
      category: ex.category,
      description: ex.description,
      is_custom: 0,
    }));
    await saveTable('exercises');
  }

  // Seed default food database if empty
  if (tableData['food_database'].length === 0) {
    tableData['food_database'] = INITIAL_FOOD_DATABASE.map((f, idx) => ({
      id: idx + 1,
      name: f.name,
      category: f.category,
      default_serving: f.default_serving,
      unit: f.unit,
      calories: f.calories,
      protein: f.protein,
      carbs: f.carbs,
      fat: f.fat,
      fiber: f.fiber,
      is_custom: 0,
    }));
    await saveTable('food_database');
  }
}

class WebSQLiteDatabase {
  async execAsync(sql: string): Promise<void> {
    if (sql.includes('DELETE FROM')) {
      const match = sql.match(/DELETE FROM (\w+)/i);
      if (match && match[1]) {
        const tbl = match[1].toLowerCase();
        tableData[tbl] = [];
        await saveTable(tbl);
      }
    }
  }

  async runAsync(
    sql: string,
    params: any[] = []
  ): Promise<{ lastInsertRowId: number; changes: number }> {
    const trimmed = sql.trim();

    // 1. INSERT INTO
    if (/^INSERT/i.test(trimmed)) {
      const tableMatch = trimmed.match(/INSERT\s+(?:OR\s+IGNORE\s+INTO|INTO)\s+(\w+)/i);
      if (tableMatch && tableMatch[1]) {
        const table = tableMatch[1].toLowerCase();
        if (!tableData[table]) tableData[table] = [];

        // Extract column names
        const colsMatch = trimmed.match(/\(([^)]+)\)\s*VALUES/i);
        let row: any = {};
        if (colsMatch && colsMatch[1]) {
          const cols = colsMatch[1].split(',').map(c => c.trim());
          cols.forEach((col, idx) => {
            row[col] = params[idx] !== undefined ? params[idx] : null;
          });
        }

        // Auto-increment ID if not present
        const currentMaxId = tableData[table].reduce((max, r) => Math.max(max, r.id || 0), 0);
        row.id = row.id || currentMaxId + 1;

        // Check unique constraint on date for weight_entries or sleep_entries
        if (table === 'weight_entries' && row.date) {
          const existingIdx = tableData[table].findIndex(r => r.date === row.date);
          if (existingIdx !== -1) {
            tableData[table][existingIdx] = { ...tableData[table][existingIdx], ...row };
            await saveTable(table);
            return { lastInsertRowId: tableData[table][existingIdx].id, changes: 1 };
          }
        } else if (table === 'sleep_entries' && row.date) {
          const existingIdx = tableData[table].findIndex(r => r.date === row.date);
          if (existingIdx !== -1) {
            tableData[table][existingIdx] = { ...tableData[table][existingIdx], ...row };
            await saveTable(table);
            return { lastInsertRowId: tableData[table][existingIdx].id, changes: 1 };
          }
        }

        tableData[table].push(row);
        await saveTable(table);
        return { lastInsertRowId: row.id, changes: 1 };
      }
    }

    // 2. UPDATE
    if (/^UPDATE/i.test(trimmed)) {
      const tableMatch = trimmed.match(/UPDATE\s+(\w+)\s+SET/i);
      if (tableMatch && tableMatch[1]) {
        const table = tableMatch[1].toLowerCase();
        if (!tableData[table]) tableData[table] = [];

        if (table === 'profile') {
          if (params.length >= 13) {
            const row = {
              name: params[0],
              age: params[1],
              height: params[2],
              weight: params[3],
              goal_weight: params[4],
              fitness_goal: params[5],
              activity_level: params[6],
              workout_frequency: params[7],
              water_target: params[8],
              sleep_target: params[9],
              calorie_goal: params[10],
              protein_goal: params[11],
              step_goal: params[12],
              updated_at: params[13] || new Date().toISOString(),
              id: 1,
            };
            tableData['profile'] = [row];
            await saveTable('profile');
            return { lastInsertRowId: 1, changes: 1 };
          } else if (trimmed.includes('weight = ?')) {
            if (tableData['profile'][0]) {
              tableData['profile'][0].weight = params[0];
              tableData['profile'][0].updated_at = params[1];
              await saveTable('profile');
            }
            return { lastInsertRowId: 1, changes: 1 };
          }
        }

        // Generic WHERE id = ?
        const idParam = params[params.length - 1];
        const existing = tableData[table].find(r => r.id === idParam);
        if (existing) {
          if (table === 'tasks' && trimmed.includes('completed = ?')) {
            existing.completed = params[0];
            existing.completed_at = params[1];
          } else if (table === 'schedule_events' && trimmed.includes('completed = ?')) {
            existing.completed = params[0];
          } else if (table === 'habit_logs' && trimmed.includes('completed = ?')) {
            existing.completed = params[0];
            existing.created_at = params[1];
          }
          await saveTable(table);
          return { lastInsertRowId: existing.id, changes: 1 };
        }
      }
    }

    // 3. DELETE
    if (/^DELETE/i.test(trimmed)) {
      const tableMatch = trimmed.match(/DELETE\s+FROM\s+(\w+)\s+WHERE\s+(\w+)\s*=\s*\?/i);
      if (tableMatch && tableMatch[1] && tableMatch[2]) {
        const table = tableMatch[1].toLowerCase();
        const col = tableMatch[2];
        const val = params[0];
        if (tableData[table]) {
          tableData[table] = tableData[table].filter(
            r => String(r[col]) !== String(val) && r[col] != val
          );
          await saveTable(table);
        }
        return { lastInsertRowId: 0, changes: 1 };
      }
    }

    return { lastInsertRowId: 0, changes: 0 };
  }

  async getFirstAsync<T>(sql: string, params: any[] = []): Promise<T | null> {
    const list = await this.getAllAsync<T>(sql, params);
    return list.length > 0 ? list[0] : null;
  }

  async getAllAsync<T>(sql: string, params: any[] = []): Promise<T[]> {
    const trimmed = sql.trim();

    // 1. COUNT(*)
    if (/SELECT\s+COUNT\(\*\)\s+as\s+count\s+FROM\s+(\w+)/i.test(trimmed)) {
      const match = trimmed.match(/FROM\s+(\w+)/i);
      const tbl = match ? match[1].toLowerCase() : '';
      const count = tableData[tbl] ? tableData[tbl].length : 0;
      return [{ count }] as any;
    }

    // 2. SUM queries
    if (/SELECT\s+SUM\(amount_ml\)\s+as\s+total\s+FROM\s+water_entries/i.test(trimmed)) {
      const date = params[0];
      const list = (tableData['water_entries'] || []).filter(r => r.date === date);
      const total = list.reduce((sum, r) => sum + (Number(r.amount_ml) || 0), 0);
      return [{ total }] as any;
    }

    // 3. Profile
    if (/SELECT\s+\*\s+FROM\s+profile/i.test(trimmed)) {
      return (tableData['profile'] || []) as any;
    }

    // 4. Exercises
    if (/SELECT\s+\*\s+FROM\s+exercises/i.test(trimmed)) {
      let list = [...(tableData['exercises'] || [])];
      if (params.length > 0 && params[0] !== 'All') {
        list = list.filter(e => e.category === params[0]);
      }
      list.sort((a, b) => a.name.localeCompare(b.name));
      return list as any;
    }

    // 5. Workouts
    if (/SELECT\s+\*\s+FROM\s+workouts/i.test(trimmed)) {
      let list = [...(tableData['workouts'] || [])];
      if (trimmed.includes('WHERE date = ?')) {
        list = list.filter(w => w.date === params[0]);
      }
      list.sort((a, b) => (b.date || '').localeCompare(a.date || '') || b.id - a.id);
      return list as any;
    }

    // 6. Workout Exercises
    if (/SELECT\s+\*\s+FROM\s+workout_exercises/i.test(trimmed)) {
      let list = [...(tableData['workout_exercises'] || [])];
      if (trimmed.includes('WHERE workout_id = ?')) {
        list = list.filter(we => we.workout_id === params[0]);
      }
      return list as any;
    }

    // 7. PR query
    if (/SELECT\s+we\.exercise_name/i.test(trimmed)) {
      const map: Record<string, { exercise_name: string; max_weight: number; reps: number; date: string }> = {};
      const wList = tableData['workouts'] || [];
      const weList = tableData['workout_exercises'] || [];

      for (const we of weList) {
        if (!we.exercise_name || Number(we.weight) <= 0) continue;
        const w = wList.find(x => x.id === we.workout_id);
        const weight = Number(we.weight);
        if (!map[we.exercise_name] || weight > map[we.exercise_name].max_weight) {
          map[we.exercise_name] = {
            exercise_name: we.exercise_name,
            max_weight: weight,
            reps: Number(we.reps) || 10,
            date: w ? w.date : '',
          };
        }
      }
      return Object.values(map) as any;
    }

    // 8. Food Database
    if (/SELECT\s+\*\s+FROM\s+food_database/i.test(trimmed)) {
      let list = [...(tableData['food_database'] || [])];
      if (params.length >= 1 && trimmed.includes('name LIKE ?')) {
        const q = String(params[0]).replace(/%/g, '').toLowerCase();
        list = list.filter(f => f.name.toLowerCase().includes(q));
      }
      return list as any;
    }

    // 9. Food Entries
    if (/SELECT\s+\*\s+FROM\s+food_entries/i.test(trimmed)) {
      let list = [...(tableData['food_entries'] || [])];
      if (trimmed.includes('WHERE date = ?')) {
        list = list.filter(f => f.date === params[0]);
      }
      return list as any;
    }

    // 10. Water Entries
    if (/SELECT\s+\*\s+FROM\s+water_entries/i.test(trimmed)) {
      let list = [...(tableData['water_entries'] || [])];
      if (trimmed.includes('WHERE date = ?')) {
        list = list.filter(w => w.date === params[0]);
      }
      list.sort((a, b) => b.id - a.id);
      return list as any;
    }

    // 11. Weight Entries
    if (/SELECT\s+\*\s+FROM\s+weight_entries/i.test(trimmed)) {
      let list = [...(tableData['weight_entries'] || [])];
      if (trimmed.includes('WHERE date = ?')) {
        list = list.filter(w => w.date === params[0]);
      }
      list.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
      return list as any;
    }

    // 12. Tasks
    if (/SELECT\s+\*\s+FROM\s+tasks/i.test(trimmed)) {
      let list = [...(tableData['tasks'] || [])];
      if (trimmed.includes('WHERE due_date = ?')) {
        list = list.filter(t => t.due_date === params[0]);
      }
      return list as any;
    }

    // 13. Schedule Events
    if (/SELECT\s+\*\s+FROM\s+schedule_events/i.test(trimmed)) {
      let list = [...(tableData['schedule_events'] || [])];
      if (trimmed.includes('WHERE date = ?')) {
        list = list.filter(s => s.date === params[0]);
      }
      list.sort((a, b) => (a.start_time || '').localeCompare(b.start_time || ''));
      return list as any;
    }

    // 14. Habits
    if (/SELECT\s+\*\s+FROM\s+habits/i.test(trimmed)) {
      return (tableData['habits'] || []) as any;
    }

    // 15. Habit Logs
    if (/SELECT\s+id,\s*completed\s+FROM\s+habit_logs/i.test(trimmed)) {
      const [habitId, date] = params;
      const match = (tableData['habit_logs'] || []).find(
        l => l.habit_id === habitId && l.date === date
      );
      return match ? [match] as any : [];
    }

    if (/SELECT\s+completed\s+FROM\s+habit_logs/i.test(trimmed)) {
      const [habitId, date] = params;
      const match = (tableData['habit_logs'] || []).find(
        l => l.habit_id === habitId && l.date === date
      );
      return match ? [match] as any : [];
    }

    if (/SELECT\s+date,\s*completed\s+FROM\s+habit_logs/i.test(trimmed)) {
      const [habitId] = params;
      return (tableData['habit_logs'] || [])
        .filter(l => l.habit_id === habitId && l.completed === 1)
        .sort((a, b) => (b.date || '').localeCompare(a.date || '')) as any;
    }

    // 16. Sleep Entries
    if (/SELECT\s+\*\s+FROM\s+sleep_entries/i.test(trimmed)) {
      let list = [...(tableData['sleep_entries'] || [])];
      if (trimmed.includes('WHERE date = ?')) {
        list = list.filter(s => s.date === params[0]);
      } else if (trimmed.includes('WHERE date >= ? AND date <= ?')) {
        list = list.filter(s => s.date >= params[0] && s.date <= params[1]);
      }
      list.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
      return list as any;
    }

    // 17. Focus Sessions
    if (/SELECT\s+\*\s+FROM\s+focus_sessions/i.test(trimmed)) {
      let list = [...(tableData['focus_sessions'] || [])];
      if (trimmed.includes('WHERE date = ?')) {
        list = list.filter(f => f.date === params[0] && f.session_type === 'focus');
      }
      list.sort((a, b) => b.id - a.id);
      return list as any;
    }

    // 18. Progress Group By Aggregations
    if (/SELECT\s+date,\s*weight\s+FROM\s+weight_entries\s+WHERE\s+date\s*>=/i.test(trimmed)) {
      const startDate = params[0];
      return (tableData['weight_entries'] || [])
        .filter(r => r.date >= startDate)
        .sort((a, b) => a.date.localeCompare(b.date)) as any;
    }

    if (/SELECT\s+date,\s*SUM\(calories\)/i.test(trimmed)) {
      const startDate = params[0];
      const map: Record<string, number> = {};
      (tableData['food_entries'] || []).forEach(f => {
        if (f.date >= startDate) {
          map[f.date] = (map[f.date] || 0) + (Number(f.calories) || 0);
        }
      });
      return Object.entries(map)
        .map(([date, total_calories]) => ({ date, total_calories }))
        .sort((a, b) => a.date.localeCompare(b.date)) as any;
    }

    if (/SELECT\s+date,\s*SUM\(protein\)/i.test(trimmed)) {
      const startDate = params[0];
      const map: Record<string, number> = {};
      (tableData['food_entries'] || []).forEach(f => {
        if (f.date >= startDate) {
          map[f.date] = (map[f.date] || 0) + (Number(f.protein) || 0);
        }
      });
      return Object.entries(map)
        .map(([date, total_protein]) => ({ date, total_protein }))
        .sort((a, b) => a.date.localeCompare(b.date)) as any;
    }

    if (/SELECT\s+w\.date,\s*SUM\(we\.sets/i.test(trimmed)) {
      const startDate = params[0];
      const map: Record<string, number> = {};
      const wList = tableData['workouts'] || [];
      const weList = tableData['workout_exercises'] || [];

      for (const w of wList) {
        if (w.date >= startDate) {
          const exercises = weList.filter(e => e.workout_id === w.id);
          const volume = exercises.reduce(
            (sum, e) => sum + (Number(e.sets) * Number(e.reps) * Number(e.weight) || 0),
            0
          );
          map[w.date] = (map[w.date] || 0) + volume;
        }
      }
      return Object.entries(map)
        .map(([date, total_volume]) => ({ date, total_volume }))
        .sort((a, b) => a.date.localeCompare(b.date)) as any;
    }

    if (/SELECT\s+date,\s*SUM\(amount_ml\)/i.test(trimmed)) {
      const startDate = params[0];
      const map: Record<string, number> = {};
      (tableData['water_entries'] || []).forEach(w => {
        if (w.date >= startDate) {
          map[w.date] = (map[w.date] || 0) + (Number(w.amount_ml) || 0);
        }
      });
      return Object.entries(map)
        .map(([date, total_water]) => ({ date, total_water }))
        .sort((a, b) => a.date.localeCompare(b.date)) as any;
    }

    if (/SELECT\s+date,\s*duration_hours/i.test(trimmed)) {
      const startDate = params[0];
      return (tableData['sleep_entries'] || [])
        .filter(s => s.date >= startDate)
        .sort((a, b) => a.date.localeCompare(b.date)) as any;
    }

    if (/SELECT\s+date,\s*SUM\(duration_minutes\)/i.test(trimmed)) {
      const startDate = params[0];
      const map: Record<string, number> = {};
      (tableData['focus_sessions'] || []).forEach(f => {
        if (f.date >= startDate && f.session_type === 'focus') {
          map[f.date] = (map[f.date] || 0) + (Number(f.duration_minutes) || 0);
        }
      });
      return Object.entries(map)
        .map(([date, total_focus]) => ({ date, total_focus }))
        .sort((a, b) => a.date.localeCompare(b.date)) as any;
    }

    if (/SELECT\s+date,\s*COUNT\(\*\)\s+as\s+completed_count/i.test(trimmed)) {
      const startDate = params[0];
      const map: Record<string, number> = {};
      (tableData['habit_logs'] || []).forEach(l => {
        if (l.date >= startDate && l.completed === 1) {
          map[l.date] = (map[l.date] || 0) + 1;
        }
      });
      return Object.entries(map)
        .map(([date, completed_count]) => ({ date, completed_count }))
        .sort((a, b) => a.date.localeCompare(b.date)) as any;
    }

    return [];
  }
}

const webDbInstance = new WebSQLiteDatabase();

export async function getDatabase(): Promise<any> {
  if (!isInitialized) {
    await loadAllTables();
    isInitialized = true;
  }
  return webDbInstance;
}

export async function resetDatabase(): Promise<void> {
  tableData = {
    profile: [],
    workouts: [],
    workout_exercises: [],
    meals: [],
    food_entries: [],
    water_entries: [],
    weight_entries: [],
    tasks: [],
    schedule_events: [],
    habits: [],
    habit_logs: [],
    sleep_entries: [],
    focus_sessions: [],
    daily_goals: [],
  };
  const keys = Object.keys(tableData).map(t => `${WEB_STORAGE_PREFIX}${t}`);
  await AsyncStorage.multiRemove(keys);
  await loadAllTables();
}
