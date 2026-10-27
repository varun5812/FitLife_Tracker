# FitLife — Personal Fitness, Food & Time Management Tracker

A modern, standalone mobile application engineered with **React Native**, **Expo (Expo Go)**, **TypeScript**, **Expo Router**, and **Expo SQLite**.

---

## 📱 Tech Stack & Libraries

* **Framework**: React Native 0.86 with Expo SDK 57 (100% Expo Go Compatible)
* **Routing**: Expo Router (File-based navigation with Bottom Tabs & Modal Stacks)
* **Database**: `expo-sqlite` (Local-first, relational SQLite with Foreign Keys & WAL mode)
* **Local State & Storage**: React Context + `@react-native-async-storage/async-storage`
* **Vector Graphics & Charts**: `react-native-svg` (Custom dynamic line & bar charts with gradients)
* **Haptics & Feedback**: `expo-haptics` (Tactile feedback on actions and completion)
* **Notifications**: `expo-notifications` (Local hydration, workout, habit, and sleep reminders)
* **Design System**: Curated Dark (Obsidian) & Light Themes, Responsive Card Layouts, Circular Progress Rings

---

## 🏗️ Project Architecture

```
FitLife_Fitness_Tracker/
├── app.json                  # Expo configuration
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration & path aliases
├── src/
│   ├── app/                  # Expo Router Pages & Navigation
│   │   ├── _layout.tsx       # Root layout with Theme & App Provider
│   │   ├── index.tsx         # Root redirect
│   │   ├── (tabs)/           # Main Bottom Tab Navigation
│   │   │   ├── _layout.tsx   # 5-Tab Bar Configuration
│   │   │   ├── index.tsx     # 1. Today Dashboard (Honest Score & Daily Cards)
│   │   │   ├── fitness.tsx   # 2. Fitness Center & Workout Splits
│   │   │   ├── food.tsx      # 3. Nutrition Tracker & Meal Diary
│   │   │   ├── time.tsx      # 4. Schedule, Tasks, Focus Timer & Habits
│   │   │   └── progress.tsx  # 5. Progress Analytics & Multi-period Charts
│   │   ├── onboarding.tsx    # Multi-Step Personalized Onboarding
│   │   ├── profile.tsx       # User Profile & BMI Target Recalibrator
│   │   ├── settings.tsx      # Dark/Light Theme, Notifications & Data Reset
│   │   ├── quick-log.tsx     # Rapid Universal Modal Logger
│   │   ├── workout-active.tsx# Live Workout Tracker with Rest Timer
│   │   └── exercise-library.tsx # 8-Muscle Group Exercise Library
│   ├── components/
│   │   ├── common/           # Card, Button, Header, Badge, ProgressBar, CircularProgress, EmptyState, StatCard
│   │   ├── dashboard/        # DailyScoreCard, QuickActionsGrid, Fitness/Nutrition/Water/Schedule/Habits/Sleep Cards
│   │   ├── progress/         # SVG StatChart (Line and Bar variations with gradients)
│   │   └── time/             # PomodoroDial (Focus Timer)
│   ├── constants/
│   │   ├── colors.ts         # Dark & Light Color Palettes & Accents
│   │   └── theme.ts          # Spacing, BorderRadius & Typography
│   ├── context/
│   │   ├── ThemeContext.tsx  # Theme Mode & AsyncStorage Persistence
│   │   └── AppContext.tsx    # Profile, Daily Summary & SQLite Refresh Triggers
│   ├── database/
│   │   ├── db.ts             # SQLite Instance Manager & Seeding
│   │   ├── schema.ts         # Relational Tables DDL
│   │   └── seedData.ts       # Preloaded 50+ Exercises & Local Food Database
│   ├── hooks/
│   │   └── index.ts          # Reusable Hooks
│   ├── services/
│   │   ├── profileService.ts # User Metrics & Target Calculations (BMR/TDEE)
│   │   ├── workoutService.ts # Workouts, Exercises, Sets & PR Stats
│   │   ├── foodService.ts    # Meal Logging, Local DB Search & Macros
│   │   ├── waterService.ts   # Water Logs & Hydration Meters
│   │   ├── weightService.ts  # Body Weight Tracking & Goal Progress
│   │   ├── taskService.ts    # Priority Tasks & Completion
│   │   ├── scheduleService.ts# Daily Timeline Blocks (Work, Gym, Study, etc.)
│   │   ├── habitService.ts   # Habit Rituals, Logs & Streak Algorithms
│   │   ├── sleepService.ts   # Sleep Duration, Quality & Weekly Averages
│   │   ├── focusService.ts   # Pomodoro Sessions History & Stats
│   │   ├── dailyScoreService.ts # Honest Daily Score % Computation (No Fake Data)
│   │   ├── progressService.ts# Analytics Aggregation (7d, 30d, 3m, 6m, 1y)
│   │   └── notificationService.ts # Local Notifications Scheduler
│   └── types/
│       └── index.ts          # Comprehensive TypeScript Interfaces
```

---

## 🗄️ Database Structure (SQLite)

All data is stored locally on the device in `fitlife_tracker.db`:

