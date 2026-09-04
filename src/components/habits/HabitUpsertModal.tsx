import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Habit, DayOfWeek, ALL_DAYS_OF_WEEK, SHORT_DAY_NAMES } from '../../types';
import { useTheme } from '../../theme/ThemeContext';
import { TimePickerModal } from '../common/TimePickerModal';

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
  }) => void;
  onDelete?: (habitId: number) => void;
  onClose: () => void;
}

export const HabitUpsertModal: React.FC<HabitUpsertModalProps> = ({
  visible,
  habitToEdit,
  onSave,
  onDelete,
  onClose,
}) => {
  const { colors, appSettings, fontFamily } = useTheme();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedDays, setSelectedDays] = useState<Set<DayOfWeek>>(new Set(ALL_DAYS_OF_WEEK));
  const [reminderMinutes, setReminderMinutes] = useState<number>(540); // 9:00 AM
  const [reminderEnabled, setReminderEnabled] = useState(true);

  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
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
      setReminderMinutes(540);
      setReminderEnabled(true);
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

  const handleSave = () => {
    if (!title.trim()) return;

    onSave({
      id: habitToEdit?.id,
      title: title.trim(),
      description: description.trim(),
      days: Array.from(selectedDays),
      time: reminderMinutes,
      reminder: reminderEnabled,
    });
    onClose();
  };

  const formatTime = (minutes: number): string => {
    const h24 = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (appSettings.is24Hr) {
      return `${h24.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    } else {
      const p = h24 >= 12 ? 'PM' : 'AM';
      const h12 = h24 % 12 || 12;
      return `${h12}:${m.toString().padStart(2, '0')} ${p}`;
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
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
          <View style={[styles.dragHandle, { backgroundColor: colors.outlineVariant }]} />

          <View style={styles.header}>
            <Text style={[styles.sheetTitle, { color: colors.onSurface, fontFamily }]}>
              {habitToEdit ? 'Edit Habit' : 'New Habit'}
            </Text>
            {habitToEdit && onDelete && (
              <TouchableOpacity
                onPress={() => {
                  onDelete(habitToEdit.id);
                  onClose();
                }}
                style={styles.deleteButton}
              >
                <MaterialCommunityIcons name="trash-can-outline" size={22} color={colors.error} />
              </TouchableOpacity>
            )}
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>
            {/* Title */}
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surfaceVariant,
                  color: colors.onSurface,
                  fontFamily,
                },
              ]}
              placeholder="Habit Title (e.g. Read 30 mins, Exercise)"
              placeholderTextColor={colors.onSurfaceVariant}
              value={title}
              onChangeText={setTitle}
            />

            {/* Description */}
            <TextInput
              style={[
                styles.input,
                styles.descInput,
                {
                  backgroundColor: colors.surfaceVariant,
                  color: colors.onSurface,
                  fontFamily,
                },
              ]}
              placeholder="Description or motivation (optional)"
              placeholderTextColor={colors.onSurfaceVariant}
              value={description}
              onChangeText={setDescription}
              multiline
            />

            {/* Frequency / Weekdays */}
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionLabel, { color: colors.onSurfaceVariant, fontFamily }]}>
                Days of Week
              </Text>
              <View style={styles.presetRow}>
                <TouchableOpacity onPress={selectEveryDay} style={styles.presetLink}>
                  <Text style={[styles.presetLinkText, { color: colors.primary, fontFamily }]}>
                    All
                  </Text>
                </TouchableOpacity>
                <Text style={{ color: colors.outline }}>•</Text>
                <TouchableOpacity onPress={selectWeekdays} style={styles.presetLink}>
                  <Text style={[styles.presetLinkText, { color: colors.primary, fontFamily }]}>
                    Weekdays
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.daysGrid}>
              {ALL_DAYS_OF_WEEK.map((day) => {
                const isSelected = selectedDays.has(day);
                return (
                  <TouchableOpacity
                    key={day}
                    style={[
                      styles.dayChip,
                      {
                        backgroundColor: isSelected ? colors.primary : colors.surfaceVariant,
                      },
                    ]}
                    onPress={() => toggleDay(day)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.dayChipText,
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

            {/* Reminder & Time */}
            <View
              style={[
                styles.reminderCard,
                {
                  backgroundColor: colors.surfaceVariant,
                  borderColor: colors.outlineVariant,
                },
              ]}
            >
              <View style={styles.switchRow}>
                <View style={styles.switchLabelCol}>
                  <Text style={[styles.reminderTitle, { color: colors.onSurface, fontFamily }]}>
                    Daily Reminder
                  </Text>
                  <Text
                    style={[
                      styles.reminderSubtitle,
                      { color: colors.onSurfaceVariant, fontFamily },
                    ]}
                  >
                    Get notified at {formatTime(reminderMinutes)}
                  </Text>
                </View>
                <Switch
                  value={reminderEnabled}
                  onValueChange={setReminderEnabled}
                  trackColor={{ false: colors.outline, true: colors.primary }}
                  thumbColor={colors.surface}
                />
              </View>

              {reminderEnabled && (
                <TouchableOpacity
                  style={[styles.timePickerTrigger, { backgroundColor: colors.surface }]}
                  onPress={() => setShowTimePicker(true)}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons name="clock-outline" size={20} color={colors.primary} />
                  <Text style={[styles.timeDisplayText, { color: colors.onSurface, fontFamily }]}>
                    {formatTime(reminderMinutes)}
                  </Text>
                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={20}
                    color={colors.onSurfaceVariant}
                  />
                </TouchableOpacity>
              )}
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
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  descInput: {
    minHeight: 64,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  sectionHeaderRow: {
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
  presetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  presetLink: {
    paddingVertical: 2,
  },
  presetLinkText: {
    fontSize: 13,
    fontWeight: '700',
  },
  daysGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  dayChip: {
    flex: 1,
    marginHorizontal: 2,
    paddingVertical: 10,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayChipText: {
    fontSize: 12,
  },
  reminderCard: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    marginBottom: 24,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchLabelCol: {
    flex: 1,
    marginRight: 16,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  reminderSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  timePickerTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 14,
  },
  timeDisplayText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 12,
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
