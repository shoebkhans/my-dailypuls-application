import React, { ReactNode } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function AppPage({
  children,
  contentStyle,
}: {
  children: ReactNode;
  contentStyle?: object;
}) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[
        styles.page,
        {
          paddingTop: Platform.OS === 'web' ? 67 : Math.max(insets.top, 14),
          paddingBottom:
            Platform.OS === 'web' ? 110 : Math.max(insets.bottom + 98, 112),
        },
        contentStyle,
      ]}
    >
      {children}
    </ScrollView>
  );
}

export function PageHeading({
  eyebrow,
  title,
  subtitle,
  right,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  const colors = useColors();
  return (
    <View style={styles.heading}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.eyebrow, { color: colors.primary }]}>{eyebrow}</Text>
        <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right}
    </View>
  );
}

export function Card({
  children,
  style,
}: {
  children: ReactNode;
  style?: object;
}) {
  const colors = useColors();
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: colors.radius,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function SectionTitle({
  title,
  action,
}: {
  title: string;
  action?: ReactNode;
}) {
  const colors = useColors();
  return (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
        {title}
      </Text>
      {action}
    </View>
  );
}

export function IconButton({
  icon,
  color,
  label,
  onPress,
  testID,
}: {
  icon: React.ComponentProps<typeof Feather>['name'];
  color?: string;
  label: string;
  onPress: () => void;
  testID?: string;
}) {
  const colors = useColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      testID={testID}
      onPress={onPress}
      hitSlop={10}
      style={({ pressed }) => ({ opacity: pressed ? 0.54 : 1, padding: 7 })}
    >
      <Feather name={icon} size={20} color={color ?? colors.foreground} />
    </Pressable>
  );
}

export function ActionButton({
  label,
  onPress,
  icon,
  secondary = false,
  testID,
}: {
  label: string;
  onPress: () => void;
  icon?: React.ComponentProps<typeof Feather>['name'];
  secondary?: boolean;
  testID?: string;
}) {
  const colors = useColors();
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionButton,
        {
          backgroundColor: secondary ? colors.secondary : colors.primary,
          opacity: pressed ? 0.78 : 1,
        },
      ]}
    >
      {icon ? (
        <Feather
          name={icon}
          size={16}
          color={secondary ? colors.secondaryForeground : colors.primaryForeground}
        />
      ) : null}
      <Text
        style={[
          styles.actionText,
          {
            color: secondary
              ? colors.secondaryForeground
              : colors.primaryForeground,
          },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon: React.ComponentProps<typeof Feather>['name'];
  title: string;
  body: string;
  action?: ReactNode;
}) {
  const colors = useColors();
  return (
    <View style={styles.emptyState}>
      <View style={[styles.emptyIcon, { backgroundColor: colors.secondary }]}>
        <Feather name={icon} size={22} color={colors.secondaryForeground} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
        {title}
      </Text>
      <Text style={[styles.emptyBody, { color: colors.mutedForeground }]}>
        {body}
      </Text>
      {action}
    </View>
  );
}

export function ProgressTrack({
  value,
  color,
}: {
  value: number;
  color?: string;
}) {
  const colors = useColors();
  return (
    <View style={[styles.track, { backgroundColor: colors.muted }]}>
      <View
        style={[
          styles.trackFill,
          { width: `${Math.max(0, Math.min(100, value))}%`, backgroundColor: color ?? colors.primary },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    paddingHorizontal: 22,
    gap: 22,
  },
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 2,
  },
  eyebrow: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    marginBottom: 7,
  },
  title: {
    fontSize: 30,
    lineHeight: 36,
    fontFamily: 'Inter_700Bold',
    letterSpacing: -0.8,
  },
  subtitle: {
    marginTop: 7,
    fontSize: 14,
    lineHeight: 21,
    fontFamily: 'Inter_400Regular',
  },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    padding: 18,
    gap: 13,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: -10,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: -0.35,
  },
  actionButton: {
    minHeight: 44,
    borderRadius: 18,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionText: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 10,
    gap: 10,
  },
  emptyIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 1,
  },
  emptyTitle: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    textAlign: 'center',
  },
  emptyBody: {
    fontSize: 13,
    lineHeight: 19,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    maxWidth: 260,
  },
  track: {
    height: 7,
    borderRadius: 4,
    overflow: 'hidden',
  },
  trackFill: {
    height: '100%',
    borderRadius: 4,
  },
});