| Table Name | Description |
| :--- | :--- |
| `profile` | User metrics (age, height, weight, goal weight, fitness goal, activity level, calorie/protein/water/sleep targets) |
| `exercises` | Library of exercises across 8 muscle groups + custom user exercises |
| `workouts` | Completed workouts (date, duration, calories burned, total volume) |
| `workout_exercises` | Individual exercise entries with sets, reps, weight (kg), rest time |
| `food_database` | Pre-seeded healthy food database for offline instant search |
| `food_entries` | Logged meals with calories, protein, carbs, fat, fiber, category |
| `water_entries` | Hydration logs with amount (ml), time, and date |
| `weight_entries` | Daily body weight logs and notes |
| `tasks` | Daily tasks with priority (high/medium/low), due time, completion status |
| `schedule_events` | Time blocks (Work, Gym, Study, Meals, Sleep, Personal, etc.) |
| `habits` | Habit routines with icons, color accents, target frequency |
| `habit_logs` | Daily habit completion logs for calculating current & longest streaks |
| `sleep_entries` | Sleep logs with bedtime, wake time, duration, quality rating |
| `focus_sessions` | Completed Pomodoro focus sessions with tags and duration |
| `daily_goals` | Historic and current target overrides |

---

## 🚀 How to Run the Application

### 1. Navigate to the project directory:
```bash
cd FitLife_Fitness_Tracker
```

### 2. Install dependencies (if not already installed):
```bash
npm install
```

### 3. Start the Mobile Web App:
```bash
npm run dev
```
> Opens the high-performance mobile web application on **`http://localhost:8081`** with responsive mobile shell, dark obsidian UI, and local offline database.

### 4. Open in Browser / Mobile:
* **Mobile Website**: Open `http://localhost:8081` in your browser. On desktop, it renders in an authentic centered smartphone shell; on mobile devices, it automatically scales to 100% full screen.
* **1-Tap Quick Demo**: Tap **"Quick Demo Mode"** on the welcome screen to instantly load realistic workouts, meals, water entries, habits, and progress charts.
* **Mobile Devices (Expo Go)**: Run `npx expo start` and scan the QR code using the **Expo Go** app.

---

## ✨ Features Completed

1. **Personalized Onboarding**:
   * Collects Name, Age, Height, Weight, Goal Weight, Fitness Goals (Weight Loss, Muscle Gain, Maintenance, General Fitness), and Activity Level.
   * Automatically calculates Mifflin-St Jeor BMR, TDEE, Calorie Deficit/Surplus, Protein Goal, and Water Target.
2. **Today Home Dashboard**:
   * Personalized Greeting & Date.
   * **Daily Completion Score (0-100%)**: Transparently computed from real logs (Fitness, Nutrition, Protein, Water, Habits, Tasks, Sleep).
   * **Quick Actions System**: 1-tap buttons for Add Food, Add Water, Workout, Add Task, New Habit, and Focus Timer.
   * Individual Pillar Cards (Fitness, Food & Macros, Water Meter, Schedule & Tasks, Habits, Sleep & Recovery).
3. **Fitness Module**:
   * Active Live Workout Tracker with Elapsed Stopwatch, Sets table (Set #, kg, Reps, Checkbox), and Rest Countdown Timer.
   * Preset workout splits (Chest+Triceps, Back+Biceps, Legs+Core, Shoulders+Arms, Full Body).
   * Workout History with exercise breakdown, total volume (kg), and calories burned.
   * Personal Records (PRs) automated leaderboard.
   * 8-category Exercise Library + Custom Exercise Creator.
4. **Food & Nutrition Module**:
   * Calories & Macro distribution indicators (Calories, Protein, Carbs, Fat, Fiber).
   * 4 Meal Categories (Breakfast, Lunch, Dinner, Snacks & Supplements).
   * Local Food Database Search (Chicken, Salmon, Tuna, Eggs, Oats, Rice, Quinoa, Sweet Potato, Greek Yogurt, Avocado, Whey Protein, etc.) + Custom Food Logger.
   * Date navigation to browse past nutritional diaries.
5. **Water Tracker**:
   * Daily Hydration Goal Progress Bar.
   * Quick buttons (+250ml, +500ml, +750ml, +1L) and custom milliliter inputs.
6. **Weight Tracking & Analytics**:
   * Starting Weight, Current Weight, Goal Weight, Weight Lost/Gained, Remaining to Goal, Progress %.
   * Interactive SVG Weight Trend Chart.
7. **Time Management & Productivity**:
   * Daily Schedule timeline for time blocking (Work, Gym, Study, Meals, Sleep, Family, Personal).
   * Tasks manager with Priority tags (High, Medium, Low) and due times.
   * Interactive Pomodoro Focus Timer with Focus (25m), Short Break (5m), Long Break (15m) modes and session logger.
8. **Habit Rituals**:
   * Daily habits with customizable color accents and frequencies.
   * Automated Current Streak & Longest Streak calculations.
   * 7-day visual completion calendar matrix.
9. **Sleep & Recovery**:
   * Sleep duration and quality logger (1-5 stars) with weekly averages.
10. **Progress & Analytics Charts**:
    * Range selector: **7 Days**, **30 Days**, **3 Months**, **6 Months**, **1 Year**.
    * SVG Charts for Weight, Calories, Protein, Workout Volume, Water, Sleep, Focus Time, and Habit Consistency.
11. **Settings & Themes**:
    * Obsidian Dark Mode & Crisp Light Mode toggle with instant AsyncStorage persistence.
    * Target adjustments (Calories, Protein, Water, Sleep).
    * Local Notification scheduling preferences.
    * JSON Data Export & Database Reset.
12. **Zero Fake Data Policy**:
    * Clean, motivational empty states on first launch. All statistics and charts populate strictly from actual user logs.
