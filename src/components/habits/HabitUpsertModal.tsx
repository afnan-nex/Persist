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
import { Habit, DayOfWeek, ALL_DAYS_OF_WEEK, SHORT_DAY_NAMES } from '../../types';
import { useTheme } from '../../theme/ThemeContext';
import { FilterChip, AssistChip, FilledButton, TextButton, M3Switch } from '../m3';
import { TimePickerModal } from '../common/TimePickerModal';
import { KeyboardAwareBottomSheet } from '../common/KeyboardAwareModal';

interface HabitUpsertModalProps {
  visible: boolean;
  habitToEdit?: Habit | null;
  onSave: (habitData: {
    id?: number;
    title: string;
    description: string;
    days: DayOfWeek[];
    time: number;
    reminder: boolean;
  }) => void | Promise<void>;
  onDelete?: (habitId: number) => void;
  onClose: () => void;
}

function getCurrentPhoneMinutes(): number {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

export const HabitUpsertModal: React.FC<HabitUpsertModalProps> = ({
  visible,
  habitToEdit,
  onSave,
  onDelete,
  onClose,
}) => {
  const { colors, appSettings, fontFamily, shapes, typography } = useTheme();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedDays, setSelectedDays] = useState<Set<DayOfWeek>>(new Set(ALL_DAYS_OF_WEEK));
  const [reminderMinutes, setReminderMinutes] = useState<number>(getCurrentPhoneMinutes());
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [showTimePicker, setShowTimePicker] = useState(false);

  const inputRef = useRef<TextInput>(null);
  const scrollRef = useRef<ScrollView>(null);

  const focusInput = () => {
    inputRef.current?.focus();
  };

  useEffect(() => {
    setIsSaving(false);
    if (habitToEdit) {
      setTitle(habitToEdit.title);
      setDescription(habitToEdit.description);
      setSelectedDays(new Set(habitToEdit.days));
      setReminderMinutes(habitToEdit.time);
      setReminderEnabled(habitToEdit.reminder);
    } else {
      setTitle('');
      setDescription('');
      setSelectedDays(new Set(ALL_DAYS_OF_WEEK));
      setReminderMinutes(getCurrentPhoneMinutes());
      setReminderEnabled(true);
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
  }, [habitToEdit, visible]);

  const toggleDay = (day: DayOfWeek) => {
    const next = new Set(selectedDays);
    if (next.has(day)) {
      if (next.size > 1) {
        next.delete(day);
      }
    } else {
      next.add(day);
    }
    setSelectedDays(next);
  };

  const selectEveryDay = () => {
    setSelectedDays(new Set(ALL_DAYS_OF_WEEK));
  };

  const selectWeekdays = () => {
    setSelectedDays(
      new Set<DayOfWeek>(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'])
    );
  };

  const handleSave = async () => {
    if (!title.trim() || isSaving) return;
    setIsSaving(true);
    try {
      await onSave({
        id: habitToEdit?.id,
        title: title.trim(),
        description: description.trim(),
        days: Array.from(selectedDays),
        time: reminderMinutes,
        reminder: reminderEnabled,
      });
      onClose();
    } catch (err) {
      console.error('Failed to save habit:', err);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const formatTimeDisplay = (totalMins: number): string => {
    const hours = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    if (appSettings.is24Hr) {
      return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    }
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${mins.toString().padStart(2, '0')} ${period}`;
  };

  const headerContent = (
    <View style={styles.header}>
      <Text style={[styles.sheetTitle, { color: colors.onSurface, fontFamily }]}>
        {habitToEdit ? 'Edit Habit' : 'New Habit'}
      </Text>

      <View style={styles.headerRightActions}>
        {/* Keyboard Button to force focus */}
        <TouchableOpacity
          style={[styles.keyboardBtn, { backgroundColor: colors.surfaceContainerHighest }]}
          onPress={focusInput}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="keyboard-outline" size={20} color={colors.primary} />
        </TouchableOpacity>

        {habitToEdit && onDelete && (
          <TouchableOpacity
            onPress={() => {
              onDelete(habitToEdit.id);
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
        disabled={!title.trim() || isSaving}
        loading={isSaving}
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
          placeholder="Habit name (e.g., Read 20 mins)"
          placeholderTextColor={colors.onSurfaceVariant}
          value={title}
          onChangeText={setTitle}
          autoFocus
          showSoftInputOnFocus={true}
          onFocus={() => {
            scrollRef.current?.scrollTo({ y: 0, animated: true });
          }}
        />

        {/* Description Input */}
        <TextInput
          style={[
            styles.input,
            styles.descInput,
            {
              backgroundColor: colors.surfaceContainerHighest,
              color: colors.onSurface,
              fontFamily,
            },
          ]}
          placeholder="Description or motivation (optional)"
          placeholderTextColor={colors.onSurfaceVariant}
          value={description}
          onChangeText={setDescription}
          multiline
          showSoftInputOnFocus={true}
          onFocus={() => {
            setTimeout(() => {
              scrollRef.current?.scrollTo({ y: 80, animated: true });
            }, 100);
          }}
        />

        {/* Schedule Section */}
        <View style={styles.scheduleHeader}>
          <Text style={[styles.sectionLabel, { color: colors.onSurfaceVariant, fontFamily }]}>
            Frequency
          </Text>
          <View style={styles.presetButtons}>
            <AssistChip
              label="All Days"
              onPress={selectEveryDay}
              style={{ marginRight: 8 }}
            />
            <AssistChip
              label="Weekdays"
              onPress={selectWeekdays}
            />
          </View>
        </View>

        {/* Day Selector Pills */}
        <View style={styles.daysRow}>
          {ALL_DAYS_OF_WEEK.map((day) => {
            const isSelected = selectedDays.has(day);
            return (
              <TouchableOpacity
                key={day}
                style={[
                  styles.dayPill,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.surfaceContainerHighest,
                  },
                ]}
                onPress={() => toggleDay(day)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.dayPillText,
                    {
                      color: isSelected ? colors.onPrimary : colors.onSurfaceVariant,
                      fontWeight: isSelected ? '700' : '500',
                      fontFamily,
                    },
                  ]}
                >
                  {SHORT_DAY_NAMES[day]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Reminder Section */}
        <Text style={[styles.sectionLabel, { color: colors.onSurfaceVariant, fontFamily }]}>
          Daily Reminder
        </Text>

        <View style={[styles.reminderCard, { backgroundColor: colors.surfaceContainer }]}>
          <View style={styles.reminderToggleRow}>
            <View style={styles.reminderLabelCol}>
              <Text style={[styles.reminderTitle, { color: colors.onSurface, fontFamily }]}>
                Enable Reminder
              </Text>
              <Text style={[styles.reminderSub, { color: colors.onSurfaceVariant, fontFamily }]}>
                Get notified on scheduled days
              </Text>
            </View>
            <M3Switch
              value={reminderEnabled}
              onValueChange={setReminderEnabled}
            />
          </View>

          {reminderEnabled && (
            <TouchableOpacity
              style={[styles.timePickerButton, { backgroundColor: colors.surfaceContainerHigh }]}
              onPress={() => setShowTimePicker(true)}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="clock-outline" size={20} color={colors.primary} />
              <Text style={[styles.timeDisplayText, { color: colors.onSurface, fontFamily }]}>
                {formatTimeDisplay(reminderMinutes)}
              </Text>
              <MaterialCommunityIcons name="pencil" size={18} color={colors.onSurfaceVariant} />
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAwareBottomSheet>

      <TimePickerModal
        visible={showTimePicker}
        initialMinutes={reminderMinutes}
        is24Hr={appSettings.is24Hr}
        onConfirm={(mins) => {
          setReminderMinutes(mins);
          setShowTimePicker(false);
        }}
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
    marginBottom: 12,
  },
  descInput: {
    minHeight: 60,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  scheduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  presetButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  presetChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  presetChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  dayPill: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayPillText: {
    fontSize: 13,
  },
  reminderCard: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
  },
  reminderToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reminderLabelCol: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  reminderSub: {
    fontSize: 12,
    marginTop: 2,
  },
  timePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    marginTop: 12,
    gap: 10,
  },
  timeDisplayText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
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
