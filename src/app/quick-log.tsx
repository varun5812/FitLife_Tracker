import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { BorderRadius, Spacing, Typography } from '../constants/theme';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { MealCategory, FoodItem, TaskPriority, ScheduleCategory, HabitFrequency } from '../types';
import { searchFoodDatabase, addFoodEntry } from '../services/foodService';
import { addWaterEntry } from '../services/waterService';
import { logWeight } from '../services/weightService';
import { addTask } from '../services/taskService';
import { addScheduleEvent } from '../services/scheduleService';
import { addHabit } from '../services/habitService';
import { logSleepEntry } from '../services/sleepService';
import { analyzeFood } from '../services/aiNutritionService';
import * as Haptics from 'expo-haptics';

export default function QuickLogModal() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { colors } = useTheme();
  const { currentDate, refreshData } = useApp();

  const [activeType, setActiveType] = useState<string>((params.type as string) || 'food');
  const targetDate = (params.date as string) || currentDate;

  // Food Form State
  const [foodQuery, setFoodQuery] = useState('');
  const [foodResults, setFoodResults] = useState<FoodItem[]>([]);
  const [selectedMealCategory, setSelectedMealCategory] = useState<MealCategory>(
    (params.category as MealCategory) || 'breakfast'
  );
  const [customFoodName, setCustomFoodName] = useState('');
  const [foodDescription, setFoodDescription] = useState('');
  const [customCalories, setCustomCalories] = useState('');
  const [customProtein, setCustomProtein] = useState('');
  const [customCarbs, setCustomCarbs] = useState('');
  const [customFat, setCustomFat] = useState('');
  const [servingQuantity, setServingQuantity] = useState('100');
  const [servingUnit, setServingUnit] = useState('g');

  // AI Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiStatusMessage, setAiStatusMessage] = useState('');

  // Water Form State
  const [customWaterAmount, setCustomWaterAmount] = useState('350');

  // Weight Form State
  const [weightInput, setWeightInput] = useState('74.5');
  const [weightNotes, setWeightNotes] = useState('');

  // Task Form State
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDueTime, setTaskDueTime] = useState('14:00');
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('medium');
  const [taskCategory, setTaskCategory] = useState('General');

  // Schedule Event Form State
  const [eventTitle, setEventTitle] = useState('');
  const [eventStart, setEventStart] = useState('09:00');
  const [eventEnd, setEventEnd] = useState('10:00');
  const [eventCategory, setEventCategory] = useState<ScheduleCategory>('work');

  // Habit Form State
  const [habitName, setHabitName] = useState('');
  const [habitColor, setHabitColor] = useState('#10B981');
  const [habitFrequency, setHabitFrequency] = useState<HabitFrequency>('daily');
  const [habitDays, setHabitDays] = useState(7);

  // Sleep Form State
  const [sleepStart, setSleepStart] = useState('23:00');
  const [wakeEnd, setWakeEnd] = useState('07:00');
  const [sleepRating, setSleepRating] = useState(4);
  const [sleepNotes, setSleepNotes] = useState('');

  useEffect(() => {
    if (foodQuery.trim()) {
      searchFoodDatabase(foodQuery).then(setFoodResults);
    } else {
      searchFoodDatabase('', 'All').then(res => setFoodResults(res.slice(0, 10)));
    }
  }, [foodQuery]);

  const selectFoodItem = (item: FoodItem) => {
    setFoodDescription(item.name);
    setCustomFoodName(item.name);
    setCustomCalories(String(item.calories));
    setCustomProtein(String(item.protein));
    setCustomCarbs(String(item.carbs));
    setCustomFat(String(item.fat));
    setServingQuantity(String(item.default_serving));
    setServingUnit(item.unit);
  };

  const handleAiAnalyze = async () => {
    const query = foodDescription.trim() || customFoodName.trim();
    if (!query) {
      Alert.alert(
        'Meal Description Needed',
        'Please enter what you ate (e.g., "Chicken fry with 10 ml oil", "2 rotis with dal and 1 tsp ghee")'
      );
      return;
    }

    const weight = parseFloat(servingQuantity) || 100;
    setIsAnalyzing(true);
    setAiStatusMessage('🤖 Analyzing ingredients & calculating macros with AI...');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const result = await analyzeFood(query, weight, servingUnit);
      if (result.food_name) {
        setCustomFoodName(result.food_name);
      }
      setCustomCalories(String(Math.round(result.calories)));
      setCustomProtein(String(Math.round(result.protein * 10) / 10));
      setCustomCarbs(String(Math.round(result.carbs * 10) / 10));
      setCustomFat(String(Math.round(result.fat * 10) / 10));
      setAiStatusMessage(`✅ ${result.food_name} • ${result.serving_info} (${result.calories} kcal)`);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error: any) {
      setAiStatusMessage('❌ AI analysis failed — enter values manually');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      console.error('AI nutrition analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Submit Handlers
  const handleSaveFood = async () => {
    const finalName = customFoodName.trim() || foodDescription.trim();
    if (!finalName) {
      Alert.alert('Required', 'Please describe what you ate or enter a food name');
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await addFoodEntry({
      name: finalName,
      category: selectedMealCategory,
      quantity: parseFloat(servingQuantity) || 100,
      unit: servingUnit,
      calories: parseFloat(customCalories) || 0,
      protein: parseFloat(customProtein) || 0,
      carbs: parseFloat(customCarbs) || 0,
      fat: parseFloat(customFat) || 0,
      fiber: 0,
      date: targetDate,
    });
    await refreshData();
    router.back();
  };

  const handleSaveWater = async (amount?: number) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const amt = amount || parseInt(customWaterAmount, 10) || 250;
    await addWaterEntry(amt, targetDate);
    await refreshData();
    router.back();
  };

  const handleSaveWeight = async () => {
    const w = parseFloat(weightInput);
    if (isNaN(w) || w <= 0) {
      Alert.alert('Invalid Weight', 'Please enter a valid numeric weight in kg.');
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await logWeight(w, targetDate, weightNotes);
    await refreshData();
    router.back();
  };

  const handleSaveTask = async () => {
    if (!taskTitle.trim()) {
      Alert.alert('Required', 'Please enter a task title');
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await addTask(taskTitle, targetDate, taskPriority, taskCategory, taskDueTime);
    await refreshData();
    router.back();
  };

  const handleSaveEvent = async () => {
    if (!eventTitle.trim()) {
      Alert.alert('Required', 'Please enter an event title');
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await addScheduleEvent(eventTitle, eventStart, eventEnd, eventCategory, targetDate);
    await refreshData();
    router.back();
  };

  const handleSaveHabit = async () => {
    if (!habitName.trim()) {
      Alert.alert('Required', 'Please enter a habit name');
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await addHabit(habitName, 'checkmark-circle-outline', habitColor, habitFrequency, habitDays);
    await refreshData();
    router.back();
  };

  const handleSaveSleep = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const startIso = `${targetDate}T${sleepStart}:00`;
    const endIso = `${targetDate}T${wakeEnd}:00`;
    await logSleepEntry(startIso, endIso, targetDate, sleepRating, sleepNotes);
    await refreshData();
    router.back();
  };

  // Filter categories dynamically based on navigation context
  const isFoodMode = params.type === 'food';
  const isTimeMode = ['task', 'event', 'habit'].includes(params.type as string);

  const allTypes = [
    { key: 'food', label: 'Food & Nutrition', icon: 'restaurant-outline' },
    { key: 'water', label: 'Water', icon: 'water-outline' },
    { key: 'weight', label: 'Weight', icon: 'scale-outline' },
    { key: 'task', label: 'Task', icon: 'checkbox-outline' },
    { key: 'event', label: 'Event', icon: 'calendar-outline' },
    { key: 'habit', label: 'Habit', icon: 'flame-outline' },
    { key: 'sleep', label: 'Sleep', icon: 'moon-outline' },
  ];

  // In food logging mode, remove task, event, habit, and sleep
  const typesList = isFoodMode
    ? allTypes.filter(t => ['food', 'water'].includes(t.key))
    : isTimeMode
    ? allTypes.filter(t => ['task', 'event', 'habit'].includes(t.key))
    : allTypes;

  return (
    <SafeAreaView edges={['top', 'bottom']} style={[styles.container, { backgroundColor: 'transparent' }]}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <View>
          <Text style={[Typography.h2, { color: colors.text }]}>
            {isFoodMode ? 'Log Food & Nutrition' : 'Quick Log'}
          </Text>
          {isFoodMode && (
            <Text style={[Typography.caption, { color: colors.textSecondary }]}>
              AI-powered meal tracker & nutrition diary
            </Text>
          )}
        </View>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.closeBtn, { backgroundColor: colors.cardSecondary }]}
        >
          <Ionicons name="close" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Type Selector Horizontal Bar */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.typesRow}>
        {typesList.map(t => (
          <TouchableOpacity
            key={t.key}
            activeOpacity={0.75}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setActiveType(t.key);
            }}
            style={[
              styles.typePill,
              {
                backgroundColor: activeType === t.key ? colors.primary : colors.cardSecondary,
                borderColor: activeType === t.key ? colors.primary : colors.border,
              },
            ]}
          >
            <Ionicons
              name={t.icon as any}
              size={16}
              color={activeType === t.key ? '#FFF' : colors.textSecondary}
            />
            <Text
              style={[
                Typography.caption,
                { color: activeType === t.key ? '#FFF' : colors.text, fontWeight: '700', marginLeft: 4 },
              ]}
            >
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* 1. FOOD LOG FORM */}
        {activeType === 'food' && (
          <Card style={styles.formCard}>
            <Text style={[Typography.h3, { color: colors.text, marginBottom: Spacing.sm }]}>
              Log Meal / Food
            </Text>

            {/* Meal Category Select */}
            <View style={styles.mealCatRow}>
              {(['breakfast', 'lunch', 'dinner', 'snack'] as MealCategory[]).map(cat => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setSelectedMealCategory(cat)}
                  style={[
                    styles.mealCatBtn,
                    {
                      backgroundColor: selectedMealCategory === cat ? colors.nutrition : colors.cardSecondary,
                      borderColor: selectedMealCategory === cat ? colors.nutrition : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      Typography.caption,
                      { color: selectedMealCategory === cat ? '#FFF' : colors.text, fontWeight: '700', textTransform: 'capitalize' },
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Search Food Database */}
            <View style={[styles.searchBox, { backgroundColor: colors.cardSecondary, borderColor: colors.border }]}>
              <Ionicons name="search" size={18} color={colors.textSecondary} />
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                placeholder="Search food database (e.g., Chicken, Oats, Rice)..."
                placeholderTextColor={colors.textMuted}
                value={foodQuery}
                onChangeText={setFoodQuery}
              />
            </View>

            {foodResults.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.resultsScroll}>
                {foodResults.map(item => (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => selectFoodItem(item)}
                    style={[styles.quickFoodChip, { backgroundColor: colors.cardSecondary, borderColor: colors.border }]}
                  >
                    <Text style={[Typography.caption, { color: colors.text, fontWeight: '700' }]}>{item.name}</Text>
                    <Text style={[Typography.caption, { color: colors.nutrition, fontSize: 10 }]}>
                      {item.calories} kcal ({item.protein}g P)
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            {/* Meal Description Input Field */}
            <View style={{ marginTop: Spacing.md }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <Text style={[Typography.caption, { color: colors.textSecondary }]}>MEAL DESCRIPTION / WHAT DID YOU EAT?</Text>
                <Text style={[Typography.caption, { color: '#8B5CF6', fontSize: 11, fontWeight: '700' }]}>AI POWERED</Text>
              </View>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.cardSecondary,
                    borderColor: colors.border,
                    color: colors.text,
                    minHeight: 52,
                    paddingTop: 12,
                    paddingBottom: 12,
                  },
                ]}
                value={foodDescription}
                onChangeText={(text) => {
                  setFoodDescription(text);
                  setAiStatusMessage('');
                }}
                placeholder="e.g. Chicken fry with 10 ml oil, 2 rotis with dal and 1 tsp ghee"
                placeholderTextColor={colors.textMuted}
                multiline={true}
              />
            </View>

            {/* Separate Weight / Portion Section */}
            <View style={styles.row}>
              <View style={[styles.col, { flex: 1 }]}>
                <Text style={[Typography.caption, { color: colors.textSecondary }]}>WEIGHT / PORTION (SEPARATE)</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.cardSecondary, borderColor: colors.border, color: colors.text }]}
                  value={servingQuantity}
                  onChangeText={setServingQuantity}
                  placeholder="150"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                />
              </View>

              <View style={[styles.col, { flex: 1 }]}>
                <Text style={[Typography.caption, { color: colors.textSecondary }]}>PORTION UNIT</Text>
                <View style={styles.unitRow}>
                  {['g', 'ml', 'pcs', 'bowl'].map(u => (
                    <TouchableOpacity
                      key={u}
                      onPress={() => setServingUnit(u)}
                      style={[
                        styles.unitBtn,
                        {
                          backgroundColor: servingUnit === u ? colors.nutrition : colors.cardSecondary,
                          borderColor: servingUnit === u ? colors.nutrition : colors.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          Typography.caption,
                          { color: servingUnit === u ? '#FFF' : colors.text, fontWeight: '700' },
                        ]}
                      >
                        {u}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            {/* AI Calculate Nutrition Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleAiAnalyze}
              disabled={isAnalyzing}
              style={[
                styles.aiAnalyzeBtn,
                {
                  backgroundColor: isAnalyzing ? colors.cardSecondary : '#7C3AED',
                  borderColor: isAnalyzing ? colors.border : '#7C3AED',
                },
              ]}
            >
              {isAnalyzing ? (
                <ActivityIndicator size="small" color="#7C3AED" />
              ) : (
                <Ionicons name="sparkles" size={18} color="#FFF" />
              )}
              <Text
                style={[
                  Typography.bodyBold,
                  {
                    color: isAnalyzing ? colors.textSecondary : '#FFF',
                    marginLeft: Spacing.sm,
                  },
                ]}
              >
                {isAnalyzing ? 'Calculating Nutrition & Oils with AI...' : 'AI Calculate Nutrition & Oil ✨'}
              </Text>
            </TouchableOpacity>

            {/* AI Status Message */}
            {aiStatusMessage ? (
              <View style={[styles.aiStatusBanner, { backgroundColor: `${colors.cardSecondary}` }]}>
                <Text style={[Typography.subtext, { color: colors.textSecondary }]}>{aiStatusMessage}</Text>
              </View>
            ) : null}

            {/* Meal / Food Log Title */}
            <View style={{ marginTop: Spacing.sm }}>
              <Text style={[Typography.caption, { color: colors.textSecondary }]}>FOOD / LOG TITLE</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.cardSecondary, borderColor: colors.border, color: colors.text }]}
                value={customFoodName}
                onChangeText={setCustomFoodName}
                placeholder="Auto-filled by AI or type custom title"
                placeholderTextColor={colors.textMuted}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.col, { flex: 1 }]}>
                <Text style={[Typography.caption, { color: colors.textSecondary }]}>CALORIES (KCAL)</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.cardSecondary, borderColor: colors.border, color: colors.text }]}
                  value={customCalories}
                  onChangeText={setCustomCalories}
                  placeholder="250"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                />
              </View>

              <View style={[styles.col, { flex: 1 }]}>
                <Text style={[Typography.caption, { color: colors.protein }]}>PROTEIN (G)</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.cardSecondary, borderColor: colors.border, color: colors.text }]}
                  value={customProtein}
                  onChangeText={setCustomProtein}
                  placeholder="30"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.col, { flex: 1 }]}>
                <Text style={[Typography.caption, { color: colors.carbs }]}>CARBS (G)</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.cardSecondary, borderColor: colors.border, color: colors.text }]}
                  value={customCarbs}
                  onChangeText={setCustomCarbs}
                  placeholder="20"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                />
              </View>

              <View style={[styles.col, { flex: 1 }]}>
                <Text style={[Typography.caption, { color: colors.fat }]}>FAT (G)</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.cardSecondary, borderColor: colors.border, color: colors.text }]}
                  value={customFat}
                  onChangeText={setCustomFat}
                  placeholder="8"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <Button
              title="Log Food Entry 🥑"
              onPress={handleSaveFood}
              style={{ marginTop: Spacing.lg, backgroundColor: colors.nutrition }}
            />
          </Card>
        )}

        {/* 2. WATER LOG FORM */}
        {activeType === 'water' && (
          <Card style={styles.formCard}>
            <Text style={[Typography.h3, { color: colors.text, marginBottom: Spacing.sm }]}>
              Log Hydration 💧
            </Text>

            <View style={styles.quickWaterGrid}>
              {[250, 500, 750, 1000].map(amt => (
                <TouchableOpacity
                  key={amt}
                  onPress={() => handleSaveWater(amt)}
                  style={[styles.waterAmtBtn, { backgroundColor: colors.cardSecondary, borderColor: colors.water }]}
                >
                  <Ionicons name="water" size={24} color={colors.water} />
                  <Text style={[Typography.bodyBold, { color: colors.text, marginTop: 4 }]}>
                    +{amt >= 1000 ? `${amt / 1000} L` : `${amt} ml`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[Typography.caption, { color: colors.textSecondary, marginTop: Spacing.lg }]}>
              CUSTOM AMOUNT (ML)
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.cardSecondary, borderColor: colors.border, color: colors.text }]}
              value={customWaterAmount}
              onChangeText={setCustomWaterAmount}
              keyboardType="numeric"
            />

            <Button
              title="Add Custom Water"
              onPress={() => handleSaveWater()}
              style={{ marginTop: Spacing.lg, backgroundColor: colors.water }}
            />
          </Card>
        )}

        {/* 3. BODY WEIGHT LOG FORM */}
        {activeType === 'weight' && (
          <Card style={styles.formCard}>
            <Text style={[Typography.h3, { color: colors.text, marginBottom: Spacing.sm }]}>
              Log Body Weight ⚖️
            </Text>

            <View style={{ marginTop: Spacing.sm }}>
              <Text style={[Typography.caption, { color: colors.textSecondary }]}>WEIGHT (KG)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.cardSecondary, borderColor: colors.border, color: colors.text, fontSize: 20, fontWeight: '700' }]}
                value={weightInput}
                onChangeText={setWeightInput}
                placeholder="75.0"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                autoFocus
              />
            </View>

            <View style={{ marginTop: Spacing.md }}>
              <Text style={[Typography.caption, { color: colors.textSecondary }]}>OPTIONAL NOTES</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.cardSecondary, borderColor: colors.border, color: colors.text }]}
                value={weightNotes}
                onChangeText={setWeightNotes}
                placeholder="Morning fasting weight"
                placeholderTextColor={colors.textMuted}
              />
            </View>

            <Button
              title="Save Weight Log"
              onPress={handleSaveWeight}
              style={{ marginTop: Spacing.lg }}
            />
          </Card>
        )}

        {/* 4. TASK LOG FORM */}
        {activeType === 'task' && (
          <Card style={styles.formCard}>
            <Text style={[Typography.h3, { color: colors.text, marginBottom: Spacing.sm }]}>
              Add New Task 📋
            </Text>

            <View style={{ marginTop: Spacing.sm }}>
              <Text style={[Typography.caption, { color: colors.textSecondary }]}>TASK TITLE</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.cardSecondary, borderColor: colors.border, color: colors.text }]}
                value={taskTitle}
                onChangeText={setTaskTitle}
                placeholder="e.g. Prepare healthy lunch / Meal prep"
                placeholderTextColor={colors.textMuted}
                autoFocus
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.col, { flex: 1 }]}>
                <Text style={[Typography.caption, { color: colors.textSecondary }]}>DUE TIME</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.cardSecondary, borderColor: colors.border, color: colors.text }]}
                  value={taskDueTime}
                  onChangeText={setTaskDueTime}
                  placeholder="14:00"
                  placeholderTextColor={colors.textMuted}
                />
              </View>

              <View style={[styles.col, { flex: 1 }]}>
                <Text style={[Typography.caption, { color: colors.textSecondary }]}>PRIORITY</Text>
                <View style={styles.priorityRow}>
                  {(['low', 'medium', 'high'] as TaskPriority[]).map(p => (
                    <TouchableOpacity
                      key={p}
                      onPress={() => setTaskPriority(p)}
                      style={[
                        styles.priorityBtn,
                        {
                          backgroundColor: taskPriority === p ? colors.time : colors.cardSecondary,
                          borderColor: taskPriority === p ? colors.time : colors.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          Typography.caption,
                          { color: taskPriority === p ? '#FFF' : colors.text, fontWeight: '700', textTransform: 'capitalize' },
                        ]}
                      >
                        {p}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <Button
              title="Create Task"
              onPress={handleSaveTask}
              style={{ marginTop: Spacing.lg, backgroundColor: colors.time }}
            />
          </Card>
        )}

        {/* 5. SCHEDULE EVENT FORM */}
        {activeType === 'event' && (
          <Card style={styles.formCard}>
            <Text style={[Typography.h3, { color: colors.text, marginBottom: Spacing.sm }]}>
              Schedule Event ⏰
            </Text>

            <View style={{ marginTop: Spacing.sm }}>
              <Text style={[Typography.caption, { color: colors.textSecondary }]}>EVENT TITLE</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.cardSecondary, borderColor: colors.border, color: colors.text }]}
                value={eventTitle}
                onChangeText={setEventTitle}
                placeholder="e.g. Gym Strength Training / Deep Work"
                placeholderTextColor={colors.textMuted}
                autoFocus
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.col, { flex: 1 }]}>
                <Text style={[Typography.caption, { color: colors.textSecondary }]}>START TIME</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.cardSecondary, borderColor: colors.border, color: colors.text }]}
                  value={eventStart}
                  onChangeText={setEventStart}
                  placeholder="09:00"
                  placeholderTextColor={colors.textMuted}
                />
              </View>

              <View style={[styles.col, { flex: 1 }]}>
                <Text style={[Typography.caption, { color: colors.textSecondary }]}>END TIME</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.cardSecondary, borderColor: colors.border, color: colors.text }]}
                  value={eventEnd}
                  onChangeText={setEventEnd}
                  placeholder="10:30"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
            </View>

            <Text style={[Typography.caption, { color: colors.textSecondary, marginTop: Spacing.md }]}>
              CATEGORY
            </Text>
            <View style={styles.mealCatRow}>
              {(['gym', 'work', 'study', 'meals', 'sleep', 'personal'] as ScheduleCategory[]).map(cat => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setEventCategory(cat)}
                  style={[
                    styles.mealCatBtn,
                    {
                      backgroundColor: eventCategory === cat ? colors.time : colors.cardSecondary,
                      borderColor: eventCategory === cat ? colors.time : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      Typography.caption,
                      { color: eventCategory === cat ? '#FFF' : colors.text, fontWeight: '700', textTransform: 'capitalize' },
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Button
              title="Add to Schedule"
              onPress={handleSaveEvent}
              style={{ marginTop: Spacing.lg, backgroundColor: colors.time }}
            />
          </Card>
        )}

        {/* 6. HABIT LOG FORM */}
        {activeType === 'habit' && (
          <Card style={styles.formCard}>
            <Text style={[Typography.h3, { color: colors.text, marginBottom: Spacing.sm }]}>
              Create New Habit 🔥
            </Text>

            <View style={{ marginTop: Spacing.sm }}>
              <Text style={[Typography.caption, { color: colors.textSecondary }]}>HABIT NAME</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.cardSecondary, borderColor: colors.border, color: colors.text }]}
                value={habitName}
                onChangeText={setHabitName}
                placeholder="e.g. Read 20 pages / 10k steps"
                placeholderTextColor={colors.textMuted}
                autoFocus
              />
            </View>

            <Text style={[Typography.caption, { color: colors.textSecondary, marginTop: Spacing.md }]}>
              COLOR ACCENT
            </Text>
            <View style={styles.colorsRow}>
              {[colors.habit, colors.fitness, colors.water, colors.accent, colors.nutrition, colors.protein].map(c => (
                <TouchableOpacity
                  key={c}
                  onPress={() => setHabitColor(c)}
                  style={[
                    styles.colorCircle,
                    { backgroundColor: c, borderColor: habitColor === c ? '#FFF' : 'transparent' },
                  ]}
                />
              ))}
            </View>

            <Button
              title="Start Tracking Habit"
              onPress={handleSaveHabit}
              style={{ marginTop: Spacing.lg, backgroundColor: colors.habit }}
            />
          </Card>
        )}

        {/* 7. SLEEP LOG FORM */}
        {activeType === 'sleep' && (
          <Card style={styles.formCard}>
            <Text style={[Typography.h3, { color: colors.text, marginBottom: Spacing.sm }]}>
              Log Sleep Duration 🌙
            </Text>

            <View style={styles.row}>
              <View style={[styles.col, { flex: 1 }]}>
                <Text style={[Typography.caption, { color: colors.textSecondary }]}>BEDTIME (HH:MM)</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.cardSecondary, borderColor: colors.border, color: colors.text }]}
                  value={sleepStart}
                  onChangeText={setSleepStart}
                  placeholder="23:00"
                  placeholderTextColor={colors.textMuted}
                />
              </View>

              <View style={[styles.col, { flex: 1 }]}>
                <Text style={[Typography.caption, { color: colors.textSecondary }]}>WAKE UP (HH:MM)</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.cardSecondary, borderColor: colors.border, color: colors.text }]}
                  value={wakeEnd}
                  onChangeText={setWakeEnd}
                  placeholder="07:30"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
            </View>

            <Text style={[Typography.caption, { color: colors.textSecondary, marginTop: Spacing.md }]}>
              SLEEP QUALITY (1-5 STARS)
            </Text>
            <View style={styles.starRow}>
              {[1, 2, 3, 4, 5].map(star => (
                <TouchableOpacity key={star} onPress={() => setSleepRating(star)}>
                  <Ionicons
                    name={star <= sleepRating ? 'star' : 'star-outline'}
                    size={32}
                    color={colors.nutrition}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <Button
              title="Save Sleep Record"
              onPress={handleSaveSleep}
              style={{ marginTop: Spacing.lg, backgroundColor: colors.sleep }}
            />
          </Card>
        )}

        <View style={{ height: Spacing.xxxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typesRow: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.xs,
    paddingBottom: Spacing.sm,
  },
  typePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  formCard: {
    padding: Spacing.lg,
  },
  mealCatRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
    flexWrap: 'wrap',
  },
  mealCatBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    height: 46,
    marginBottom: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontSize: 14,
  },
  resultsScroll: {
    marginVertical: Spacing.xs,
  },
  quickFoodChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginRight: Spacing.xs,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  col: {
    gap: 4,
  },
  input: {
    height: 48,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    marginTop: 4,
    fontSize: 15,
  },
  quickWaterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
  },
  waterAmtBtn: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 4,
  },
  priorityBtn: {
    flex: 1,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  colorsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  colorCircle: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    borderWidth: 2,
  },
  starRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  aiAnalyzeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    marginTop: Spacing.lg,
  },
  aiStatusBanner: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.sm,
    alignItems: 'center',
  },
  unitRow: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 4,
  },
  unitBtn: {
    flex: 1,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
});
