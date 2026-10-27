import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { BorderRadius, Spacing, Typography } from '../../constants/theme';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  actionTitle?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'bar-chart-outline',
  title,
  description,
  actionTitle,
  onAction,
  style,
}) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: colors.cardSecondary, borderColor: colors.border },
        ]}
      >
        <Ionicons name={icon} size={36} color={colors.primary} />
      </View>

      <Text style={[Typography.h3, { color: colors.text, marginTop: Spacing.md, textAlign: 'center' }]}>
        {title}
      </Text>

      <Text
        style={[
          Typography.subtext,
          { color: colors.textSecondary, marginTop: Spacing.xs, textAlign: 'center', maxWidth: 280 },
        ]}
      >
        {description}
      </Text>

      {actionTitle && onAction && (
        <Button
          title={actionTitle}
          onPress={onAction}
          size="sm"
          style={{ marginTop: Spacing.lg }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxxl,
    paddingHorizontal: Spacing.xl,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});
