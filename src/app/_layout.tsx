import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, Platform, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { AppProvider, useApp } from '../context/AppContext';
import { DeviceModeProvider, useDeviceMode } from '../context/DeviceModeContext';
import { GlassBackground } from '../components/common/GlassBackground';
import { Ionicons } from '@expo/vector-icons';
import '../global.css';

function RootNavigation() {
  const { isDark, colors } = useTheme();
  const { isLoading, isOnboarded } = useApp();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      const inOnboarding = segments[0] === 'onboarding';
      if (!isOnboarded && !inOnboarding) {
        router.replace('/onboarding');
      } else if (isOnboarded && inOnboarding) {
        router.replace('/(tabs)');
      }
    }
  }, [isLoading, isOnboarded, segments]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: 'transparent', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: 'transparent' },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen
          name="profile"
          options={{
            headerShown: true,
            title: 'My Profile',
            headerStyle: { backgroundColor: colors.card },
            headerTintColor: colors.text,
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="settings"
          options={{
            headerShown: true,
            title: 'Settings',
            headerStyle: { backgroundColor: colors.card },
            headerTintColor: colors.text,
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="quick-log"
          options={{
            headerShown: false,
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="workout-active"
          options={{
            headerShown: false,
            presentation: 'fullScreenModal',
          }}
        />
        <Stack.Screen
          name="exercise-library"
          options={{
            headerShown: true,
            title: 'Exercise Library',
            headerStyle: { backgroundColor: colors.card },
            headerTintColor: colors.text,
            presentation: 'modal',
          }}
        />
      </Stack>
    </>
  );
}

function WebDesktopControlBar() {
  const { mode, setMode } = useDeviceMode();
  const { isDark, toggleTheme } = useTheme();

  return (
    <View style={styles.webControlBar}>
      {/* Brand Badge */}
      <View style={styles.brandBadge}>
        <View style={styles.brandDot} />
        <Text style={styles.brandText}>FitLife Pro</Text>
        <View style={styles.glassTag}>
          <Text style={styles.glassTagText}>GLASSMORPHISM</Text>
        </View>
      </View>

      {/* Device Switcher Pills */}
      <View style={styles.devicePillGroup}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setMode('mobile')}
          style={[
            styles.modePillBtn,
            mode === 'mobile' && styles.modePillBtnActive,
          ]}
        >
          <Ionicons
            name="phone-portrait-outline"
            size={14}
            color={mode === 'mobile' ? '#10B981' : '#94A3B8'}
          />
          <Text
            style={[
              styles.modePillText,
              mode === 'mobile' && { color: '#10B981', fontWeight: '700' },
            ]}
          >
            Mobile
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setMode('laptop')}
          style={[
            styles.modePillBtn,
            mode === 'laptop' && styles.modePillBtnActive,
          ]}
        >
          <Ionicons
            name="laptop-outline"
            size={14}
            color={mode === 'laptop' ? '#10B981' : '#94A3B8'}
          />
          <Text
            style={[
              styles.modePillText,
              mode === 'laptop' && { color: '#10B981', fontWeight: '700' },
            ]}
          >
            Laptop
          </Text>
        </TouchableOpacity>
      </View>

      {/* Theme Toggle Pill */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={toggleTheme}
        style={styles.themePillBtn}
      >
        <Ionicons
          name={isDark ? 'moon-outline' : 'sunny-outline'}
          size={14}
          color={isDark ? '#818CF8' : '#F59E0B'}
        />
        <Text style={styles.themePillText}>
          {isDark ? 'Dark' : 'Light'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

function WebShellWrapper({ children }: { children: React.ReactNode }) {
  const { colors, isDark } = useTheme();
  const { mode } = useDeviceMode();

  if (Platform.OS !== 'web') {
    return <GlassBackground>{children}</GlassBackground>;
  }

  const isLaptop = mode === 'laptop';

  return (
    <View style={styles.webOuter}>
      {/* Top Floating Glass Control Dock */}
      <WebDesktopControlBar />

      {/* Device Frame */}
      <View
        style={[
          isLaptop ? styles.webFrameLaptop : styles.webFrameMobile,
          {
            borderColor: isDark ? 'rgba(255, 255, 255, 0.16)' : 'rgba(255, 255, 255, 0.8)',
            backgroundColor: isDark ? 'rgba(7, 10, 16, 0.92)' : 'rgba(240, 244, 248, 0.92)',
          },
        ]}
      >
        {/* Dynamic Top Bar for Laptop Mode */}
        {isLaptop && (
          <View
            style={[
              styles.laptopWindowHeader,
              {
                borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
                backgroundColor: isDark ? 'rgba(15, 23, 42, 0.65)' : 'rgba(255, 255, 255, 0.75)',
              },
            ]}
          >
            <View style={styles.windowDots}>
              <View style={[styles.windowDot, { backgroundColor: '#EF4444' }]} />
              <View style={[styles.windowDot, { backgroundColor: '#F59E0B' }]} />
              <View style={[styles.windowDot, { backgroundColor: '#10B981' }]} />
            </View>
            <Text style={[styles.windowTitle, { color: colors.textSecondary }]}>
              FitLife Pro — Live Health & Fitness Workspace
            </Text>
            <View style={styles.windowStatus}>
              <View style={styles.activeDot} />
              <Text style={styles.windowStatusText}>Active Session</Text>
            </View>
          </View>
        )}

        {/* Dynamic Island / Speaker for Mobile Mode */}
        {!isLaptop && (
          <View style={styles.mobileSpeakerRow}>
            <View style={styles.mobileDynamicIsland}>
              <View style={styles.islandCamera} />
            </View>
          </View>
        )}

        {/* Core Glass App Canvas */}
        <View style={{ flex: 1, width: '100%', height: '100%', position: 'relative' }}>
          <GlassBackground style={{ flex: 1 }}>
            {children}
          </GlassBackground>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  webOuter: {
    flex: 1,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#050811',
    paddingVertical: 18,
    paddingHorizontal: 16,
    overflow: 'hidden',
  },
  webControlBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 1240,
    marginBottom: 14,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 9999,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandDot: {
    width: 8,
    height: 8,
    borderRadius: 9999,
    backgroundColor: '#10B981',
  },
  brandText: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  glassTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  glassTagText: {
    color: '#34D399',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  devicePillGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 9999,
    padding: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  modePillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 9999,
  },
  modePillBtnActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.35)',
  },
  modePillText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  themePillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 9999,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  themePillText: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '600',
  },
  webFrameMobile: {
    width: '100%',
    maxWidth: 420,
    height: '92%',
    maxHeight: 890,
    borderRadius: 44,
    overflow: 'hidden',
    borderWidth: 2,
    position: 'relative',
  },
  webFrameLaptop: {
    width: '100%',
    maxWidth: 1240,
    height: '92%',
    maxHeight: 920,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1.5,
    position: 'relative',
  },
  laptopWindowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    zIndex: 10,
  },
  windowDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  windowDot: {
    width: 10,
    height: 10,
    borderRadius: 9999,
  },
  windowTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  windowStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 9999,
    backgroundColor: '#10B981',
  },
  windowStatusText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '600',
  },
  mobileSpeakerRow: {
    position: 'absolute',
    top: 8,
    left: 0,
    right: 0,
    zIndex: 999,
    alignItems: 'center',
    pointerEvents: 'none',
  },
  mobileDynamicIsland: {
    width: 115,
    height: 24,
    borderRadius: 20,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  islandCamera: {
    width: 8,
    height: 8,
    borderRadius: 9999,
    backgroundColor: '#151C28',
    marginLeft: 50,
  },
});

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AppProvider>
        <DeviceModeProvider>
          <WebShellWrapper>
            <RootNavigation />
          </WebShellWrapper>
        </DeviceModeProvider>
      </AppProvider>
    </ThemeProvider>
  );
}
