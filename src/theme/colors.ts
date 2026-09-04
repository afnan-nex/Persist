import { AppThemeMode, PaletteStyle } from '../types';
import { MonetColors } from './monet';

export interface ColorScheme {
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;
  secondary: string;
  onSecondary: string;
  secondaryContainer: string;
  onSecondaryContainer: string;
  surface: string;
  onSurface: string;
  surfaceVariant: string;
  onSurfaceVariant: string;
  background: string;
  onBackground: string;
  outline: string;
  outlineVariant: string;
  error: string;
  onError: string;
  errorContainer: string;
  onErrorContainer: string;
  isDark: boolean;
}

export const SEED_COLOR_PRESETS = [
  { name: 'Indigo', color: '#6366F1' },
  { name: 'Blue', color: '#3B82F6' },
  { name: 'Teal', color: '#14B8A6' },
  { name: 'Emerald', color: '#10B981' },
  { name: 'Amber', color: '#F59E0B' },
  { name: 'Orange', color: '#F97316' },
  { name: 'Rose', color: '#F43F5E' },
  { name: 'Purple', color: '#8B5CF6' },
  { name: 'Cyan', color: '#06B6D4' },
];

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16) || 0;
  const g = parseInt(cleanHex.substring(2, 4), 16) || 0;
  const b = parseInt(cleanHex.substring(4, 6), 16) || 0;
  return { r, g, b };
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (c: number) => {
    const clamped = Math.max(0, Math.min(255, Math.round(c)));
    return clamped.toString(16).padStart(2, '0');
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function blend(hex1: string, hex2: string, weight: number): string {
  const c1 = hexToRgb(hex1);
  const c2 = hexToRgb(hex2);
  const r = c1.r * (1 - weight) + c2.r * weight;
  const g = c1.g * (1 - weight) + c2.g * weight;
  const b = c1.b * (1 - weight) + c2.b * weight;
  return rgbToHex(r, g, b);
}

export function generateColorScheme(
  seedHex: string,
  isDark: boolean,
  isAmoled: boolean,
  paletteStyle: PaletteStyle = 'TONAL_SPOT',
  monetColors?: MonetColors | null
): ColorScheme {
  // If Monet (Material You) colors are present from Android 12+ system
  if (monetColors && monetColors.isSupported && monetColors.primary) {
    const mPrimary = monetColors.primary;
    const mSecondary = monetColors.secondary || mPrimary;

    if (isDark) {
      const bg = isAmoled ? '#000000' : (monetColors.surfaceDark || '#141218');
      const surface = isAmoled ? '#121214' : blend(bg, mPrimary, 0.08);
      const surfaceVariant = isAmoled ? '#1C1B1F' : blend(bg, mPrimary, 0.15);

      return {
        primary: monetColors.primaryLight || blend(mPrimary, '#FFFFFF', 0.3),
        onPrimary: '#1E1B4B',
        primaryContainer: monetColors.primaryDark || blend(mPrimary, '#000000', 0.4),
        onPrimaryContainer: '#E0E7FF',
        secondary: monetColors.secondaryLight || blend(mSecondary, '#FFFFFF', 0.3),
        onSecondary: '#0F172A',
        secondaryContainer: blend(mSecondary, '#000000', 0.4),
        onSecondaryContainer: '#E2E8F0',
        surface,
        onSurface: '#E6E1E5',
        surfaceVariant,
        onSurfaceVariant: '#CAC4D0',
        background: bg,
        onBackground: '#E6E1E5',
        outline: '#938F99',
        outlineVariant: '#49454F',
        error: '#F2B8B5',
        onError: '#601410',
        errorContainer: '#8C1D18',
        onErrorContainer: '#F9DEDC',
        isDark: true,
      };
    } else {
      const bg = monetColors.surfaceLight || '#FEF7FF';
      const surface = '#FFFFFF';
      const surfaceVariant = blend('#E7E0EC', mPrimary, 0.08);

      return {
        primary: mPrimary,
        onPrimary: '#FFFFFF',
        primaryContainer: monetColors.primaryLight || blend(mPrimary, '#FFFFFF', 0.8),
        onPrimaryContainer: '#1E1B4B',
        secondary: mSecondary,
        onSecondary: '#FFFFFF',
        secondaryContainer: monetColors.secondaryLight || blend(mSecondary, '#FFFFFF', 0.8),
        onSecondaryContainer: '#1E293B',
        surface,
        onSurface: '#1D1B20',
        surfaceVariant,
        onSurfaceVariant: '#49454F',
        background: bg,
        onBackground: '#1D1B20',
        outline: '#79747E',
        outlineVariant: '#CAC4D0',
        error: '#B3261E',
        onError: '#FFFFFF',
        errorContainer: '#F9DEDC',
        onErrorContainer: '#410E0B',
        isDark: false,
      };
    }
  }

  // Fallback to custom seed color Material 3 algorithm
  const primary = seedHex;

  if (isDark) {
    const bg = isAmoled ? '#000000' : '#141218';
    const surface = isAmoled ? '#121214' : blend(bg, primary, 0.08);
    const surfaceVariant = isAmoled ? '#1C1B1F' : blend(bg, primary, 0.14);

    return {
      primary: blend(primary, '#FFFFFF', 0.35),
      onPrimary: '#1E1B4B',
      primaryContainer: blend(primary, '#000000', 0.45),
      onPrimaryContainer: blend(primary, '#FFFFFF', 0.7),
      secondary: blend(primary, '#94A3B8', 0.5),
      onSecondary: '#0F172A',
      secondaryContainer: blend(primary, '#1E293B', 0.4),
      onSecondaryContainer: '#E2E8F0',
      surface,
      onSurface: '#E6E1E5',
      surfaceVariant,
      onSurfaceVariant: '#CAC4D0',
      background: bg,
      onBackground: '#E6E1E5',
      outline: '#938F99',
      outlineVariant: '#49454F',
      error: '#F2B8B5',
      onError: '#601410',
      errorContainer: '#8C1D18',
      onErrorContainer: '#F9DEDC',
      isDark: true,
    };
  } else {
    const bg = '#FEF7FF';
    const surface = '#FFFFFF';
    const surfaceVariant = blend('#E7E0EC', primary, 0.06);

    return {
      primary,
      onPrimary: '#FFFFFF',
      primaryContainer: blend(primary, '#FFFFFF', 0.85),
      onPrimaryContainer: blend(primary, '#000000', 0.7),
      secondary: blend(primary, '#64748B', 0.4),
      onSecondary: '#FFFFFF',
      secondaryContainer: blend(primary, '#F1F5F9', 0.8),
      onSecondaryContainer: '#1E293B',
      surface,
      onSurface: '#1D1B20',
      surfaceVariant,
      onSurfaceVariant: '#49454F',
      background: bg,
      onBackground: '#1D1B20',
      outline: '#79747E',
      outlineVariant: '#CAC4D0',
      error: '#B3261E',
      onError: '#FFFFFF',
      errorContainer: '#F9DEDC',
      onErrorContainer: '#410E0B',
      isDark: false,
    };
  }
}
