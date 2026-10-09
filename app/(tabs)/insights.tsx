import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { AppPage, Card, IconButton, PageHeading, ProgressTrack, SectionTitle } from '@/components/ui';
import { dateKey, useDailyPulse } from '@/context/DailyPulseContext';
import { dayLabel, scoreForDay, weekDates } from '@/utils/metrics';
import { useColors } from '@/hooks/useColors';

function monthDays(year: number, month: number) {
  const firstWeekday = new Date(year, month, 1).getDay();
  const count = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = Array.from({ length: firstWeekday }, () => null);
  for (let day = 1; day <= count; day += 1) cells.push(day);
  while (cells.length % 7) cells.push(null);
  return cells;
}

function dateKeyFromParts(year: number, month: number, day: number) {
  return dateKey(new Date(year, month, day));
}

export default function InsightsScreen() {
  const colors = useColors();
  const { data } = useDailyPulse();
  const today = dateKey();
  const [selectedDate, setSelectedDate] = useState(today);
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const todayMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const cells = useMemo(
    () => monthDays(month.getFullYear(), month.getMonth()),
    [month],
  );
  const dates = weekDates();
  const completedTasks = data.tasks.filter((task) => task.done).length;
  const taskCompletion = data.tasks.length
    ? Math.round((completedTasks / data.tasks.length) * 100)
    : 0;
  const activeDays = Object.values(data.moods).length;
  const reflectionCount = Object.keys(data.reflections).length;
  const selectedTasks = data.tasks.filter((task) => task.date === selectedDate);
  const selectedHabits = data.habits.filter((habit) =>
    habit.completedDates.includes(selectedDate),
  );
  const selectedMood = data.moods[selectedDate];
  const monthTitle = month.toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });
  const canMoveForward = month < todayMonth;

  return (
    <AppPage>
      <PageHeading
        eyebrow="YOUR PROGRESS"
        title="Notice the little wins."
        subtitle="A few gentle signals, not a scorecard."
      />

      <View style={styles.statsGrid}>
        <Card style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: colors.warm }]}>
            <Feather name="check" size={16} color={colors.primary} />
          </View>
          <Text style={[styles.statValue, { color: colors.foreground }]}>{taskCompletion}%</Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
            tasks finished
          </Text>
        </Card>
        <Card style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: colors.secondary }]}>
            <Feather name="activity" size={16} color={colors.success} />
          </View>
          <Text style={[styles.statValue, { color: colors.foreground }]}>{activeDays}</Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
            mood check-ins
          </Text>
        </Card>
        <Card style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: colors.accent }]}>
            <Feather name="book-open" size={16} color={colors.accentForeground} />
          </View>
          <Text style={[styles.statValue, { color: colors.foreground }]}>{reflectionCount}</Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
            reflections saved
          </Text>
        </Card>
      </View>

      <View style={styles.sectionBlock}>
        <SectionTitle
          title="Your calendar"
          action={
            <View style={styles.monthControls}>
              <IconButton
                icon="chevron-left"
                label="Previous month"
                onPress={() =>
                  setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))
                }
              />
              {canMoveForward ? (
                <IconButton
                  icon="chevron-right"
                  label="Next month"
                  onPress={() =>
                    setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))
                  }
                />
              ) : null}
            </View>
          }
        />
        <Card style={styles.calendarCard}>
          <Text style={[styles.monthTitle, { color: colors.foreground }]}>{monthTitle}</Text>
          <View style={styles.calendarGrid}>
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((label, index) => (
              <Text
                key={`${label}-${index}`}
                style={[styles.weekday, { color: colors.mutedForeground }]}
              >
                {label}
              </Text>
            ))}
            {cells.map((day, index) => {
              if (day === null) return <View key={`blank-${index}`} style={styles.dayCell} />;
              const key = dateKeyFromParts(month.getFullYear(), month.getMonth(), day);
              const score = scoreForDay(data, key);
              const isSelected = selectedDate === key;
              const isToday = key === today;
              const hasActivity =
                score > 0 ||
                Boolean(data.reflections[key]) ||
                data.tasks.some((task) => task.date === key);
              return (
                <Pressable
                  key={key}
                  accessibilityRole="button"
                  accessibilityLabel={`${dayLabel(key)}${hasActivity ? `, ${score} day score` : ''}`}
                  accessibilityState={{ selected: isSelected }}
                  testID={`calendar-day-${key}`}
                  onPress={() => setSelectedDate(key)}
                  style={[
                    styles.dayCell,
                    styles.dayButton,
                    {
                      backgroundColor: isSelected ? colors.foreground : 'transparent',
                      borderColor: isToday && !isSelected ? colors.primary : 'transparent',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.dayNumber,
                      {
                        color: isSelected
                          ? colors.card
                          : isToday
                            ? colors.primary
                            : colors.foreground,
                      },
                    ]}
                  >
                    {day}
                  </Text>
                  {hasActivity ? (
                    <View
                      style={[
                        styles.dayDot,
                        {
                          backgroundColor: isSelected
                            ? colors.card
                            : score >= 60
                              ? colors.success
                              : colors.primary,
                        },
                      ]}
                    />
                  ) : null}
                </Pressable>
              );
            })}
          </View>
          <View style={[styles.selectedDayPanel, { backgroundColor: colors.background }]}>
            <View style={{ flex: 1, gap: 3 }}>
              <Text style={[styles.selectedDate, { color: colors.foreground }]}>
                {selectedDate === today ? 'Today' : dayLabel(selectedDate)}
              </Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
                {selectedTasks.filter((task) => task.done).length}/{selectedTasks.length} tasks
                {selectedHabits.length ? ` · ${selectedHabits.length} habits` : ''}
                {selectedMood ? ' · mood checked in' : ''}
              </Text>
            </View>
            <View style={[styles.scorePill, { backgroundColor: colors.accent }]}>
              <Text style={[styles.scorePillText, { color: colors.accentForeground }]}>
                {scoreForDay(data, selectedDate)}
              </Text>
            </View>
          </View>
        </Card>
        <View style={styles.legend}>
          <View style={[styles.dayDot, { backgroundColor: colors.success }]} />
          <Text style={[styles.legendText, { color: colors.mutedForeground }]}>
            Some things showed up
          </Text>
          <View style={[styles.dayDot, { backgroundColor: colors.primary, marginLeft: 12 }]} />
          <Text style={[styles.legendText, { color: colors.mutedForeground }]}>
            A check-in or a note
          </Text>
        </View>
      </View>

      <View style={styles.sectionBlock}>
        <SectionTitle title="This past week" />
        <Card style={styles.weekCard}>
          {dates.map((date) => {
            const score = scoreForDay(data, date);
            const active = date === today;
            const shortName = new Date(`${date}T12:00:00`).toLocaleDateString(undefined, {
              weekday: 'short',
            });
            return (
              <View key={date} style={styles.weekDay}>
                <Text style={[styles.weekValue, { color: colors.foreground }]}>
                  {score ? score : '–'}
                </Text>
                <View style={[styles.weekBar, { backgroundColor: colors.muted }]}>
                  <View
                    style={[
                      styles.weekFill,
                      {
                        height: `${Math.max(score, 5)}%`,
                        backgroundColor: active ? colors.primary : colors.success,
                      },
                    ]}
                  />
                </View>
                <Text
                  style={[
                    styles.weekLabel,
                    { color: active ? colors.primary : colors.mutedForeground },
                  ]}
                >
                  {shortName}
                </Text>
              </View>
            );
          })}
        </Card>
      </View>

      <Card style={styles.formulaCard}>
        <View style={[styles.formulaIcon, { backgroundColor: colors.secondary }]}>
          <Feather name="sliders" size={17} color={colors.secondaryForeground} />
        </View>
        <View style={{ flex: 1, gap: 5 }}>
          <Text style={[styles.formulaTitle, { color: colors.foreground }]}>
            How your Day Score works
          </Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
            Completed tasks (40%) + completed habits (40%) + checking in with your mood (20%). Mood
            itself is never graded. An empty category earns no points.
          </Text>
        </View>
      </Card>
    </AppPage>
  );
}

