import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';

interface ColorPickerModalProps {
  visible: boolean;
  initialColor?: string;
  onConfirm: (color: string) => void;
  onCancel: () => void;
}

const PALETTE = [
  '#6366F1', // Indigo
  '#3B82F6', // Blue
  '#06B6D4', // Cyan
  '#14B8A6', // Teal
  '#10B981', // Green
  '#84CC16', // Lime
  '#F59E0B', // Amber
  '#F97316', // Orange
  '#EF4444', // Red
  '#EC4899', // Pink
  '#8B5CF6', // Purple
  '#64748B', // Slate
];

export const ColorPickerModal: React.FC<ColorPickerModalProps> = ({
  visible,
  initialColor = '#6366F1',
  onConfirm,
  onCancel,
}) => {
  const { colors, fontFamily } = useTheme();
  const [selectedColor, setSelectedColor] = useState<string>(initialColor);
  const [customHex, setCustomHex] = useState<string>(initialColor);

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

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View
          style={[
            styles.dialog,
            {
              backgroundColor: colors.surface,
              borderColor: colors.outlineVariant,
            },
          ]}
        >
          <Text style={[styles.title, { color: colors.onSurface, fontFamily }]}>
            Pick Color
          </Text>

          {/* Color Preview */}
          <View style={styles.previewRow}>
            <View style={[styles.previewCircle, { backgroundColor: selectedColor }]} />
            <TextInput
              style={[
                styles.hexInput,
                {
                  backgroundColor: colors.surfaceVariant,
                  color: colors.onSurface,
                  fontFamily,
                },
              ]}
              value={customHex}
              onChangeText={handleHexChange}
              placeholder="#RRGGBB"
              placeholderTextColor={colors.onSurfaceVariant}
              maxLength={7}
              autoCapitalize="characters"
            />
          </View>

          {/* Color Grid */}
          <View style={styles.grid}>
            {PALETTE.map((c) => (
              <TouchableOpacity
                key={c}
                style={[
                  styles.swatch,
                  { backgroundColor: c },
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

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.btn} onPress={onCancel}>
              <Text style={[styles.btnText, { color: colors.onSurfaceVariant, fontFamily }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, styles.confirmBtn, { backgroundColor: colors.primary }]}
              onPress={() => onConfirm(selectedColor)}
            >
              <Text style={[styles.btnText, { color: colors.onPrimary, fontFamily }]}>
                Select
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  dialog: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    elevation: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 20,
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
    marginBottom: 24,
  },
  swatch: {
    width: 46,
    height: 46,
    borderRadius: 23,
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
