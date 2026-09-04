import { NativeModules, Platform } from 'react-native';

const { MonetModule } = NativeModules;

export interface MonetColors {
  isSupported: boolean;
  primary?: string;
  primaryLight?: string;
  primaryDark?: string;
  secondary?: string;
  secondaryLight?: string;
  tertiary?: string;
  neutral?: string;
  neutralVariant?: string;
  surfaceLight?: string;
  surfaceDark?: string;
}

export function getSystemMonetColors(): MonetColors | null {
  if (Platform.OS !== 'android') return null;
  try {
    const constants = MonetModule?.getConstants?.() || MonetModule;
    if (constants && constants.isSupported) {
      return constants as MonetColors;
    }
  } catch (err) {
    console.warn('Failed to get Monet colors:', err);
  }
  return null;
}
