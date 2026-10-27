import { getDatabase } from '../database/db';
import { FoodEntry, FoodItem, MealCategory } from '../types';

export async function searchFoodDatabase(query: string, category?: string): Promise<FoodItem[]> {
  const db = await getDatabase();
  let sql = 'SELECT * FROM food_database WHERE 1=1';
  const params: (string | number)[] = [];

  if (query.trim()) {
    sql += ' AND name LIKE ?';
    params.push(`%${query.trim()}%`);
  }

  if (category && category !== 'All') {
    sql += ' AND category = ?';
    params.push(category);
  }

  sql += ' ORDER BY name ASC LIMIT 50;';
  return await db.getAllAsync<FoodItem>(sql, params);
}

export async function addCustomFoodItem(item: Omit<FoodItem, 'id' | 'is_custom'>): Promise<FoodItem> {
  const db = await getDatabase();
  const res = await db.runAsync(
    `INSERT INTO food_database (
      name, category, default_serving, unit, calories, protein, carbs, fat, fiber, is_custom
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1);`,
    [
      item.name.trim(),
      item.category,
      item.default_serving,
      item.unit,
      item.calories,
      item.protein,
      item.carbs,
      item.fat,
      item.fiber,
    ]
  );
  return {
    id: res.lastInsertRowId,
    ...item,
    is_custom: 1,
  };
}

export async function addFoodEntry(entry: Omit<FoodEntry, 'id' | 'created_at'>): Promise<FoodEntry> {
  const db = await getDatabase();
  const now = new Date().toISOString();

  const res = await db.runAsync(
    `INSERT INTO food_entries (
      meal_id, name, category, quantity, unit, calories, protein, carbs, fat, fiber, date, notes, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      entry.meal_id || null,
      entry.name.trim(),
      entry.category,
      entry.quantity,
      entry.unit,
      entry.calories,
      entry.protein,
      entry.carbs,
      entry.fat,
      entry.fiber,
      entry.date,
      entry.notes || '',
      now,
    ]
  );

  return {
    id: res.lastInsertRowId,
    ...entry,
    created_at: now,
  };
}

export async function getFoodEntriesByDate(date: string): Promise<FoodEntry[]> {
  const db = await getDatabase();
  return await db.getAllAsync<FoodEntry>(
    'SELECT * FROM food_entries WHERE date = ? ORDER BY id ASC;',
    [date]
  );
}

export async function deleteFoodEntry(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM food_entries WHERE id = ?;', [id]);
}

export async function getDailyNutritionTotals(date: string): Promise<{
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  byCategory: Record<MealCategory, { calories: number; protein: number; carbs: number; fat: number; entries: FoodEntry[] }>;
}> {
  const entries = await getFoodEntriesByDate(date);

  const initialCategory = () => ({ calories: 0, protein: 0, carbs: 0, fat: 0, entries: [] as FoodEntry[] });

  const byCategory: Record<MealCategory, { calories: number; protein: number; carbs: number; fat: number; entries: FoodEntry[] }> = {
    breakfast: initialCategory(),
    lunch: initialCategory(),
    dinner: initialCategory(),
    snack: initialCategory(),
  };

  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;
  let totalFiber = 0;

  for (const item of entries) {
    const cat = item.category as MealCategory;
    if (byCategory[cat]) {
      byCategory[cat].calories += Math.round(item.calories);
      byCategory[cat].protein += Math.round(item.protein);
      byCategory[cat].carbs += Math.round(item.carbs);
      byCategory[cat].fat += Math.round(item.fat);
      byCategory[cat].entries.push(item);
    }

    totalCalories += item.calories;
    totalProtein += item.protein;
    totalCarbs += item.carbs;
    totalFat += item.fat;
    totalFiber += item.fiber;
  }

  return {
    calories: Math.round(totalCalories),
    protein: Math.round(totalProtein),
    carbs: Math.round(totalCarbs),
    fat: Math.round(totalFat),
    fiber: Math.round(totalFiber),
    byCategory,
  };
}
