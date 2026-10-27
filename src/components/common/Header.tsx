import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useApp } from '../../context/AppContext';
import { BorderRadius, Spacing, Typography } from '../../constants/theme';
import * as Haptics from 'expo-haptics';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showProfile?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle, showProfile = true }) => {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { profile } = useApp();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getFormattedDate = () => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    };
    return new Date().toLocaleDateString('en-US', options);
  };

  const userName = profile?.name ? profile.name.split(' ')[0] : 'Athlete';

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <View style={styles.greetingPill}>
          <View style={styles.greetingDot} />
          <Text style={[Typography.subtextBold, { color: colors.primaryLight || colors.primary, fontSize: 12 }]}>
            {subtitle || `${getGreeting()}, ${userName}`}
          </Text>
        </View>
        <Text style={[Typography.h1, { color: colors.text, marginTop: 4, letterSpacing: -0.6 }]}>
          {title || getFormattedDate()}
        </Text>
      </View>

      {showProfile && (
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/settings');
            }}
            style={[
              styles.iconButton,
              {
                backgroundColor: colors.cardSecondary,
                borderColor: colors.border,
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                boxShadow: isDark
                  ? '0 4px 14px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.16)'
                  : '0 4px 14px rgba(0, 0, 0, 0.05), inset 0 1px 1px rgba(255, 255, 255, 0.8)',
              } as any,
            ]}
          >
            <Ionicons name="settings-outline" size={19} color={colors.text} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/profile');
            }}
            style={[
              styles.avatarButton,
              {
                backgroundColor: isDark ? 'rgba(16, 185, 129, 0.18)' : 'rgba(5, 150, 105, 0.14)',
                borderColor: colors.primary,
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                boxShadow: '0 0 18px rgba(16, 185, 129, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.25)',
              } as any,
            ]}
          >
            <Text style={[Typography.bodyBold, { color: colors.primary, fontWeight: '800' }]}>
              {userName.charAt(0).toUpperCase()}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md + 4,
    paddingBottom: Spacing.sm,
  },
  textContainer: {
    flex: 1,
  },
  greetingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.22)',
  },
  greetingDot: {
    width: 6,
    height: 6,
    borderRadius: 9999,
    backgroundColor: '#10B981',
    // @ts-ignore
    boxShadow: '0 0 6px #10B981',
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  avatarButton: {
    width: 42,
    height: 42,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
});
