import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { Typography } from '../../constants/theme';

interface CircularProgressProps {
  size?: number;
  strokeWidth?: number;
  progress: number; // 0 to 100
  color?: string;
  gradientColors?: [string, string];
  trackColor?: string;
  children?: React.ReactNode;
  showPercentage?: boolean;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  size = 140,
  strokeWidth = 12,
  progress,
  color,
  gradientColors,
  trackColor,
  children,
  showPercentage = false,
}) => {
  const { colors } = useTheme();

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedProgress = Math.min(100, Math.max(0, isNaN(progress) ? 0 : progress));
  const strokeDashoffset = circumference - (clampedProgress / 100) * circumference;

  const activeColor = color || colors.primary;
  const inactiveColor = trackColor || colors.border;
  const gradientId = `grad_${Math.random().toString(36).substring(7)}`;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        {gradientColors && (
          <Defs>
            <LinearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={gradientColors[0]} />
              <Stop offset="100%" stopColor={gradientColors[1]} />
            </LinearGradient>
          </Defs>
        )}

        {/* Background Track */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={inactiveColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />

        {/* Progress Arc */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={gradientColors ? `url(#${gradientId})` : activeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>

      <View style={styles.content}>
        {children ? (
          children
        ) : showPercentage ? (
          <Text style={[Typography.h2, { color: colors.text }]}>{Math.round(clampedProgress)}%</Text>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  content: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
