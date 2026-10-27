export const DATABASE_NAME = 'fitlife_tracker.db';

export const CREATE_TABLES_SQL = `
CREATE TABLE IF NOT EXISTS profile (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  height REAL NOT NULL,
  weight REAL NOT NULL,
  goal_weight REAL NOT NULL,
  fitness_goal TEXT NOT NULL,
  activity_level TEXT NOT NULL,
  workout_frequency INTEGER NOT NULL DEFAULT 4,
  water_target INTEGER NOT NULL DEFAULT 2500,
  sleep_target REAL NOT NULL DEFAULT 8.0,
  calorie_goal INTEGER NOT NULL DEFAULT 2200,
  protein_goal INTEGER NOT NULL DEFAULT 140,
  step_goal INTEGER NOT NULL DEFAULT 10000,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS exercises (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  description TEXT,
  is_custom INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS workouts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  date TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 0,
  calories_burned INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS workout_exercises (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  workout_id INTEGER NOT NULL,
  exercise_id INTEGER NOT NULL,
  exercise_name TEXT NOT NULL,
  sets INTEGER NOT NULL DEFAULT 3,
  reps INTEGER NOT NULL DEFAULT 10,
  weight REAL NOT NULL DEFAULT 0,
  rest_time_seconds INTEGER NOT NULL DEFAULT 60,
  notes TEXT,
  completed INTEGER NOT NULL DEFAULT 1,
  FOREIGN KEY (workout_id) REFERENCES workouts (id) ON DELETE CASCADE,
  FOREIGN KEY (exercise_id) REFERENCES exercises (id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS food_database (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  default_serving REAL NOT NULL DEFAULT 100,
  unit TEXT NOT NULL DEFAULT 'g',
  calories REAL NOT NULL,
  protein REAL NOT NULL,
  carbs REAL NOT NULL,
  fat REAL NOT NULL,
  fiber REAL NOT NULL DEFAULT 0,
  is_custom INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS meals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS food_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  meal_id INTEGER,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  quantity REAL NOT NULL DEFAULT 100,
  unit TEXT NOT NULL DEFAULT 'g',
  calories REAL NOT NULL,
  protein REAL NOT NULL,
  carbs REAL NOT NULL,
  fat REAL NOT NULL,
  fiber REAL NOT NULL DEFAULT 0,
  date TEXT NOT NULL,
  notes TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (meal_id) REFERENCES meals (id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS water_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  amount_ml INTEGER NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS weight_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  weight REAL NOT NULL,
  date TEXT NOT NULL UNIQUE,
  notes TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  due_date TEXT NOT NULL,
  due_time TEXT,
  priority TEXT NOT NULL DEFAULT 'medium',
  category TEXT NOT NULL DEFAULT 'General',
  completed INTEGER NOT NULL DEFAULT 0,
  completed_at TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS schedule_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'other',
  reminder INTEGER NOT NULL DEFAULT 0,
  completed INTEGER NOT NULL DEFAULT 0,
  date TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS habits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'checkmark-circle-outline',
  color TEXT NOT NULL DEFAULT '#10B981',
  frequency TEXT NOT NULL DEFAULT 'daily',
  reminder_time TEXT,
  target_days_per_week INTEGER NOT NULL DEFAULT 7,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS habit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  habit_id INTEGER NOT NULL,
  date TEXT NOT NULL,
  completed INTEGER NOT NULL DEFAULT 1,
  notes TEXT,
  created_at TEXT NOT NULL,
  UNIQUE(habit_id, date),
  FOREIGN KEY (habit_id) REFERENCES habits (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS sleep_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sleep_time TEXT NOT NULL,
  wake_time TEXT NOT NULL,
  duration_hours REAL NOT NULL,
  sleep_goal REAL NOT NULL DEFAULT 8.0,
  quality_rating INTEGER DEFAULT 4,
  notes TEXT,
  date TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS focus_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tag TEXT NOT NULL DEFAULT 'General',
  duration_minutes INTEGER NOT NULL,
  session_type TEXT NOT NULL DEFAULT 'focus',
  date TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS daily_goals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL UNIQUE,
  calorie_target INTEGER NOT NULL,
  protein_target INTEGER NOT NULL,
  water_target INTEGER NOT NULL,
  sleep_target REAL NOT NULL,
  workout_target INTEGER NOT NULL DEFAULT 1,
  focus_target_minutes INTEGER NOT NULL DEFAULT 60,
  task_target INTEGER NOT NULL DEFAULT 3,
  step_target INTEGER NOT NULL DEFAULT 10000
);
`;
