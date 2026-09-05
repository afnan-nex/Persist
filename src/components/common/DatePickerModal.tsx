import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { KeyboardAwareDialog } from './KeyboardAwareModal';

interface DatePickerModalProps {
  visible: boolean;
  initialDate?: Date;
  onConfirm: (date: Date) => void;
  onCancel: () => void;
}

export const DatePickerModal: React.FC<DatePickerModalProps> = ({
  visible,
  initialDate = new Date(),
  onConfirm,
  onCancel,
}) => {
  const { colors, typography, shapes, elevation, fontFamily } = useTheme();

  const [currentYear, setCurrentYear] = useState<number>(initialDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(initialDate.getMonth()); // 0-11
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate);

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Build days matrix for the month
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const daysMatrix: (number | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    daysMatrix.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    daysMatrix.push(d);
  }

  const isSelected = (day: number) => {
    return (
      selectedDate.getFullYear() === currentYear &&
      selectedDate.getMonth() === currentMonth &&
      selectedDate.getDate() === day
    );
  };

  const handleDayPress = (day: number) => {
    setSelectedDate(new Date(currentYear, currentMonth, day));
  };

  const headerContent = (
    <View style={styles.header}>
      <Text style={[styles.title, { color: colors.onSurface, ...typography.titleMedium, fontFamily }]}>
        {monthNames[currentMonth]} {currentYear}
      </Text>
      <View style={styles.navRow}>
        <TouchableOpacity style={styles.navBtn} onPress={handlePrevMonth} activeOpacity={0.7}>
          <MaterialCommunityIcons name="chevron-left" size={24} color={colors.onSurface} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navBtn} onPress={handleNextMonth} activeOpacity={0.7}>
          <MaterialCommunityIcons name="chevron-right" size={24} color={colors.onSurface} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const footerContent = (
    <View style={styles.actions}>
      <TouchableOpacity style={styles.btn} onPress={onCancel} activeOpacity={0.7}>
        <Text style={[styles.btnText, { color: colors.primary, ...typography.labelLarge, fontFamily }]}>
          Cancel
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.btn, styles.confirmBtn, { backgroundColor: colors.primary, borderRadius: shapes.full }]}
        onPress={() => onConfirm(selectedDate)}
        activeOpacity={0.8}
      >
        <Text style={[styles.btnText, { color: colors.onPrimary, ...typography.labelLarge, fontFamily }]}>OK</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAwareDialog
      visible={visible}
      onRequestClose={onCancel}
      header={headerContent}
      footer={footerContent}
      maxWidth={340}
    >
      {/* Day of Week Headers */}
      <View style={styles.weekHeader}>
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((dow, idx) => (
          <Text
            key={idx}
            style={[styles.weekHeaderText, { color: colors.onSurfaceVariant, ...typography.bodySmall, fontFamily }]}
          >
            {dow}
          </Text>
        ))}
      </View>

      {/* Calendar Grid */}
      <View style={styles.grid}>
        {daysMatrix.map((day, idx) => {
          if (!day) {
            return <View key={`empty-${idx}`} style={styles.dayCell} />;
          }
          const active = isSelected(day);
          return (
            <TouchableOpacity
              key={`day-${day}`}
              style={[
                styles.dayCell,
                active && [styles.selectedDayCell, { backgroundColor: colors.primary }],
              ]}
              onPress={() => handleDayPress(day)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.dayText,
                  {
                    color: active ? colors.onPrimary : colors.onSurface,
                    ...typography.bodyMedium,
                    fontWeight: active ? '700' : '400',
                    fontFamily,
                  },
                ]}
              >
                {day}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </KeyboardAwareDialog>
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
    fontSize: 18,
    fontWeight: '700',
  },
  navRow: {
    flexDirection: 'row',
    gap: 4,
  },
  navBtn: {
    padding: 6,
    borderRadius: 16,
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  weekHeaderText: {
    fontSize: 12,
    fontWeight: '700',
    width: 36,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginBottom: 20,
  },
  dayCell: {
    width: '14.28%',
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
  },
  selectedDayCell: {
    borderRadius: 19,
  },
  dayText: {
    fontSize: 14,
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
    minWidth: 70,
    alignItems: 'center',
  },
  btnText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
