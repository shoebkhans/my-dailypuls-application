import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Appearance, Platform } from 'react-native';

export type Priority = 'low' | 'medium' | 'high';
export type Frequency = 'Daily' | 'Weekdays' | 'Weekly';
export type Mood = 1 | 2 | 3 | 4 | 5;
export type ThemeMode = 'system' | 'light' | 'dark';

export interface DailyTask {
  id: string;
  title: string;
  date: string;
  time: string;
  priority: Priority;
  done: boolean;
}

export interface Habit {
  id: string;
  title: string;
  frequency: Frequency;
  completedDates: string[];
}

export interface AppData {
  tasks: DailyTask[];
  habits: Habit[];
  moods: Record<string, Mood>;
  reflections: Record<string, string>;
  savedLessons: string[];
  learnedLessons: string[];
  theme: ThemeMode;
  reminderEnabled: boolean;
  reminderHour: number;
  reminderMinute: number;
}

const STORAGE_KEY = 'dailypulse:v1';

export function dateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

const initialData: AppData = {
  tasks: [],
  habits: [],
  moods: {},
  reflections: {},
  savedLessons: [],
  learnedLessons: [],
  theme: 'system',
  reminderEnabled: false,
  reminderHour: 20,
  reminderMinute: 0,
};

interface DailyPulseContextValue {
  data: AppData;
  ready: boolean;
  storageError: boolean;
  addTask: (input: Omit<DailyTask, 'id' | 'done'>) => void;
  updateTask: (task: DailyTask) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  addHabit: (title: string, frequency: Frequency) => void;
  updateHabit: (habit: Habit) => void;
  toggleHabit: (id: string, date?: string) => void;
  deleteHabit: (id: string) => void;
  setMood: (date: string, mood: Mood) => void;
  saveReflection: (date: string, text: string) => void;
  toggleLessonSaved: (lessonId: string) => void;
  toggleLessonLearned: (lessonId: string) => void;
  setTheme: (theme: ThemeMode) => void;
  setReminder: (enabled: boolean, hour?: number, minute?: number) => void;
  clearAll: () => Promise<void>;
}

const DailyPulseContext = createContext<DailyPulseContextValue | null>(null);

export function DailyPulseProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(initialData);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState(false);

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!mounted) return;
        if (raw) {
          const parsed = JSON.parse(raw) as Partial<AppData>;
          setData({ ...initialData, ...parsed });
        }
      })
      .catch(() => {
        if (mounted) setStorageError(true);
      })
      .finally(() => {
        if (mounted) setReady(true);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data)).catch(() =>
      setStorageError(true),
    );
  }, [data, ready]);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      Appearance.setColorScheme(data.theme === 'system' ? 'unspecified' : data.theme);
    }
  }, [data.theme]);

  const addTask = useCallback(
    (input: Omit<DailyTask, 'id' | 'done'>) =>
      setData((current) => ({
        ...current,
        tasks: [...current.tasks, { ...input, id: makeId(), done: false }],
      })),
    [],
  );
  const updateTask = useCallback(
    (task: DailyTask) =>
      setData((current) => ({
        ...current,
        tasks: current.tasks.map((item) => (item.id === task.id ? task : item)),
      })),
    [],
  );
  const toggleTask = useCallback(
    (id: string) =>
      setData((current) => ({
        ...current,
        tasks: current.tasks.map((task) =>
          task.id === id ? { ...task, done: !task.done } : task,
        ),
      })),
    [],
  );
  const deleteTask = useCallback(
    (id: string) =>
      setData((current) => ({
        ...current,
        tasks: current.tasks.filter((task) => task.id !== id),
      })),
    [],
  );
  const addHabit = useCallback(
    (title: string, frequency: Frequency) =>
      setData((current) => ({
        ...current,
        habits: [
          ...current.habits,
          { id: makeId(), title, frequency, completedDates: [] },
        ],
      })),
    [],
  );
  const updateHabit = useCallback(
    (habit: Habit) =>
      setData((current) => ({
        ...current,
        habits: current.habits.map((item) =>
          item.id === habit.id ? habit : item,
        ),
      })),
    [],
  );
  const toggleHabit = useCallback((id: string, date = dateKey()) => {
    setData((current) => ({
      ...current,
      habits: current.habits.map((habit) => {
        if (habit.id !== id) return habit;
        const complete = habit.completedDates.includes(date);
        return {
          ...habit,
          completedDates: complete
            ? habit.completedDates.filter((entry) => entry !== date)
            : [...habit.completedDates, date],
        };
      }),
    }));
  }, []);
  const deleteHabit = useCallback(
    (id: string) =>
      setData((current) => ({
        ...current,
        habits: current.habits.filter((habit) => habit.id !== id),
      })),
    [],
  );
  const setMood = useCallback(
    (date: string, mood: Mood) =>
      setData((current) => ({
        ...current,
        moods: { ...current.moods, [date]: mood },
      })),
    [],
  );
  const saveReflection = useCallback((date: string, text: string) => {
    setData((current) => {
      const reflections = { ...current.reflections };
      if (text.trim()) reflections[date] = text.trim();
      else delete reflections[date];
      return { ...current, reflections };
    });
  }, []);
  const toggleLessonSaved = useCallback((lessonId: string) => {
    setData((current) => ({
      ...current,
      savedLessons: current.savedLessons.includes(lessonId)
        ? current.savedLessons.filter((item) => item !== lessonId)
        : [...current.savedLessons, lessonId],
    }));
  }, []);
  const toggleLessonLearned = useCallback((lessonId: string) => {
    setData((current) => ({
      ...current,
      learnedLessons: current.learnedLessons.includes(lessonId)
        ? current.learnedLessons.filter((item) => item !== lessonId)
        : [...current.learnedLessons, lessonId],
    }));
  }, []);
  const setTheme = useCallback(
    (theme: ThemeMode) => setData((current) => ({ ...current, theme })),
    [],
  );
  const setReminder = useCallback(
    (enabled: boolean, hour?: number, minute?: number) =>
      setData((current) => ({
        ...current,
        reminderEnabled: enabled,
        reminderHour: hour ?? current.reminderHour,
        reminderMinute: minute ?? current.reminderMinute,
      })),
    [],
  );
  const clearAll = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      setStorageError(false);
      setData(initialData);
    } catch {
      setStorageError(true);
      throw new Error('Could not clear saved data from this device.');
    }
  }, []);

  const value = useMemo(
    () => ({
      data,
      ready,
      storageError,
      addTask,
      updateTask,
      toggleTask,
      deleteTask,
      addHabit,
      updateHabit,
      toggleHabit,
      deleteHabit,
      setMood,
      saveReflection,
      toggleLessonSaved,
      toggleLessonLearned,
      setTheme,
      setReminder,
      clearAll,
    }),
    [
      data,
      ready,
      storageError,
      addTask,
      updateTask,
      toggleTask,
      deleteTask,
      addHabit,
      updateHabit,
      toggleHabit,
      deleteHabit,
      setMood,
      saveReflection,
      toggleLessonSaved,
      toggleLessonLearned,
      setTheme,
      setReminder,
      clearAll,
    ],
  );

  return (
    <DailyPulseContext.Provider value={value}>
      {children}
    </DailyPulseContext.Provider>
  );
}

export function useDailyPulse() {
  const context = useOptionalDailyPulse();
  if (!context) {
    throw new Error('useDailyPulse must be used inside DailyPulseProvider.');
  }
  return context;
}

export function useOptionalDailyPulse() {
  return useContext(DailyPulseContext);
}

export { initialData };
