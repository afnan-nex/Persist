import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme as useDeviceColorScheme } from 'react-native';
import { AppThemeSettings, AppSettings, AppFont } from '../types';
import {
  getThemeSettings,
  updateThemeSettings as saveThemeSettings,
  DEFAULT_THEME_SETTINGS,
} from '../data/themeDatastore';
import {
  getSettings,
  updateSettings as saveAppSettings,
  DEFAULT_SETTINGS,
} from '../data/settingsDatastore';
import { generateColorScheme, ColorScheme } from './colors';
import { getSystemMonetColors } from './monet';

interface ThemeContextType {
  colors: ColorScheme;
  themeSettings: AppThemeSettings;
  setThemeSettings: (partial: Partial<AppThemeSettings>) => Promise<void>;
  appSettings: AppSettings;
  setAppSettings: (partial: Partial<AppSettings>) => Promise<void>;
  fontFamily: string | undefined;
  isReady: boolean;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

function getFontFamily(font: AppFont): string | undefined {
  switch (font) {
    case 'MONOSPACE':
      return 'monospace';
    case 'SERIF':
      return 'serif';
    case 'ROUNDED':
      return 'sans-serif-medium';
    case 'SYSTEM':
    default:
      return undefined;
  }
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const deviceColorScheme = useDeviceColorScheme();
  const [themeSettings, setThemeSettingsState] = useState<AppThemeSettings>(DEFAULT_THEME_SETTINGS);
  const [appSettings, setAppSettingsState] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function load() {
      const [tSettings, aSettings] = await Promise.all([getThemeSettings(), getSettings()]);
      setThemeSettingsState(tSettings);
      setAppSettingsState(aSettings);
      setIsReady(true);
    }
    load();
  }, []);

  const isDark =
    themeSettings.themeMode === 'DARK' ||
    themeSettings.themeMode === 'AMOLED' ||
    (themeSettings.themeMode === 'SYSTEM' && deviceColorScheme === 'dark');

  const isAmoled = themeSettings.themeMode === 'AMOLED' || (isDark && themeSettings.amoled);

  const monetColors = themeSettings.useMaterialYou !== false ? getSystemMonetColors() : null;

  const colors = generateColorScheme(
    themeSettings.seedColor,
    isDark,
    isAmoled,
    themeSettings.paletteStyle,
    monetColors
  );

  const updateTheme = async (partial: Partial<AppThemeSettings>) => {
    const updated = await saveThemeSettings(partial);
    setThemeSettingsState(updated);
  };

  const updateApp = async (partial: Partial<AppSettings>) => {
    const updated = await saveAppSettings(partial);
    setAppSettingsState(updated);
  };

  const fontFamily = getFontFamily(themeSettings.font);

  return (
    <ThemeContext.Provider
      value={{
        colors,
        themeSettings,
        setThemeSettings: updateTheme,
        appSettings,
        setAppSettings: updateApp,
        fontFamily,
        isReady,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
