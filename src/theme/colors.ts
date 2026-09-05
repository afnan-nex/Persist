import { AppThemeMode, PaletteStyle } from '../types';
import { MonetColors } from './monet';

/**
 * Official Material Design 3 Color Scheme Specification
 * https://m3.material.io/styles/color/overview
 */
export interface ColorScheme {
  // Primary
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;
  inversePrimary: string;

  // Secondary
  secondary: string;
  onSecondary: string;
  secondaryContainer: string;
  onSecondaryContainer: string;

  // Tertiary
  tertiary: string;
  onTertiary: string;
  tertiaryContainer: string;
  onTertiaryContainer: string;

  // Error
  error: string;
  onError: string;
  errorContainer: string;
  onErrorContainer: string;

  // Background & Surface
  background: string;
  onBackground: string;
  surface: string;
  onSurface: string;
  surfaceVariant: string;
  onSurfaceVariant: string;

  // Surface Containers (Tonal Elevation)
  surfaceDim: string;
  surfaceBright: string;
  surfaceContainerLowest: string;
  surfaceContainerLow: string;
  surfaceContainer: string;
  surfaceContainerHigh: string;
  surfaceContainerHighest: string;

  // Inverse
  inverseSurface: string;
  inverseOnSurface: string;

  // Outline
  outline: string;
  outlineVariant: string;

  // Scrim & Shadow
  scrim: string;
  shadow: string;

  // Metadata
  isDark: boolean;
}

export const SEED_COLOR_PRESETS = [
  { name: 'Indigo', color: '#6366F1' },
  { name: 'Royal Blue', color: '#2563EB' },
  { name: 'Teal', color: '#0D9488' },
  { name: 'Emerald', color: '#10B981' },
  { name: 'Amber Gold', color: '#F59E0B' },
  { name: 'Sunset Coral', color: '#F97316' },
  { name: 'Crimson Rose', color: '#F43F5E' },
  { name: 'Amethyst', color: '#8B5CF6' },
  { name: 'Deep Violet', color: '#7C3AED' },
  { name: 'Vivid Cyan', color: '#06B6D4' },
  { name: 'Berry Pink', color: '#D946EF' },
  { name: 'Forest Sage', color: '#15803D' },
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

// Convert RGB to HSL
function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}

// Convert HSL to RGB Hex
function hslToHex(h: number, s: number, l: number): string {
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(100, s)) / 100;
  l = Math.max(0, Math.min(100, l)) / 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;

  if (h < 60) {
    r = c; g = x; b = 0;
  } else if (h < 120) {
    r = x; g = c; b = 0;
  } else if (h < 180) {
    r = 0; g = c; b = x;
  } else if (h < 240) {
    r = 0; g = x; b = c;
  } else if (h < 300) {
    r = x; g = 0; b = c;
  } else {
    r = c; g = 0; b = x;
  }

  return rgbToHex((r + m) * 255, (g + m) * 255, (b + m) * 255);
}

export function getLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

