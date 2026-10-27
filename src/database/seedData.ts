export const INITIAL_EXERCISES = [
  // Chest
  { name: 'Barbell Bench Press', category: 'Chest', description: 'Compound chest press for overall chest mass' },
  { name: 'Incline Dumbbell Press', category: 'Chest', description: 'Upper chest development with dumbbells' },
  { name: 'Cable Chest Fly', category: 'Chest', description: 'Chest isolation with constant cable tension' },
  { name: 'Dips (Chest Focus)', category: 'Chest', description: 'Bodyweight lower chest and tricep compound' },
  { name: 'Push-ups', category: 'Chest', description: 'Classic bodyweight chest and core exercise' },

  // Back
  { name: 'Barbell Deadlift', category: 'Back', description: 'Full posterior chain strength builder' },
  { name: 'Pull-ups', category: 'Back', description: 'Upper lat and upper body bodyweight movement' },
  { name: 'Bent-Over Barbell Row', category: 'Back', description: 'Mid-back thickness and lats builder' },
  { name: 'Lat Pulldown', category: 'Back', description: 'Lat width builder on cable machine' },
  { name: 'Seated Cable Row', category: 'Back', description: 'Mid back and rhomboids builder' },

  // Shoulders
  { name: 'Overhead Barbell Press', category: 'Shoulders', description: 'Strict overhead pressing for deltoid strength' },
  { name: 'Dumbbell Lateral Raise', category: 'Shoulders', description: 'Side deltoid isolation for width' },
  { name: 'Face Pulls', category: 'Shoulders', description: 'Rear deltoid and rotator cuff health' },
  { name: 'Dumbbell Shoulder Press', category: 'Shoulders', description: 'Seated or standing shoulder press' },
  { name: 'Front Dumbbell Raise', category: 'Shoulders', description: 'Anterior deltoid isolation' },

  // Arms
  { name: 'Barbell Bicep Curl', category: 'Arms', description: 'Classic bicep mass builder' },
  { name: 'Incline Dumbbell Curl', category: 'Arms', description: 'Long head bicep stretch and curl' },
  { name: 'Tricep Rope Pushdown', category: 'Arms', description: 'Tricep lateral head cable isolation' },
  { name: 'Skull Crushers', category: 'Arms', description: 'Lying triceps extension' },
  { name: 'Hammer Curls', category: 'Arms', description: 'Brachialis and forearm builder' },

  // Legs
  { name: 'Barbell Back Squat', category: 'Legs', description: 'The king of quad and lower body exercises' },
  { name: 'Romanian Deadlift', category: 'Legs', description: 'Hamstring and glute stretch and hip hinge' },
  { name: 'Leg Press', category: 'Legs', description: 'Quad-focused heavy machine press' },
  { name: 'Walking Dumbbell Lunges', category: 'Legs', description: 'Unilateral quad and glute builder' },
  { name: 'Standing Calf Raises', category: 'Legs', description: 'Calf muscle isolation' },
  { name: 'Leg Extensions', category: 'Legs', description: 'Quad isolation machine movement' },
  { name: 'Lying Leg Curls', category: 'Legs', description: 'Hamstring isolation' },

  // Core
  { name: 'Hanging Leg Raises', category: 'Core', description: 'Lower abs and hip flexor builder' },
  { name: 'Plank', category: 'Core', description: 'Isometric core stability hold' },
  { name: 'Cable Woodchoppers', category: 'Core', description: 'Oblique rotational power' },
  { name: 'Ab Rollout', category: 'Core', description: 'Advanced anterior core flexion' },
  { name: 'Bicycle Crunches', category: 'Core', description: 'Dynamic rotational abdominal movement' },

  // Cardio
  { name: 'Treadmill Running', category: 'Cardio', description: 'Cardiovascular endurance running' },
  { name: 'Stationary Cycling', category: 'Cardio', description: 'Low impact steady state cardio' },
  { name: 'Rowing Machine', category: 'Cardio', description: 'Full body cardiovascular conditioning' },
  { name: 'Jump Rope', category: 'Cardio', description: 'Agility and high-intensity conditioning' },

  // Full Body
  { name: 'Kettlebell Swings', category: 'Full Body', description: 'Posterior power and conditioning' },
  { name: 'Burpees', category: 'Full Body', description: 'High intensity full-body metabolic drill' },
  { name: 'Clean and Press', category: 'Full Body', description: 'Olympic style explosive total body lift' },
];

