export type DayOfWeek =
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY'
  | 'SUNDAY';

export const ALL_DAYS_OF_WEEK: DayOfWeek[] = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
];

export const SHORT_DAY_NAMES: Record<DayOfWeek, string> = {
  MONDAY: 'Mon',
  TUESDAY: 'Tue',
  WEDNESDAY: 'Wed',
  THURSDAY: 'Thu',
  FRIDAY: 'Fri',
  SATURDAY: 'Sat',
  SUNDAY: 'Sun',
};

export const SINGLE_CHAR_DAYS: Record<DayOfWeek, string> = {
  MONDAY: 'M',
  TUESDAY: 'T',
  WEDNESDAY: 'W',
  THURSDAY: 'T',
  FRIDAY: 'F',
  SATURDAY: 'S',
  SUNDAY: 'S',
};

export interface Category {
  id: number;
  name: string;
  index: number;
  color: string;
}

export interface Task {
  id: number;
  categoryId: number;
  title: string;
  status: boolean;
  index: number;
  reminder: number | null; // epoch timestamp in ms
}

export interface Habit {
  id: number;
  title: string;
  description: string;
  index: number;
  days: DayOfWeek[];
  time: number; // minutes from midnight (0 to 1439) or timestamp
  reminder: boolean;
}

export interface HabitStatus {
  id: number;
  habitId: number;
  date: number; // epoch days (days since Jan 1 1970 UTC)
}

export interface HabitRanking {
  title: string;
  consistency: number;
}

export interface HabitWithAnalytics {
  habit: Habit;
  consistency: number;
  statuses: HabitStatus[];
  weeklyComparisonData: number[];
  weekDayFrequencyData: Record<string, number>;
  currentStreak: number;
  bestStreak: number;
  startedDaysAgo: number;
}

export interface OverallAnalytics {
  heatMapData: Record<number, number>; // epochDay -> completion count
  weekDayFrequencyData: Record<string, number>;
  consistency: number;
  topHabits: HabitRanking[];
}

export type AppThemeMode = 'SYSTEM' | 'LIGHT' | 'DARK' | 'AMOLED';
export type PaletteStyle =
  | 'TONAL_SPOT'
  | 'SPRITZ'
  | 'VIBRANT'
  | 'EXPRESSIVE'
  | 'RAINBOW'
  | 'FRUIT_SALAD';
export type AppFont = 'SYSTEM' | 'MONOSPACE' | 'SERIF' | 'ROUNDED';
export type StartingPage = 'tasks' | 'habits';

export interface AppSettings {
  startOfWeek: DayOfWeek;
  startingPage: StartingPage;
  is24Hr: boolean;
  notificationsEnabled: boolean;
  biometricLock: boolean;
  taskReorder: boolean;
  compactView: boolean;
  lastChangelogShown: string;
}

export interface AppThemeSettings {
  themeMode: AppThemeMode;
  seedColor: string;
  paletteStyle: PaletteStyle;
  amoled: boolean;
  useMaterialYou: boolean;
  font: AppFont;
}

// Backup Export/Import schemas matching Grit version 5
export interface ExportSchema {
  tasksSchemaVersion: number;
  habitsSchemaVersion: number;
  habits: HabitSchema[];
  habitStatus: HabitStatusSchema[];
  tasks: TaskSchema[];
  categories: CategorySchema[];
}

export interface HabitSchema {
  id: number;
  title: string;
  description: string;
  index: number;
  time: number; // epoch ms
  days: string; // comma-separated e.g. "MONDAY,TUESDAY"
  reminder: boolean;
}

export interface HabitStatusSchema {
  id: number;
  habitId: number;
  date: number; // epoch days
}

export interface TaskSchema {
  id: number;
  categoryId: number;
  title: string;
  status: boolean;
  index: number;
  reminder: number | null; // epoch seconds
}

export interface CategorySchema {
  id: number;
  name: string;
  index: number;
  color: string;
}
