import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

interface WeekdayFrequencyChartProps {
  data: Record<string, number>; // "Mon" -> count
}

export const WeekdayFrequencyChart: React.FC<WeekdayFrequencyChartProps> = ({ data }) => {
  const { colors, typography, shapes, elevation, fontFamily } = useTheme();

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const maxVal = Math.max(1, ...Object.values(data));

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surfaceContainerLow,
          borderRadius: shapes.large,
          elevation: elevation.level1,
        },
      ]}
    >
      <Text style={[styles.title, { color: colors.onSurface, ...typography.titleMedium, fontFamily }]}>
        Weekday Breakdown
      </Text>

      <View style={styles.list}>
        {days.map((d) => {
          const count = data[d] || 0;
          const percent = `${Math.min(100, Math.max(count > 0 ? 5 : 0, (count / maxVal) * 100))}%` as `${number}%`;
          const isMax = count === maxVal && count > 0;

          return (
            <View key={d} style={styles.row}>
              <Text
                style={[
                  styles.dayLabel,
                  {
                    color: isMax ? colors.primary : colors.onSurfaceVariant,
                    fontWeight: isMax ? '700' : '500',
                    fontFamily,
                  },
                ]}
              >
                {d}
              </Text>

              <View
                style={[
                  styles.barBackground,
                  { backgroundColor: colors.surfaceVariant },
                ]}
              >
                <View
                  style={[
                    styles.barFill,
                    {
                      width: percent,
                      backgroundColor: isMax ? colors.primary : colors.primaryContainer,
                    },
                  ]}
                />
              </View>

              <Text
                style={[
                  styles.countLabel,
                  {
                    color: isMax ? colors.primary : colors.onSurfaceVariant,
                    fontWeight: isMax ? '700' : '500',
                    fontFamily,
                  },
                ]}
              >
                {count}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    padding: 20,
    marginBottom: 16,
    elevation: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  list: {
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dayLabel: {
    width: 32,
    fontSize: 13,
  },
  barBackground: {
    flex: 1,
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 5,
  },
  countLabel: {
    width: 24,
    fontSize: 13,
    textAlign: 'right',
  },
});
