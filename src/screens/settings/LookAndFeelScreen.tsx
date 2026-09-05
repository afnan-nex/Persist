import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppThemeMode, PaletteStyle, AppFont } from '../../types';
import { SEED_COLOR_PRESETS, getContrastingTextColor, getPalettePreviewColors } from '../../theme/colors';
import { getSystemMonetColors } from '../../theme/monet';
import { useTheme } from '../../theme/ThemeContext';
import { TopAppBar, M3Switch } from '../../components/m3';
import { ColorPickerModal } from '../../components/common/ColorPickerModal';

export const LookAndFeelScreen: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { colors, typography, shapes, elevation, themeSettings, setThemeSettings, fontFamily } = useTheme();
  const systemMonet = getSystemMonetColors();
  const isMonetSupported = systemMonet?.isSupported ?? false;

  const [showColorPicker, setShowColorPicker] = useState(false);

  const themeOptions: { label: string; mode: AppThemeMode; icon: keyof typeof MaterialCommunityIcons.glyphMap }[] = [
    { label: 'System', mode: 'SYSTEM', icon: 'brightness-auto' },
    { label: 'Light', mode: 'LIGHT', icon: 'white-balance-sunny' },
    { label: 'Dark', mode: 'DARK', icon: 'weather-night' },
    { label: 'AMOLED', mode: 'AMOLED', icon: 'circle-slice-8' },
  ];

  const paletteStyles: { label: string; style: PaletteStyle; description: string }[] = [
    { label: 'Tonal Spot', style: 'TONAL_SPOT', description: 'Balanced & harmonious Material You' },
    { label: 'Spritz', style: 'SPRITZ', description: 'Soft, muted & calm pastel tones' },
    { label: 'Vibrant', style: 'VIBRANT', description: 'Vivid, punchy & high-energy colors' },
    { label: 'Expressive', style: 'EXPRESSIVE', description: 'Bold, artistic & contrasting accents' },
    { label: 'Rainbow', style: 'RAINBOW', description: 'Rich spectrum of chromatic colors' },
    { label: 'Fruit Salad', style: 'FRUIT_SALAD', description: 'Fresh, playful & tropical hues' },
  ];

  const fontOptions: { label: string; font: AppFont }[] = [
    { label: 'System Default', font: 'SYSTEM' },
    { label: 'Rounded / Medium', font: 'ROUNDED' },
    { label: 'Monospace', font: 'MONOSPACE' },
    { label: 'Serif', font: 'SERIF' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopAppBar
        title="Look & Feel"
        variant="small"
        navigationIcon={{
          icon: 'arrow-left',
          onPress: () => navigation.goBack(),
          accessibilityLabel: 'Go back',
        }}
      />

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* App Theme */}
        <Text style={[styles.sectionTitle, { color: colors.primary, ...typography.titleSmall, fontFamily }]}>
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
                    backgroundColor: isSelected ? colors.secondaryContainer : colors.surfaceContainerLow,
                    borderRadius: shapes.large,
                    elevation: elevation.level1,
                  },
                ]}
                onPress={() => setThemeSettings({ themeMode: opt.mode })}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons
                  name={opt.icon}
                  size={24}
                  color={isSelected ? colors.onSecondaryContainer : colors.onSurfaceVariant}
                />
                <Text
                  style={[
                    styles.themeOptionLabel,
                    {
                      color: isSelected ? colors.onSecondaryContainer : colors.onSurface,
                      ...typography.labelMedium,
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


        {/* Material You Dynamic Colors (Monet) */}
        {isMonetSupported && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.primary, ...typography.titleSmall, fontFamily }]}>
              Material You
            </Text>
            <View
              style={[
                styles.card,
                {
                  backgroundColor: colors.surfaceContainerLow,
                  borderRadius: shapes.large,
                  elevation: elevation.level1,
                  padding: 16,
                },
              ]}
            >
              <View style={styles.settingRowInner}>
                <View style={styles.rowLabelCol}>
                  <Text style={[styles.rowTitle, { color: colors.onSurface, ...typography.titleMedium, fontFamily }]}>
                    Dynamic Wallpaper Colors
                  </Text>
                  <Text style={[styles.rowSubtitle, { color: colors.onSurfaceVariant, ...typography.bodyMedium, fontFamily }]}>
                    Sync palette directly with your Android system wallpaper
                  </Text>
                </View>
                <M3Switch
                  selected={themeSettings.useMaterialYou !== false}
                  onValueChange={(val) => setThemeSettings({ useMaterialYou: val })}
                />
              </View>

              {themeSettings.useMaterialYou !== false && systemMonet?.primary && (
                <View style={styles.monetActiveContainer}>
                  <View style={styles.monetBadgeRow}>
                    <MaterialCommunityIcons name="palette" size={16} color={colors.primary} />
                    <Text style={[styles.monetBadgeText, { color: colors.primary, ...typography.labelMedium, fontFamily }]}>
                      System Wallpaper Palette Active
                    </Text>
                  </View>
                  <View style={styles.monetChipsRow}>
                    <View style={[styles.monetChip, { backgroundColor: systemMonet.primary }]} />
                    {systemMonet.secondary && (
                      <View style={[styles.monetChip, { backgroundColor: systemMonet.secondary }]} />
                    )}
                    {systemMonet.tertiary && (
                      <View style={[styles.monetChip, { backgroundColor: systemMonet.tertiary }]} />
                    )}
                    {systemMonet.primaryLight && (
                      <View style={[styles.monetChip, { backgroundColor: systemMonet.primaryLight }]} />
                    )}
                  </View>
                </View>
              )}
            </View>
          </>
        )}

        {/* Accent / Seed Color */}
        <Text style={[styles.sectionTitle, { color: colors.primary, ...typography.titleSmall, fontFamily }]}>
          {isMonetSupported && themeSettings.useMaterialYou !== false
            ? 'Custom Accent Color (Selecting overrides wallpaper)'
            : 'Accent Color'}
        </Text>
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.surfaceContainerLow,
              borderRadius: shapes.large,
              elevation: elevation.level1,
              padding: 16,
            },
          ]}
        >
          <View style={styles.colorsGrid}>
            {SEED_COLOR_PRESETS.map((preset) => {
              const isSelected =
                themeSettings.useMaterialYou === false &&
                themeSettings.seedColor.toLowerCase() === preset.color.toLowerCase();
              const checkmarkColor = getContrastingTextColor(preset.color, '#FFFFFF', '#111318');
              return (
                <TouchableOpacity
                  key={preset.name}
                  style={[
                    styles.colorSwatch,
                    { backgroundColor: preset.color },
                    isSelected && [styles.selectedSwatch, { borderColor: colors.primary }],
                  ]}
                  onPress={() => setThemeSettings({ seedColor: preset.color, useMaterialYou: false })}
                  activeOpacity={0.8}
                >
                  {isSelected && (
                    <MaterialCommunityIcons name="check" size={20} color={checkmarkColor} />
                  )}
                </TouchableOpacity>
              );
            })}

            {/* Custom Color Trigger */}
            {(() => {
              const isCustomSelected =
                themeSettings.useMaterialYou === false &&
                !SEED_COLOR_PRESETS.some(
                  (preset) => preset.color.toLowerCase() === themeSettings.seedColor.toLowerCase()
                );
              const customCheckColor = getContrastingTextColor(themeSettings.seedColor, '#FFFFFF', '#111318');

              return isCustomSelected ? (
                <TouchableOpacity
                  style={[
                    styles.colorSwatch,
                    styles.selectedSwatch,
                    { backgroundColor: themeSettings.seedColor, borderColor: colors.primary },
                  ]}
                  onPress={() => setShowColorPicker(true)}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons name="palette-outline" size={20} color={customCheckColor} />
                </TouchableOpacity>
              ) : (
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
              );
            })()}
          </View>
        </View>

        {/* Palette Style */}
        <Text style={[styles.sectionTitle, { color: colors.primary, ...typography.titleSmall, fontFamily }]}>
          Palette Style
        </Text>
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.surfaceContainerLow,
              borderRadius: shapes.large,
              elevation: elevation.level1,
            },
          ]}
        >
          {(() => {
            const activeSeed =
              themeSettings.useMaterialYou !== false && systemMonet?.primary
                ? systemMonet.primary
                : themeSettings.seedColor;

            return paletteStyles.map((ps, idx) => {
              const isSelected = themeSettings.paletteStyle === ps.style;
              const preview = getPalettePreviewColors(activeSeed, ps.style, colors.isDark);

              return (
                <React.Fragment key={ps.style}>
                  {idx > 0 && (
                    <View style={[styles.divider, { backgroundColor: colors.outlineVariant }]} />
                  )}
                  <TouchableOpacity
                    style={styles.paletteRow}
                    onPress={() => setThemeSettings({ paletteStyle: ps.style })}
                    activeOpacity={0.7}
                  >
                    <View style={styles.paletteInfoCol}>
                      <Text
                        style={[
                          styles.paletteLabel,
                          {
                            color: isSelected ? colors.primary : colors.onSurface,
                            ...typography.bodyLarge,
                            fontWeight: isSelected ? '700' : '500',
                            fontFamily,
                          },
                        ]}
                      >
                        {ps.label}
                      </Text>
                      <Text
                        style={[
                          styles.paletteDesc,
                          {
                            color: colors.onSurfaceVariant,
                            ...typography.bodySmall,
                            fontFamily,
                          },
                        ]}
                      >
                        {ps.description}
                      </Text>
                      {/* Live Palette Swatches */}
                      <View style={styles.swatchesRow}>
                        <View style={[styles.swatchPill, { backgroundColor: preview.primary }]} />
                        <View style={[styles.swatchPill, { backgroundColor: preview.secondary }]} />
                        <View style={[styles.swatchPill, { backgroundColor: preview.tertiary }]} />
                        <View style={[styles.swatchPill, { backgroundColor: preview.container }]} />
                      </View>
                    </View>

                    <MaterialCommunityIcons
                      name={isSelected ? 'radiobox-marked' : 'radiobox-blank'}
                      size={22}
                      color={isSelected ? colors.primary : colors.outline}
                    />
                  </TouchableOpacity>
                </React.Fragment>
              );
            });
          })()}
        </View>

        {/* Font Family */}
        <Text style={[styles.sectionTitle, { color: colors.primary, ...typography.titleSmall, fontFamily }]}>
          Font Family
        </Text>
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.surfaceContainerLow,
              borderRadius: shapes.large,
              elevation: elevation.level1,
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
                        ...typography.bodyLarge,
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
          setThemeSettings({ seedColor: c, useMaterialYou: false });
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
    alignItems: 'center',
    gap: 6,
  },
  themeOptionLabel: {
    fontSize: 12,
  },
  card: {
    borderRadius: 22,
    elevation: 1,
    overflow: 'hidden',
    marginBottom: 8,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  settingRowInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  monetActiveContainer: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(150, 150, 150, 0.15)',
    gap: 10,
  },
  monetBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  monetBadgeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  monetChipsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  monetChip: {
    width: 32,
    height: 32,
    borderRadius: 16,
    elevation: 2,
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
  paletteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  paletteInfoCol: {
    flex: 1,
    marginRight: 16,
  },
  paletteLabel: {
    fontSize: 15,
  },
  paletteDesc: {
    fontSize: 12,
    marginTop: 2,
    marginBottom: 8,
  },
  swatchesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  swatchPill: {
    width: 22,
    height: 12,
    borderRadius: 6,
  },
  divider: {
    height: 1,
    marginLeft: 16,
  },
});
