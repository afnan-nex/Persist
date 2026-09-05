import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Category } from '../../types';
import { useTheme } from '../../theme/ThemeContext';
import { ColorPickerModal } from '../common/ColorPickerModal';
import { KeyboardAwareDialog } from '../common/KeyboardAwareModal';

interface CategoryManageModalProps {
  visible: boolean;
  categories: Category[];
  onAddCategory: (name: string, color: string) => void;
  onDeleteCategory: (category: Category) => void;
  onReorderCategories: (newOrder: Category[]) => void;
  onClose: () => void;
}

export const CategoryManageModal: React.FC<CategoryManageModalProps> = ({
  visible,
  categories,
  onAddCategory,
  onDeleteCategory,
  onReorderCategories,
  onClose,
}) => {
  const { colors, typography, shapes, elevation, fontFamily } = useTheme();

  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#6366F1');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const handleAdd = () => {
    if (!newCatName.trim()) return;
    onAddCategory(newCatName.trim(), newCatColor);
    setNewCatName('');
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const newCats = [...categories];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newCats.length) return;

    const temp = newCats[index];
    newCats[index] = newCats[targetIndex];
    newCats[targetIndex] = temp;

    onReorderCategories(newCats);
  };

  const handleDelete = (cat: Category) => {
    if (categories.length <= 1) {
      Alert.alert('Cannot Delete', 'You must have at least one category.');
      return;
    }

    Alert.alert(
      'Delete Category',
      `Are you sure you want to delete "${cat.name}"? All tasks in this category will also be deleted.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDeleteCategory(cat),
        },
      ]
    );
  };

  const scrollRef = useRef<ScrollView>(null);

  const handleInputFocus = () => {
    // Smoothly scroll down so the New Category input and Add button are fully visible above the keyboard
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const headerContent = (
    <View style={styles.header}>
      <Text style={[styles.title, { color: colors.onSurface, ...typography.headlineSmall, fontFamily }]}>
        Manage Categories
      </Text>
      <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
        <MaterialCommunityIcons name="close" size={24} color={colors.onSurface} />
      </TouchableOpacity>
    </View>
  );

  return (
    <>
      <KeyboardAwareDialog
        visible={visible}
        onRequestClose={onClose}
        header={headerContent}
        scrollRef={scrollRef}
        maxWidth={360}
      >
        {/* Existing Categories List */}
        <View style={styles.catListWrapper}>
          {categories.map((cat, idx) => (
            <View
              key={cat.id}
              style={[
                styles.catItem,
                {
                  backgroundColor: colors.surfaceContainerLow,
                  borderRadius: shapes.medium,
                },
              ]}
            >
              <View style={[styles.colorBadge, { backgroundColor: cat.color || colors.primary }]} />
              <Text
                style={[styles.catItemName, { color: colors.onSurface, ...typography.bodyLarge, fontFamily }]}
                numberOfLines={1}
              >
                {cat.name}
              </Text>

              {/* Move Controls */}
              <View style={styles.moveRow}>
                <TouchableOpacity
                  disabled={idx === 0}
                  style={[styles.moveBtn, idx === 0 && styles.disabled]}
                  onPress={() => handleMove(idx, 'up')}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons
                    name="chevron-up"
                    size={20}
                    color={idx === 0 ? colors.outline : colors.onSurface}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  disabled={idx === categories.length - 1}
                  style={[styles.moveBtn, idx === categories.length - 1 && styles.disabled]}
                  onPress={() => handleMove(idx, 'down')}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons
                    name="chevron-down"
                    size={20}
                    color={idx === categories.length - 1 ? colors.outline : colors.onSurface}
                  />
                </TouchableOpacity>
              </View>

              {/* Delete Button */}
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => handleDelete(cat)}
                disabled={categories.length <= 1}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons
                  name="trash-can-outline"
                  size={18}
                  color={categories.length <= 1 ? colors.outline : colors.error}
                />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Add Category Section */}
        <View style={styles.addSection}>
          <Text style={[styles.addLabel, { color: colors.onSurfaceVariant, ...typography.labelMedium, fontFamily }]}>
            New Category
          </Text>
          <View style={styles.addRow}>
            <TouchableOpacity
              style={[styles.colorPickerTrigger, { backgroundColor: newCatColor }]}
              onPress={() => setShowColorPicker(true)}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="palette" size={18} color="#FFFFFF" />
            </TouchableOpacity>

            <TextInput
              ref={inputRef}
              style={[
                styles.addInput,
                {
                  backgroundColor: colors.surfaceContainerHighest,
                  color: colors.onSurface,
                  borderRadius: shapes.small,
                  fontFamily,
                },
              ]}
              placeholder="Category Name"
              placeholderTextColor={colors.onSurfaceVariant}
              value={newCatName}
              onChangeText={setNewCatName}
              showSoftInputOnFocus={true}
              onFocus={handleInputFocus}
              returnKeyType="done"
              onSubmitEditing={handleAdd}
            />

            <TouchableOpacity
              style={[
                styles.addButton,
                {
                  backgroundColor: newCatName.trim() ? colors.primary : colors.surfaceContainerHighest,
                },
              ]}
              disabled={!newCatName.trim()}
              onPress={handleAdd}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons
                name="plus"
                size={24}
                color={newCatName.trim() ? colors.onPrimary : colors.onSurfaceVariant}
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAwareDialog>

      <ColorPickerModal
        visible={showColorPicker}
        initialColor={newCatColor}
        onConfirm={(c) => {
          setNewCatColor(c);
          setShowColorPicker(false);
        }}
        onCancel={() => setShowColorPicker(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
  },
  closeBtn: {
    padding: 4,
  },
  catListWrapper: {
    marginBottom: 16,
  },
  catItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    marginBottom: 8,
  },
  colorBadge: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 10,
  },
  catItemName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  moveRow: {
    flexDirection: 'row',
    marginRight: 6,
  },
  moveBtn: {
    padding: 4,
  },
  disabled: {
    opacity: 0.3,
  },
  deleteBtn: {
    padding: 6,
  },
  addSection: {
    paddingTop: 12,
  },
  addLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  colorPickerTrigger: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addInput: {
    flex: 1,
    height: 44,
    borderRadius: 14,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
