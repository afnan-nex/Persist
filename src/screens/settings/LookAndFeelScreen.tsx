import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppThemeMode, PaletteStyle, AppFont } from '../../types';
import { SEED_COLOR_PRESETS } from '../../theme/colors';
import { useTheme } from '../../theme/ThemeContext';
import { AppHeader } from '../../components/common/AppHeader';
import { ColorPickerModal } from '../../components/common/ColorPickerModal';

export const LookAndFeelScreen: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { colors, themeSettings, setThemeSettings, fontFamily } = useTheme();

  const [showColorPicker, setShowColorPicker] = useState(false);

  const themeOptions: { label: string; mode: AppThemeMode; icon: keyof typeof MaterialCommunityIcons.glyphMap }[] = [
    { label: 'System', mode: 'SYSTEM', icon: 'brightness-auto' },
    { label: 'Light', mode: 'LIGHT', icon: 'white-balance-sunny' },
    { label: 'Dark', mode: 'DARK', icon: 'weather-night' },
    { label: 'AMOLED', mode: 'AMOLED', icon: 'circle-slice-8' },
  ];

  const paletteStyles: { label: string; style: PaletteStyle }[] = [
    { label: 'Tonal Spot', style: 'TONAL_SPOT' },
    { label: 'Spritz', style: 'SPRITZ' },
    { label: 'Vibrant', style: 'VIBRANT' },
    { label: 'Expressive', style: 'EXPRESSIVE' },
    { label: 'Rainbow', style: 'RAINBOW' },
    { label: 'Fruit Salad', style: 'FRUIT_SALAD' },
  ];

  const fontOptions: { label: string; font: AppFont }[] = [
    { label: 'System Default', font: 'SYSTEM' },
    { label: 'Rounded / Medium', font: 'ROUNDED' },
    { label: 'Monospace', font: 'MONOSPACE' },
    { label: 'Serif', font: 'SERIF' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader
        title="Look & Feel"
        leftAction={{
          icon: 'arrow-left',
          onPress: () => navigation.goBack(),
        }}
      />

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* App Theme */}
        <Text style={[styles.sectionTitle, { color: colors.primary, fontFamily }]}>
          Theme Mode
        </Text>
        <View style={styles.themeGrid}>
          {themeOptions.map((opt) => {
            const isSelected = themeSettings.themeMode === opt.mode;
            return (
              <TouchableOpacity
                key={opt.mode}
                style={[
                  styles.themeOptionCard,
                  {
                    backgroundColor: isSelected ? colors.primaryContainer : colors.surface,
                    borderColor: isSelected ? colors.primary : colors.outlineVariant,
                  },
                ]}
                onPress={() => setThemeSettings({ themeMode: opt.mode })}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons
                  name={opt.icon}
                  size={24}
                  color={isSelected ? colors.primary : colors.onSurfaceVariant}
                />
                <Text
                  style={[
                    styles.themeOptionLabel,
                    {
                      color: isSelected ? colors.onPrimaryContainer : colors.onSurface,
                      fontWeight: isSelected ? '700' : '500',
                      fontFamily,
                    },
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Pure AMOLED Black Option */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              borderColor: colors.outlineVariant,
            },
          ]}
        >
          <View style={styles.settingRow}>
            <View style={styles.rowLabelCol}>
              <Text style={[styles.rowTitle, { color: colors.onSurface, fontFamily }]}>
                AMOLED Pure Black
              </Text>
              <Text style={[styles.rowSubtitle, { color: colors.onSurfaceVariant, fontFamily }]}>
                Deep true black #000000 background for OLED displays
              </Text>
            </View>
            <Switch
              value={themeSettings.amoled}
              onValueChange={(val) => setThemeSettings({ amoled: val })}
              trackColor={{ false: colors.outline, true: colors.primary }}
              thumbColor={colors.surface}
            />
          </View>
        </View>

        {/* Accent / Seed Color */}
        <Text style={[styles.sectionTitle, { color: colors.primary, fontFamily }]}>
          Accent Color
        </Text>
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              borderColor: colors.outlineVariant,
              padding: 16,
            },
          ]}
        >
          <View style={styles.colorsGrid}>
            {SEED_COLOR_PRESETS.map((preset) => {
              const isSelected =
                themeSettings.seedColor.toLowerCase() === preset.color.toLowerCase();
              return (
                <TouchableOpacity
                  key={preset.name}
                  style={[
                    styles.colorSwatch,
                    { backgroundColor: preset.color },
                    isSelected && styles.selectedSwatch,
                  ]}
                  onPress={() => setThemeSettings({ seedColor: preset.color })}
                  activeOpacity={0.8}
                >
                  {isSelected && (
                    <MaterialCommunityIcons name="check" size={20} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
              );
            })}

            {/* Custom Color Trigger */}
            <TouchableOpacity
              style={[
                styles.colorSwatch,
                styles.customColorSwatch,
                { borderColor: colors.outline },
              ]}
              onPress={() => setShowColorPicker(true)}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="plus" size={22} color={colors.onSurface} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Palette Style */}
        <Text style={[styles.sectionTitle, { color: colors.primary, fontFamily }]}>
          Palette Style
        </Text>
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              borderColor: colors.outlineVariant,
            },
          ]}
        >
          {paletteStyles.map((ps, idx) => {
            const isSelected = themeSettings.paletteStyle === ps.style;
            return (
              <React.Fragment key={ps.style}>
                {idx > 0 && (
                  <View style={[styles.divider, { backgroundColor: colors.outlineVariant }]} />
                )}
                <TouchableOpacity
                  style={styles.radioRow}
                  onPress={() => setThemeSettings({ paletteStyle: ps.style })}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.radioLabel,
                      {
                        color: isSelected ? colors.primary : colors.onSurface,
                        fontWeight: isSelected ? '700' : '500',
                        fontFamily,
                      },
                    ]}
                  >
                    {ps.label}
                  </Text>
                  <MaterialCommunityIcons
                    name={isSelected ? 'radiobox-marked' : 'radiobox-blank'}
                    size={22}
                    color={isSelected ? colors.primary : colors.outline}
                  />
                </TouchableOpacity>
              </React.Fragment>
            );
          })}
        </View>

        {/* Font Family */}
        <Text style={[styles.sectionTitle, { color: colors.primary, fontFamily }]}>
          Font Family
        </Text>
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              borderColor: colors.outlineVariant,
            },
          ]}
        >
          {fontOptions.map((fo, idx) => {
            const isSelected = themeSettings.font === fo.font;
            return (
              <React.Fragment key={fo.font}>
                {idx > 0 && (
                  <View style={[styles.divider, { backgroundColor: colors.outlineVariant }]} />
                )}
                <TouchableOpacity
                  style={styles.radioRow}
                  onPress={() => setThemeSettings({ font: fo.font })}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.radioLabel,
                      {
                        color: isSelected ? colors.primary : colors.onSurface,
                        fontWeight: isSelected ? '700' : '500',
                        fontFamily,
                      },
                    ]}
                  >
                    {fo.label}
                  </Text>
                  <MaterialCommunityIcons
                    name={isSelected ? 'radiobox-marked' : 'radiobox-blank'}
                    size={22}
                    color={isSelected ? colors.primary : colors.outline}
                  />
                </TouchableOpacity>
              </React.Fragment>
            );
          })}
        </View>
      </ScrollView>

      <ColorPickerModal
        visible={showColorPicker}
        initialColor={themeSettings.seedColor}
        onConfirm={(c) => {
          setThemeSettings({ seedColor: c });
          setShowColorPicker(false);
        }}
        onCancel={() => setShowColorPicker(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
    marginTop: 16,
    marginLeft: 4,
  },
  themeGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  themeOptionCard: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    gap: 6,
  },
  themeOptionLabel: {
    fontSize: 12,
  },
  card: {
    borderRadius: 22,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 8,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  rowLabelCol: {
    flex: 1,
    marginRight: 16,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  rowSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  colorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'flex-start',
  },
  colorSwatch: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedSwatch: {
    borderWidth: 3,
    borderColor: '#FFFFFF',
    elevation: 4,
  },
  customColorSwatch: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    backgroundColor: 'transparent',
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  radioLabel: {
    fontSize: 15,
  },
  divider: {
    height: 1,
    marginLeft: 16,
  },
});
