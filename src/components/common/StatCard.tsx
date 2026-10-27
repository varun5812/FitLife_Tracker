import React from 'react';
import { View, Text, StyleSheet, ViewStyle, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { BorderRadius, Spacing, Typography } from '../../constants/theme';
import { Card } from './Card';
import { ProgressBar } from './ProgressBar';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
  color?: string;
  progress?: number; // 0 to 100
  style?: ViewStyle;
  onPress?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  color,
  progress,
  style,
  onPress,
}) => {
  const { colors } = useTheme();
  const accentColor = color || colors.primary;

  return (
    <Card onPress={onPress} style={[{ flex: 1, padding: Spacing.md }, style || {}]}>
      <View style={styles.topRow}>
        <View
          style={[
            styles.iconWrapper,
            {
              backgroundColor: `${accentColor}16`,
              borderColor: `${accentColor}35`,
              // @ts-ignore
              boxShadow: Platform.OS === 'web' ? `0 0 14px ${accentColor}30` : undefined,
            },
          ]}
        >
          <Ionicons name={icon} size={18} color={accentColor} />
        </View>
        <Text style={[Typography.caption, { color: colors.textSecondary, fontWeight: '600' }]}>{title}</Text>
      </View>

      <Text style={[Typography.h2, { color: colors.text, marginTop: Spacing.sm, fontWeight: '800' }]}>{value}</Text>

      {subtitle && (
        <Text style={[Typography.subtext, { color: colors.textSecondary, marginTop: 2, fontSize: 12 }]}>
          {subtitle}
        </Text>
      )}

      {progress !== undefined && (
        <ProgressBar
          progress={progress}
          color={accentColor}
          height={6}
          style={{ marginTop: Spacing.sm }}
        />
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconWrapper: {
    width: 34,
    height: 34,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});
