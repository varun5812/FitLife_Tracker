import React, { useState } from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity, Platform } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { BorderRadius, Spacing } from '../../constants/theme';
import * as Haptics from 'expo-haptics';

interface CardProps {
  children: React.ReactNode;
  style?: any;
  onPress?: () => void;
  variant?: 'default' | 'secondary' | 'glow';
  glowColor?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  onPress,
  variant = 'default',
  glowColor,
}) => {
  const { colors, isDark } = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  const getBackgroundColor = () => {
    if (variant === 'secondary') return colors.cardSecondary;
    return colors.card;
  };

  const getBorderColor = () => {
    if (isHovered && onPress) {
      return colors.borderHighlight || 'rgba(255, 255, 255, 0.32)';
    }
    if (variant === 'glow') {
      return glowColor || colors.primary;
    }
    return colors.border;
  };

  // Web-specific glassmorphic styles
  const webGlassStyle: any = Platform.OS === 'web' ? {
    backdropFilter: 'blur(20px) saturate(190%)',
    WebkitBackdropFilter: 'blur(20px) saturate(190%)',
    boxShadow: variant === 'glow'
      ? `0 12px 36px rgba(0, 0, 0, 0.42), 0 0 28px ${glowColor || 'rgba(16, 185, 129, 0.28)'}, inset 0 1px 1px rgba(255, 255, 255, 0.22)`
      : isDark
        ? isHovered
          ? '0 16px 44px rgba(0, 0, 0, 0.55), inset 0 1px 1px rgba(255, 255, 255, 0.25)'
          : '0 8px 32px rgba(0, 0, 0, 0.38), inset 0 1px 1px rgba(255, 255, 255, 0.16)'
        : isHovered
          ? '0 12px 32px rgba(100, 116, 139, 0.18), inset 0 1px 1px rgba(255, 255, 255, 0.95)'
          : '0 8px 24px rgba(100, 116, 139, 0.12), inset 0 1px 1px rgba(255, 255, 255, 0.85)',
    transition: 'all 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
    cursor: onPress ? 'pointer' : 'default',
    transform: isHovered && onPress ? 'translateY(-2px)' : 'none',
  } : {};

  const cardStyle: ViewStyle = {
    backgroundColor: getBackgroundColor(),
    borderColor: getBorderColor(),
    borderWidth: 1,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    shadowColor: isDark ? '#000' : '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: isDark ? 0.3 : 0.08,
    shadowRadius: 10,
    elevation: 3,
    position: 'relative',
    overflow: 'hidden',
    ...webGlassStyle,
  };

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.82}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress();
        }}
        // @ts-ignore - Web hover handlers
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={[cardStyle, style]}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View
      // @ts-ignore - Web hover handlers
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={[cardStyle, style]}
    >
      {children}
    </View>
  );
};