const styles = StyleSheet.create({
  statsGrid: { flexDirection: 'row', gap: 9 },
  statCard: { flex: 1, minWidth: 0, padding: 12, gap: 6 },
  statIcon: { width: 30, height: 30, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  statValue: { fontFamily: 'Inter_700Bold', fontSize: 21, letterSpacing: -0.5 },
  statLabel: { fontFamily: 'Inter_400Regular', fontSize: 10, lineHeight: 15 },
  sectionBlock: { gap: 13 },
  monthControls: { flexDirection: 'row', gap: 7 },
  calendarCard: { gap: 12 },
  monthTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  weekday: { width: `${100 / 7}%`, textAlign: 'center', fontFamily: 'Inter_600SemiBold', fontSize: 10, paddingBottom: 6 },
  dayCell: { width: `${100 / 7}%`, height: 40, alignItems: 'center', justifyContent: 'center' },
  dayButton: { borderWidth: 1, borderRadius: 14, gap: 2 },
  dayNumber: { fontFamily: 'Inter_500Medium', fontSize: 12 },
  dayDot: { width: 4, height: 4, borderRadius: 2 },
  selectedDayPanel: { borderRadius: 15, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 2 },
  selectedDate: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  scorePill: { width: 34, height: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  scorePillText: { fontFamily: 'Inter_700Bold', fontSize: 12 },
  legend: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 5, marginTop: -4 },
  legendText: { fontFamily: 'Inter_400Regular', fontSize: 9 },
  weekCard: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', paddingHorizontal: 14, paddingTop: 17, paddingBottom: 12 },
  weekDay: { alignItems: 'center', flex: 1, gap: 5, height: 102, justifyContent: 'flex-end' },
  weekValue: { height: 13, fontFamily: 'Inter_500Medium', fontSize: 9 },
  weekBar: { width: 14, height: 58, borderRadius: 6, justifyContent: 'flex-end', overflow: 'hidden' },
  weekFill: { width: '100%', borderRadius: 6 },
  weekLabel: { fontFamily: 'Inter_500Medium', fontSize: 9 },
  formulaCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 11 },
  formulaIcon: { width: 35, height: 35, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  formulaTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
});
