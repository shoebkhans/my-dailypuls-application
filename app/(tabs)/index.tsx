import React, { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Svg, { Circle } from 'react-native-svg';
import {
  ActionButton,
  AppPage,
  Card,
  IconButton,
  PageHeading,
  ProgressTrack,
  SectionTitle,
} from '@/components/ui';
import { EntryModal } from '@/components/EntryModal';
import { dateKey, DailyTask, useDailyPulse } from '@/context/DailyPulseContext';
import { lessonForDay } from '@/data/lessons';
import { scoreForDay } from '@/utils/metrics';
import { useColors } from '@/hooks/useColors';

function TaskRow({
  task,
  onToggle,
  onEdit,
  onDelete,
}: {
  task: DailyTask;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const colors = useColors();
  const priorityColor =
    task.priority === 'high'
      ? colors.primary
      : task.priority === 'medium'
        ? colors.success
        : colors.mutedForeground;
  return (
    <View style={[styles.taskRow, { borderBottomColor: colors.border }]}>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: task.done }}
        accessibilityLabel={`${task.done ? 'Mark incomplete' : 'Complete'} ${task.title}`}
        testID={`complete-task-${task.id}`}
        onPress={() => {
          Haptics.selectionAsync().catch(() => undefined);
          onToggle();
        }}
        style={[
          styles.check,
          {
            borderColor: task.done ? colors.success : colors.border,
            backgroundColor: task.done ? colors.success : 'transparent',
          },
        ]}
      >
        {task.done ? <Feather name="check" size={15} color={colors.primaryForeground} /> : null}
      </Pressable>
      <View style={{ flex: 1, gap: 5 }}>
        <Text
          numberOfLines={2}
          style={[
            styles.taskText,
            { color: task.done ? colors.mutedForeground : colors.foreground },
            task.done && styles.completedText,
          ]}
        >
          {task.title}
        </Text>
        <View style={styles.taskMeta}>
          {task.time ? (
            <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
              {task.time}
            </Text>
          ) : null}
          <View style={[styles.priorityDot, { backgroundColor: priorityColor }]} />
          <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
            {task.priority}
          </Text>
        </View>
      </View>
      <IconButton icon="edit-2" label={`Edit ${task.title}`} onPress={onEdit} />
      <IconButton
        icon="x"
        color={colors.mutedForeground}
        label={`Delete ${task.title}`}
        onPress={onDelete}
      />
    </View>
  );
}

