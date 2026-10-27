import * as SQLite from 'expo-sqlite';
import { DATABASE_NAME, CREATE_TABLES_SQL } from './schema';
import { INITIAL_EXERCISES, INITIAL_FOOD_DATABASE } from './seedData';

let dbInstance: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!dbInstance) {
    dbInstance = await SQLite.openDatabaseAsync(DATABASE_NAME);
    await initDatabase(dbInstance);
  }
  return dbInstance;
}

async function initDatabase(db: SQLite.SQLiteDatabase): Promise<void> {
  // Enable Foreign Keys and create tables
  await db.execAsync(`
    PRAGMA foreign_keys = ON;
    PRAGMA journal_mode = WAL;
    ${CREATE_TABLES_SQL}
  `);

  // Check if exercises table is empty, if so populate default library
  const exerciseCountRow = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM exercises;'
  );
  if (exerciseCountRow && exerciseCountRow.count === 0) {
    for (const ex of INITIAL_EXERCISES) {
      await db.runAsync(
        'INSERT OR IGNORE INTO exercises (name, category, description, is_custom) VALUES (?, ?, ?, 0);',
        [ex.name, ex.category, ex.description]
      );
    }
  }

  // Check if food database is empty, if so populate default library
  const foodCountRow = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM food_database;'
  );
  if (foodCountRow && foodCountRow.count === 0) {
    for (const food of INITIAL_FOOD_DATABASE) {
      await db.runAsync(
        'INSERT OR IGNORE INTO food_database (name, category, default_serving, unit, calories, protein, carbs, fat, fiber, is_custom) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0);',
        [
          food.name,
          food.category,
          food.default_serving,
          food.unit,
          food.calories,
          food.protein,
          food.carbs,
          food.fat,
          food.fiber,
        ]
      );
    }
  }
}

export async function resetDatabase(): Promise<void> {
  const db = await getDatabase();
  await db.execAsync(`
    DELETE FROM profile;
    DELETE FROM workouts;
    DELETE FROM workout_exercises;
    DELETE FROM meals;
    DELETE FROM food_entries;
    DELETE FROM water_entries;
    DELETE FROM weight_entries;
    DELETE FROM tasks;
    DELETE FROM schedule_events;
    DELETE FROM habits;
    DELETE FROM habit_logs;
    DELETE FROM sleep_entries;
    DELETE FROM focus_sessions;
    DELETE FROM daily_goals;
  `);
}
