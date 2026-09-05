import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Task, Category } from '../../types';
import { useTheme } from '../../theme/ThemeContext';
import { FilterChip, AssistChip, FilledButton, TextButton } from '../m3';
import { TimePickerModal } from '../common/TimePickerModal';
import { DatePickerModal } from '../common/DatePickerModal';
import { KeyboardAwareBottomSheet } from '../common/KeyboardAwareModal';

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
  const { colors, appSettings, fontFamily, shapes, typography } = useTheme();

  const [title, setTitle] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(1);
  const [reminderTimestamp, setReminderTimestamp] = useState<number | null>(null);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const inputRef = useRef<TextInput>(null);
  const scrollRef = useRef<ScrollView>(null);

  const focusInput = () => {
    inputRef.current?.focus();
  };

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
      const t1 = setTimeout(focusInput, 80);
      const t2 = setTimeout(focusInput, 200);
      const t3 = setTimeout(focusInput, 350);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
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

  const headerContent = (
    <View style={styles.header}>
      <Text style={[styles.sheetTitle, { color: colors.onSurface, fontFamily }]}>
        {taskToEdit ? 'Edit Task' : 'New Task'}
      </Text>

      <View style={styles.headerRightActions}>
        {/* Keyboard Button to force select & open keyboard */}
        <TouchableOpacity
          style={[styles.keyboardBtn, { backgroundColor: colors.surfaceContainerHighest }]}
          onPress={focusInput}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="keyboard-outline" size={20} color={colors.primary} />
        </TouchableOpacity>

        {taskToEdit && onDelete && (
          <TouchableOpacity
            onPress={() => {
              onDelete(taskToEdit.id);
              onClose();
            }}
            style={styles.deleteButton}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="trash-can-outline" size={22} color={colors.error} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const footerContent = (
    <View style={styles.pinnedActionsRow}>
      <TextButton
        label="Cancel"
        onPress={onClose}
        style={{ flex: 1, marginRight: 8 }}
      />
      <FilledButton
        label="Save"
        disabled={!title.trim()}
        onPress={handleSave}
        style={{ flex: 1, marginLeft: 8 }}
      />
    </View>
  );

  return (
    <>
      <KeyboardAwareBottomSheet
        visible={visible}
        onRequestClose={onClose}
        header={headerContent}
        footer={footerContent}
        scrollRef={scrollRef}
        onShow={() => {
          focusInput();
          setTimeout(focusInput, 150);
          setTimeout(focusInput, 300);
        }}
      >
        {/* Title Input */}
        <TextInput
          ref={inputRef}
          style={[
            styles.input,
            {
              backgroundColor: colors.surfaceContainerHighest,
              color: colors.onSurface,
              fontFamily,
            },
          ]}
          placeholder="What do you need to do?"
          placeholderTextColor={colors.onSurfaceVariant}
          value={title}
          onChangeText={setTitle}
          autoFocus
          showSoftInputOnFocus={true}
          multiline
          onFocus={() => {
            scrollRef.current?.scrollTo({ y: 0, animated: true });
          }}
        />

        {/* Category Selector */}
        <Text style={[styles.sectionLabel, { color: colors.onSurfaceVariant, fontFamily }]}>
          Category
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
          {categories.map((cat) => {
            const isSelected = selectedCategoryId === cat.id;
            return (
              <FilterChip
                key={cat.id}
                label={cat.name}
                selected={isSelected}
                customColor={cat.color}
                onPress={() => setSelectedCategoryId(cat.id)}
                style={{ marginRight: 8 }}
              />
            );
          })}
        </ScrollView>

        {/* Reminder Section */}
        <Text style={[styles.sectionLabel, { color: colors.onSurfaceVariant, fontFamily }]}>
          Reminder
        </Text>

        <View style={[styles.reminderCard, { backgroundColor: colors.surfaceContainer }]}>
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
              style={[styles.pickerBtn, { backgroundColor: colors.surfaceContainerHigh }]}
              onPress={() => setShowDatePicker(true)}
            >
              <MaterialCommunityIcons name="calendar" size={16} color={colors.onSurface} />
              <Text style={[styles.pickerBtnText, { color: colors.onSurface, fontFamily }]}>
                Date
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.pickerBtn, { backgroundColor: colors.surfaceContainerHigh }]}
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
            <AssistChip
              label="Tomorrow 9 AM"
              onPress={() => handleQuickReminder('tomorrow_morning')}
            />
            <AssistChip
              label="Tomorrow 6 PM"
              onPress={() => handleQuickReminder('tomorrow_evening')}
            />
            <AssistChip
              label="Next Week"
              onPress={() => handleQuickReminder('next_week')}
            />
          </View>
        </View>
      </KeyboardAwareBottomSheet>

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
            : new Date().getHours() * 60 + new Date().getMinutes()
        }
        onConfirm={handleTimeConfirm}
        onCancel={() => setShowTimePicker(false)}
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
  sheetTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  keyboardBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    padding: 6,
  },
  scrollArea: {
    maxHeight: 380,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  input: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    minHeight: 70,
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
    marginBottom: 16,
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
  pinnedActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 12,
    paddingTop: 12,
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
