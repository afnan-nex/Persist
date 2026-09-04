import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppThemeSettings } from '../types';

const THEME_KEY = 'persist_theme_settings';

export const DEFAULT_THEME_SETTINGS: AppThemeSettings = {
  themeMode: 'SYSTEM',
  seedColor: '#6366F1',
  paletteStyle: 'TONAL_SPOT',
  amoled: false,
  useMaterialYou: true,
  font: 'SYSTEM',
};

export async function getThemeSettings(): Promise<AppThemeSettings> {
  try {
    const raw = await AsyncStorage.getItem(THEME_KEY);
    if (!raw) return DEFAULT_THEME_SETTINGS;
    return { ...DEFAULT_THEME_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_THEME_SETTINGS;
  }
}

export async function updateThemeSettings(
  partial: Partial<AppThemeSettings>
): Promise<AppThemeSettings> {
  try {
    const current = await getThemeSettings();
    const updated = { ...current, ...partial };
    await AsyncStorage.setItem(THEME_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.error('Failed to update theme settings:', error);
    return DEFAULT_THEME_SETTINGS;
  }
}
