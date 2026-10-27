import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const NOTIF_PREF_KEY = '@fitlife_notification_preferences';

export interface NotificationPreferences {
  waterReminder: boolean;
  waterIntervalHours: number;
  workoutReminder: boolean;
  workoutTime: string; // "18:00"
  habitReminder: boolean;
  habitTime: string; // "20:00"
  sleepReminder: boolean;
  sleepTime: string; // "22:30"
}

export const DEFAULT_NOTIF_PREFERENCES: NotificationPreferences = {
  waterReminder: true,
  waterIntervalHours: 2,
  workoutReminder: true,
  workoutTime: '17:30',
  habitReminder: true,
  habitTime: '20:00',
  sleepReminder: true,
  sleepTime: '22:30',
};

// Set handler for foreground notification presentation
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    return finalStatus === 'granted';
  } catch (error) {
    console.warn('Error requesting notification permissions:', error);
    return false;
  }
}

export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  try {
    const json = await AsyncStorage.getItem(NOTIF_PREF_KEY);
    if (json) {
      return { ...DEFAULT_NOTIF_PREFERENCES, ...JSON.parse(json) };
    }
  } catch (e) {
    console.warn('Error loading notification preferences', e);
  }
  return DEFAULT_NOTIF_PREFERENCES;
}

export async function saveNotificationPreferences(prefs: NotificationPreferences): Promise<void> {
  try {
    await AsyncStorage.setItem(NOTIF_PREF_KEY, JSON.stringify(prefs));
    await rescheduleAllNotifications(prefs);
  } catch (e) {
    console.warn('Error saving notification preferences', e);
  }
}

export async function rescheduleAllNotifications(prefs: NotificationPreferences): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();

    const granted = await requestNotificationPermissions();
    if (!granted) return;

    // 1. Water Reminder (every N hours between 8 AM and 10 PM)
    if (prefs.waterReminder) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '💧 Stay Hydrated!',
          body: 'Time to log a glass of water and keep your energy high.',
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: prefs.waterIntervalHours * 3600,
          repeats: true,
        },
      });
    }

    // 2. Workout Reminder
    if (prefs.workoutReminder && prefs.workoutTime) {
      const [hour, minute] = prefs.workoutTime.split(':').map(Number);
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '⚡ Workout Time!',
          body: 'Your scheduled fitness session is ready. Crush your goals today!',
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: hour || 17,
          minute: minute || 30,
        },
      });
    }

    // 3. Evening Habits Review
    if (prefs.habitReminder && prefs.habitTime) {
      const [hH, hM] = prefs.habitTime.split(':').map(Number);
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🔥 Check Your Daily Habits',
          body: 'Keep your streaks alive! Complete remaining habits for today.',
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: hH || 20,
          minute: hM || 0,
        },
      });
    }
  } catch (error) {
    console.warn('Failed to schedule notifications:', error);
  }
}
