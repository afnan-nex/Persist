import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Category } from '../../types';
import { useTheme } from '../../theme/ThemeContext';
import { ColorPickerModal } from '../common/ColorPickerModal';

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
  const { colors, fontFamily } = useTheme();

  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#6366F1');
  const [showColorPicker, setShowColorPicker] = useState(false);

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

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
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
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.onSurface, fontFamily }]}>
              Manage Categories
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <MaterialCommunityIcons name="close" size={24} color={colors.onSurface} />
            </TouchableOpacity>
          </View>

          {/* Existing Categories List */}
          <ScrollView style={styles.catList} showsVerticalScrollIndicator={false}>
            {categories.map((cat, idx) => (
              <View
                key={cat.id}
                style={[
                  styles.catItem,
                  {
                    backgroundColor: colors.surfaceVariant,
                  },
                ]}
              >
                <View style={[styles.colorBadge, { backgroundColor: cat.color || colors.primary }]} />
                <Text
                  style={[styles.catItemName, { color: colors.onSurface, fontFamily }]}
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
                >
                  <MaterialCommunityIcons
                    name="trash-can-outline"
                    size={18}
                    color={categories.length <= 1 ? colors.outline : colors.error}
                  />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>

          {/* Add Category Section */}
          <View
            style={[
              styles.addSection,
              {
                borderTopColor: colors.outlineVariant,
              },
            ]}
          >
            <Text style={[styles.addLabel, { color: colors.onSurfaceVariant, fontFamily }]}>
              New Category
            </Text>
            <View style={styles.addRow}>
              <TouchableOpacity
                style={[styles.colorPickerTrigger, { backgroundColor: newCatColor }]}
                onPress={() => setShowColorPicker(true)}
              >
                <MaterialCommunityIcons name="palette" size={18} color="#FFFFFF" />
              </TouchableOpacity>

              <TextInput
                style={[
                  styles.addInput,
                  {
                    backgroundColor: colors.surfaceVariant,
                    color: colors.onSurface,
                    fontFamily,
                  },
                ]}
                placeholder="Category Name"
                placeholderTextColor={colors.onSurfaceVariant}
                value={newCatName}
                onChangeText={setNewCatName}
              />

              <TouchableOpacity
                style={[
                  styles.addButton,
                  {
                    backgroundColor: newCatName.trim() ? colors.primary : colors.surfaceVariant,
                  },
                ]}
                disabled={!newCatName.trim()}
                onPress={handleAdd}
              >
                <MaterialCommunityIcons
                  name="plus"
                  size={24}
                  color={newCatName.trim() ? colors.onPrimary : colors.onSurfaceVariant}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <ColorPickerModal
          visible={showColorPicker}
          initialColor={newCatColor}
          onConfirm={(c) => {
            setNewCatColor(c);
            setShowColorPicker(false);
          }}
          onCancel={() => setShowColorPicker(false)}
        />
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
    padding: 20,
  },
  dialog: {
    width: '100%',
    maxWidth: 360,
    maxHeight: '80%',
    borderRadius: 28,
    padding: 20,
    borderWidth: 1,
    elevation: 10,
  },
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
  catList: {
    maxHeight: 220,
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
    borderTopWidth: 1,
    paddingTop: 16,
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
