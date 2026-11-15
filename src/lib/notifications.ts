import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { fmt, strings } from '@/i18n';
import { adventYear, countdown, type ChristmasMode } from './christmas';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

/**
 * Schedules on-device reminders: one per advent door (Dec 1–24, 9:00) and one
 * on Christmas morning. Everything is local — no push server involved.
 * Returns false when the user has not allowed notifications.
 */
export async function syncReminders(enabled: boolean, mode: ChristmasMode): Promise<boolean> {
  if (Platform.OS === 'web') return enabled;
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (!enabled) return true;

  let perm = await Notifications.getPermissionsAsync();
  if (!perm.granted && perm.canAskAgain) perm = await Notifications.requestPermissionsAsync();
  if (!perm.granted) return false;

  const now = new Date();
  const year = adventYear(now) < now.getFullYear() ? now.getFullYear() : adventYear(now);
  const jobs: Promise<string>[] = [];

  for (let day = 1; day <= 24; day++) {
    const date = new Date(year, 11, day, 9, 0, 0);
    if (date <= now) continue;
    jobs.push(
      Notifications.scheduleNotificationAsync({
        content: { title: fmt(strings.notify.doorTitle, { n: day }), body: strings.notify.doorBody },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date },
      }),
    );
  }

  const { target } = countdown(now, mode);
  const christmasMorning = new Date(target.getFullYear(), target.getMonth(), target.getDate(), 8, 0, 0);
  if (christmasMorning > now) {
    jobs.push(
      Notifications.scheduleNotificationAsync({
        content: { title: strings.notify.christmasTitle, body: strings.notify.christmasBody },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: christmasMorning },
      }),
    );
  }

  await Promise.all(jobs);
  return true;
}
