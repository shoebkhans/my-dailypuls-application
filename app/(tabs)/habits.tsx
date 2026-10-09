import React, { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { ActionButton, AppPage, Card, IconButton, PageHeading, ProgressTrack, SectionTitle } from '@/components/ui';
import { EntryModal } from '@/components/EntryModal';
import { dateKey, Frequency, Habit, useDailyPulse } from '@/context/DailyPulseContext';
import { habitWeekCount } from '@/utils/metrics';
import { useColors } from '@/hooks/useColors';

export default function HabitsScreen() {
  const colors = useColors();
  const { data, addHabit, updateHabit, toggleHabit, deleteHabit } = useDailyPulse();
  const today = dateKey();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Habit | null>(null);
  const completeCount = useMemo(
    () => data.habits.filter((habit) => habit.completedDates.includes(today)).length,
    [data.habits, today],
  );

  const confirmDelete = (habit: Habit) =>
    Alert.alert('Remove this habit?', habit.title, [
      { text: 'Keep it', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => deleteHabit(habit.id) },
    ]);

  return (
    <>
      <AppPage>
        <PageHeading
          eyebrow="YOUR ROUTINES"
          title="Good things, repeated."
          subtitle="A missed day is a pause, not a reset."
          right={
            <IconButton
              icon="plus"
              label="Add a habit"
              testID="add-habit"
              onPress={() => {
                setEditing(null);
                setModalOpen(true);
              }}
            />
          }
        />

        <Card style={[styles.weekCard, { backgroundColor: colors.accent }]}>
          <View style={styles.weekHeader}>
            <View style={{ flex: 1, gap: 6 }}>
              <Text style={[styles.smallCaps, { color: colors.accentForeground }]}>
                TODAY
              </Text>
              <Text style={[styles.weekTitle, { color: colors.foreground }]}>
                {data.habits.length
                  ? `${completeCount} of ${data.habits.length} checked in`
                  : 'Build a rhythm that fits.'}
              </Text>
            </View>
            <View style={[styles.countCircle, { backgroundColor: colors.card }]}>
              <Text style={[styles.countText, { color: colors.success }]}>
                {data.habits.length ? Math.round((completeCount / data.habits.length) * 100) : 0}%
              </Text>
            </View>
          </View>
          <ProgressTrack
            value={data.habits.length ? (completeCount / data.habits.length) * 100 : 0}
            color={colors.success}
          />
          <Text style={[styles.weekCaption, { color: colors.mutedForeground }]}>
            Habits work best when they’re small enough to repeat.
          </Text>
        </Card>

        <View style={styles.sectionBlock}>
          <SectionTitle title="Your habits" />
          {data.habits.length ? (
            data.habits.map((habit) => {
              const isDone = habit.completedDates.includes(today);
              const timesThisWeek = habitWeekCount(habit);
              return (
                <Card key={habit.id} style={styles.habitCard}>
                  <Pressable
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: isDone }}
                    accessibilityLabel={`${isDone ? 'Undo' : 'Mark complete'} ${habit.title}`}
                    testID={`complete-habit-${habit.id}`}
                    onPress={() => {
                      Haptics.selectionAsync().catch(() => undefined);
                      toggleHabit(habit.id);
                    }}
                    style={[
                      styles.checkCircle,
                      {
                        backgroundColor: isDone ? colors.success : colors.secondary,
                        borderColor: isDone ? colors.success : colors.border,
                      },
                    ]}
                  >
                    <Feather
                      name={isDone ? 'check' : 'sun'}
                      size={18}
                      color={isDone ? colors.primaryForeground : colors.secondaryForeground}
                    />
                  </Pressable>
                  <View style={{ flex: 1, gap: 5 }}>
                    <Text style={[styles.habitTitle, { color: colors.foreground }]}>
                      {habit.title}
                    </Text>
                    <Text style={[styles.habitMeta, { color: colors.mutedForeground }]}>
                      {habit.frequency} · {timesThisWeek} {timesThisWeek === 1 ? 'check-in' : 'check-ins'} this week
                    </Text>
                  </View>
                  <IconButton
                    icon="edit-2"
                    label={`Edit ${habit.title}`}
                    onPress={() => {
                      setEditing(habit);
                      setModalOpen(true);
                    }}
                  />
                  <IconButton
                    icon="more-horizontal"
                    color={colors.mutedForeground}
                    label={`Remove ${habit.title}`}
                    onPress={() => confirmDelete(habit)}
                  />
                </Card>
              );
            })
          ) : (
            <Card style={styles.emptyCard}>
              <View style={[styles.emptyIcon, { backgroundColor: colors.secondary }]}>
                <Feather name="repeat" size={22} color={colors.secondaryForeground} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
                Start with one small habit
              </Text>
              <Text style={[styles.emptyCopy, { color: colors.mutedForeground }]}>
                Choose something that takes a few minutes and feels useful to you.
              </Text>
              <ActionButton
                label="Create your first habit"
                icon="plus"
                onPress={() => setModalOpen(true)}
                testID="empty-add-habit"
              />
            </Card>
          )}
        </View>

        {data.habits.length > 0 ? (
          <Card style={styles.tipCard}>
            <Feather name="wind" size={18} color={colors.success} />
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={[styles.tipTitle, { color: colors.foreground }]}>Keep the bar kind</Text>
              <Text style={[styles.emptyCopy, { color: colors.mutedForeground }]}>
                A habit is a practice, not a pass-or-fail test. You can change or remove it any time.
              </Text>
            </View>
          </Card>
        ) : null}
      </AppPage>
      <EntryModal
        visible={modalOpen}
        mode="habit"
        initialTitle={editing?.title}
        initialFrequency={editing?.frequency}
        onClose={() => setModalOpen(false)}
        onSave={(value) => {
          if (editing) {
            updateHabit({ ...editing, title: value.title, frequency: value.frequency });
          } else {
            addHabit(value.title, value.frequency as Frequency);
          }
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
            () => undefined,
          );
          setModalOpen(false);
          setEditing(null);
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  weekCard: { gap: 14, borderColor: 'transparent', padding: 20 },
  weekHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  smallCaps: { fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.3 },
  weekTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 18, lineHeight: 24 },
  countCircle: { width: 54, height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center' },
  countText: { fontFamily: 'Inter_700Bold', fontSize: 13 },
  weekCaption: { fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 18 },
  sectionBlock: { gap: 14 },
  habitCard: { flexDirection: 'row', alignItems: 'center', gap: 9, padding: 14 },
  checkCircle: { width: 42, height: 42, borderRadius: 16, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  habitTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 14, lineHeight: 19 },
  habitMeta: { fontFamily: 'Inter_400Regular', fontSize: 11 },
  emptyCard: { alignItems: 'center', paddingVertical: 26, gap: 11 },
  emptyIcon: { width: 48, height: 48, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 15, textAlign: 'center' },
  emptyCopy: { fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 18 },
  tipCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 11, backgroundColor: 'transparent', borderColor: 'transparent', paddingHorizontal: 2 },
  tipTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
});
