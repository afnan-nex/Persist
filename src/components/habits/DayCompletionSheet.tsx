import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Habit } from '../../types';
import { epochDayToDate } from '../../data/calculations';
import { getCompletedHabitsForDate } from '../../data/habitRepository';
import { useTheme } from '../../theme/ThemeContext';

interface DayCompletionSheetProps {
  visible: boolean;
  epochDay: number | null;
  onClose: () => void;
}

export const DayCompletionSheet: React.FC<DayCompletionSheetProps> = ({
  visible,
  epochDay,
  onClose,
}) => {
  const { colors, fontFamily } = useTheme();
  const [completedHabits, setCompletedHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && epochDay !== null) {
      setLoading(true);
      getCompletedHabitsForDate(epochDay)
        .then((habits) => {
          setCompletedHabits(habits);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [visible, epochDay]);

  if (epochDay === null) return null;

  const date = epochDayToDate(epochDay);
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  const dateString = date.toLocaleDateString(undefined, options);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
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
            <View>
              <Text style={[styles.title, { color: colors.onSurface, fontFamily }]}>
                {dateString}
              </Text>
              <Text style={[styles.subtitle, { color: colors.onSurfaceVariant, fontFamily }]}>
                {completedHabits.length}{' '}
                {completedHabits.length === 1 ? 'habit' : 'habits'} completed
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <MaterialCommunityIcons name="close" size={24} color={colors.onSurface} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {loading ? (
              <Text style={[styles.loadingText, { color: colors.onSurfaceVariant, fontFamily }]}>
                Loading...
              </Text>
            ) : completedHabits.length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons
                  name="calendar-blank-outline"
                  size={40}
                  color={colors.outline}
                />
                <Text
                  style={[styles.emptyText, { color: colors.onSurfaceVariant, fontFamily }]}
                >
                  No habits were completed on this day.
                </Text>
              </View>
            ) : (
              completedHabits.map((h) => (
                <View
                  key={h.id}
                  style={[
                    styles.habitItem,
                    {
                      backgroundColor: colors.surfaceVariant,
                    },
                  ]}
                >
                  <View style={[styles.checkCircle, { backgroundColor: colors.primary }]}>
                    <MaterialCommunityIcons name="check" size={16} color={colors.onPrimary} />
                  </View>
                  <View style={styles.habitInfo}>
                    <Text
                      style={[styles.habitTitle, { color: colors.onSurface, fontFamily }]}
                    >
                      {h.title}
                    </Text>
                    {h.description ? (
                      <Text
                        style={[
                          styles.habitDesc,
                          { color: colors.onSurfaceVariant, fontFamily },
                        ]}
                        numberOfLines={1}
                      >
                        {h.description}
                      </Text>
                    ) : null}
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </View>
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
    paddingBottom: 36,
    maxHeight: '60%',
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
  title: {
    fontSize: 18,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  list: {
    marginBottom: 12,
  },
  loadingText: {
    textAlign: 'center',
    paddingVertical: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
  },
  habitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    marginBottom: 8,
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  habitInfo: {
    flex: 1,
  },
  habitTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  habitDesc: {
    fontSize: 12,
    marginTop: 2,
  },
});
