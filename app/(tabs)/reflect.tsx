import React, { useMemo, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { ActionButton, AppPage, Card, PageHeading, SectionTitle } from '@/components/ui';
import { dateKey, Mood, useDailyPulse } from '@/context/DailyPulseContext';
import { lessonForDay } from '@/data/lessons';
import { useColors } from '@/hooks/useColors';

const moods: { value: Mood; label: string; icon: React.ComponentProps<typeof Feather>['name'] }[] = [
  { value: 1, label: 'Low', icon: 'cloud-rain' },
  { value: 2, label: 'Heavy', icon: 'cloud' },
  { value: 3, label: 'Okay', icon: 'minus' },
  { value: 4, label: 'Good', icon: 'sun' },
  { value: 5, label: 'Bright', icon: 'sunrise' },
];

export default function ReflectScreen() {
  const colors = useColors();
  const { data, setMood, saveReflection, toggleLessonSaved, toggleLessonLearned } = useDailyPulse();
  const today = dateKey();
  const todayMood = data.moods[today];
  const lesson = useMemo(() => lessonForDay(), []);
  const [reflectionText, setReflectionText] = useState(data.reflections[today] ?? '');
  const [savedFeedback, setSavedFeedback] = useState(false);
  const isSaved = data.savedLessons.includes(lesson.id);
  const isLearned = data.learnedLessons.includes(lesson.id);

  const handleSave = () => {
    saveReflection(today, reflectionText);
    setSavedFeedback(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
      () => undefined,
    );
    setTimeout(() => setSavedFeedback(false), 1800);
  };

  return (
    <AppPage>
      <PageHeading
        eyebrow="PAUSE & NOTICE"
        title="How are you, really?"
        subtitle="There’s no right answer. Just check in with yourself."
      />

      <Card style={[styles.moodCard, { backgroundColor: colors.accent, borderColor: 'transparent' }]}>
        <View style={styles.moodHeader}>
          <View style={{ flex: 1, gap: 5 }}>
            <Text style={[styles.smallCaps, { color: colors.accentForeground }]}>
              TODAY’S CHECK-IN
            </Text>
            <Text style={[styles.promptTitle, { color: colors.foreground }]}>
              {todayMood ? `Feeling ${moods[todayMood - 1]?.label.toLowerCase()}.` : 'Pick what feels closest.'}
            </Text>
          </View>
        </View>
        <View style={styles.moodRow}>
          {moods.map((mood) => {
            const selected = todayMood === mood.value;
            return (
              <Pressable
                key={mood.value}
                accessibilityRole="button"
                accessibilityLabel={`I feel ${mood.label.toLowerCase()}`}
                accessibilityState={{ selected }}
                testID={`mood-${mood.value}`}
                onPress={() => {
                  setMood(today, mood.value);
                  Haptics.selectionAsync().catch(() => undefined);
                }}
                style={styles.moodOption}
              >
                <View
                  style={[
                    styles.moodIcon,
                    {
                      backgroundColor: selected ? colors.primary : colors.card,
                      borderColor: selected ? colors.primary : colors.border,
                      transform: [{ scale: selected ? 1.08 : 1 }],
                    },
                  ]}
                >
                  <Feather
                    name={mood.icon}
                    size={19}
                    color={selected ? colors.primaryForeground : colors.secondaryForeground}
                  />
                </View>
                <Text
                  numberOfLines={1}
                  style={[
                    styles.moodLabel,
                    { color: selected ? colors.foreground : colors.mutedForeground },
                  ]}
                >
                  {mood.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Text style={[styles.note, { color: colors.mutedForeground }]}>
          Your mood is private and saved only on this device.
        </Text>
      </Card>

      <View style={styles.sectionBlock}>
        <SectionTitle title="A few words for today" />
        <Card style={styles.reflectionCard}>
          <Text style={[styles.reflectionPrompt, { color: colors.foreground }]}>
            What felt good, hard, or worth remembering?
          </Text>
          <TextInput
            value={reflectionText}
            onChangeText={(value) => {
              setReflectionText(value);
              setSavedFeedback(false);
            }}
            placeholder="Write a little, or leave it for another day…"
            placeholderTextColor={colors.mutedForeground}
            style={[
              styles.reflectionInput,
              { color: colors.foreground, backgroundColor: colors.background, borderColor: colors.border },
            ]}
            multiline
            textAlignVertical="top"
            maxLength={1000}
            testID="reflection-input"
          />
          <View style={styles.reflectionFooter}>
            <Text style={[styles.note, { color: colors.mutedForeground }]}>
              {reflectionText.length}/1000
            </Text>
            <ActionButton
              label={savedFeedback ? 'Saved' : 'Save reflection'}
              icon={savedFeedback ? 'check' : 'bookmark'}
              onPress={handleSave}
              secondary
              testID="save-reflection"
            />
          </View>
        </Card>
      </View>

      <View style={styles.sectionBlock}>
        <SectionTitle title="A small idea to carry" />
        <Card style={styles.lessonCard}>
          <View style={[styles.topicPill, { backgroundColor: colors.warm }]}>
            <Text style={[styles.smallCaps, { color: colors.primary }]}>{lesson.topic}</Text>
          </View>
          <Text style={[styles.lessonTitle, { color: colors.foreground }]}>
            {lesson.title}
          </Text>
          <Text style={[styles.lessonBody, { color: colors.mutedForeground }]}>
            {lesson.body}
          </Text>
          <View style={[styles.thoughtBox, { backgroundColor: colors.secondary }]}>
            <Feather name="message-circle" size={15} color={colors.secondaryForeground} />
            <Text style={[styles.thoughtText, { color: colors.secondaryForeground }]}>
              {lesson.prompt}
            </Text>
          </View>
          <View style={styles.lessonActions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={isSaved ? 'Remove saved lesson' : 'Save lesson'}
              testID="toggle-saved-lesson"
              onPress={() => toggleLessonSaved(lesson.id)}
              style={styles.lessonAction}
            >
              <Feather
                name={isSaved ? 'bookmark' : 'bookmark'}
                size={16}
                color={isSaved ? colors.primary : colors.mutedForeground}
              />
              <Text style={[styles.lessonActionText, { color: colors.mutedForeground }]}>
                {isSaved ? 'Saved' : 'Save for later'}
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: isLearned }}
              testID="toggle-learned-lesson"
              onPress={() => toggleLessonLearned(lesson.id)}
              style={[
                styles.learnedButton,
                { backgroundColor: isLearned ? colors.success : colors.primary },
              ]}
            >
              <Feather
                name={isLearned ? 'check' : 'plus'}
                size={15}
                color={colors.primaryForeground}
              />
              <Text style={[styles.learnedButtonText, { color: colors.primaryForeground }]}>
                {isLearned ? 'Learned' : 'Mark learned'}
              </Text>
            </Pressable>
          </View>
        </Card>
      </View>
    </AppPage>
  );
}

const styles = StyleSheet.create({
  moodCard: { padding: 19, gap: 17 },
  moodHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  smallCaps: { fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.25 },
  promptTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 17, lineHeight: 23 },
  moodRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 5 },
  moodOption: { flex: 1, alignItems: 'center', gap: 7 },
  moodIcon: { width: 44, height: 44, borderWidth: 1, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  moodLabel: { fontFamily: 'Inter_500Medium', fontSize: 10 },
  note: { fontFamily: 'Inter_400Regular', fontSize: 10 },
  sectionBlock: { gap: 13 },
  reflectionCard: { gap: 12 },
  reflectionPrompt: { fontFamily: 'Inter_600SemiBold', fontSize: 14, lineHeight: 20 },
  reflectionInput: {
    minHeight: 122,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 21,
  },
  reflectionFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  lessonCard: { gap: 12 },
  topicPill: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 7, borderRadius: 10 },
  lessonTitle: { fontFamily: 'Inter_700Bold', fontSize: 20, lineHeight: 27, letterSpacing: -0.4 },
  lessonBody: { fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 20 },
  thoughtBox: { borderRadius: 16, padding: 13, flexDirection: 'row', alignItems: 'flex-start', gap: 9 },
  thoughtText: { flex: 1, fontFamily: 'Inter_500Medium', fontSize: 12, lineHeight: 18 },
  lessonActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  lessonAction: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingVertical: 10 },
  lessonActionText: { fontFamily: 'Inter_500Medium', fontSize: 12 },
  learnedButton: { minHeight: 40, borderRadius: 15, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', gap: 7 },
  learnedButtonText: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
});
