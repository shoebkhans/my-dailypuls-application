import React, { useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { AppPage, Card, PageHeading, SectionTitle } from '@/components/ui';
import { ThemeMode, useDailyPulse } from '@/context/DailyPulseContext';
import { useColors } from '@/hooks/useColors';

const themeOptions: { value: ThemeMode; label: string; icon: React.ComponentProps<typeof Feather>['name'] }[] = [
  { value: 'system', label: 'System', icon: 'smartphone' },
  { value: 'light', label: 'Light', icon: 'sun' },
  { value: 'dark', label: 'Dark', icon: 'moon' },
];

const reminderTimes = [
  { label: '8 am', hour: 8, minute: 0 },
  { label: '12 pm', hour: 12, minute: 0 },
  { label: '8 pm', hour: 20, minute: 0 },
];

async function scheduleDailyReminder(hour: number, minute: number) {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('daily-reminder', {
      name: 'Daily check-in',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 180, 100, 180],
      lightColor: '#D96F59',
    });
  }
  await Notifications.cancelAllScheduledNotificationsAsync();
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'A moment for yourself',
      body: 'Take a breath and check in with your day.',
      sound: 'default',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
      ...(Platform.OS === 'android' ? { channelId: 'daily-reminder' } : {}),
    },
  });
}

