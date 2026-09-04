import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Task, Category } from '../../types';
import { useTheme } from '../../theme/ThemeContext';
import { TimePickerModal } from '../common/TimePickerModal';
import { DatePickerModal } from '../common/DatePickerModal';

interface TaskUpsertModalProps {
  visible: boolean;
  taskToEdit?: Task | null;
  categories: Category[];
  defaultCategoryId?: number;
  onSave: (taskData: {
    id?: number;
    categoryId: number;
    title: string;
    reminder: number | null;
    status?: boolean;
  }) => void;
  onDelete?: (taskId: number) => void;
  onClose: () => void;
}

export const TaskUpsertModal: React.FC<TaskUpsertModalProps> = ({
  visible,
  taskToEdit,
  categories,
  defaultCategoryId,
  onSave,
  onDelete,
  onClose,
}) => {
  const { colors, appSettings, fontFamily } = useTheme();

  const [title, setTitle] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(1);
  const [reminderTimestamp, setReminderTimestamp] = useState<number | null>(null);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const inputRef = React.useRef<TextInput>(null);

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setSelectedCategoryId(taskToEdit.categoryId);
      setReminderTimestamp(taskToEdit.reminder);
    } else {
      setTitle('');
      setSelectedCategoryId(
        defaultCategoryId || (categories.length > 0 ? categories[0].id : 1)
      );
      setReminderTimestamp(null);
    }

    if (visible) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [taskToEdit, defaultCategoryId, categories, visible]);

  const handleSave = () => {
    if (!title.trim()) return;

    onSave({
      id: taskToEdit?.id,
      categoryId: selectedCategoryId,
      title: title.trim(),
      reminder: reminderTimestamp,
      status: taskToEdit?.status || false,
    });
    onClose();
  };

  const handleQuickReminder = (type: 'tomorrow_morning' | 'tomorrow_evening' | 'next_week') => {
    const now = new Date();
    if (type === 'tomorrow_morning') {
      const d = new Date(now);
      d.setDate(d.getDate() + 1);
      d.setHours(9, 0, 0, 0);
      setReminderTimestamp(d.getTime());
    } else if (type === 'tomorrow_evening') {
      const d = new Date(now);
      d.setDate(d.getDate() + 1);
      d.setHours(18, 0, 0, 0);
      setReminderTimestamp(d.getTime());
    } else if (type === 'next_week') {
      const d = new Date(now);
      d.setDate(d.getDate() + 7);
      d.setHours(9, 0, 0, 0);
      setReminderTimestamp(d.getTime());
    }
  };

  const handleDateConfirm = (date: Date) => {
    setShowDatePicker(false);
    const base = reminderTimestamp ? new Date(reminderTimestamp) : new Date();
    base.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
    setReminderTimestamp(base.getTime());
  };

  const handleTimeConfirm = (minutesFromMidnight: number) => {
    setShowTimePicker(false);
    const base = reminderTimestamp ? new Date(reminderTimestamp) : new Date();
    const hours = Math.floor(minutesFromMidnight / 60);
    const mins = minutesFromMidnight % 60;
    base.setHours(hours, mins, 0, 0);
    setReminderTimestamp(base.getTime());
  };

  const formatReminderDisplay = (ts: number | null): string => {
    if (!ts) return 'No reminder set';
    const d = new Date(ts);
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dateStr = `${monthNames[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
    let timeStr = '';
    if (appSettings.is24Hr) {
      timeStr = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    } else {
      let h = d.getHours();
      const m = d.getMinutes().toString().padStart(2, '0');
      const p = h >= 12 ? 'PM' : 'AM';
      h = h % 12 || 12;
      timeStr = `${h}:${m} ${p}`;
    }
    return `${dateStr} at ${timeStr}`;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
      onShow={() => {
        setTimeout(() => {
          inputRef.current?.focus();
        }, 50);
      }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.surface,
              borderColor: colors.outlineVariant,
            },
          ]}
        >
          {/* Handle */}
          <View style={[styles.dragHandle, { backgroundColor: colors.outlineVariant }]} />

          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.sheetTitle, { color: colors.onSurface, fontFamily }]}>
              {taskToEdit ? 'Edit Task' : 'New Task'}
            </Text>
            {taskToEdit && onDelete && (
              <TouchableOpacity
                onPress={() => {
                  onDelete(taskToEdit.id);
                  onClose();
                }}
                style={styles.deleteButton}
              >
                <MaterialCommunityIcons name="trash-can-outline" size={22} color={colors.error} />
              </TouchableOpacity>
            )}
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>
            {/* Title Input */}
            <TextInput
              ref={inputRef}
              style={[
                styles.input,
                {
                  backgroundColor: colors.surfaceVariant,
                  color: colors.onSurface,
                  fontFamily,
                },
              ]}
              placeholder="What do you need to do?"
              placeholderTextColor={colors.onSurfaceVariant}
              value={title}
              onChangeText={setTitle}
              autoFocus
              multiline
            />

            {/* Category Selector */}
            <Text style={[styles.sectionLabel, { color: colors.onSurfaceVariant, fontFamily }]}>
              Category
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
              {categories.map((cat) => {
                const isSelected = selectedCategoryId === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryChip,
                      {
                        backgroundColor: isSelected ? colors.primary : colors.surfaceVariant,
                      },
                    ]}
                    onPress={() => setSelectedCategoryId(cat.id)}
                    activeOpacity={0.8}
                  >
                    <View
                      style={[
                        styles.catDot,
                        { backgroundColor: cat.color || colors.primary },
                      ]}
                    />
                    <Text
                      style={[
                        styles.catName,
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
            </ScrollView>

            {/* Reminder Section */}
            <Text style={[styles.sectionLabel, { color: colors.onSurfaceVariant, fontFamily }]}>
              Reminder
            </Text>

            <View
              style={[
                styles.reminderCard,
                {
                  backgroundColor: colors.surfaceVariant,
                  borderColor: colors.outlineVariant,
                },
              ]}
            >
              <View style={styles.reminderInfoRow}>
                <MaterialCommunityIcons
                  name="bell-outline"
                  size={20}
                  color={reminderTimestamp ? colors.primary : colors.onSurfaceVariant}
                />
                <Text
                  style={[
                    styles.reminderDisplay,
                    {
                      color: reminderTimestamp ? colors.primary : colors.onSurfaceVariant,
                      fontWeight: reminderTimestamp ? '700' : '500',
                      fontFamily,
                    },
                  ]}
                >
                  {formatReminderDisplay(reminderTimestamp)}
                </Text>
                {reminderTimestamp ? (
                  <TouchableOpacity
                    onPress={() => setReminderTimestamp(null)}
                    style={styles.clearBtn}
                  >
                    <MaterialCommunityIcons name="close" size={18} color={colors.onSurfaceVariant} />
                  </TouchableOpacity>
                ) : null}
              </View>

              {/* Date / Time Pickers */}
              <View style={styles.pickerButtonsRow}>
                <TouchableOpacity
                  style={[styles.pickerBtn, { backgroundColor: colors.surface }]}
                  onPress={() => setShowDatePicker(true)}
                >
                  <MaterialCommunityIcons name="calendar" size={16} color={colors.onSurface} />
                  <Text style={[styles.pickerBtnText, { color: colors.onSurface, fontFamily }]}>
                    Date
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.pickerBtn, { backgroundColor: colors.surface }]}
                  onPress={() => setShowTimePicker(true)}
                >
                  <MaterialCommunityIcons name="clock-outline" size={16} color={colors.onSurface} />
                  <Text style={[styles.pickerBtnText, { color: colors.onSurface, fontFamily }]}>
                    Time
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Quick Preset Buttons */}
              <View style={styles.quickPresetsRow}>
                <TouchableOpacity
                  style={[styles.presetChip, { backgroundColor: colors.surface }]}
                  onPress={() => handleQuickReminder('tomorrow_morning')}
                >
                  <Text style={[styles.presetText, { color: colors.onSurfaceVariant, fontFamily }]}>
                    Tomorrow 9 AM
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.presetChip, { backgroundColor: colors.surface }]}
                  onPress={() => handleQuickReminder('tomorrow_evening')}
                >
                  <Text style={[styles.presetText, { color: colors.onSurfaceVariant, fontFamily }]}>
                    Tomorrow 6 PM
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.presetChip, { backgroundColor: colors.surface }]}
                  onPress={() => handleQuickReminder('next_week')}
                >
                  <Text style={[styles.presetText, { color: colors.onSurfaceVariant, fontFamily }]}>
                    Next Week
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionsRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                <Text style={[styles.actionBtnText, { color: colors.onSurfaceVariant, fontFamily }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.saveBtn,
                  {
                    backgroundColor: title.trim() ? colors.primary : colors.surfaceVariant,
                  },
                ]}
                disabled={!title.trim()}
                onPress={handleSave}
              >
                <Text
                  style={[
                    styles.actionBtnText,
                    {
                      color: title.trim() ? colors.onPrimary : colors.onSurfaceVariant,
                      fontFamily,
                    },
                  ]}
                >
                  Save
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>

        <DatePickerModal
          visible={showDatePicker}
          initialDate={reminderTimestamp ? new Date(reminderTimestamp) : new Date()}
          onConfirm={handleDateConfirm}
          onCancel={() => setShowDatePicker(false)}
        />

        <TimePickerModal
          visible={showTimePicker}
          is24Hr={appSettings.is24Hr}
          initialMinutes={
            reminderTimestamp
              ? new Date(reminderTimestamp).getHours() * 60 +
                new Date(reminderTimestamp).getMinutes()
              : 540
          }
          onConfirm={handleTimeConfirm}
          onCancel={() => setShowTimePicker(false)}
        />
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 32,
    maxHeight: '90%',
    borderWidth: 1,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  deleteButton: {
    padding: 6,
  },
  body: {
    paddingBottom: 20,
  },
  input: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  catScroll: {
    marginBottom: 20,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
  },
  catDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  catName: {
    fontSize: 14,
  },
  reminderCard: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    marginBottom: 24,
  },
  reminderInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  reminderDisplay: {
    flex: 1,
    fontSize: 14,
  },
  clearBtn: {
    padding: 4,
  },
  pickerButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  pickerBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 14,
    gap: 8,
  },
  pickerBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  quickPresetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  presetChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  presetText: {
    fontSize: 12,
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 12,
  },
  cancelBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
  },
  saveBtn: {
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 24,
    minWidth: 100,
    alignItems: 'center',
  },
  actionBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
