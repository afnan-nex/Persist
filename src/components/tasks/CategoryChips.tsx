import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Category } from '../../types';
import { useTheme } from '../../theme/ThemeContext';
import { FilterChip } from '../m3/Chip';

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
  const { colors, shapes } = useTheme();

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {/* "All" Category Chip */}
        <FilterChip
          label="All"
          selected={selectedCategoryId === null}
          onPress={() => onSelectCategory(null)}
          showCheckmark={false}
        />

        {/* Individual Category Chips */}
        {categories.map((cat) => {
          const isSelected = selectedCategoryId === cat.id;
          return (
            <FilterChip
              key={cat.id}
              label={cat.name}
              selected={isSelected}
              onPress={() => onSelectCategory(cat.id)}
              customColor={cat.color}
              showCheckmark={true}
            />
          );
        })}

        {/* Manage Categories Button */}
        <TouchableOpacity
          style={[
            styles.manageButton,
            {
              backgroundColor: colors.surfaceContainerLow,
              borderRadius: shapes.small,
            },
          ]}
          onPress={onManageCategories}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Manage categories"
        >
          <MaterialCommunityIcons name="tune-variant" size={18} color={colors.onSurfaceVariant} />
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
  manageButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