export function getContrastRatio(hex1: string, hex2: string): number {
  const l1 = getLuminance(hex1);
  const l2 = getLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export function getContrastingTextColor(backgroundHex: string, lightHex = '#FFFFFF', darkHex = '#111318'): string {
  const lum = getLuminance(backgroundHex);
  return lum > 0.36 ? darkHex : lightHex;
}

/**
 * Generate an M3 Tonal Palette for a given Hue and Chroma/Saturation
 * Generates tones: 0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 98, 99, 100
 */
/**
 * Generate an authentic Material 3 / Material You Tonal Palette
 * Accurately models perceptual Chroma and Luminance:
 * - Tone 80 (Dark Mode Primary): Luminous, glowing, vibrant pop (never washed-out chalk)
 * - Tone 40 (Light Mode Primary): Deep, authoritative, high-contrast saturated primary
 * - Tone 90 (Light Mode Container): Rich, juicy, saturated pastel (never dirty grey)
 * - Tone 30 (Dark Mode Container): Deep, saturated jewel-tone
 */
function createTonalPalette(hue: number, saturation: number) {
  const baseSat = Math.max(0, Math.min(100, saturation));

  return (tone: number): string => {
    if (tone >= 100) return '#FFFFFF';
    if (tone <= 0) return '#000000';

    let l: number;
    let sFactor: number;

    if (tone >= 95) {
      l = 94;
      sFactor = 0.65;
    } else if (tone >= 90) {
      // Tone 90: Light mode container - soft pastel
      l = 88;
      sFactor = 0.85;
    } else if (tone >= 80) {
      // Tone 80: Dark mode primary - glowing pop
      l = 78;
      sFactor = 1.0;
    } else if (tone >= 70) {
      l = 68;
      sFactor = 0.95;
    } else if (tone >= 60) {
      l = 58;
      sFactor = 0.92;
    } else if (tone >= 50) {
      l = 49;
      sFactor = 0.92;
    } else if (tone >= 40) {
      // Tone 40: Light mode primary - authoritative & commanding
      l = 40;
      sFactor = 1.0;
    } else if (tone >= 30) {
      // Tone 30: Dark mode container - deep jewel tone
      l = 28;
      sFactor = 0.85;
    } else if (tone >= 20) {
      l = 18;
      sFactor = 0.80;
    } else {
      // Tone 10: OnContainer in light mode
      l = 11;
      sFactor = 0.70;
    }

    const s = Math.max(0, Math.min(100, baseSat * sFactor));
    return hslToHex(hue, s, l);
  };
}

export interface PaletteStyleConfig {
  primaryHueShift: number;
  primarySat: (baseSat: number) => number;
  secondaryHueShift: number;
  secondarySat: (baseSat: number) => number;
  tertiaryHueShift: number;
  tertiarySat: (baseSat: number) => number;
  surfaceTintMult: number;
  label: string;
  description: string;
}

export function getPaletteParams(style: PaletteStyle): PaletteStyleConfig {
  switch (style) {
    case 'SPRITZ':
      return {
        primaryHueShift: 0,
        primarySat: (s) => Math.min(32, Math.max(18, s * 0.3)),
        secondaryHueShift: 10,
        secondarySat: (s) => Math.min(22, Math.max(12, s * 0.2)),
        tertiaryHueShift: 25,
        tertiarySat: (s) => Math.min(28, Math.max(15, s * 0.25)),
        surfaceTintMult: 0.2,
        label: 'Spritz',
        description: 'Soft, muted & calm pastel tones',
      };
    case 'VIBRANT':
      return {
        primaryHueShift: 0,
        primarySat: (s) => Math.min(100, Math.max(85, s * 1.35)),
        secondaryHueShift: 18,
        secondarySat: (s) => Math.min(95, Math.max(75, s * 1.2)),
        tertiaryHueShift: 75,
        tertiarySat: (s) => Math.min(100, Math.max(85, s * 1.3)),
        surfaceTintMult: 1.6,
        label: 'Vibrant',
        description: 'Vivid, punchy & high-energy colors',
      };
    case 'EXPRESSIVE':
      return {
        primaryHueShift: 15,
        primarySat: (s) => Math.min(100, Math.max(80, s * 1.2)),
        secondaryHueShift: 110,
        secondarySat: (s) => Math.min(95, Math.max(70, s * 1.1)),
        tertiaryHueShift: 220,
        tertiarySat: (s) => Math.min(100, Math.max(75, s * 1.15)),
        surfaceTintMult: 1.2,
        label: 'Expressive',
        description: 'Bold, artistic & contrasting accents',
      };
    case 'RAINBOW':
      return {
        primaryHueShift: 0,
        primarySat: (s) => Math.min(100, Math.max(75, s * 1.1)),
        secondaryHueShift: 90,
        secondarySat: (s) => Math.min(90, Math.max(65, s * 1.0)),
        tertiaryHueShift: 180,
        tertiarySat: (s) => Math.min(100, Math.max(75, s * 1.15)),
        surfaceTintMult: 1.1,
        label: 'Rainbow',
        description: 'Rich spectrum of chromatic colors',
      };
    case 'FRUIT_SALAD':
      return {
        primaryHueShift: -40,
        primarySat: (s) => Math.min(100, Math.max(80, s * 1.25)),
        secondaryHueShift: 50,
        secondarySat: (s) => Math.min(95, Math.max(70, s * 1.1)),
        tertiaryHueShift: 140,
        tertiarySat: (s) => Math.min(100, Math.max(80, s * 1.2)),
        surfaceTintMult: 1.3,
        label: 'Fruit Salad',
        description: 'Fresh, playful & tropical hues',
      };
    case 'TONAL_SPOT':
    default:
      return {
        primaryHueShift: 0,
        primarySat: (s) => Math.min(85, Math.max(55, s * 0.9)),
        secondaryHueShift: 16,
        secondarySat: (s) => Math.min(65, Math.max(35, s * 0.55)),
        tertiaryHueShift: 60,
        tertiarySat: (s) => Math.min(75, Math.max(45, s * 0.7)),
        surfaceTintMult: 1.0,
        label: 'Tonal Spot',
        description: 'Balanced & harmonious Material You',
      };
  }
}

export function getPalettePreviewColors(
  seedHex: string,
  style: PaletteStyle,
  isDark: boolean
): { primary: string; secondary: string; tertiary: string; container: string } {
  const rgb = hexToRgb(seedHex);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const params = getPaletteParams(style);

  const primaryHue = (hsl.h + params.primaryHueShift + 360) % 360;
  const primarySat = params.primarySat(hsl.s);
  const secondaryHue = (hsl.h + params.secondaryHueShift + 360) % 360;
  const secondarySat = params.secondarySat(hsl.s);
  const tertiaryHue = (hsl.h + params.tertiaryHueShift + 360) % 360;
  const tertiarySat = params.tertiarySat(hsl.s);

  const primaryPalette = createTonalPalette(primaryHue, primarySat);
  const secondaryPalette = createTonalPalette(secondaryHue, secondarySat);
  const tertiaryPalette = createTonalPalette(tertiaryHue, tertiarySat);

  if (isDark) {
    return {
      primary: primaryPalette(80),
      secondary: secondaryPalette(80),
      tertiary: tertiaryPalette(80),
      container: primaryPalette(30),
    };
  } else {
    return {
      primary: primaryPalette(40),
      secondary: secondaryPalette(40),
      tertiary: tertiaryPalette(40),
      container: primaryPalette(90),
    };
  }
}

export function generateColorScheme(
  seedHex: string,
  isDark: boolean,
  isAmoled: boolean,
  paletteStyle: PaletteStyle = 'TONAL_SPOT',
  monetColors?: MonetColors | null
): ColorScheme {
  // If Monet (Material You) colors are present from Android 12+ system
  // and style is TONAL_SPOT, use the native system tokens directly
  if (
    paletteStyle === 'TONAL_SPOT' &&
    monetColors &&
    monetColors.isSupported &&
    monetColors.primary
  ) {
    const mPrimary = monetColors.primary;
    const mSecondary = monetColors.secondary || blend(mPrimary, '#64748B', 0.35);
    const mTertiary = monetColors.tertiary || blend(mPrimary, '#EC4899', 0.35);

    if (isDark) {
      // Dark Mode: Glowing Tone 80 primary, rich Tone 30 jewel container
      const primaryCol = monetColors.primaryLight || blend(mPrimary, '#FFFFFF', 0.35);
      const primaryContainerCol = monetColors.primaryDark || blend(mPrimary, '#000000', 0.45);
      const secondaryCol = monetColors.secondaryLight || blend(mSecondary, '#FFFFFF', 0.35);
      const secondaryContainerCol = monetColors.secondaryDark || blend(mSecondary, '#000000', 0.45);
      const tertiaryCol = monetColors.tertiaryLight || blend(mTertiary, '#FFFFFF', 0.35);
      const tertiaryContainerCol = monetColors.tertiaryDark || blend(mTertiary, '#000000', 0.45);

      const baseDark = isAmoled ? '#000000' : (monetColors.surfaceDark || '#0E1117');
      const bg = baseDark;
      const surface = baseDark;

      // Surface tinting: infuse surfaces with the primary accent
      const surfaceLow = isAmoled ? '#080B12' : (monetColors.surfaceDarkLow || blend(baseDark, primaryCol, 0.08));
      const surfaceContainer = isAmoled ? '#10141F' : (monetColors.surfaceDarkContainer || blend(baseDark, primaryCol, 0.12));
      const surfaceHigh = isAmoled ? '#181E2C' : blend(baseDark, primaryCol, 0.16);
      const surfaceHighest = isAmoled ? '#202738' : blend(baseDark, primaryCol, 0.22);

      return {
        primary: primaryCol,
        onPrimary: getContrastingTextColor(primaryCol, '#FFFFFF', '#090D16'),
        primaryContainer: primaryContainerCol,
        onPrimaryContainer: getContrastingTextColor(primaryContainerCol, '#EEF2FF', '#1E1B4B'),
        inversePrimary: mPrimary,

        secondary: secondaryCol,
        onSecondary: getContrastingTextColor(secondaryCol, '#FFFFFF', '#090D16'),
        secondaryContainer: secondaryContainerCol,
        onSecondaryContainer: '#F1F5F9',

        tertiary: tertiaryCol,
        onTertiary: getContrastingTextColor(tertiaryCol, '#FFFFFF', '#3B0764'),
        tertiaryContainer: tertiaryContainerCol,
        onTertiaryContainer: '#FCE7F3',

        error: '#F2B8B5',
        onError: '#601410',
        errorContainer: '#8C1D18',
        onErrorContainer: '#F9DEDC',

        background: bg,
        onBackground: '#E3E6EE',
        surface,
        onSurface: '#E3E6EE',
        surfaceVariant: isAmoled ? '#161B28' : blend(surfaceContainer, primaryCol, 0.15),
        onSurfaceVariant: '#C4C8D4',

        surfaceDim: isAmoled ? '#000000' : '#0B0D13',
        surfaceBright: isAmoled ? '#151924' : '#2A2F3D',
        surfaceContainerLowest: isAmoled ? '#000000' : '#080A0F',
        surfaceContainerLow: surfaceLow,
        surfaceContainer: surfaceContainer,
        surfaceContainerHigh: surfaceHigh,
        surfaceContainerHighest: surfaceHighest,

        inverseSurface: '#E3E6EE',
        inverseOnSurface: '#191C24',

        outline: monetColors.outlineDark || '#8E94A4',
        outlineVariant: '#444958',

        scrim: '#000000',
        shadow: '#000000',
        isDark: true,
      };
    } else {
      // Light Mode: Authoritative Tone 40 primary, saturated Tone 90 pastel container
      const primaryCol = monetColors.primaryKey || monetColors.primary || blend(mPrimary, '#000000', 0.1);
      const primaryContainerCol = monetColors.primaryContainerLight || blend(mPrimary, '#FFFFFF', 0.82);
      const onPrimaryContainerCol = monetColors.onPrimaryContainerLight || blend(primaryCol, '#000000', 0.6);

      const secondaryCol = monetColors.secondaryKey || monetColors.secondary || blend(mSecondary, '#000000', 0.1);
      const secondaryContainerCol = monetColors.secondaryContainerLight || blend(mSecondary, '#FFFFFF', 0.82);

      const tertiaryCol = monetColors.tertiaryKey || monetColors.tertiary || blend(mTertiary, '#000000', 0.1);
      const tertiaryContainerCol = monetColors.tertiaryContainerLight || blend(mTertiary, '#FFFFFF', 0.82);

      const bg = monetColors.surfaceLight || '#F8F9FE';
      const baseSurface = '#FFFFFF';

      const surfaceLow = monetColors.surfaceLightLow || blend(baseSurface, primaryCol, 0.04);
      const surfaceContainer = monetColors.surfaceLightContainer || blend(baseSurface, primaryCol, 0.08);
      const surfaceHigh = blend(baseSurface, primaryCol, 0.12);
      const surfaceHighest = blend(baseSurface, primaryCol, 0.16);

      return {
        primary: primaryCol,
        onPrimary: '#FFFFFF',
        primaryContainer: primaryContainerCol,
        onPrimaryContainer: onPrimaryContainerCol,
        inversePrimary: blend(primaryCol, '#FFFFFF', 0.45),

        secondary: secondaryCol,
        onSecondary: '#FFFFFF',
        secondaryContainer: secondaryContainerCol,
        onSecondaryContainer: getContrastingTextColor(secondaryContainerCol, '#FFFFFF', '#0F172A'),

        tertiary: tertiaryCol,
        onTertiary: '#FFFFFF',
        tertiaryContainer: tertiaryContainerCol,
        onTertiaryContainer: '#3B0764',

        error: '#B3261E',
        onError: '#FFFFFF',
        errorContainer: '#F9DEDC',
        onErrorContainer: '#410E0B',

        background: bg,
        onBackground: '#191C22',
        surface: baseSurface,
        onSurface: '#191C22',
        surfaceVariant: blend('#E2E4EC', primaryCol, 0.14),
        onSurfaceVariant: '#444752',

        surfaceDim: '#DCE0E9',
        surfaceBright: '#F8F9FE',
        surfaceContainerLowest: '#FFFFFF',
        surfaceContainerLow: surfaceLow,
        surfaceContainer: surfaceContainer,
        surfaceContainerHigh: surfaceHigh,
        surfaceContainerHighest: surfaceHighest,

        inverseSurface: '#2D3038',
        inverseOnSurface: '#F0F2F8',

        outline: monetColors.outlineLight || '#737785',
        outlineVariant: '#C3C7D4',

        scrim: '#000000',
        shadow: '#000000',
        isDark: false,
      };
    }
  }

  // Derive palette dynamically from the active seed color (wallpaper primary or custom seed)
  const effectiveSeed =
    monetColors && monetColors.isSupported && monetColors.primary
      ? monetColors.primary
      : seedHex;

  const rgb = hexToRgb(effectiveSeed);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const params = getPaletteParams(paletteStyle);

  const primaryHue = (hsl.h + params.primaryHueShift + 360) % 360;
  const primarySat = params.primarySat(hsl.s);
  const secondaryHue = (hsl.h + params.secondaryHueShift + 360) % 360;
  const secondarySat = params.secondarySat(hsl.s);
  const tertiaryHue = (hsl.h + params.tertiaryHueShift + 360) % 360;
  const tertiarySat = params.tertiarySat(hsl.s);

  const primaryPalette = createTonalPalette(primaryHue, primarySat);
  const secondaryPalette = createTonalPalette(secondaryHue, secondarySat);
  const tertiaryPalette = createTonalPalette(tertiaryHue, tertiarySat);

  const tint = params.surfaceTintMult;

  if (isDark) {
    // Dark Mode: Luminous Tone 80 primary, rich Tone 30 jewel container
    const primaryCol = primaryPalette(80);
    const primaryContainerCol = primaryPalette(30);
    const secondaryCol = secondaryPalette(80);
    const secondaryContainerCol = secondaryPalette(30);
    const tertiaryCol = tertiaryPalette(80);
    const tertiaryContainerCol = tertiaryPalette(30);

    const baseDark = isAmoled ? '#000000' : '#0E1117';
    const bg = baseDark;
    const surface = baseDark;

    // Material You surface tinting: infuse dark surfaces with the primary accent
    const surfaceContainerLowest = isAmoled ? '#000000' : '#080A0F';
    const surfaceContainerLow = isAmoled ? '#080B12' : blend(baseDark, primaryCol, Math.min(0.20, 0.08 * tint));
    const surfaceContainer = isAmoled ? '#10141F' : blend(baseDark, primaryCol, Math.min(0.25, 0.12 * tint));
    const surfaceContainerHigh = isAmoled ? '#181E2C' : blend(baseDark, primaryCol, Math.min(0.30, 0.16 * tint));
    const surfaceContainerHighest = isAmoled ? '#202738' : blend(baseDark, primaryCol, Math.min(0.35, 0.22 * tint));

    return {
      primary: primaryCol,
      onPrimary: getContrastingTextColor(primaryCol, '#FFFFFF', '#090D16'),
      primaryContainer: primaryContainerCol,
      onPrimaryContainer: getContrastingTextColor(primaryContainerCol, '#EEF2FF', '#1E1B4B'),
      inversePrimary: primaryPalette(40),

      secondary: secondaryCol,
      onSecondary: getContrastingTextColor(secondaryCol, '#FFFFFF', '#090D16'),
      secondaryContainer: secondaryContainerCol,
      onSecondaryContainer: getContrastingTextColor(secondaryContainerCol, '#F1F5F9', '#0F172A'),

      tertiary: tertiaryCol,
      onTertiary: getContrastingTextColor(tertiaryCol, '#FFFFFF', '#3B0764'),
      tertiaryContainer: tertiaryContainerCol,
      onTertiaryContainer: getContrastingTextColor(tertiaryContainerCol, '#FCE7F3', '#4A044E'),

      error: '#F2B8B5',
      onError: '#601410',
      errorContainer: '#8C1D18',
      onErrorContainer: '#F9DEDC',

      background: bg,
      onBackground: '#E3E6EE',
      surface,
      onSurface: '#E3E6EE',
      surfaceVariant: isAmoled ? '#161B28' : blend(surfaceContainer, primaryCol, Math.min(0.25, 0.15 * tint)),
      onSurfaceVariant: '#C4C8D4',

      surfaceDim: isAmoled ? '#000000' : '#0B0D13',
      surfaceBright: isAmoled ? '#151924' : '#2A2F3D',
      surfaceContainerLowest,
      surfaceContainerLow,
      surfaceContainer,
      surfaceContainerHigh,
      surfaceContainerHighest,

      inverseSurface: '#E3E6EE',
      inverseOnSurface: '#191C24',

      outline: blend('#8E94A4', primaryCol, 0.1 * tint),
      outlineVariant: blend('#444958', primaryCol, 0.1 * tint),

      scrim: '#000000',
      shadow: '#000000',
      isDark: true,
    };
  } else {
    // Light Mode: Authoritative Tone 40 primary, saturated Tone 90 pastel container
    const primaryCol = primaryPalette(40);
    const primaryContainerCol = primaryPalette(90);
    const secondaryCol = secondaryPalette(40);
    const secondaryContainerCol = secondaryPalette(90);
    const tertiaryCol = tertiaryPalette(40);
    const tertiaryContainerCol = tertiaryPalette(90);

    const baseLight = '#F8F9FE';
    const baseSurface = '#FFFFFF';

    // Material You surface tinting for light mode
    const surfaceContainerLow = blend(baseSurface, primaryCol, Math.min(0.12, 0.04 * tint));
    const surfaceContainer = blend(baseSurface, primaryCol, Math.min(0.18, 0.08 * tint));
    const surfaceContainerHigh = blend(baseSurface, primaryCol, Math.min(0.24, 0.12 * tint));
    const surfaceContainerHighest = blend(baseSurface, primaryCol, Math.min(0.30, 0.16 * tint));

    return {
      primary: primaryCol,
      onPrimary: '#FFFFFF',
      primaryContainer: primaryContainerCol,
      onPrimaryContainer: getContrastingTextColor(primaryContainerCol, '#FFFFFF', primaryPalette(10)),
      inversePrimary: primaryPalette(80),

      secondary: secondaryCol,
      onSecondary: '#FFFFFF',
      secondaryContainer: secondaryContainerCol,
      onSecondaryContainer: getContrastingTextColor(secondaryContainerCol, '#FFFFFF', secondaryPalette(10)),

      tertiary: tertiaryCol,
      onTertiary: '#FFFFFF',
      tertiaryContainer: tertiaryContainerCol,
      onTertiaryContainer: getContrastingTextColor(tertiaryContainerCol, '#FFFFFF', tertiaryPalette(10)),

      error: '#B3261E',
      onError: '#FFFFFF',
      errorContainer: '#F9DEDC',
      onErrorContainer: '#410E0B',

      background: baseLight,
      onBackground: '#191C22',
      surface: baseSurface,
      onSurface: '#191C22',
      surfaceVariant: blend('#E2E4EC', primaryCol, Math.min(0.25, 0.14 * tint)),
      onSurfaceVariant: '#444752',

      surfaceDim: '#DCE0E9',
      surfaceBright: '#F8F9FE',
      surfaceContainerLowest: '#FFFFFF',
      surfaceContainerLow,
      surfaceContainer,
      surfaceContainerHigh,
      surfaceContainerHighest,

      inverseSurface: '#2D3038',
      inverseOnSurface: '#F0F2F8',

      outline: blend('#737785', primaryCol, 0.1 * tint),
      outlineVariant: blend('#C3C7D4', primaryCol, 0.1 * tint),

      scrim: '#000000',
      shadow: '#000000',
      isDark: false,
    };
  }
}
