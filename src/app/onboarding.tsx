import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { BorderRadius, Spacing, Typography } from '../constants/theme';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { FitnessGoal, ActivityLevel } from '../types';
import { saveProfile, calculateNutritionTargets } from '../services/profileService';
import { seedDemoUserData } from '../services/demoDataService';
import * as Haptics from 'expo-haptics';

export default function OnboardingScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { updateProfileState } = useApp();

  const [step, setStep] = useState<number>(1);
  const totalSteps = 4;

  // Form Fields
  const [name, setName] = useState<string>('');
  const [age, setAge] = useState<string>('26');
  const [height, setHeight] = useState<string>('175');
  const [weight, setWeight] = useState<string>('75');
  const [goalWeight, setGoalWeight] = useState<string>('72');
  const [fitnessGoal, setFitnessGoal] = useState<FitnessGoal>('weight_loss');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('moderately_active');
  const [workoutFrequency, setWorkoutFrequency] = useState<number>(4);
  const [waterTarget, setWaterTarget] = useState<string>('2500');
  const [sleepTarget, setSleepTarget] = useState<string>('8.0');
  const [isDemoLoading, setIsDemoLoading] = useState<boolean>(false);

  const handleQuickDemo = async () => {
    try {
      setIsDemoLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const demoProfile = await seedDemoUserData();
      updateProfileState(demoProfile);
      router.replace('/(tabs)');
    } catch (e) {
      console.warn('Demo seeding error', e);
    } finally {
      setIsDemoLoading(false);
    }
  };

  const handleNext = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      // Calculate nutrition targets and save to SQLite
      const w = parseFloat(weight) || 75;
      const h = parseFloat(height) || 175;
      const a = parseInt(age, 10) || 26;
      const gw = parseFloat(goalWeight) || w;
      const targets = calculateNutritionTargets(w, h, a, fitnessGoal, activityLevel);

      const saved = await saveProfile({
        name: name.trim() || 'Champion',
        age: a,
        height: h,
        weight: w,
        goal_weight: gw,
        fitness_goal: fitnessGoal,
        activity_level: activityLevel,
        workout_frequency: workoutFrequency,
        water_target: parseInt(waterTarget, 10) || targets.waterMl,
        sleep_target: parseFloat(sleepTarget) || 8.0,
        calorie_goal: targets.calories,
        protein_goal: targets.protein,
        step_goal: 10000,
      });

      updateProfileState(saved);
      router.replace('/(tabs)');
    }
  };

  const handleBack = () => {
    if (step > 1) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setStep(step - 1);
    }
  };

  const goalsList: { key: FitnessGoal; label: string; desc: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: 'weight_loss', label: 'Weight Loss', desc: 'Burn fat & build lean definition', icon: 'flame-outline' },
    { key: 'muscle_gain', label: 'Muscle Gain', desc: 'Build strength & hypertrophy', icon: 'barbell-outline' },
    { key: 'maintenance', label: 'Maintenance', desc: 'Maintain body composition', icon: 'shield-checkmark-outline' },
    { key: 'general_fitness', label: 'General Fitness', desc: 'Improve stamina, health & vitality', icon: 'heart-outline' },
  ];

  const activityList: { key: ActivityLevel; label: string; desc: string }[] = [
    { key: 'sedentary', label: 'Sedentary', desc: 'Desk job, little intentional exercise' },
    { key: 'lightly_active', label: 'Lightly Active', desc: 'Light exercise 1-3 days/week' },
    { key: 'moderately_active', label: 'Moderately Active', desc: 'Moderate workouts 3-5 days/week' },
    { key: 'very_active', label: 'Very Active', desc: 'Hard training 6-7 days/week' },
    { key: 'extra_active', label: 'Extra Active', desc: 'Athlete / high physical labor' },
  ];

  return (
    <SafeAreaView edges={['top', 'bottom']} style={[styles.container, { backgroundColor: 'transparent' }]}>
      {/* Header with step indicator */}
      <View style={styles.header}>
        {step > 1 ? (
          <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 24 }} />
        )}

        <Text style={[Typography.subtextBold, { color: colors.primary }]}>
          Step {step} of {totalSteps}
        </Text>

        <View style={{ width: 24 }} />
      </View>

      {/* Step Progress Bar */}
      <View style={[styles.progressBarTrack, { backgroundColor: colors.border }]}>
        <View
          style={[
            styles.progressBarFill,
            { width: `${(step / totalSteps) * 100}%`, backgroundColor: colors.primary },
          ]}
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Step 1: Name & Age */}
        {step === 1 && (
          <View style={styles.stepContainer}>
            <Text style={[Typography.h1, { color: colors.text }]}>Welcome to FitLife ⚡</Text>
            <Text style={[Typography.body, { color: colors.textSecondary, marginTop: Spacing.xs }]}>
              Your all-in-one personal fitness, nutrition, and daily productivity companion.
            </Text>

            {/* Quick Demo Mode Banner */}
            <TouchableOpacity
              onPress={handleQuickDemo}
              disabled={isDemoLoading}
              style={[
                styles.demoBanner,
                {
                  backgroundColor: colors.cardSecondary,
                  borderColor: colors.primary,
                },
              ]}
              activeOpacity={0.8}
            >
              <View style={[styles.demoIconBox, { backgroundColor: `${colors.primary}20` }]}>
                <Ionicons name="flash" size={20} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={[Typography.bodyBold, { color: colors.text }]}>Quick Demo Mode</Text>
                  <View style={{ backgroundColor: colors.primary, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                    <Text style={{ color: '#000', fontSize: 10, fontWeight: '700' }}>1-TAP</Text>
                  </View>
                </View>
                <Text style={[Typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
                  {isDemoLoading ? '⚡ Loading demo...' : 'Instantly explore dashboard with pre-loaded workouts, meals & habits'}
                </Text>
              </View>
              <Ionicons name="arrow-forward" size={18} color={colors.primary} />
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: Spacing.xs }}>
              <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
              <Text style={[Typography.caption, { color: colors.textMuted, marginHorizontal: Spacing.sm, fontSize: 11 }]}>
                OR SETUP PROFILE MANUALLY
              </Text>
              <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
            </View>

            <View style={styles.formGroup}>
              <Text style={[Typography.bodyBold, { color: colors.text, marginBottom: Spacing.xs }]}>
                What should we call you?
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: colors.card, borderColor: colors.border, color: colors.text },
                ]}
                placeholder="Enter your name"
                placeholderTextColor={colors.textMuted}
                value={name}
                onChangeText={setName}
                autoFocus
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[Typography.bodyBold, { color: colors.text, marginBottom: Spacing.xs }]}>
                How old are you?
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: colors.card, borderColor: colors.border, color: colors.text },
                ]}
                placeholder="26"
                placeholderTextColor={colors.textMuted}
                value={age}
                onChangeText={setAge}
                keyboardType="numeric"
              />
            </View>
          </View>
        )}

        {/* Step 2: Body Metrics */}
        {step === 2 && (
          <View style={styles.stepContainer}>
            <Text style={[Typography.h1, { color: colors.text }]}>Body Metrics 📏</Text>
            <Text style={[Typography.body, { color: colors.textSecondary, marginTop: Spacing.xs }]}>
              Used to accurately compute your daily calories, protein, and hydration targets.
            </Text>

            <View style={styles.formGroup}>
              <Text style={[Typography.bodyBold, { color: colors.text, marginBottom: Spacing.xs }]}>
                Height (cm)
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: colors.card, borderColor: colors.border, color: colors.text },
                ]}
                placeholder="175"
                placeholderTextColor={colors.textMuted}
                value={height}
                onChangeText={setHeight}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[Typography.bodyBold, { color: colors.text, marginBottom: Spacing.xs }]}>
                Current Weight (kg)
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: colors.card, borderColor: colors.border, color: colors.text },
                ]}
                placeholder="75"
                placeholderTextColor={colors.textMuted}
                value={weight}
                onChangeText={setWeight}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[Typography.bodyBold, { color: colors.text, marginBottom: Spacing.xs }]}>
                Goal Weight (kg)
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: colors.card, borderColor: colors.border, color: colors.text },
                ]}
                placeholder="70"
                placeholderTextColor={colors.textMuted}
                value={goalWeight}
                onChangeText={setGoalWeight}
                keyboardType="numeric"
              />
            </View>
          </View>
        )}

        {/* Step 3: Fitness Goal & Activity */}
        {step === 3 && (
          <View style={styles.stepContainer}>
            <Text style={[Typography.h1, { color: colors.text }]}>Your Fitness Goal 🎯</Text>
            <Text style={[Typography.body, { color: colors.textSecondary, marginTop: Spacing.xs }]}>
              Select your primary fitness focus and daily activity level.
            </Text>

            <View style={{ gap: Spacing.sm, marginTop: Spacing.md }}>
              {goalsList.map(item => (
                <TouchableOpacity
                  key={item.key}
                  activeOpacity={0.7}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setFitnessGoal(item.key);
                  }}
                  style={[
                    styles.selectableCard,
                    {
                      backgroundColor: fitnessGoal === item.key ? `${colors.primary}18` : colors.card,
                      borderColor: fitnessGoal === item.key ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <View style={[styles.goalIcon, { backgroundColor: `${colors.primary}20` }]}>
                    <Ionicons name={item.icon} size={22} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[Typography.bodyBold, { color: colors.text }]}>{item.label}</Text>
                    <Text style={[Typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
                      {item.desc}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[Typography.h3, { color: colors.text, marginTop: Spacing.xl, marginBottom: Spacing.sm }]}>
              Activity Level
            </Text>

            <View style={{ gap: Spacing.xs }}>
              {activityList.map(item => (
                <TouchableOpacity
                  key={item.key}
                  activeOpacity={0.7}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setActivityLevel(item.key);
                  }}
                  style={[
                    styles.activityItem,
                    {
                      backgroundColor: activityLevel === item.key ? `${colors.primary}18` : colors.card,
                      borderColor: activityLevel === item.key ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text style={[Typography.bodyBold, { color: colors.text }]}>{item.label}</Text>
                  <Text style={[Typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
                    {item.desc}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Step 4: Daily Targets */}
        {step === 4 && (
          <View style={styles.stepContainer}>
            <Text style={[Typography.h1, { color: colors.text }]}>Daily Targets 🎯</Text>
            <Text style={[Typography.body, { color: colors.textSecondary, marginTop: Spacing.xs }]}>
              Fine-tune your hydration, sleep, and workout routine.
            </Text>

            <View style={styles.formGroup}>
              <Text style={[Typography.bodyBold, { color: colors.text, marginBottom: Spacing.xs }]}>
                Workout Frequency (days per week)
              </Text>
              <View style={styles.freqRow}>
                {[2, 3, 4, 5, 6, 7].map(f => (
                  <TouchableOpacity
                    key={f}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setWorkoutFrequency(f);
                    }}
                    style={[
                      styles.freqBtn,
                      {
                        backgroundColor: workoutFrequency === f ? colors.primary : colors.card,
                        borderColor: workoutFrequency === f ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        Typography.bodyBold,
                        { color: workoutFrequency === f ? '#FFF' : colors.text },
                      ]}
                    >
                      {f}d
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={[Typography.bodyBold, { color: colors.text, marginBottom: Spacing.xs }]}>
                Daily Water Target (ml)
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: colors.card, borderColor: colors.border, color: colors.text },
                ]}
                placeholder="2500"
                placeholderTextColor={colors.textMuted}
                value={waterTarget}
                onChangeText={setWaterTarget}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[Typography.bodyBold, { color: colors.text, marginBottom: Spacing.xs }]}>
                Nightly Sleep Target (hours)
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: colors.card, borderColor: colors.border, color: colors.text },
                ]}
                placeholder="8.0"
                placeholderTextColor={colors.textMuted}
                value={sleepTarget}
                onChangeText={setSleepTarget}
                keyboardType="numeric"
              />
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom Action Button */}
      <View style={[styles.bottomBar, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <Button
          title={step === totalSteps ? 'Get Started 🚀' : 'Continue →'}
          onPress={handleNext}
          size="lg"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  backBtn: {
    padding: Spacing.xs,
  },
  progressBarTrack: {
    height: 4,
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  stepContainer: {
    gap: Spacing.md,
  },
  demoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    gap: Spacing.md,
    marginTop: Spacing.xs,
  },
  demoIconBox: {
    width: 42,
    height: 42,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formGroup: {
    marginTop: Spacing.md,
  },
  input: {
    height: 52,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    paddingHorizontal: Spacing.lg,
    fontSize: 16,
  },
  selectableCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    gap: Spacing.md,
  },
  goalIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityItem: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  freqRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  freqBtn: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomBar: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
  },
});
