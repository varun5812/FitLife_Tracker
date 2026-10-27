import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useApp } from '../../context/AppContext';
import { BorderRadius, Spacing, Typography } from '../../constants/theme';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';

interface SleepDashboardCardProps {}

export const SleepDashboardCard: React.FC<SleepDashboardCardProps> = () => {
  const router = useRouter();
  const { colors } = useTheme();
  const { todaySummary } = useApp();

  const sleep = todaySummary?.sleep;
  const isLogged = sleep?.logged;
  const duration = sleep?.durationHours || 0;
  const target = sleep?.targetHours || 8.0;

  return (
    <Card
      onPress={() => router.push('/quick-log?type=sleep')}
      style={styles.card}
    >
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={[styles.iconWrapper, { backgroundColor: colors.sleepGlow }]}>
            <Ionicons name="moon-outline" size={20} color={colors.sleep} />
          </View>
          <View>
            <Text style={[Typography.subtextBold, { color: colors.textSecondary }]}>RECOVERY</Text>
            <Text style={[Typography.h3, { color: colors.text }]}>Sleep & Rest</Text>
          </View>
        </View>

        {isLogged ? (
          <Badge label={`${duration} hrs`} color={colors.sleep} />
        ) : (
          <Badge label="Not Logged" color={colors.textSecondary} />
        )}
      </View>

      {isLogged ? (
        <View style={styles.loggedRow}>
          <Text style={[Typography.bodyBold, { color: colors.text }]}>
            {duration} hrs / {target} hrs target
          </Text>
          <Text style={[Typography.caption, { color: colors.textSecondary }]}>
            Quality: {'⭐'.repeat(sleep.qualityRating || 4)}
          </Text>
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={[Typography.subtext, { color: colors.textSecondary }]}>
            Log your sleep duration to measure recovery.
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/quick-log?type=sleep')}
            style={[styles.actionLink, { borderColor: colors.sleep }]}
          >
            <Text style={[Typography.subtextBold, { color: colors.sleep }]}>Log Sleep +</Text>
          </TouchableOpacity>
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loggedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
  },
  emptyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
  },
  actionLink: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
});
