import { NativeModules, Platform } from 'react-native';

const { MonetModule } = NativeModules;

export interface MonetColors {
  isSupported: boolean;
  primary?: string;
  primaryKey?: string;
  primaryLight?: string;
  primaryDark?: string;
  primaryContainerLight?: string;
  onPrimaryContainerLight?: string;
  secondary?: string;
  secondaryKey?: string;
  secondaryLight?: string;
  secondaryDark?: string;
  secondaryContainerLight?: string;
  tertiary?: string;
  tertiaryKey?: string;
  tertiaryLight?: string;
  tertiaryDark?: string;
  tertiaryContainerLight?: string;
  neutral?: string;
  neutralVariant?: string;
  surfaceLight?: string;
  surfaceLightLow?: string;
  surfaceLightContainer?: string;
  surfaceDark?: string;
  surfaceDarkLow?: string;
  surfaceDarkContainer?: string;
  outlineLight?: string;
  outlineDark?: string;
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