export default function SettingsScreen() {
  const colors = useColors();
  const { data, storageError, setTheme, setReminder, clearAll } = useDailyPulse();
  const [savingReminder, setSavingReminder] = useState(false);
  const [clearing, setClearing] = useState(false);
  const selectedReminder = reminderTimes.find(
    (time) => time.hour === data.reminderHour && time.minute === data.reminderMinute,
  );

  const handleReminderToggle = async (enabled: boolean) => {
    if (Platform.OS === 'web') {
      Alert.alert('Reminders on your phone', 'Local reminders are available in the iOS and Android app.');
      return;
    }
    setSavingReminder(true);
    try {
      if (enabled) {
        const permission = await Notifications.getPermissionsAsync();
        const result = permission.granted
          ? permission
          : await Notifications.requestPermissionsAsync();
        if (!result.granted) {
          Alert.alert(
            'Reminders are off',
            'Allow DailyPulse notifications in your device settings to receive a daily reminder.',
          );
          return;
        }
        await scheduleDailyReminder(data.reminderHour, data.reminderMinute);
        setReminder(true);
      } else {
        await Notifications.cancelAllScheduledNotificationsAsync();
        setReminder(false);
      }
    } catch {
      Alert.alert('Could not update reminder', 'Please try again in a moment.');
    } finally {
      setSavingReminder(false);
    }
  };

  const handleReminderTime = async (hour: number, minute: number) => {
    if (data.reminderEnabled) {
      setSavingReminder(true);
      try {
        await scheduleDailyReminder(hour, minute);
        setReminder(true, hour, minute);
      } catch {
        Alert.alert('Could not update reminder', 'Please try again in a moment.');
      } finally {
        setSavingReminder(false);
      }
    } else {
      setReminder(false, hour, minute);
    }
  };

  const confirmClear = () =>
    Alert.alert(
      'Delete all DailyPulse data?',
      'This permanently removes your tasks, habits, moods, reflections, and saved preferences from this device.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete everything',
          style: 'destructive',
          onPress: async () => {
            setClearing(true);
            try {
              await Notifications.cancelAllScheduledNotificationsAsync();
              await clearAll();
            } catch {
              Alert.alert('Could not delete data', 'Your saved information was not fully removed. Please try again.');
            } finally {
              setClearing(false);
            }
          },
        },
      ],
    );

  return (
    <AppPage>
      <PageHeading
        eyebrow="MAKE IT YOURS"
        title="A space that feels right."
        subtitle="Your choices stay on this device."
      />

      <View style={styles.sectionBlock}>
        <SectionTitle title="Appearance" />
        <Card style={styles.themeCard}>
          {themeOptions.map((option) => {
            const selected = data.theme === option.value;
            return (
              <Pressable
                key={option.value}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                testID={`theme-${option.value}`}
                onPress={() => setTheme(option.value)}
                style={[
                  styles.themeOption,
                  {
                    backgroundColor: selected ? colors.accent : 'transparent',
                    borderColor: selected ? colors.success : colors.border,
                  },
                ]}
              >
                <Feather
                  name={option.icon}
                  size={16}
                  color={selected ? colors.accentForeground : colors.mutedForeground}
                />
                <Text
                  style={[
                    styles.themeLabel,
                    { color: selected ? colors.accentForeground : colors.mutedForeground },
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </Card>
      </View>

      <View style={styles.sectionBlock}>
        <SectionTitle title="Daily reminder" />
        <Card style={styles.reminderCard}>
          <View style={[styles.reminderIcon, { backgroundColor: colors.warm }]}>
            <Feather name="bell" size={17} color={colors.primary} />
          </View>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={[styles.rowTitle, { color: colors.foreground }]}>
              Gentle check-in
            </Text>
            <Text style={[styles.rowSubtitle, { color: colors.mutedForeground }]}>
              A private reminder, scheduled on this device.
            </Text>
          </View>
          <Switch
            accessibilityLabel="Enable daily reminder"
            testID="reminder-switch"
            value={data.reminderEnabled}
            disabled={savingReminder || Platform.OS === 'web'}
            onValueChange={handleReminderToggle}
            trackColor={{ false: colors.muted, true: colors.success }}
            thumbColor={colors.card}
          />
        </Card>
        {Platform.OS !== 'web' ? (
          <View style={styles.timeRow}>
            {reminderTimes.map((time) => {
              const selected = selectedReminder?.hour === time.hour;
              return (
                <Pressable
                  key={time.hour}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  testID={`reminder-time-${time.hour}`}
                  disabled={savingReminder}
                  onPress={() => handleReminderTime(time.hour, time.minute)}
                  style={[
                    styles.timePill,
                    {
                      backgroundColor: selected ? colors.accent : colors.card,
                      borderColor: selected ? colors.success : colors.border,
                      opacity: savingReminder ? 0.55 : 1,
                    },
                  ]}
                >
                  <Feather
                    name={selected ? 'check' : 'clock'}
                    size={13}
                    color={selected ? colors.accentForeground : colors.mutedForeground}
                  />
                  <Text
                    style={[
                      styles.timeLabel,
                      { color: selected ? colors.accentForeground : colors.mutedForeground },
                    ]}
                  >
                    {time.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ) : (
          <Text style={[styles.helperText, { color: colors.mutedForeground }]}>
            Enable reminders in the iOS or Android app.
          </Text>
        )}
      </View>

      <View style={styles.sectionBlock}>
        <SectionTitle title="Your privacy" />
        <Card style={styles.privacyCard}>
          <View style={[styles.privacyIcon, { backgroundColor: colors.secondary }]}>
            <Feather name="lock" size={17} color={colors.secondaryForeground} />
          </View>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={[styles.rowTitle, { color: colors.foreground }]}>
              Stored only on this device
            </Text>
            <Text style={[styles.rowSubtitle, { color: colors.mutedForeground }]}>
              DailyPulse works offline. No account or cloud sync is used.
            </Text>
          </View>
        </Card>
        {storageError ? (
          <Text style={[styles.errorText, { color: colors.destructive }]}>
            Saved data could not be read or updated. Check your device storage and reopen the app.
          </Text>
        ) : null}
        <Card style={styles.deleteCard}>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={[styles.rowTitle, { color: colors.foreground }]}>
              Clear all app data
            </Text>
            <Text style={[styles.rowSubtitle, { color: colors.mutedForeground }]}>
              Remove tasks, habits, check-ins, and reflections from this device.
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            testID="clear-data"
            disabled={clearing}
            onPress={confirmClear}
            style={({ pressed }) => [
              styles.deleteButton,
              { backgroundColor: colors.destructive, opacity: pressed || clearing ? 0.7 : 1 },
            ]}
          >
            <Feather name="trash-2" size={15} color={colors.destructiveForeground} />
            <Text style={[styles.deleteText, { color: colors.destructiveForeground }]}>
              {clearing ? 'Clearing…' : 'Clear data'}
            </Text>
          </Pressable>
        </Card>
      </View>

      <View style={styles.footer}>
        <View style={[styles.footerMark, { backgroundColor: colors.accent }]}>
          <Feather name="activity" size={15} color={colors.accentForeground} />
        </View>
        <Text style={[styles.footerText, { color: colors.mutedForeground }]}>
          DailyPulse · A little at a time.
        </Text>
      </View>
    </AppPage>
  );
}

const styles = StyleSheet.create({
  sectionBlock: { gap: 13 },
  themeCard: { flexDirection: 'row', gap: 7, padding: 8 },
  themeOption: { flex: 1, minHeight: 46, borderWidth: 1, borderRadius: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  themeLabel: { fontFamily: 'Inter_500Medium', fontSize: 12 },
  reminderCard: { flexDirection: 'row', alignItems: 'center', gap: 11, padding: 14 },
  reminderIcon: { width: 38, height: 38, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  rowTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 13, lineHeight: 18 },
  rowSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 11, lineHeight: 16 },
  timeRow: { flexDirection: 'row', gap: 8 },
  timePill: { flex: 1, minHeight: 38, borderWidth: 1, borderRadius: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 },
  timeLabel: { fontFamily: 'Inter_500Medium', fontSize: 11 },
  helperText: { fontFamily: 'Inter_400Regular', fontSize: 11 },
  privacyCard: { flexDirection: 'row', alignItems: 'center', gap: 11, padding: 14 },
  privacyIcon: { width: 38, height: 38, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  errorText: { fontFamily: 'Inter_500Medium', fontSize: 12, lineHeight: 18 },
  deleteCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 15 },
  deleteButton: { minHeight: 38, borderRadius: 13, paddingHorizontal: 11, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  deleteText: { fontFamily: 'Inter_600SemiBold', fontSize: 11 },
  footer: { alignItems: 'center', gap: 8, paddingTop: 3 },
  footerMark: { width: 34, height: 34, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  footerText: { fontFamily: 'Inter_500Medium', fontSize: 11 },
});
