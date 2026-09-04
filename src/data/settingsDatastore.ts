import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppSettings } from '../types';

const SETTINGS_KEY = 'persist_user_settings';

export const DEFAULT_SETTINGS: AppSettings = {
  startOfWeek: 'MONDAY',
  startingPage: 'tasks',
  is24Hr: false,
  notificationsEnabled: true,
  biometricLock: false,
  taskReorder: false,
  compactView: false,
  lastChangelogShown: '1.0.0',
};

export async function getSettings(): Promise<AppSettings> {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function updateSettings(partial: Partial<AppSettings>): Promise<AppSettings> {
  try {
    const current = await getSettings();
    const updated = { ...current, ...partial };
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.error('Failed to update settings:', error);
    return DEFAULT_SETTINGS;
  }
}
