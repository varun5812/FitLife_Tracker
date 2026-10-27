import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface GlassBackgroundProps {
  children?: React.ReactNode;
  intensity?: 'normal' | 'subtle' | 'vibrant';
  style?: any;
}

export const GlassBackground: React.FC<GlassBackgroundProps> = ({
  children,
  intensity = 'normal',
  style,
}) => {
  const { colors, isDark } = useTheme();

  const opacityMultiplier = intensity === 'vibrant' ? 1.3 : intensity === 'subtle' ? 0.6 : 1.0;

  // Luminous aurora colors tailored for Glassmorphism
  const emeraldGlow = isDark
    ? `rgba(16, 185, 129, ${0.22 * opacityMultiplier})`
    : `rgba(16, 185, 129, ${0.12 * opacityMultiplier})`;
  
  const indigoGlow = isDark
    ? `rgba(99, 102, 241, ${0.20 * opacityMultiplier})`
    : `rgba(99, 102, 241, ${0.10 * opacityMultiplier})`;

  const cyanGlow = isDark
    ? `rgba(6, 182, 212, ${0.16 * opacityMultiplier})`
    : `rgba(6, 182, 212, ${0.08 * opacityMultiplier})`;

  const amberGlow = isDark
    ? `rgba(245, 158, 11, ${0.14 * opacityMultiplier})`
    : `rgba(245, 158, 11, ${0.08 * opacityMultiplier})`;

  const roseGlow = isDark
    ? `rgba(244, 63, 94, ${0.13 * opacityMultiplier})`
    : `rgba(244, 63, 94, ${0.07 * opacityMultiplier})`;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }, style]}>
      {/* Aurora Ambient Glow Layer */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {/* Top-Left Emerald Aurora Orb */}
        <View
          style={[
            styles.glowOrb,
            styles.orbTopLeft,
            {
              backgroundColor: emeraldGlow,
              // @ts-ignore
              filter: Platform.OS === 'web' ? 'blur(80px)' : undefined,
            },
          ]}
        />

        {/* Top-Right Indigo Nebula Orb */}
        <View
          style={[
            styles.glowOrb,
            styles.orbTopRight,
            {
              backgroundColor: indigoGlow,
              // @ts-ignore
              filter: Platform.OS === 'web' ? 'blur(85px)' : undefined,
            },
          ]}
        />

        {/* Center-Left Cyan Energy Orb */}
        <View
          style={[
            styles.glowOrb,
            styles.orbCenterLeft,
            {
              backgroundColor: cyanGlow,
              // @ts-ignore
              filter: Platform.OS === 'web' ? 'blur(75px)' : undefined,
            },
          ]}
        />

        {/* Bottom-Right Amber Solar Orb */}
        <View
          style={[
            styles.glowOrb,
            styles.orbBottomRight,
            {
              backgroundColor: amberGlow,
              // @ts-ignore
              filter: Platform.OS === 'web' ? 'blur(90px)' : undefined,
            },
          ]}
        />

        {/* Mid-Right Rose Flare Orb */}
        <View
          style={[
            styles.glowOrb,
            styles.orbMidRight,
            {
              backgroundColor: roseGlow,
              // @ts-ignore
              filter: Platform.OS === 'web' ? 'blur(80px)' : undefined,
            },
          ]}
        />

        {/* Subtle Frosted Vignette Mesh Overlay on Web */}
        {Platform.OS === 'web' && (
          <View
            style={[
              StyleSheet.absoluteFill,
              {
                // @ts-ignore
                backgroundImage: isDark
                  ? 'radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.03) 0%, transparent 60%)'
                  : 'radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.4) 0%, transparent 70%)',
                pointerEvents: 'none',
              },
            ]}
          />
        )}
      </View>

      {/* Screen Content */}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  glowOrb: {
    position: 'absolute',
    borderRadius: 9999,
  },
  orbTopLeft: {
    top: -80,
    left: -60,
    width: 280,
    height: 280,
  },
  orbTopRight: {
    top: -40,
    right: -80,
    width: 320,
    height: 320,
  },
  orbCenterLeft: {
    top: '40%',
    left: -100,
    width: 260,
    height: 260,
  },
  orbBottomRight: {
    bottom: -60,
    right: -60,
    width: 340,
    height: 340,
  },
  orbMidRight: {
    top: '55%',
    right: -80,
    width: 240,
    height: 240,
  },
});
