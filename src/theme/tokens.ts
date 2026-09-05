import { TextStyle } from 'react-native';

/**
 * Official Material Design 3 Shape Scale Tokens
 * https://m3.material.io/styles/shape
 */
export const M3Shapes = {
  none: 0,
  extraSmall: 4,
  small: 8,
  medium: 12,
  large: 16,
  extraLarge: 28,
  full: 9999,
} as const;

export type M3ShapeKey = keyof typeof M3Shapes;

/**
 * Official Material Design 3 Elevation Tokens (dp)
 * https://m3.material.io/styles/elevation/overview
 */
export const M3Elevation = {
  level0: 0,
  level1: 1,
  level2: 3,
  level3: 6,
  level4: 8,
  level5: 12,
} as const;

export type M3ElevationLevel = keyof typeof M3Elevation;

/**
 * Official Material Design 3 State Layer Opacities
 */
export const M3StateLayers = {
  hover: 0.08,
  focus: 0.12,
  press: 0.12,
  drag: 0.16,
} as const;

/**
 * Official Material Design 3 15-Role Typography Scale
 * https://m3.material.io/styles/typography/overview
 */
export interface M3TextStyle extends TextStyle {
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
  fontWeight: TextStyle['fontWeight'];
}

export interface M3TypographyScale {
  displayLarge: M3TextStyle;
  displayMedium: M3TextStyle;
  displaySmall: M3TextStyle;
  headlineLarge: M3TextStyle;
  headlineMedium: M3TextStyle;
  headlineSmall: M3TextStyle;
  titleLarge: M3TextStyle;
  titleMedium: M3TextStyle;
  titleSmall: M3TextStyle;
  bodyLarge: M3TextStyle;
  bodyMedium: M3TextStyle;
  bodySmall: M3TextStyle;
  labelLarge: M3TextStyle;
  labelMedium: M3TextStyle;
  labelSmall: M3TextStyle;
}

export function createM3Typography(fontFamily?: string): M3TypographyScale {
  return {
    displayLarge: {
      fontFamily,
      fontSize: 57,
      lineHeight: 64,
      letterSpacing: -0.25,
      fontWeight: '400',
    },
    displayMedium: {
      fontFamily,
      fontSize: 45,
      lineHeight: 52,
      letterSpacing: 0,
      fontWeight: '400',
    },
    displaySmall: {
      fontFamily,
      fontSize: 36,
      lineHeight: 44,
      letterSpacing: 0,
      fontWeight: '400',
    },
    headlineLarge: {
      fontFamily,
      fontSize: 32,
      lineHeight: 40,
      letterSpacing: 0,
      fontWeight: '400',
    },
    headlineMedium: {
      fontFamily,
      fontSize: 28,
      lineHeight: 36,
      letterSpacing: 0,
      fontWeight: '400',
    },
    headlineSmall: {
      fontFamily,
      fontSize: 24,
      lineHeight: 32,
      letterSpacing: 0,
      fontWeight: '400',
    },
    titleLarge: {
      fontFamily,
      fontSize: 22,
      lineHeight: 28,
      letterSpacing: 0,
      fontWeight: '400',
    },
    titleMedium: {
      fontFamily,
      fontSize: 16,
      lineHeight: 24,
      letterSpacing: 0.15,
      fontWeight: '500',
    },
    titleSmall: {
      fontFamily,
      fontSize: 14,
      lineHeight: 20,
      letterSpacing: 0.1,
      fontWeight: '500',
    },
    bodyLarge: {
      fontFamily,
      fontSize: 16,
      lineHeight: 24,
      letterSpacing: 0.5,
      fontWeight: '400',
    },
    bodyMedium: {
      fontFamily,
      fontSize: 14,
      lineHeight: 20,
      letterSpacing: 0.25,
      fontWeight: '400',
    },
    bodySmall: {
      fontFamily,
      fontSize: 12,
      lineHeight: 16,
      letterSpacing: 0.4,
      fontWeight: '400',
    },
    labelLarge: {
      fontFamily,
      fontSize: 14,
      lineHeight: 20,
      letterSpacing: 0.1,
      fontWeight: '500',
    },
    labelMedium: {
      fontFamily,
      fontSize: 12,
      lineHeight: 16,
      letterSpacing: 0.5,
      fontWeight: '500',
    },
    labelSmall: {
      fontFamily,
      fontSize: 11,
      lineHeight: 16,
      letterSpacing: 0.5,
      fontWeight: '500',
    },
  };
}
