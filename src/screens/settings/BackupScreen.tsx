import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { exportToJson, importFromJson } from '../../data/backupRepository';
import { getHabits, getHabitStatuses } from '../../data/habitRepository';
import { getTasks, getCategories } from '../../data/taskRepository';
import { useTheme } from '../../theme/ThemeContext';
import { AppHeader } from '../../components/common/AppHeader';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';

export const BackupScreen: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { colors, fontFamily } = useTheme();

  const [stats, setStats] = useState({
    habits: 0,
    tasks: 0,
    categories: 0,
    statuses: 0,
  });
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [showImportConfirm, setShowImportConfirm] = useState(false);

  const loadStats = async () => {
    try {
      const [hbs, sts, tks, cats] = await Promise.all([
        getHabits(),
        getHabitStatuses(),
        getTasks(),
        getCategories(),
      ]);
      setStats({
        habits: hbs.length,
        statuses: sts.length,
        tasks: tks.length,
        categories: cats.length,
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      await exportToJson();
    } catch (error: any) {
      Alert.alert('Export Failed', error?.message || 'Could not export backup file.');
    } finally {
      setIsExporting(false);
    }
  };

  const executeImport = async () => {
    setShowImportConfirm(false);
    try {
      setIsImporting(true);
      const res = await importFromJson();
      await loadStats();
      Alert.alert(
        'Restore Complete',
        `Successfully restored:\n• ${res.habitsCount} habits\n• ${res.tasksCount} tasks\n• ${res.categoriesCount} categories\n• ${res.statusesCount} check-ins`
      );
    } catch (error: any) {
      if (error?.message !== 'File selection cancelled') {
        Alert.alert('Restore Failed', error?.message || 'Could not restore backup file.');
      }
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader
        title="Backup & Restore"
        leftAction={{
          icon: 'arrow-left',
          onPress: () => navigation.goBack(),
        }}
      />

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Data Stats Card */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              borderColor: colors.outlineVariant,
            },
          ]}
        >
          <Text style={[styles.cardTitle, { color: colors.onSurface, fontFamily }]}>
            Current Storage
          </Text>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: colors.primary, fontFamily }]}>
                {stats.habits}
              </Text>
              <Text style={[styles.statLabel, { color: colors.onSurfaceVariant, fontFamily }]}>
                Habits
              </Text>
            </View>

            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: colors.primary, fontFamily }]}>
                {stats.tasks}
              </Text>
              <Text style={[styles.statLabel, { color: colors.onSurfaceVariant, fontFamily }]}>
                Tasks
              </Text>
            </View>

            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: colors.primary, fontFamily }]}>
                {stats.categories}
              </Text>
              <Text style={[styles.statLabel, { color: colors.onSurfaceVariant, fontFamily }]}>
                Categories
              </Text>
            </View>

            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: colors.primary, fontFamily }]}>
                {stats.statuses}
              </Text>
              <Text style={[styles.statLabel, { color: colors.onSurfaceVariant, fontFamily }]}>
                Check-ins
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          {/* Export Button */}
          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}
            onPress={handleExport}
            disabled={isExporting}
            activeOpacity={0.8}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: colors.primaryContainer }]}>
              {isExporting ? (
                <ActivityIndicator color={colors.primary} size="small" />
              ) : (
                <MaterialCommunityIcons name="export-variant" size={24} color={colors.primary} />
              )}
            </View>
            <View style={styles.actionTextCol}>
              <Text style={[styles.actionTitle, { color: colors.onSurface, fontFamily }]}>
                Export Backup (JSON)
              </Text>
              <Text style={[styles.actionDesc, { color: colors.onSurfaceVariant, fontFamily }]}>
                Generate a portable JSON file of all your habits, tasks, categories, and progress.
              </Text>
            </View>
          </TouchableOpacity>

          {/* Import Button */}
          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}
            onPress={() => setShowImportConfirm(true)}
            disabled={isImporting}
            activeOpacity={0.8}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: colors.surfaceVariant }]}>
              {isImporting ? (
                <ActivityIndicator color={colors.onSurface} size="small" />
              ) : (
                <MaterialCommunityIcons name="import" size={24} color={colors.onSurface} />
              )}
            </View>
            <View style={styles.actionTextCol}>
              <Text style={[styles.actionTitle, { color: colors.onSurface, fontFamily }]}>
                Restore from Backup
              </Text>
              <Text style={[styles.actionDesc, { color: colors.onSurfaceVariant, fontFamily }]}>
                Load a JSON file exported from Persist or Grit to restore your data.
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Notice Card */}
        <View
          style={[
            styles.noticeCard,
            {
              backgroundColor: colors.surfaceVariant,
              borderColor: colors.outlineVariant,
            },
          ]}
        >
          <MaterialCommunityIcons name="information-outline" size={20} color={colors.primary} />
          <Text style={[styles.noticeText, { color: colors.onSurfaceVariant, fontFamily }]}>
            Persist uses the open schema version 5 format, providing 100% interoperability with Grit.
            Backups are stored offline on your device and are never transmitted to external servers.
          </Text>
        </View>
      </ScrollView>

      {/* Import Confirmation Dialog */}
      <ConfirmDialog
        visible={showImportConfirm}
        title="Restore from Backup?"
        message="Restoring from a backup will overwrite and replace your current tasks, habits, and history. Are you sure you want to proceed?"
        confirmText="Select File"
        isDestructive
        onConfirm={executeImport}
        onCancel={() => setShowImportConfirm(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  card: {
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    marginBottom: 16,
    elevation: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 26,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  actionsContainer: {
    gap: 12,
    marginBottom: 16,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 22,
    borderWidth: 1,
    elevation: 1,
  },
  actionIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  actionTextCol: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  actionDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  noticeCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    gap: 12,
    alignItems: 'flex-start',
  },
  noticeText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
  },
});
