import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, Alert, Share, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { BorderRadius, Spacing, Typography } from '../constants/theme';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { resetDatabase } from '../database/db';
import {
  getNotificationPreferences,
  saveNotificationPreferences,
  NotificationPreferences,
} from '../services/notificationService';
import { saveProfile } from '../services/profileService';
import { seedDemoUserData } from '../services/demoDataService';
import * as Haptics from 'expo-haptics';

export default function SettingsScreen() {
  const router = useRouter();
  const { theme, isDark, toggleTheme, colors } = useTheme();
  const { profile, refreshData, updateProfileState } = useApp();

  const [notifPrefs, setNotifPrefs] = useState<NotificationPreferences>({
    waterReminder: true,
    waterIntervalHours: 2,
    workoutReminder: true,
    workoutTime: '17:30',
    habitReminder: true,
    habitTime: '20:00',
    sleepReminder: true,
    sleepTime: '22:30',
  });

  // Target overrides
  const [calorieGoal, setCalorieGoal] = useState(String(profile?.calorie_goal || 2200));
  const [proteinGoal, setProteinGoal] = useState(String(profile?.protein_goal || 140));
  const [waterGoal, setWaterGoal] = useState(String(profile?.water_target || 2500));
  const [sleepGoal, setSleepGoal] = useState(String(profile?.sleep_target || 8.0));

  useEffect(() => {
    getNotificationPreferences().then(setNotifPrefs);
  }, []);

  const handleToggleNotif = async (key: keyof NotificationPreferences, value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const updated = { ...notifPrefs, [key]: value };
    setNotifPrefs(updated);
    await saveNotificationPreferences(updated);
  };

  const handleSaveGoals = async () => {
    if (!profile) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const updated = await saveProfile({
      ...profile,
      calorie_goal: parseInt(calorieGoal, 10) || 2200,
      protein_goal: parseInt(proteinGoal, 10) || 140,
      water_target: parseInt(waterGoal, 10) || 2500,
      sleep_target: parseFloat(sleepGoal) || 8.0,
    });
    updateProfileState(updated);
    Alert.alert('Goals Saved', 'Your custom daily goals have been updated.');
  };

  const handleExportData = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const exportSummary = JSON.stringify(
      {
        profile,
        exportDate: new Date().toISOString(),
        application: 'FitLife Tracker v1.0',
      },
      null,
      2
    );

    try {
      await Share.share({
        message: exportSummary,
        title: 'FitLife_Export_Data.json',
      });
    } catch (e) {
      console.warn('Error sharing export data:', e);
    }
  };

  const handleLoadDemo = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const demoProf = await seedDemoUserData();
    updateProfileState(demoProf);
    await refreshData();
    Alert.alert('⚡ Demo Data Loaded', 'Sample workouts, meals, water logs, and habits have been populated.');
  };

  const handleResetData = () => {
    Alert.alert(
      '⚠️ Reset All Data',
      'This will permanently delete all your workouts, food logs, hydration entries, tasks, habits, and profile data from local storage. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Everything',
          style: 'destructive',
          onPress: async () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            await resetDatabase();
            await refreshData();
            router.replace('/onboarding');
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: 'transparent' }]} contentContainerStyle={styles.content}>
      {/* Theme Card */}
      <Card style={styles.sectionCard}>
        <Text style={[Typography.h3, { color: colors.text, marginBottom: Spacing.md }]}>Appearance</Text>

        <View style={styles.settingRow}>
          <View style={styles.settingLabelRow}>
            <Ionicons name={isDark ? 'moon' : 'sunny'} size={22} color={colors.primary} />
            <View style={{ marginLeft: Spacing.md }}>
              <Text style={[Typography.bodyBold, { color: colors.text }]}>Dark Mode</Text>
              <Text style={[Typography.caption, { color: colors.textSecondary }]}>
                {isDark ? 'Deep Obsidian Dark' : 'Clean Bright Light'}
              </Text>
            </View>
          </View>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor="#FFF"
          />
        </View>
      </Card>

      {/* Notifications Card */}
      <Card style={styles.sectionCard}>
        <Text style={[Typography.h3, { color: colors.text, marginBottom: Spacing.md }]}>
          Reminders & Notifications
        </Text>

        <View style={styles.settingRow}>
          <View style={styles.settingLabelRow}>
            <Ionicons name="water-outline" size={22} color={colors.water} />
            <View style={{ marginLeft: Spacing.md }}>
              <Text style={[Typography.bodyBold, { color: colors.text }]}>Hydration Reminders</Text>
              <Text style={[Typography.caption, { color: colors.textSecondary }]}>Every 2 hours</Text>
            </View>
          </View>
          <Switch
            value={notifPrefs.waterReminder}
            onValueChange={v => handleToggleNotif('waterReminder', v)}
            trackColor={{ false: colors.border, true: colors.water }}
            thumbColor="#FFF"
          />
        </View>

        <View style={[styles.settingRow, { borderTopWidth: 1, borderTopColor: colors.border }]}>
          <View style={styles.settingLabelRow}>
            <Ionicons name="barbell-outline" size={22} color={colors.fitness} />
            <View style={{ marginLeft: Spacing.md }}>
              <Text style={[Typography.bodyBold, { color: colors.text }]}>Workout Reminder</Text>
              <Text style={[Typography.caption, { color: colors.textSecondary }]}>Daily at 5:30 PM</Text>
            </View>
          </View>
          <Switch
            value={notifPrefs.workoutReminder}
            onValueChange={v => handleToggleNotif('workoutReminder', v)}
            trackColor={{ false: colors.border, true: colors.fitness }}
            thumbColor="#FFF"
          />
        </View>

        <View style={[styles.settingRow, { borderTopWidth: 1, borderTopColor: colors.border }]}>
          <View style={styles.settingLabelRow}>
            <Ionicons name="flame-outline" size={22} color={colors.habit} />
            <View style={{ marginLeft: Spacing.md }}>
              <Text style={[Typography.bodyBold, { color: colors.text }]}>Habit Check-in</Text>
              <Text style={[Typography.caption, { color: colors.textSecondary }]}>Evening at 8:00 PM</Text>
            </View>
          </View>
          <Switch
            value={notifPrefs.habitReminder}
            onValueChange={v => handleToggleNotif('habitReminder', v)}
            trackColor={{ false: colors.border, true: colors.habit }}
            thumbColor="#FFF"
          />
        </View>
      </Card>

      {/* Target Adjustments Card */}
      <Card style={styles.sectionCard}>
        <Text style={[Typography.h3, { color: colors.text, marginBottom: Spacing.md }]}>Daily Goal Targets</Text>

        <View style={styles.goalGrid}>
          <View style={styles.goalInputCol}>
            <Text style={[Typography.caption, { color: colors.nutrition, fontWeight: '700' }]}>CALORIES (KCAL)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.cardSecondary, borderColor: colors.border, color: colors.text }]}
              value={calorieGoal}
              onChangeText={setCalorieGoal}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.goalInputCol}>
            <Text style={[Typography.caption, { color: colors.protein, fontWeight: '700' }]}>PROTEIN (G)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.cardSecondary, borderColor: colors.border, color: colors.text }]}
              value={proteinGoal}
              onChangeText={setProteinGoal}
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={[styles.goalGrid, { marginTop: Spacing.sm }]}>
          <View style={styles.goalInputCol}>
            <Text style={[Typography.caption, { color: colors.water, fontWeight: '700' }]}>WATER (ML)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.cardSecondary, borderColor: colors.border, color: colors.text }]}
              value={waterGoal}
              onChangeText={setWaterGoal}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.goalInputCol}>
            <Text style={[Typography.caption, { color: colors.sleep, fontWeight: '700' }]}>SLEEP (HRS)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.cardSecondary, borderColor: colors.border, color: colors.text }]}
              value={sleepGoal}
              onChangeText={setSleepGoal}
              keyboardType="numeric"
            />
          </View>
        </View>

        <Button
          title="Update Daily Targets"
          onPress={handleSaveGoals}
          size="sm"
          style={{ marginTop: Spacing.md }}
        />
      </Card>

      {/* Data Management */}
      <Card style={styles.sectionCard}>
        <Text style={[Typography.h3, { color: colors.text, marginBottom: Spacing.md }]}>Data Management</Text>

        <TouchableOpacity
          onPress={handleLoadDemo}
          style={[styles.settingRow, { paddingVertical: Spacing.sm }]}
        >
          <View style={styles.settingLabelRow}>
            <Ionicons name="flash-outline" size={22} color={colors.primary} />
            <Text style={[Typography.bodyBold, { color: colors.text, marginLeft: Spacing.md }]}>
              Load Demo Data (1-Tap Test)
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleExportData}
          style={[styles.settingRow, { paddingVertical: Spacing.sm, borderTopWidth: 1, borderTopColor: colors.border }]}
        >
          <View style={styles.settingLabelRow}>
            <Ionicons name="download-outline" size={22} color={colors.primary} />
            <Text style={[Typography.bodyBold, { color: colors.text, marginLeft: Spacing.md }]}>
              Export Data (JSON)
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleResetData}
          style={[styles.settingRow, { paddingVertical: Spacing.sm, borderTopWidth: 1, borderTopColor: colors.border }]}
        >
          <View style={styles.settingLabelRow}>
            <Ionicons name="trash-outline" size={22} color={colors.error} />
            <Text style={[Typography.bodyBold, { color: colors.error, marginLeft: Spacing.md }]}>
              Reset Application Data
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.error} />
        </TouchableOpacity>
      </Card>

      {/* About */}
      <Card style={styles.sectionCard}>
        <Text style={[Typography.h3, { color: colors.text }]}>FitLife Tracker</Text>
        <Text style={[Typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
          Version 1.0.0 • Offline-First React Native + Expo SQLite
        </Text>
        <Text style={[Typography.subtext, { color: colors.textMuted, marginTop: Spacing.xs }]}>
          Engineered for privacy, zero fake data, and maximum performance on mobile.
        </Text>
      </Card>

      <View style={{ height: Spacing.xxxl }} />
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
  sectionCard: {
    padding: Spacing.lg,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
  },
  settingLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  goalInputCol: {
    flex: 1,
  },
  input: {
    height: 46,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    marginTop: 4,
    fontSize: 15,
  },
});
