import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useApp } from '../../context/AppContext';
import { BorderRadius, Spacing, Typography } from '../../constants/theme';
import { CircularProgress } from '../common/CircularProgress';
import { Card } from '../common/Card';
import { logFocusSession } from '../../services/focusService';
import * as Haptics from 'expo-haptics';

export const PomodoroDial: React.FC = () => {
  const { colors } = useTheme();
  const { refreshData } = useApp();

  const [mode, setMode] = useState<'focus' | 'short_break' | 'long_break'>('focus');
  const [totalSeconds, setTotalSeconds] = useState<number>(25 * 60);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(25 * 60);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [tag, setTag] = useState<string>('Deep Work');

  const intervalRef = useRef<any>(null);

  const modeDurations = {
    focus: 25 * 60,
    short_break: 5 * 60,
    long_break: 15 * 60,
  };

  const handleModeChange = (newMode: 'focus' | 'short_break' | 'long_break') => {
    setIsActive(false);
    clearInterval(intervalRef.current);
    setMode(newMode);
    const secs = modeDurations[newMode];
    setTotalSeconds(secs);
    setSecondsRemaining(secs);
  };

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setSecondsRemaining(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setIsActive(false);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            // Log session completed
            logFocusSession(tag, Math.round(totalSeconds / 60), mode).then(() => {
              refreshData();
            });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isActive, mode, totalSeconds, tag]);

  const toggleTimer = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (secondsRemaining === 0) {
      setSecondsRemaining(totalSeconds);
    }
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsActive(false);
    clearInterval(intervalRef.current);
    setSecondsRemaining(totalSeconds);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainderSecs = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(remainderSecs).padStart(2, '0')}`;
  };

  const progressPercent = totalSeconds > 0 ? ((totalSeconds - secondsRemaining) / totalSeconds) * 100 : 0;

  const getModeColor = () => {
    if (mode === 'focus') return colors.accent;
    if (mode === 'short_break') return colors.fitness;
    return colors.water;
  };

  return (
    <Card style={styles.card}>
      {/* Mode Selectors */}
      <View style={styles.modeTabs}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => handleModeChange('focus')}
          style={[
            styles.modeTab,
            mode === 'focus' && { backgroundColor: colors.accent, borderColor: colors.accent },
          ]}
        >
          <Text
            style={[
              Typography.caption,
              { color: mode === 'focus' ? '#FFF' : colors.textSecondary, fontWeight: '700' },
            ]}
          >
            25m Focus
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => handleModeChange('short_break')}
          style={[
            styles.modeTab,
            mode === 'short_break' && { backgroundColor: colors.fitness, borderColor: colors.fitness },
          ]}
        >
          <Text
            style={[
              Typography.caption,
              { color: mode === 'short_break' ? '#FFF' : colors.textSecondary, fontWeight: '700' },
            ]}
          >
            5m Break
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => handleModeChange('long_break')}
          style={[
            styles.modeTab,
            mode === 'long_break' && { backgroundColor: colors.water, borderColor: colors.water },
          ]}
        >
          <Text
            style={[
              Typography.caption,
              { color: mode === 'long_break' ? '#FFF' : colors.textSecondary, fontWeight: '700' },
            ]}
          >
            15m Break
          </Text>
        </TouchableOpacity>
      </View>

      {/* Dial Center */}
      <View style={styles.dialContainer}>
        <CircularProgress
          size={180}
          strokeWidth={14}
          progress={progressPercent}
          color={getModeColor()}
          gradientColors={mode === 'focus' ? [colors.accentLight, colors.accent] : undefined}
        >
          <Text style={[Typography.h1, { color: colors.text, fontSize: 36 }]}>
            {formatTime(secondsRemaining)}
          </Text>
          <Text style={[Typography.caption, { color: getModeColor(), fontWeight: '700', marginTop: 4 }]}>
            {mode === 'focus' ? '🎯 DEEP FOCUS' : '☕ RECHARGE'}
          </Text>
        </CircularProgress>
      </View>

      {/* Control Buttons */}
      <View style={styles.controlsRow}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={resetTimer}
          style={[styles.controlBtn, { backgroundColor: colors.cardSecondary, borderColor: colors.border }]}
        >
          <Ionicons name="refresh-outline" size={22} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={toggleTimer}
          style={[styles.mainActionBtn, { backgroundColor: getModeColor() }]}
        >
          <Ionicons name={isActive ? 'pause' : 'play'} size={24} color="#FFF" />
          <Text style={[Typography.bodyBold, { color: '#FFF', marginLeft: Spacing.sm }]}>
            {isActive ? 'Pause' : secondsRemaining === 0 ? 'Restart' : 'Start'}
          </Text>
        </TouchableOpacity>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: Spacing.lg,
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.md,
  },
  modeTabs: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  modeTab: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  dialContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  controlBtn: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  mainActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    minWidth: 140,
  },
});
