import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useApp } from '../../context/AppContext';
import { BorderRadius, Spacing, Typography } from '../../constants/theme';
import { Card } from '../common/Card';
import { ProgressBar } from '../common/ProgressBar';
import { addWaterEntry } from '../../services/waterService';
import * as Haptics from 'expo-haptics';

interface WaterDashboardCardProps {}

export const WaterDashboardCard: React.FC<WaterDashboardCardProps> = () => {
  const { colors } = useTheme();
  const { todaySummary, refreshData } = useApp();

  const water = todaySummary?.water;
  const currentMl = water?.currentMl || 0;
  const targetMl = water?.targetMl || 2500;
  const percent = Math.min(100, Math.round((currentMl / targetMl) * 100));

  const handleQuickAdd = async (amount: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await addWaterEntry(amount);
    await refreshData();
  };

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={[styles.iconWrapper, { backgroundColor: colors.waterGlow }]}>
            <Ionicons name="water-outline" size={20} color={colors.water} />
          </View>
          <View>
            <Text style={[Typography.subtextBold, { color: colors.textSecondary }]}>HYDRATION</Text>
            <Text style={[Typography.h3, { color: colors.text }]}>Water Intake</Text>
          </View>
        </View>

        <Text style={[Typography.bodyBold, { color: colors.water }]}>
          {(currentMl / 1000).toFixed(2)}L / {(targetMl / 1000).toFixed(1)}L
        </Text>
      </View>

      <ProgressBar progress={percent} color={colors.water} height={8} style={{ marginVertical: Spacing.sm }} />

      <View style={styles.quickAddRow}>
        {[
          { label: '+250 ml', amount: 250 },
          { label: '+500 ml', amount: 500 },
          { label: '+750 ml', amount: 750 },
          { label: '+1 L', amount: 1000 },
        ].map(item => (
          <TouchableOpacity
            key={item.amount}
            activeOpacity={0.7}
            onPress={() => handleQuickAdd(item.amount)}
            style={[
              styles.quickButton,
              { backgroundColor: colors.cardSecondary, borderColor: colors.border },
            ]}
          >
            <Text style={[Typography.caption, { color: colors.text, fontWeight: '700' }]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
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
  quickAddRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
    gap: Spacing.xs,
  },
  quickButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
});
