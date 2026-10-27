import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { BorderRadius, Spacing, Typography } from '../constants/theme';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { FitnessGoal, ActivityLevel } from '../types';
import { saveProfile, calculateNutritionTargets } from '../services/profileService';
import * as Haptics from 'expo-haptics';

export default function ProfileScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { profile, updateProfileState } = useApp();

  const [name, setName] = useState(profile?.name || '');
  const [age, setAge] = useState(String(profile?.age || 26));
  const [height, setHeight] = useState(String(profile?.height || 175));
  const [weight, setWeight] = useState(String(profile?.weight || 75));
  const [goalWeight, setGoalWeight] = useState(String(profile?.goal_weight || 70));
  const [fitnessGoal, setFitnessGoal] = useState<FitnessGoal>(profile?.fitness_goal || 'weight_loss');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(profile?.activity_level || 'moderately_active');
  const [isSaving, setIsSaving] = useState(false);

  // Compute BMI
  const hM = (parseFloat(height) || 175) / 100;
  const wKg = parseFloat(weight) || 75;
  const bmi = (wKg / (hM * hM)).toFixed(1);

  const getBmiCategory = (bmiVal: number) => {
    if (bmiVal < 18.5) return { label: 'Underweight', color: colors.water };
    if (bmiVal < 25) return { label: 'Normal Weight', color: colors.fitness };
    if (bmiVal < 30) return { label: 'Overweight', color: colors.nutrition };
    return { label: 'Obese', color: colors.error };
  };

  const handleSave = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsSaving(true);
    try {
      const a = parseInt(age, 10) || 26;
      const h = parseFloat(height) || 175;
      const w = parseFloat(weight) || 75;
      const gw = parseFloat(goalWeight) || w;

      const targets = calculateNutritionTargets(w, h, a, fitnessGoal, activityLevel);

      const saved = await saveProfile({
        name: name.trim() || 'Athlete',
        age: a,
        height: h,
        weight: w,
        goal_weight: gw,
        fitness_goal: fitnessGoal,
        activity_level: activityLevel,
        workout_frequency: profile?.workout_frequency || 4,
        water_target: targets.waterMl,
        sleep_target: profile?.sleep_target || 8.0,
        calorie_goal: targets.calories,
        protein_goal: targets.protein,
        step_goal: profile?.step_goal || 10000,
      });

      updateProfileState(saved);
      Alert.alert('Profile Updated', 'Your body metrics and daily targets have been recalibrated!');
      router.back();
    } catch (e) {
      console.warn('Error updating profile:', e);
    } finally {
      setIsSaving(false);
    }
  };

  const bmiInfo = getBmiCategory(parseFloat(bmi));

  return (
    <ScrollView style={[styles.container, { backgroundColor: 'transparent' }]} contentContainerStyle={styles.content}>
      {/* Avatar Card */}
      <Card variant="glow" glowColor={colors.primaryGlow} style={styles.avatarCard}>
        <View style={[styles.avatarCircle, { backgroundColor: colors.primaryGlow, borderColor: colors.primary }]}>
          <Text style={[Typography.h1, { color: colors.primary, fontSize: 36 }]}>
            {name ? name.charAt(0).toUpperCase() : 'A'}
          </Text>
        </View>

        <Text style={[Typography.h2, { color: colors.text, marginTop: Spacing.sm }]}>{name || 'Athlete'}</Text>
        <Text style={[Typography.caption, { color: colors.textSecondary }]}>
          Goal: {fitnessGoal.replace('_', ' ').toUpperCase()}
        </Text>

        <View style={styles.badgeRow}>
          <Badge label={`BMI: ${bmi} (${bmiInfo.label})`} color={bmiInfo.color} />
          <Badge label={`Target: ${profile?.calorie_goal || 2200} kcal`} color={colors.nutrition} />
        </View>
      </Card>

      {/* Form Fields */}
      <Card style={styles.formCard}>
        <Text style={[Typography.h3, { color: colors.text, marginBottom: Spacing.md }]}>Edit Body Metrics</Text>

        <View style={styles.fieldGroup}>
          <Text style={[Typography.caption, { color: colors.textSecondary }]}>FULL NAME</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.cardSecondary, borderColor: colors.border, color: colors.text }]}
            value={name}
            onChangeText={setName}
            placeholder="Name"
            placeholderTextColor={colors.textMuted}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.fieldGroup, { flex: 1 }]}>
            <Text style={[Typography.caption, { color: colors.textSecondary }]}>AGE</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.cardSecondary, borderColor: colors.border, color: colors.text }]}
              value={age}
              onChangeText={setAge}
              keyboardType="numeric"
            />
          </View>

          <View style={[styles.fieldGroup, { flex: 1 }]}>
            <Text style={[Typography.caption, { color: colors.textSecondary }]}>HEIGHT (CM)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.cardSecondary, borderColor: colors.border, color: colors.text }]}
              value={height}
              onChangeText={setHeight}
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.fieldGroup, { flex: 1 }]}>
            <Text style={[Typography.caption, { color: colors.textSecondary }]}>CURRENT WEIGHT (KG)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.cardSecondary, borderColor: colors.border, color: colors.text }]}
              value={weight}
              onChangeText={setWeight}
              keyboardType="numeric"
            />
          </View>

          <View style={[styles.fieldGroup, { flex: 1 }]}>
            <Text style={[Typography.caption, { color: colors.textSecondary }]}>GOAL WEIGHT (KG)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.cardSecondary, borderColor: colors.border, color: colors.text }]}
              value={goalWeight}
              onChangeText={setGoalWeight}
              keyboardType="numeric"
            />
          </View>
        </View>

        <Text style={[Typography.caption, { color: colors.textSecondary, marginTop: Spacing.sm, marginBottom: 4 }]}>
          PRIMARY FITNESS GOAL
        </Text>
        <View style={styles.goalsWrap}>
          {(['weight_loss', 'muscle_gain', 'maintenance', 'general_fitness'] as FitnessGoal[]).map(g => (
            <TouchableOpacity
              key={g}
              onPress={() => setFitnessGoal(g)}
              style={[
                styles.goalChip,
                {
                  backgroundColor: fitnessGoal === g ? colors.primary : colors.cardSecondary,
                  borderColor: fitnessGoal === g ? colors.primary : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  Typography.caption,
                  { color: fitnessGoal === g ? '#FFF' : colors.text, fontWeight: '700' },
                ]}
              >
                {g.replace('_', ' ').toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Button
          title={isSaving ? 'Recalculating...' : 'Save & Recalibrate Targets ⚡'}
          onPress={handleSave}
          loading={isSaving}
          style={{ marginTop: Spacing.xl }}
        />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.md,
  },
  avatarCard: {
    alignItems: 'center',
    padding: Spacing.xl,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  formCard: {
    padding: Spacing.lg,
  },
  fieldGroup: {
    marginBottom: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  input: {
    height: 48,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    marginTop: 4,
    fontSize: 15,
  },
  goalsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  goalChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
});
