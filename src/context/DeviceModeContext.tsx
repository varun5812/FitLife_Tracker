import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type DeviceMode = 'mobile' | 'laptop';

const DEVICE_MODE_KEY = '@fitlife_device_mode';

interface DeviceModeContextType {
  mode: DeviceMode;
  setMode: (mode: DeviceMode) => void;
  toggleMode: () => void;
}

const DeviceModeContext = createContext<DeviceModeContextType | undefined>(undefined);

export const DeviceModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setCurrentMode] = useState<DeviceMode>('mobile');

  useEffect(() => {
    AsyncStorage.getItem(DEVICE_MODE_KEY).then(saved => {
      if (saved === 'laptop' || saved === 'mobile') {
        setCurrentMode(saved);
      }
    });
  }, []);

  const setMode = (newMode: DeviceMode) => {
    setCurrentMode(newMode);
    AsyncStorage.setItem(DEVICE_MODE_KEY, newMode);
  };

  const toggleMode = () => {
    const next = mode === 'mobile' ? 'laptop' : 'mobile';
    setMode(next);
  };

  return (
    <DeviceModeContext.Provider value={{ mode, setMode, toggleMode }}>
      {children}
    </DeviceModeContext.Provider>
  );
};

export const useDeviceMode = () => {
  const context = useContext(DeviceModeContext);
  if (!context) {
    throw new Error('useDeviceMode must be used within a DeviceModeProvider');
  }
  return context;
};
