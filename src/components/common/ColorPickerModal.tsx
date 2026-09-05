import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { KeyboardAwareDialog } from './KeyboardAwareModal';

interface ColorPickerModalProps {
  visible: boolean;
  initialColor?: string;
  onConfirm: (color: string) => void;
  onCancel: () => void;
}

const PALETTE = [
  '#6366F1', // Indigo
  '#2563EB', // Royal Blue
  '#0D9488', // Teal
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#F97316', // Orange
  '#F43F5E', // Crimson
  '#8B5CF6', // Purple
  '#7C3AED', // Violet
  '#06B6D4', // Cyan
  '#D946EF', // Berry Pink
  '#15803D', // Sage
];

export const ColorPickerModal: React.FC<ColorPickerModalProps> = ({
  visible,
  initialColor = '#6366F1',
  onConfirm,
  onCancel,
}) => {
  const { colors, typography, shapes, fontFamily } = useTheme();
  const [selectedColor, setSelectedColor] = useState<string>(initialColor);
  const [customHex, setCustomHex] = useState<string>(initialColor);
  const scrollRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (visible) {
      setSelectedColor(initialColor);
      setCustomHex(initialColor);
    }
  }, [visible, initialColor]);

  const handleSelect = (c: string) => {
    setSelectedColor(c);
    setCustomHex(c);
  };

  const handleHexChange = (text: string) => {
    let clean = text.trim();
    if (!clean.startsWith('#')) {
      clean = '#' + clean;
    }
    setCustomHex(clean);
    if (/^#[0-9A-Fa-f]{6}$/.test(clean)) {
      setSelectedColor(clean);
    }
  };

  const handleFocus = () => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  const headerContent = (
    <View style={styles.header}>
      <Text style={[styles.title, { color: colors.onSurface, ...typography.titleLarge, fontFamily }]}>
        Pick Color
      </Text>
    </View>
  );

  const footerContent = (
    <View style={styles.actions}>
      <TouchableOpacity style={styles.btn} onPress={onCancel} activeOpacity={0.7}>
        <Text style={[styles.btnText, { color: colors.primary, ...typography.labelLarge, fontFamily }]}>
          Cancel
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.btn, styles.confirmBtn, { backgroundColor: colors.primary, borderRadius: shapes.full }]}
        onPress={() => onConfirm(selectedColor)}
        activeOpacity={0.8}
      >
        <Text style={[styles.btnText, { color: colors.onPrimary, ...typography.labelLarge, fontFamily }]}>
          Select
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAwareDialog
      visible={visible}
      onRequestClose={onCancel}
      header={headerContent}
      footer={footerContent}
      scrollRef={scrollRef}
      maxWidth={340}
    >
      {/* Color Preview & Hex Input */}
      <View style={styles.previewRow}>
        <View style={[styles.previewCircle, { backgroundColor: selectedColor, borderRadius: shapes.full }]} />
        <TextInput
          ref={inputRef}
          style={[
            styles.hexInput,
            {
              backgroundColor: colors.surfaceContainerHighest,
              color: colors.onSurface,
              borderRadius: shapes.small,
              fontFamily,
            },
          ]}
          value={customHex}
          onChangeText={handleHexChange}
          placeholder="#RRGGBB"
          placeholderTextColor={colors.onSurfaceVariant}
          maxLength={7}
          autoCapitalize="characters"
          showSoftInputOnFocus={true}
          onFocus={handleFocus}
          selectTextOnFocus
        />
      </View>

      {/* Color Grid */}
      <View style={styles.grid}>
        {PALETTE.map((c) => (
          <TouchableOpacity
            key={c}
            style={[
              styles.swatch,
              { backgroundColor: c, borderRadius: shapes.full },
              selectedColor.toLowerCase() === c.toLowerCase() && styles.activeSwatch,
            ]}
            onPress={() => handleSelect(c)}
            activeOpacity={0.8}
          >
            {selectedColor.toLowerCase() === c.toLowerCase() && (
              <MaterialCommunityIcons name="check" size={20} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </KeyboardAwareDialog>
  );
};

const styles = StyleSheet.create({
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 16,
  },
  previewCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  hexInput: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 8,
  },
  swatch: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeSwatch: {
    borderWidth: 3,
    borderColor: '#FFFFFF',
    elevation: 4,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  btn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  confirmBtn: {
    minWidth: 80,
    alignItems: 'center',
  },
  btnText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
