import React from 'react';
import { View, Text, StyleSheet, ViewStyle, Platform } from 'react-native';
import { BorderRadius, Spacing, Typography } from '../../constants/theme';

interface BadgeProps {
  label: string;
  color: string;
  backgroundColor?: string;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  color,
  backgroundColor,
  icon,
  style,
}) => {
  const bg = backgroundColor || `${color}18`;

  const webGlassStyle: any = Platform.OS === 'web' ? {
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    boxShadow: `0 2px 8px ${color}20, inset 0 1px 0 rgba(255, 255, 255, 0.18)`,
  } : {};

  return (
    <View style={[styles.badge, { backgroundColor: bg, borderColor: `${color}40` }, webGlassStyle, style]}>
      {icon && <View style={{ marginRight: Spacing.xs }}>{icon}</View>}
      <Text style={[Typography.caption, { color, fontWeight: '700', letterSpacing: 0.2 }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm + 3,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
});