export const INITIAL_FOOD_DATABASE = [
  // Proteins
  { name: 'Chicken Breast (Cooked)', category: 'Poultry', default_serving: 100, unit: 'g', calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0 },
  { name: 'Whole Egg (Large)', category: 'Dairy/Eggs', default_serving: 50, unit: 'g', calories: 72, protein: 6.3, carbs: 0.4, fat: 4.8, fiber: 0 },
  { name: 'Egg White', category: 'Dairy/Eggs', default_serving: 33, unit: 'g', calories: 17, protein: 3.6, carbs: 0.2, fat: 0.1, fiber: 0 },
  { name: 'Salmon Fillet (Cooked)', category: 'Fish', default_serving: 100, unit: 'g', calories: 208, protein: 22, carbs: 0, fat: 13, fiber: 0 },
  { name: 'Canned Tuna (in Water)', category: 'Fish', default_serving: 100, unit: 'g', calories: 116, protein: 26, carbs: 0, fat: 1, fiber: 0 },
  { name: 'Greek Yogurt (Plain 0%)', category: 'Dairy/Eggs', default_serving: 150, unit: 'g', calories: 88, protein: 15.4, carbs: 5.4, fat: 0.3, fiber: 0 },
  { name: 'Whey Protein Powder', category: 'Supplements', default_serving: 30, unit: 'g', calories: 120, protein: 24, carbs: 2, fat: 1.5, fiber: 0 },
  { name: 'Cottage Cheese (Low Fat)', category: 'Dairy/Eggs', default_serving: 100, unit: 'g', calories: 84, protein: 11, carbs: 4.3, fat: 2.3, fiber: 0 },
  { name: 'Lean Ground Beef (90/10)', category: 'Meat', default_serving: 100, unit: 'g', calories: 176, protein: 20, carbs: 0, fat: 10, fiber: 0 },
  { name: 'Tofu (Firm)', category: 'Plant-Based', default_serving: 100, unit: 'g', calories: 83, protein: 10, carbs: 1.9, fat: 5.3, fiber: 0.8 },

  // Carbs & Grains
  { name: 'Oats (Rolled)', category: 'Grains', default_serving: 50, unit: 'g', calories: 189, protein: 6.8, carbs: 33, fat: 3.4, fiber: 5.3 },
  { name: 'Brown Rice (Cooked)', category: 'Grains', default_serving: 100, unit: 'g', calories: 112, protein: 2.6, carbs: 24, fat: 0.9, fiber: 1.8 },
  { name: 'White Rice (Cooked)', category: 'Grains', default_serving: 100, unit: 'g', calories: 130, protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4 },
  { name: 'Sweet Potato (Baked)', category: 'Vegetables', default_serving: 100, unit: 'g', calories: 90, protein: 2, carbs: 20.7, fat: 0.15, fiber: 3.3 },
  { name: 'Whole Wheat Bread', category: 'Grains', default_serving: 40, unit: 'g', calories: 92, protein: 4, carbs: 17, fat: 1.1, fiber: 2.7 },
  { name: 'Quinoa (Cooked)', category: 'Grains', default_serving: 100, unit: 'g', calories: 120, protein: 4.4, carbs: 21.3, fat: 1.9, fiber: 2.8 },
  { name: 'Whole Wheat Pasta (Cooked)', category: 'Grains', default_serving: 100, unit: 'g', calories: 124, protein: 5.3, carbs: 26.5, fat: 0.5, fiber: 3.9 },

  // Fruits
  { name: 'Banana (Medium)', category: 'Fruit', default_serving: 118, unit: 'g', calories: 105, protein: 1.3, carbs: 27, fat: 0.4, fiber: 3.1 },
  { name: 'Apple (Medium)', category: 'Fruit', default_serving: 182, unit: 'g', calories: 95, protein: 0.5, carbs: 25, fat: 0.3, fiber: 4.4 },
  { name: 'Blueberries', category: 'Fruit', default_serving: 100, unit: 'g', calories: 57, protein: 0.7, carbs: 14.5, fat: 0.3, fiber: 2.4 },
  { name: 'Strawberries', category: 'Fruit', default_serving: 100, unit: 'g', calories: 32, protein: 0.7, carbs: 7.7, fat: 0.3, fiber: 2.0 },
  { name: 'Orange', category: 'Fruit', default_serving: 131, unit: 'g', calories: 62, protein: 1.2, carbs: 15.4, fat: 0.2, fiber: 3.1 },

  // Healthy Fats & Nuts
  { name: 'Avocado', category: 'Healthy Fats', default_serving: 50, unit: 'g', calories: 80, protein: 1, carbs: 4.3, fat: 7.3, fiber: 3.4 },
  { name: 'Almonds', category: 'Nuts/Seeds', default_serving: 30, unit: 'g', calories: 173, protein: 6.4, carbs: 6.1, fat: 14.9, fiber: 3.5 },
  { name: 'Peanut Butter (Natural)', category: 'Nuts/Seeds', default_serving: 32, unit: 'g', calories: 188, protein: 8, carbs: 7, fat: 16, fiber: 2.6 },
  { name: 'Olive Oil', category: 'Oils', default_serving: 14, unit: 'g', calories: 119, protein: 0, carbs: 0, fat: 13.5, fiber: 0 },
  { name: 'Chia Seeds', category: 'Nuts/Seeds', default_serving: 20, unit: 'g', calories: 97, protein: 3.3, carbs: 8.4, fat: 6.1, fiber: 6.9 },

  // Vegetables
  { name: 'Broccoli (Steamed)', category: 'Vegetables', default_serving: 100, unit: 'g', calories: 35, protein: 2.4, carbs: 7.2, fat: 0.4, fiber: 3.3 },
  { name: 'Spinach (Fresh)', category: 'Vegetables', default_serving: 100, unit: 'g', calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2 },
  { name: 'Bell Pepper (Mixed)', category: 'Vegetables', default_serving: 100, unit: 'g', calories: 26, protein: 1, carbs: 6, fat: 0.3, fiber: 2.1 },
  { name: 'Carrot', category: 'Vegetables', default_serving: 100, unit: 'g', calories: 41, protein: 0.9, carbs: 9.6, fat: 0.2, fiber: 2.8 },
];
