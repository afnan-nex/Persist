import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Task, Category } from '../../types';
import { useTheme } from '../../theme/ThemeContext';

interface TaskCardProps {
  task: Task;
  category?: Category;
  isReorderMode?: boolean;
  is24Hr?: boolean;
  onToggleStatus: (task: Task) => void;
  onPress: (task: Task) => void;
  onDelete: (task: Task) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  category,
  isReorderMode = false,
  is24Hr = false,
  onToggleStatus,
  onPress,
  onDelete,
  onMoveUp,
  onMoveDown,
  canMoveUp = false,
  canMoveDown = false,
}) => {
  const { colors, fontFamily } = useTheme();

  const handleToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggleStatus(task);
  };

  const formatReminder = (timestamp: number | null): string | null => {
    if (!timestamp) return null;
    const date = new Date(timestamp);
    const now = new Date();

    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isTomorrow =
      date.getDate() === tomorrow.getDate() &&
      date.getMonth() === tomorrow.getMonth() &&
      date.getFullYear() === tomorrow.getFullYear();

    let timeStr: string;
    if (is24Hr) {
      const h = date.getHours().toString().padStart(2, '0');
      const m = date.getMinutes().toString().padStart(2, '0');
      timeStr = `${h}:${m}`;
    } else {
      let h = date.getHours();
      const m = date.getMinutes().toString().padStart(2, '0');
      const period = h >= 12 ? 'PM' : 'AM';
      h = h % 12 || 12;
      timeStr = `${h}:${m} ${period}`;
    }

    if (isToday) return `Today, ${timeStr}`;
    if (isTomorrow) return `Tomorrow, ${timeStr}`;

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${monthNames[date.getMonth()]} ${date.getDate()}, ${timeStr}`;
  };

  const reminderText = formatReminder(task.reminder);

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.outlineVariant,
        },
      ]}
    >
      {/* Checkbox */}
      <TouchableOpacity
        style={[
          styles.checkbox,
          {
            borderColor: task.status ? colors.primary : colors.outline,
            backgroundColor: task.status ? colors.primary : 'transparent',
          },
        ]}
        onPress={handleToggle}
        activeOpacity={0.7}
      >
        {task.status && (
          <MaterialCommunityIcons name="check" size={16} color={colors.onPrimary} />
        )}
      </TouchableOpacity>

      {/* Content Area */}
      <TouchableOpacity
        style={styles.contentArea}
        onPress={() => onPress(task)}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.title,
            {
              color: task.status ? colors.onSurfaceVariant : colors.onSurface,
              textDecorationLine: task.status ? 'line-through' : 'none',
              fontFamily,
            },
          ]}
          numberOfLines={2}
        >
          {task.title}
        </Text>

        <View style={styles.badgeRow}>
          {category && (
            <View
              style={[
                styles.categoryBadge,
                { backgroundColor: colors.surfaceVariant },
              ]}
            >
              <View
                style={[
                  styles.categoryDot,
                  { backgroundColor: category.color || colors.primary },
                ]}
              />
              <Text
                style={[
                  styles.categoryText,
                  { color: colors.onSurfaceVariant, fontFamily },
                ]}
              >
                {category.name}
              </Text>
            </View>
          )}

          {reminderText && !task.status && (
            <View
              style={[
                styles.reminderBadge,
                { backgroundColor: colors.primaryContainer },
              ]}
            >
              <MaterialCommunityIcons
                name="bell-outline"
                size={12}
                color={colors.onPrimaryContainer}
              />
              <Text
                style={[
                  styles.reminderText,
                  { color: colors.onPrimaryContainer, fontFamily },
                ]}
              >
                {reminderText}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>

      {/* Reorder Buttons or Delete */}
      {isReorderMode ? (
        <View style={styles.reorderControls}>
          <TouchableOpacity
            style={[styles.reorderBtn, !canMoveUp && styles.disabledBtn]}
            disabled={!canMoveUp}
            onPress={onMoveUp}
          >
            <MaterialCommunityIcons
              name="chevron-up"
              size={20}
              color={canMoveUp ? colors.onSurface : colors.outline}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.reorderBtn, !canMoveDown && styles.disabledBtn]}
            disabled={!canMoveDown}
            onPress={onMoveDown}
          >
            <MaterialCommunityIcons
              name="chevron-down"
              size={20}
              color={canMoveDown ? colors.onSurface : colors.outline}
            />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => onDelete(task)}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="trash-can-outline"
            size={18}
            color={colors.onSurfaceVariant}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 18,
    marginBottom: 8,
    borderWidth: 1,
    elevation: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  contentArea: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  categoryDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
  },
  reminderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
  },
  reminderText: {
    fontSize: 11,
    fontWeight: '700',
  },
  reorderControls: {
    flexDirection: 'column',
    gap: 2,
    marginLeft: 8,
  },
  reorderBtn: {
    padding: 4,
  },
  disabledBtn: {
    opacity: 0.3,
  },
  deleteBtn: {
    padding: 8,
    marginLeft: 4,
  },
});
