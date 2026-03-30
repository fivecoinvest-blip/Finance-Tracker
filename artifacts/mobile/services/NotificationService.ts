import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export const STREAK_NOTIFICATION_ID = 'cashper-daily-streak';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') {
    if (!('Notification' in window)) return false;
    const perm = await (window.Notification as any).requestPermission();
    return perm === 'granted';
  }
  try {
    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === 'granted') return true;
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch {
    return false;
  }
}

export async function fireNotification(title: string, body: string): Promise<void> {
  if (Platform.OS === 'web') {
    if (!('Notification' in window)) return;
    if ((window.Notification as any).permission === 'granted') {
      new (window.Notification as any)(title, { body, icon: '/assets/images/icon.png' });
    }
    return;
  }
  try {
    await Notifications.scheduleNotificationAsync({
      content: { title, body, sound: true },
      trigger: null,
    });
  } catch {}
}

export async function scheduleStreakReminder(): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    await cancelStreakReminder();
    await Notifications.scheduleNotificationAsync({
      identifier: STREAK_NOTIFICATION_ID,
      content: {
        title: '🔥 Keep your streak alive!',
        body: "Don't forget to log your transactions today.",
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 20,
        minute: 0,
      },
    });
  } catch {}
}

export async function cancelStreakReminder(): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    await Notifications.cancelScheduledNotificationAsync(STREAK_NOTIFICATION_ID);
  } catch {}
}
