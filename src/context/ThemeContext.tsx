import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, ThemeType } from '../constants/colors';

const THEME_STORAGE_KEY = '@fitlife_theme_preference';

interface ThemeContextType {
  theme: ThemeType;
  isDark: boolean;
  colors: typeof Colors.dark;
  toggleTheme: () => void;
  setTheme: (theme: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [theme, setCurrentTheme] = useState<ThemeType>('dark'); // Default to sleek dark mode

  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY).then(saved => {
      if (saved === 'light' || saved === 'dark') {
        setCurrentTheme(saved);
      } else if (systemColorScheme === 'light' || systemColorScheme === 'dark') {
        setCurrentTheme(systemColorScheme);
      }
    });
  }, [systemColorScheme]);

  const setTheme = (newTheme: ThemeType) => {
    setCurrentTheme(newTheme);
    AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
  };

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
  };

  const isDark = theme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  return (
    <ThemeContext.Provider value={{ theme, isDark, colors, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
