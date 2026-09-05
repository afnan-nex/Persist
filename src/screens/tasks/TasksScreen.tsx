import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Task, Category } from '../../types';
import {
  getCategories,
  getTasks,
  upsertTask,
  toggleTaskStatus,
  deleteTask,
  deleteCompletedTasks,
  updateTaskIndexes,
  upsertCategory,
  deleteCategory,
  updateCategoryIndexes,
} from '../../data/taskRepository';
import { useTheme } from '../../theme/ThemeContext';
import { TopAppBar, FloatingActionButton } from '../../components/m3';
import { EmptyState } from '../../components/common/EmptyState';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { CategoryChips } from '../../components/tasks/CategoryChips';
import { TaskCard } from '../../components/tasks/TaskCard';
import { TaskUpsertModal } from '../../components/tasks/TaskUpsertModal';
import { CategoryManageModal } from '../../components/tasks/CategoryManageModal';

export const TasksScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { colors, appSettings, setAppSettings, fontFamily } = useTheme();

  const [categories, setCategories] = useState<Category[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isReorderMode, setIsReorderMode] = useState(false);

  // Modals & Dialogs
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showCleanDialog, setShowCleanDialog] = useState(false);
  const [showDeleteTaskDialog, setShowDeleteTaskDialog] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [cats, tks] = await Promise.all([getCategories(), getTasks()]);
      setCategories(cats);
      setTasks(tks);
    } catch (error) {
      console.error('Failed to load tasks data:', error);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  const handleToggleStatus = async (task: Task) => {
    await toggleTaskStatus(task.id, !task.status);
    await loadData();
  };

  const handleSaveTask = async (taskData: {
    id?: number;
    categoryId: number;
    title: string;
    reminder: number | null;
    status?: boolean;
  }) => {
    await upsertTask(taskData);
    await loadData();
  };

  const handleDeleteTask = async () => {
    if (taskToDelete) {
      await deleteTask(taskToDelete.id);
      setTaskToDelete(null);
      setShowDeleteTaskDialog(false);
      await loadData();
    }
  };

  const handleCleanCompleted = async () => {
    await deleteCompletedTasks();
    setShowCleanDialog(false);
    await loadData();
  };

  // Reordering tasks
  const handleMoveTask = async (index: number, direction: 'up' | 'down') => {
    const currentList = [...filteredActiveTasks];
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= currentList.length) return;

    const temp = currentList[index];
    currentList[index] = currentList[target];
    currentList[target] = temp;

    await updateTaskIndexes(currentList);
    await loadData();
  };

  // Category management handlers
  const handleAddCategory = async (name: string, color: string) => {
    await upsertCategory({ name, color, index: categories.length });
    await loadData();
  };

  const handleDeleteCategory = async (cat: Category) => {
    const success = await deleteCategory(cat.id);
    if (success) {
      if (selectedCategoryId === cat.id) {
        setSelectedCategoryId(null);
      }
      await loadData();
    }
  };

  const handleReorderCategories = async (reordered: Category[]) => {
    await updateCategoryIndexes(reordered);
    await loadData();
  };

  // Filter tasks
  const filteredTasks = selectedCategoryId
    ? tasks.filter((t) => t.categoryId === selectedCategoryId)
    : tasks;

  const activeTasks = filteredTasks.filter((t) => !t.status);
  const completedTasks = filteredTasks.filter((t) => t.status);
  const filteredActiveTasks = activeTasks;

  const getCategoryForTask = (catId: number) => categories.find((c) => c.id === catId);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopAppBar
        title="Tasks"
        subtitle={`${activeTasks.length} pending`}
        actions={[
          {
            icon: isReorderMode ? 'check' : 'swap-vertical',
            color: isReorderMode ? colors.primary : colors.onSurface,
            onPress: () => setIsReorderMode(!isReorderMode),
            accessibilityLabel: 'Reorder tasks',
          },
          {
            icon: 'broom',
            onPress: () => setShowCleanDialog(true),
            accessibilityLabel: 'Clean completed tasks',
          },
        ]}
      />

      <CategoryChips
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={setSelectedCategoryId}
        onManageCategories={() => setShowCategoryModal(true)}
      />

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 90 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {filteredTasks.length === 0 ? (
          <EmptyState
            icon="checkbox-marked-circle-outline"
            title="All tasks completed!"
            description="You have no pending tasks. Tap the + button to create a new task."
            actionText="Add Task"
            onAction={() => {
              setTaskToEdit(null);
              setShowTaskModal(true);
            }}
          />
        ) : (
          <>
            {/* Active Tasks Section */}
            {activeTasks.length > 0 && (
              <View style={styles.section}>
                {activeTasks.map((t, idx) => (
                  <TaskCard
                    key={t.id}
                    task={t}
                    category={getCategoryForTask(t.categoryId)}
                    isReorderMode={isReorderMode}
                    is24Hr={appSettings.is24Hr}
                    onToggleStatus={handleToggleStatus}
                    onPress={(task) => {
                      setTaskToEdit(task);
                      setShowTaskModal(true);
                    }}
                    onDelete={(task) => {
                      setTaskToDelete(task);
                      setShowDeleteTaskDialog(true);
                    }}
                    onMoveUp={() => handleMoveTask(idx, 'up')}
                    onMoveDown={() => handleMoveTask(idx, 'down')}
                    canMoveUp={idx > 0}
                    canMoveDown={idx < activeTasks.length - 1}
                  />
                ))}
              </View>
            )}

            {/* Completed Tasks Section */}
            {completedTasks.length > 0 && (
              <View style={styles.section}>
                <View style={styles.completedHeader}>
                  <Text
                    style={[
                      styles.completedTitle,
                      { color: colors.onSurfaceVariant, fontFamily },
                    ]}
                  >
                    Completed ({completedTasks.length})
                  </Text>
                  <TouchableOpacity onPress={handleCleanCompleted}>
                    <Text
                      style={[
                        styles.cleanText,
                        { color: colors.primary, fontFamily },
                      ]}
                    >
                      Clear
                    </Text>
                  </TouchableOpacity>
                </View>

                {completedTasks.map((t) => (
                  <TaskCard
                    key={t.id}
                    task={t}
                    category={getCategoryForTask(t.categoryId)}
                    isReorderMode={false}
                    is24Hr={appSettings.is24Hr}
                    onToggleStatus={handleToggleStatus}
                    onPress={(task) => {
                      setTaskToEdit(task);
                      setShowTaskModal(true);
                    }}
                    onDelete={(task) => {
                      setTaskToDelete(task);
                      setShowDeleteTaskDialog(true);
                    }}
                  />
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <FloatingActionButton
        icon="plus"
        size="standard"
        colorVariant="primary"
        style={{
          position: 'absolute',
          right: 20,
          bottom: insets.bottom + 92,
        }}
        onPress={() => {
          setTaskToEdit(null);
          setShowTaskModal(true);
        }}
        accessibilityLabel="Add new task"
      />

      {/* Modals & Dialogs */}
      <TaskUpsertModal
        visible={showTaskModal}
        taskToEdit={taskToEdit}
        categories={categories}
        defaultCategoryId={selectedCategoryId || (categories[0]?.id ?? 1)}
        onSave={handleSaveTask}
        onDelete={(id) => {
          const t = tasks.find((item) => item.id === id);
          if (t) {
            setTaskToDelete(t);
            setShowDeleteTaskDialog(true);
          }
        }}
        onClose={() => {
          setShowTaskModal(false);
          setTaskToEdit(null);
        }}
      />

      <CategoryManageModal
        visible={showCategoryModal}
        categories={categories}
        onAddCategory={handleAddCategory}
        onDeleteCategory={handleDeleteCategory}
        onReorderCategories={handleReorderCategories}
        onClose={() => setShowCategoryModal(false)}
      />

      <ConfirmDialog
        visible={showCleanDialog}
        title="Clean Completed Tasks"
        message="Are you sure you want to permanently delete all completed tasks?"
        confirmText="Clean"
        isDestructive
        onConfirm={handleCleanCompleted}
        onCancel={() => setShowCleanDialog(false)}
      />

      <ConfirmDialog
        visible={showDeleteTaskDialog}
        title="Delete Task"
        message={`Are you sure you want to delete "${taskToDelete?.title}"?`}
        confirmText="Delete"
        isDestructive
        onConfirm={handleDeleteTask}
        onCancel={() => {
          setShowDeleteTaskDialog(false);
          setTaskToDelete(null);
        }}
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
    paddingTop: 8,
  },
  section: {
    marginBottom: 20,
  },
  completedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    marginTop: 8,
  },
  completedTitle: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cleanText: {
    fontSize: 13,
    fontWeight: '700',
  },
  fab: {
    position: 'absolute',
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
});