export default function TodayScreen() {
  const colors = useColors();
  const { data, ready, addTask, updateTask, toggleTask, deleteTask } = useDailyPulse();
  const today = dateKey();
  const todaysTasks = useMemo(
    () => data.tasks.filter((task) => task.date === today),
    [data.tasks, today],
  );
  const completed = todaysTasks.filter((task) => task.done).length;
  const score = scoreForDay(data, today);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<DailyTask | null>(null);
  const lesson = lessonForDay();
  const todayDate = new Date();
  const dayName = todayDate.toLocaleDateString(undefined, { weekday: 'long' });
  const dateName = todayDate.toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
  });

  const confirmDelete = (task: DailyTask) =>
    Alert.alert('Delete this task?', task.title, [
      { text: 'Keep it', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteTask(task.id) },
    ]);

  return (
    <>
      <AppPage>
        <PageHeading
          eyebrow={`${dayName.toUpperCase()} · ${dateName.toUpperCase()}`}
          title="A little at a time."
          subtitle="Your day, without the pressure."
          right={
            <View style={[styles.brandMark, { backgroundColor: colors.accent }]}>
              <Feather name="activity" size={19} color={colors.accentForeground} />
            </View>
          }
        />

        {!ready ? (
          <Card>
            <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>
              Opening your day…
            </Text>
          </Card>
        ) : (
          <>
        <Card style={[styles.scoreCard, { backgroundColor: colors.accent }]}>
              <View style={{ flex: 1, gap: 8 }}>
                <Text style={[styles.cardEyebrow, { color: colors.secondaryForeground }]}>
                  TODAY AT A GLANCE
                </Text>
                <Text style={[styles.scoreTitle, { color: colors.cardForeground }]}>
                  {score === 0
                    ? 'Start wherever you are.'
                    : score >= 80
                      ? 'You showed up today.'
                      : 'Small steps are adding up.'}
                </Text>
                <Text style={[styles.scoreCopy, { color: colors.mutedForeground }]}>
                  {todaysTasks.length
                    ? `${completed} of ${todaysTasks.length} tasks complete`
                    : 'Add one intention, or simply check in.'}
                </Text>
              </View>
              <View style={styles.ring}>
                <Svg
                  width={88}
                  height={88}
                  viewBox="0 0 88 88"
                  style={{ transform: [{ rotate: '-90deg' }] }}
                >
                  <Circle
                    cx="44"
                    cy="44"
                    r="35"
                    stroke={colors.muted}
                    strokeWidth="7"
                    fill="none"
                  />
                  {score > 0 ? (
                    <Circle
                      cx="44"
                      cy="44"
                      r="35"
                      stroke={colors.primary}
                      strokeWidth="7"
                      strokeDasharray={`${(score / 100) * 219.9} 219.9`}
                      strokeLinecap="round"
                      fill="none"
                    />
                  ) : null}
                </Svg>
                <View style={styles.scoreNumber}>
                  <Text style={[styles.scoreValue, { color: colors.foreground }]}>{score}</Text>
                  <Text style={[styles.scoreOutOf, { color: colors.mutedForeground }]}>of 100</Text>
                </View>
              </View>
            </Card>

            <View style={styles.inlineNote}>
              <Feather name="info" size={15} color={colors.mutedForeground} />
              <Text style={[styles.noteText, { color: colors.mutedForeground }]}>
                Your score reflects tasks, habits, and a mood check-in—not how good your day was.
              </Text>
            </View>

            <View style={styles.sectionBlock}>
              <SectionTitle
                title="Your focus"
                action={
                  <IconButton
                    icon="plus"
                    label="Add a task"
                    testID="add-task"
                    onPress={() => {
                      setEditing(null);
                      setModalOpen(true);
                    }}
                  />
                }
              />
              <Card style={{ paddingVertical: 4 }}>
                {todaysTasks.length ? (
                  todaysTasks.map((task, index) => (
                    <TaskRow
                      key={task.id}
                      task={task}
                      onToggle={() => toggleTask(task.id)}
                      onEdit={() => {
                        setEditing(task);
                        setModalOpen(true);
                      }}
                      onDelete={() => confirmDelete(task)}
                    />
                  ))
                ) : (
                  <View style={styles.noTasks}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.noTasksTitle, { color: colors.foreground }]}>
                        Nothing on the list yet
                      </Text>
                      <Text style={[styles.noTasksCopy, { color: colors.mutedForeground }]}>
                        Keep it light. Add just one thing that matters.
                      </Text>
                    </View>
                    <ActionButton
                      label="Add"
                      icon="plus"
                      onPress={() => setModalOpen(true)}
                      testID="empty-add-task"
                    />
                  </View>
                )}
              </Card>
            </View>

            <View style={styles.sectionBlock}>
              <SectionTitle
                title="Your habits"
                action={
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => router.push('/(tabs)/habits')}
                    style={({ pressed }) => ({ opacity: pressed ? 0.55 : 1 })}
                  >
                    <Text style={[styles.linkText, { color: colors.primary }]}>See all</Text>
                  </Pressable>
                }
              />
              <Card style={{ gap: 14 }}>
                {data.habits.length ? (
                  data.habits.slice(0, 3).map((habit) => {
                    const done = habit.completedDates.includes(today);
                    return (
                      <View key={habit.id} style={styles.habitSummary}>
                        <View style={[styles.habitIcon, { backgroundColor: colors.secondary }]}>
                          <Feather name="repeat" size={16} color={colors.secondaryForeground} />
                        </View>
                        <Text
                          numberOfLines={1}
                          style={[styles.habitName, { color: colors.foreground }]}
                        >
                          {habit.title}
                        </Text>
                        <Feather
                          name={done ? 'check-circle' : 'circle'}
                          size={19}
                          color={done ? colors.success : colors.mutedForeground}
                        />
                      </View>
                    );
                  })
                ) : (
                  <View style={styles.habitEmpty}>
                    <Feather name="sunrise" size={19} color={colors.success} />
                    <Text style={[styles.noTasksCopy, { color: colors.mutedForeground, flex: 1 }]}>
                      A gentle routine can start with one small habit.
                    </Text>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => router.push('/(tabs)/habits')}
                    >
                      <Text style={[styles.linkText, { color: colors.primary }]}>Create</Text>
                    </Pressable>
                  </View>
                )}
              </Card>
            </View>

            <View style={styles.sectionBlock}>
              <SectionTitle title="A thought for today" />
              <Card style={styles.lessonCard}>
                <View style={[styles.lessonIcon, { backgroundColor: colors.primary }]}>
                  <Feather name="sun" size={18} color={colors.primaryForeground} />
                </View>
                <View style={{ flex: 1, gap: 6 }}>
                  <Text style={[styles.cardEyebrow, { color: colors.primary }]}>{lesson.topic}</Text>
                  <Text style={[styles.lessonTitle, { color: colors.foreground }]}>
                    {lesson.title}
                  </Text>
                  <Text style={[styles.noTasksCopy, { color: colors.mutedForeground }]}>
                    {lesson.body}
                  </Text>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => router.push('/(tabs)/reflect')}
                    style={styles.lessonLink}
                  >
                    <Text style={[styles.linkText, { color: colors.primary }]}>
                      Read & reflect
                    </Text>
                    <Feather name="arrow-up-right" size={14} color={colors.primary} />
                  </Pressable>
                </View>
              </Card>
            </View>
          </>
        )}
      </AppPage>
      <EntryModal
        visible={modalOpen}
        mode="task"
        initialTitle={editing?.title}
        initialTime={editing?.time}
        initialPriority={editing?.priority}
        onClose={() => setModalOpen(false)}
        onSave={(value) => {
          if (editing) {
            updateTask({ ...editing, title: value.title, time: value.time, priority: value.priority });
          } else {
            addTask({ ...value, date: today });
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
  brandMark: {
    width: 43,
    height: 43,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreCard: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 145,
    borderColor: 'transparent',
    padding: 20,
  },
  cardEyebrow: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 1.3,
  },
  scoreTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    lineHeight: 24,
    maxWidth: 185,
  },
  scoreCopy: { fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 18 },
  ring: { width: 88, height: 88, alignItems: 'center', justifyContent: 'center' },
  scoreNumber: { position: 'absolute', alignItems: 'center' },
  scoreValue: { fontSize: 25, fontFamily: 'Inter_700Bold', letterSpacing: -1 },
  scoreOutOf: { fontSize: 9, fontFamily: 'Inter_500Medium' },
  inlineNote: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginTop: -13 },
  noteText: { fontSize: 11, lineHeight: 16, fontFamily: 'Inter_400Regular', flex: 1 },
  sectionBlock: { gap: 14 },
  taskRow: {
    minHeight: 69,
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  check: {
    width: 24,
    height: 24,
    borderWidth: 1.5,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 3,
  },
  taskText: { fontSize: 14, lineHeight: 19, fontFamily: 'Inter_500Medium' },
  completedText: { textDecorationLine: 'line-through' },
  taskMeta: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { fontSize: 10, fontFamily: 'Inter_400Regular', textTransform: 'capitalize' },
  priorityDot: { width: 5, height: 5, borderRadius: 3, marginLeft: 3 },
  noTasks: { padding: 16, flexDirection: 'row', alignItems: 'center', gap: 10 },
  noTasksTitle: { fontSize: 14, fontFamily: 'Inter_600SemiBold', marginBottom: 4 },
  noTasksCopy: { fontSize: 12, lineHeight: 18, fontFamily: 'Inter_400Regular' },
  linkText: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  habitSummary: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  habitIcon: {
    width: 32,
    height: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  habitName: { flex: 1, fontSize: 13, fontFamily: 'Inter_500Medium' },
  habitEmpty: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  lessonCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 13, padding: 18 },
  lessonIcon: {
    width: 36,
    height: 36,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lessonTitle: { fontSize: 16, fontFamily: 'Inter_600SemiBold' },
  lessonLink: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 5 },
  loadingText: { fontSize: 14, fontFamily: 'Inter_400Regular' },
});
