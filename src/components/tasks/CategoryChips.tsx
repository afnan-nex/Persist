import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Category } from '../../types';
import { useTheme } from '../../theme/ThemeContext';

interface CategoryChipsProps {
  categories: Category[];
  selectedCategoryId: number | null; // null means 'All'
  onSelectCategory: (id: number | null) => void;
  onManageCategories: () => void;
}

export const CategoryChips: React.FC<CategoryChipsProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
  onManageCategories,
}) => {
  const { colors, fontFamily } = useTheme();

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {/* "All" Category Chip */}
        <TouchableOpacity
          style={[
            styles.chip,
            {
              backgroundColor:
                selectedCategoryId === null ? colors.primary : colors.surfaceVariant,
            },
          ]}
          onPress={() => onSelectCategory(null)}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.chipText,
              {
                color:
                  selectedCategoryId === null ? colors.onPrimary : colors.onSurfaceVariant,
                fontWeight: selectedCategoryId === null ? '700' : '500',
                fontFamily,
              },
            ]}
          >
            All
          </Text>
        </TouchableOpacity>

        {/* Individual Category Chips */}
        {categories.map((cat) => {
          const isSelected = selectedCategoryId === cat.id;
          return (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.chip,
                {
                  backgroundColor: isSelected ? colors.primary : colors.surfaceVariant,
                },
              ]}
              onPress={() => onSelectCategory(cat.id)}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.colorDot,
                  { backgroundColor: cat.color || colors.primary },
                ]}
              />
              <Text
                style={[
                  styles.chipText,
                  {
                    color: isSelected ? colors.onPrimary : colors.onSurfaceVariant,
                    fontWeight: isSelected ? '700' : '500',
                    fontFamily,
                  },
                ]}
              >
                {cat.name}
              </Text>
            </TouchableOpacity>
          );
        })}

        {/* Manage Categories Button */}
        <TouchableOpacity
          style={[styles.manageButton, { backgroundColor: colors.surfaceVariant }]}
          onPress={onManageCategories}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="cog-outline" size={18} color={colors.onSurface} />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    paddingVertical: 8,
  },
  container: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  chipText: {
    fontSize: 14,
  },
  manageButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
});
