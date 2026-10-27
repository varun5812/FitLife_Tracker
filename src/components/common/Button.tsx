import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, ActivityIndicator, View, Platform } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { BorderRadius, Spacing, Typography } from '../../constants/theme';
import * as Haptics from 'expo-haptics';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  style,
  textStyle,
}) => {
  const { colors, isDark } = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  const handlePress = () => {
    if (disabled || loading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  const getContainerStyle = (): ViewStyle => {
    let base: any = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: BorderRadius.lg,
      paddingHorizontal: Spacing.xl,
    };

    if (size === 'sm') {
      base.paddingVertical = Spacing.sm;
      base.paddingHorizontal = Spacing.md;
      base.borderRadius = BorderRadius.md;
    } else if (size === 'md') {
      base.paddingVertical = Spacing.md + 2;
    } else if (size === 'lg') {
      base.paddingVertical = Spacing.lg;
      base.borderRadius = BorderRadius.xl;
    }

    switch (variant) {
      case 'primary':
        base.backgroundColor = colors.primary;
        if (Platform.OS === 'web') {
          base.boxShadow = isHovered
            ? '0 10px 28px rgba(16, 185, 129, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.35)'
            : '0 6px 20px rgba(16, 185, 129, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.25)';
        }
        break;
      case 'secondary':
        base.backgroundColor = colors.cardSecondary;
        base.borderWidth = 1;
        base.borderColor = isHovered ? colors.borderHighlight : colors.border;
        if (Platform.OS === 'web') {
          base.backdropFilter = 'blur(16px)';
          base.WebkitBackdropFilter = 'blur(16px)';
          base.boxShadow = isDark
            ? '0 4px 16px rgba(0, 0, 0, 0.25), inset 0 1px 1px rgba(255, 255, 255, 0.14)'
            : '0 4px 14px rgba(100, 116, 139, 0.1), inset 0 1px 1px rgba(255, 255, 255, 0.85)';
        }
        break;
      case 'outline':
        base.backgroundColor = isHovered ? `${colors.primary}12` : 'transparent';
        base.borderWidth = 1.5;
        base.borderColor = colors.primary;
        break;
      case 'ghost':
        base.backgroundColor = isHovered ? 'rgba(255, 255, 255, 0.06)' : 'transparent';
        break;
      case 'danger':
        base.backgroundColor = colors.error;
        if (Platform.OS === 'web') {
          base.boxShadow = '0 6px 20px rgba(239, 68, 68, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.2)';
        }
        break;
    }

    if (Platform.OS === 'web') {
      base.transition = 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)';
      base.cursor = disabled || loading ? 'not-allowed' : 'pointer';
      if (isHovered && !disabled && !loading) {
        base.transform = 'translateY(-1.5px)';
      }
    }

    if (disabled) {
      base.opacity = 0.5;
    }

    return base;
  };

  const getTextColor = (): string => {
    switch (variant) {
      case 'primary':
      case 'danger':
        return '#FFFFFF';
      case 'outline':
        return colors.primary;
      case 'secondary':
      case 'ghost':
        return colors.text;
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePress}
      disabled={disabled || loading}
      // @ts-ignore
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={[getContainerStyle(), style]}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <>
          {icon && iconPosition === 'left' ? <View style={{ marginRight: Spacing.sm }}>{icon}</View> : null}
          <Text
            style={[
              Typography.bodyBold,
              {
                color: getTextColor(),
                fontSize: size === 'sm' ? 13 : size === 'lg' ? 16 : 15,
                letterSpacing: 0.2,
              },
              textStyle,
            ]}
          >
            {title}
          </Text>
          {icon && iconPosition === 'right' ? <View style={{ marginLeft: Spacing.sm }}>{icon}</View> : null}
        </>
      )}
    </TouchableOpacity>
  );
};
