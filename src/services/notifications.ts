import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Task, Habit, DayOfWeek } from '../types';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const TASK_REMINDER_CATEGORY = 'TASK_REMINDER_CATEGORY';
export const ACTION_MARK_DONE = 'ACTION_MARK_DONE';

export async function initNotifications(): Promise<boolean> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('persist-reminders', {
      name: 'Persist Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#6366F1',
      sound: 'default',
    });
  }

  // Register actionable notification categories
  try {
    await Notifications.setNotificationCategoryAsync(TASK_REMINDER_CATEGORY, [
      {
        identifier: ACTION_MARK_DONE,
        buttonTitle: '✓ Mark Done',
        options: {
          opensAppToForeground: false,
        },
      },
    ]);
  } catch (err) {
    console.warn('Failed to set notification category:', err);
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  return finalStatus === 'granted';
}

export function registerNotificationResponseListener(
  onMarkTaskDone?: (taskId: number) => void
) {
  return Notifications.addNotificationResponseReceivedListener(async (response) => {
    try {
      const data = response.notification.request.content.data as
        | { taskId?: number; type?: string }
        | undefined;
      const actionId = response.actionIdentifier;

      if ((actionId === ACTION_MARK_DONE || actionId === 'MARK_DONE') && data?.taskId) {
        if (onMarkTaskDone) {
          onMarkTaskDone(data.taskId);
        } else {
          const { toggleTaskStatus } = await import('../data/taskRepository');
          await toggleTaskStatus(data.taskId, true);
        }
        await Notifications.dismissNotificationAsync(response.notification.request.identifier);
      }
    } catch (err) {
      console.warn('Error handling notification action:', err);
    }
  });
}

export async function scheduleTaskReminder(task: Task): Promise<void> {
  if (!task.reminder) return;
  // If reminder is in the past, don't schedule
  if (task.reminder <= Date.now()) return;

  // First cancel existing if any
  await cancelTaskReminder(task.id);

  try {
    await Notifications.scheduleNotificationAsync({
      identifier: `task-${task.id}`,
      content: {
        title: 'Task Reminder',
        body: task.title,
        data: { taskId: task.id, type: 'task' },
        categoryIdentifier: TASK_REMINDER_CATEGORY,
        sound: 'default',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: new Date(task.reminder),
      },
    });
  } catch (error) {
    console.warn('Failed to schedule task reminder:', error);
  }
}

export async function cancelTaskReminder(taskId: number): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(`task-${taskId}`);
  } catch (error) {
    console.warn('Failed to cancel task reminder:', error);
  }
}

function dayOfWeekToWeekday(dow: DayOfWeek): number {
  switch (dow) {
    case 'SUNDAY':
      return 1;
    case 'MONDAY':
      return 2;
    case 'TUESDAY':
      return 3;
    case 'WEDNESDAY':
      return 4;
    case 'THURSDAY':
      return 5;
    case 'FRIDAY':
      return 6;
    case 'SATURDAY':
      return 7;
  }
}

export async function scheduleHabitReminders(habit: Habit): Promise<void> {
  await cancelHabitReminders(habit.id);

  if (!habit.reminder || habit.days.length === 0) return;

  const hours = Math.floor(habit.time / 60);
  const minutes = habit.time % 60;

  for (const day of habit.days) {
    try {
      const weekday = dayOfWeekToWeekday(day);
      await Notifications.scheduleNotificationAsync({
        identifier: `habit-${habit.id}-${day}`,
        content: {
          title: habit.title,
          body: habit.description || 'Time to complete your habit!',
          data: { habitId: habit.id, type: 'habit' },
          sound: 'default',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          weekday,
          hour: hours,
          minute: minutes,
        },
      });
    } catch (error) {
      console.warn(`Failed to schedule reminder for habit ${habit.id} on ${day}:`, error);
    }
  }
}

export async function cancelHabitReminders(habitId: number): Promise<void> {
  const allDays: DayOfWeek[] = [
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
    'SATURDAY',
    'SUNDAY',
  ];

  for (const day of allDays) {
    try {
      await Notifications.cancelScheduledNotificationAsync(`habit-${habitId}-${day}`);
    } catch {
      // Ignore if not present
    }
  }
}
