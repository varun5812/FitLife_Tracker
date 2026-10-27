import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { BorderRadius } from '../../constants/theme';

interface ProgressBarProps {
  progress: number; // 0 to 100
  color?: string;
  height?: number;
  backgroundColor?: string;
  style?: ViewStyle;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  color,
  height = 8,
  backgroundColor,
  style,
}) => {
  const { colors } = useTheme();
  const clampedProgress = Math.min(100, Math.max(0, isNaN(progress) ? 0 : progress));
  const barColor = color || colors.primary;
  const trackColor = backgroundColor || colors.border;

  return (
    <View
      style={[
        styles.track,
        {
          height,
          backgroundColor: trackColor,
          borderRadius: BorderRadius.full,
        },
        style,
      ]}
    >
      <View
        style={[
          styles.fill,
          {
            width: `${clampedProgress}%`,
            backgroundColor: barColor,
            borderRadius: BorderRadius.full,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    width: '100%',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
});
