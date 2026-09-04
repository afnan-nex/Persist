import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

interface WeeklyChartProps {
  data: number[]; // 53 weeks of completions (0..7)
}

type Period = '2M' | '4M' | '6M' | '1Y';

export const WeeklyChart: React.FC<WeeklyChartProps> = ({ data }) => {
  const { colors, fontFamily } = useTheme();
  const [period, setPeriod] = useState<Period>('4M');

  const getPeriodCount = (p: Period): number => {
    switch (p) {
      case '2M':
        return 8;
      case '4M':
        return 16;
      case '6M':
        return 26;
      case '1Y':
      default:
        return 52;
    }
  };

  const count = getPeriodCount(period);
  const slicedData = data.slice(Math.max(0, data.length - count));
  const maxVal = Math.max(1, ...slicedData);
  const peakIndex = slicedData.lastIndexOf(Math.max(...slicedData));
  const avg =
    slicedData.length > 0
      ? (slicedData.reduce((a, b) => a + b, 0) / slicedData.length).toFixed(1)
      : '0.0';

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
      {/* Header & Filter Row */}
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.title, { color: colors.onSurface, fontFamily }]}>
            Weekly Comparison
          </Text>
          <Text style={[styles.subtitle, { color: colors.onSurfaceVariant, fontFamily }]}>
            Average: {avg} days/week
          </Text>
        </View>

        <View style={[styles.filterGroup, { backgroundColor: colors.surfaceVariant }]}>
          {(['2M', '4M', '6M', '1Y'] as Period[]).map((p) => {
            const isSelected = period === p;
            return (
              <TouchableOpacity
                key={p}
                style={[
                  styles.filterBtn,
                  isSelected && { backgroundColor: colors.primary },
                ]}
                onPress={() => setPeriod(p)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.filterText,
                    {
                      color: isSelected ? colors.onPrimary : colors.onSurfaceVariant,
                      fontWeight: isSelected ? '700' : '500',
                      fontFamily,
                    },
                  ]}
                >
                  {p}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Chart Bars */}
      <View style={styles.chartContainer}>
        {slicedData.map((val, idx) => {
          const heightPercent = `${Math.min(100, Math.max(8, (val / 7) * 100))}%` as `${number}%`;
          const isPeak = idx === peakIndex && val > 0;

          return (
            <View key={idx} style={styles.barWrapper}>
              <View
                style={[
                  styles.bar,
                  {
                    height: heightPercent,
                    backgroundColor: isPeak ? colors.primary : colors.primaryContainer,
                  },
                ]}
              />
            </View>
          );
        })}
      </View>

      {/* Y-axis bounds */}
      <View style={styles.axisRow}>
        <Text style={[styles.axisText, { color: colors.onSurfaceVariant, fontFamily }]}>
          0d
        </Text>
        <Text style={[styles.axisText, { color: colors.onSurfaceVariant, fontFamily }]}>
          7d/week
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    marginBottom: 16,
    elevation: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  filterGroup: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 3,
  },
  filterBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  filterText: {
    fontSize: 12,
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 120,
    gap: 2,
    paddingVertical: 8,
  },
  barWrapper: {
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: '80%',
    borderRadius: 4,
  },
  axisRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  axisText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
