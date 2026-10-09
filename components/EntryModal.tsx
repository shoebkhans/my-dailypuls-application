import React, { useEffect, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { useColors } from '@/hooks/useColors';
import { ActionButton, IconButton } from '@/components/ui';
import { Frequency, Priority } from '@/context/DailyPulseContext';

type EntryMode = 'task' | 'habit';

export function EntryModal({
  visible,
  mode,
  initialTitle = '',
  initialTime = '',
  initialPriority = 'medium',
  initialFrequency = 'Daily',
  onClose,
  onSave,
}: {
  visible: boolean;
  mode: EntryMode;
  initialTitle?: string;
  initialTime?: string;
  initialPriority?: Priority;
  initialFrequency?: Frequency;
  onClose: () => void;
  onSave: (value: {
    title: string;
    time: string;
    priority: Priority;
    frequency: Frequency;
  }) => void;
}) {
  const colors = useColors();
  const [title, setTitle] = useState(initialTitle);
  const [time, setTime] = useState(initialTime);
  const [priority, setPriority] = useState<Priority>(initialPriority);
  const [frequency, setFrequency] = useState<Frequency>(initialFrequency);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!visible) return;
    setTitle(initialTitle);
    setTime(initialTime);
    setPriority(initialPriority);
    setFrequency(initialFrequency);
    setError('');
  }, [visible, initialTitle, initialTime, initialPriority, initialFrequency]);

  const save = () => {
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setError('Add a short title to continue.');
      return;
    }
    if (mode === 'task' && time && !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) {
      setError('Use 24-hour time, such as 09:30, or leave it blank.');
      return;
    }
    onSave({ title: cleanTitle, time: mode === 'task' ? time : '', priority, frequency });
    setError('');
  };

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={[styles.backdrop, { backgroundColor: 'rgba(13, 25, 21, 0.48)' }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.background,
              paddingBottom: Platform.OS === 'web' ? 34 : 22,
            },
          ]}
        >
          <View style={styles.grabber} />
          <View style={styles.titleRow}>
            <View>
              <Text style={[styles.eyebrow, { color: colors.primary }]}>
                {mode === 'task' ? 'MAKE SPACE FOR IT' : 'A SMALL DAILY PRACTICE'}
              </Text>
              <Text style={[styles.title, { color: colors.foreground }]}>
                {mode === 'task' ? 'Your next task' : 'New habit'}
              </Text>
            </View>
            <IconButton icon="x" label="Close" onPress={onClose} />
          </View>
          <KeyboardAwareScrollViewCompat
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.form}
          >
            <Text style={[styles.label, { color: colors.foreground }]}>
              {mode === 'task' ? 'What would you like to do?' : 'What would you like to repeat?'}
            </Text>
            <TextInput
              value={title}
              onChangeText={(value) => {
                setTitle(value);
                setError('');
              }}
              placeholder={mode === 'task' ? 'e.g. Call the dentist' : 'e.g. Take a short walk'}
              placeholderTextColor={colors.mutedForeground}
              style={[
                styles.input,
                { color: colors.foreground, backgroundColor: colors.card, borderColor: colors.input },
              ]}
              maxLength={80}
              autoFocus={Platform.OS !== 'web'}
              returnKeyType={mode === 'task' ? 'next' : 'done'}
              testID={`${mode}-title-input`}
            />
            {mode === 'task' ? (
              <>
                <Text style={[styles.label, { color: colors.foreground }]}>
                  Time <Text style={{ color: colors.mutedForeground }}>(optional)</Text>
                </Text>
                <TextInput
                  value={time}
                  onChangeText={(value) => {
                    setTime(value);
                    setError('');
                  }}
                  placeholder="09:30"
                  placeholderTextColor={colors.mutedForeground}
                  style={[
                    styles.input,
                    styles.timeInput,
                    { color: colors.foreground, backgroundColor: colors.card, borderColor: colors.input },
                  ]}
                  keyboardType="numbers-and-punctuation"
                  maxLength={5}
                  testID="task-time-input"
                />
                <Text style={[styles.label, { color: colors.foreground }]}>Priority</Text>
                <View style={styles.optionRow}>
                  {(['low', 'medium', 'high'] as Priority[]).map((item) => (
                    <Pressable
                      key={item}
                      accessibilityRole="button"
                      accessibilityState={{ selected: priority === item }}
                      testID={`priority-${item}`}
                      onPress={() => setPriority(item)}
                      style={[
                        styles.option,
                        {
                          backgroundColor: priority === item ? colors.accent : colors.card,
                          borderColor: priority === item ? colors.success : colors.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          { color: priority === item ? colors.accentForeground : colors.mutedForeground },
                        ]}
                      >
                        {item.charAt(0).toUpperCase() + item.slice(1)}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </>
            ) : (
              <>
                <Text style={[styles.label, { color: colors.foreground }]}>How often?</Text>
                <View style={styles.optionRow}>
                  {(['Daily', 'Weekdays', 'Weekly'] as Frequency[]).map((item) => (
                    <Pressable
                      key={item}
                      accessibilityRole="button"
                      accessibilityState={{ selected: frequency === item }}
                      testID={`frequency-${item.toLowerCase()}`}
                      onPress={() => setFrequency(item)}
                      style={[
                        styles.option,
                        {
                          backgroundColor: frequency === item ? colors.accent : colors.card,
                          borderColor: frequency === item ? colors.success : colors.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          { color: frequency === item ? colors.accentForeground : colors.mutedForeground },
                        ]}
                      >
                        {item}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </>
            )}
            {error ? (
              <Text accessibilityRole="alert" style={[styles.error, { color: colors.destructive }]}>
                {error}
              </Text>
            ) : null}
            <ActionButton
              label={mode === 'task' ? 'Save task' : 'Add habit'}
              icon="check"
              onPress={save}
              testID={`${mode}-save`}
            />
          </KeyboardAwareScrollViewCompat>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    width: '100%',
    maxHeight: '91%',
    paddingHorizontal: 22,
    paddingTop: 12,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  grabber: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#9aa59d',
    alignSelf: 'center',
    marginBottom: 18,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  eyebrow: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    letterSpacing: 1.5,
    marginBottom: 5,
  },
  title: { fontFamily: 'Inter_700Bold', fontSize: 25 },
  form: { gap: 12, paddingBottom: 10 },
  label: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    marginTop: 6,
  },
  input: {
    minHeight: 50,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 15,
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
  },
  timeInput: { maxWidth: 150 },
  optionRow: { flexDirection: 'row', gap: 8 },
  option: {
    minHeight: 42,
    borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  error: { fontSize: 13, fontFamily: 'Inter_500Medium' },
});
