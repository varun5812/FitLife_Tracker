import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { Platform, View, StyleSheet } from 'react-native';

export default function TabsLayout() {
  const { colors, isDark } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: Platform.OS === 'web' ? 16 : Platform.OS === 'ios' ? 24 : 14,
          left: 16,
          right: 16,
          backgroundColor: isDark ? 'rgba(15, 23, 42, 0.74)' : 'rgba(255, 255, 255, 0.82)',
          borderWidth: 1,
          borderColor: isDark ? 'rgba(255, 255, 255, 0.16)' : 'rgba(255, 255, 255, 0.8)',
          borderRadius: 26,
          height: 64,
          paddingBottom: 6,
          paddingTop: 6,
          elevation: 12,
          backdropFilter: 'blur(24px) saturate(200%)',
          WebkitBackdropFilter: 'blur(24px) saturate(200%)',
          boxShadow: isDark
            ? '0 16px 44px rgba(0, 0, 0, 0.55), inset 0 1px 1px rgba(255, 255, 255, 0.22)'
            : '0 14px 36px rgba(100, 116, 139, 0.16), inset 0 1px 1px rgba(255, 255, 255, 0.95)',
        } as any,
        tabBarActiveTintColor: colors.tabBarActive,
        tabBarInactiveTintColor: colors.tabBarInactive,
        tabBarLabelStyle: {
          fontSize: 10.5,
          fontWeight: '700',
          letterSpacing: 0.2,
          marginTop: -2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Today',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconPill, focused && { backgroundColor: `${colors.primary}20`, borderColor: `${colors.primary}45` }]}>
              <Ionicons name={focused ? 'grid' : 'grid-outline'} size={20} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="fitness"
        options={{
          title: 'Fitness',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconPill, focused && { backgroundColor: `${colors.fitness}20`, borderColor: `${colors.fitness}45` }]}>
              <Ionicons name={focused ? 'barbell' : 'barbell-outline'} size={20} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="food"
        options={{
          title: 'Food',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconPill, focused && { backgroundColor: `${colors.nutrition}20`, borderColor: `${colors.nutrition}45` }]}>
              <Ionicons name={focused ? 'restaurant' : 'restaurant-outline'} size={20} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="time"
        options={{
          title: 'Time',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconPill, focused && { backgroundColor: `${colors.time}20`, borderColor: `${colors.time}45` }]}>
              <Ionicons name={focused ? 'time' : 'time-outline'} size={20} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconPill, focused && { backgroundColor: `${colors.accent}20`, borderColor: `${colors.accent}45` }]}>
              <Ionicons name={focused ? 'stats-chart' : 'stats-chart-outline'} size={20} color={color} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconPill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
