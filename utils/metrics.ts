import { AppData, Habit, dateKey } from '@/context/DailyPulseContext';

export function scoreForDay(data: AppData, date: string): number {
  const tasks = data.tasks.filter((task) => task.date === date);
  const habits = data.habits;
  const taskScore = tasks.length
    ? (tasks.filter((task) => task.done).length / tasks.length) * 40
    : 0;
  const habitScore = habits.length
    ? (habits.filter((habit) => habit.completedDates.includes(date)).length / habits.length) * 40
    : 0;
  const checkInScore = data.moods[date] ? 20 : 0;
  return Math.round(taskScore + habitScore + checkInScore);
}

export function habitWeekCount(habit: Habit, date = dateKey()): number {
  const today = new Date(`${date}T12:00:00`);
  const start = new Date(today);
  start.setDate(today.getDate() - 6);
  return habit.completedDates.filter((entry) => {
    const day = new Date(`${entry}T12:00:00`);
    return day >= start && day <= today;
  }).length;
}

export function dayLabel(date: string): string {
  const day = new Date(`${date}T12:00:00`);
  return day.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export function weekDates(end = new Date()): string[] {
  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(end);
    day.setDate(end.getDate() - (6 - index));
    return dateKey(day);
  });
}
