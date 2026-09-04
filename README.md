# Persist

A privacy-focused, distraction-free habit tracking and task management application built in **React Native** for **Android**, engineered with Material 3 Expressive aesthetics, offline-first persistence, and zero tracking.

---

## Features

### 1. Task Management
- **Category Filtering**: Organize tasks into custom categories with customized colors. Default `"Misc"` category provided out-of-the-box.
- **Task Scheduling & Alarms**: Single-shot exact device alarm reminders with customizable date and time.
- **Completion & Cleaning**: Strike-through animations, completed tasks counter, and one-tap "Clean completed tasks" dialog.
- **Reordering Mode**: Easily reorder tasks within categories.
- **Category Management**: Add, color-code, and reorder categories with safety checks to protect your data.

### 2. Habit Tracking
- **Interactive Daily Streaks**: Current streak and best streak calculations matching the audited Grit mathematical algorithms.
- **Embedded Week Strip**: 7-day horizontal calendar with connected capsule shapes for contiguous streak days. Tap any day in the current week to toggle completion.
- **Custom Schedules**: Schedule habits for specific days of the week (with "All Days" and "Weekdays" quick presets).
- **Daily Reminders**: Configurable daily alarm notifications for each habit.
- **Habit Reordering**: Customize the visual order of habits on your dashboard.

### 3. Comprehensive Analytics
- **Individual Habit Analytics**:
  - Consistency percentage calculated as `completed / eligible` since first check-in.
  - "Started X days ago" duration tracker.
  - 12-month GitHub-style contribution heatmap (52 weeks × 7 days).
  - Weekly comparison bar chart with peak week highlighting (2M, 4M, 6M, 1Y period filters).
  - Weekday breakdown distribution (Mon–Sun).
- **Overall Analytics**:
  - Aggregate consistency across all habits.
  - Top 3 habits leaderboard with Gold, Silver, and Bronze rankings.
  - 12-month aggregate intensity heatmap.
  - Tap any day on the heatmap to open the drill-down bottom sheet and see the exact habits completed on that date.

### 4. Look and Feel (Material 3)
- **Theme Modes**: System Default, Light, Dark, and AMOLED Pure Black (`#000000`).
- **Dynamic Palette Styles**: Tonal Spot, Spritz, Vibrant, Expressive, Rainbow, and Fruit Salad.
- **Seed Colors**: 9 curated Material 3 seed colors (Indigo, Blue, Teal, Emerald, Amber, Orange, Rose, Purple, Cyan) plus custom Hex color picker.
- **Custom Typography**: System Default, Rounded/Medium, Monospace, and Serif.

### 5. Privacy & Security
- **Biometric Lock**: Protect app access with fingerprint or device PIN using local authentication hardware.
- **100% Offline**: SQLite database running locally on your device. Zero telemetry, zero analytics tracking, no external server requirements.
- **JSON Backup & Restore**: Full interoperability with Grit Schema Version 5. Export and restore backups at any time.

---

## Project Structure

```
Persist/
├── android/                 # Native Android Gradle project
├── assets/                  # Icons and splash images
├── src/
│   ├── types/               # Domain interfaces, schemas, enums
│   ├── data/
│   │   ├── database.ts          # SQLite schema setup & migrations
│   │   ├── calculations.ts      # Streak, consistency, and heatmap algorithms
│   │   ├── taskRepository.ts    # Tasks & Categories CRUD
│   │   ├── habitRepository.ts   # Habits & HabitStatus CRUD & analytics
│   │   ├── settingsDatastore.ts # Persistent app preferences
│   │   ├── themeDatastore.ts    # Persistent theme & appearance
│   │   └── backupRepository.ts  # JSON Export/Import engine
│   ├── services/
│   │   ├── notifications.ts     # Local exact alarm scheduler
│   │   └── biometrics.ts        # Local biometric authentication
│   ├── theme/
│   │   ├── colors.ts            # Material 3 color generation & presets
│   │   └── ThemeContext.tsx     # Dynamic theme & settings React Context
│   ├── components/
│   │   ├── common/              # AppHeader, EmptyState, ConfirmDialog, Pickers
│   │   ├── tasks/               # TaskCard, CategoryChips, Modals
│   │   └── habits/              # HabitCard, WeekStrip, HeatMap, Charts
│   ├── screens/
│   │   ├── tasks/               # TasksScreen
│   │   ├── habits/              # HabitsScreen, HabitAnalytics, OverallAnalytics
│   │   └── settings/            # SettingsScreen, LookAndFeel, Backup, About, Support
│   └── navigation/
│       └── RootNavigator.tsx    # BottomTabs & Native Stack Navigation
├── App.tsx                  # Root component with providers
├── app.json                 # Expo configuration & Android permissions
└── package.json             # Dependencies
```

---

## Running the Project

### Start Development Server
```bash
npx expo start
```

### Run on Android
```bash
npx expo run:android
```
or via Gradle directly:
```bash
cd android
./gradlew assembleDebug
```

---

## License
Persist is free and open-source software licensed under the GNU General Public License v3.0.
