import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { UserProfile, DailySummary } from '../types';
import { getProfile } from '../services/profileService';
import { computeDailySummary } from '../services/dailyScoreService';
import { getDatabase } from '../database/db';

interface AppContextType {
  profile: UserProfile | null;
  todaySummary: DailySummary | null;
  currentDate: string;
  setCurrentDate: (date: string) => void;
  isLoading: boolean;
  isOnboarded: boolean;
  refreshKey: number;
  refreshData: () => Promise<void>;
  updateProfileState: (profile: UserProfile) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [todaySummary, setTodaySummary] = useState<DailySummary | null>(null);
  const [currentDate, setCurrentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isOnboarded, setIsOnboarded] = useState<boolean>(false);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  const loadData = useCallback(async () => {
    try {
      // Ensure database is initialized
      await getDatabase();

      const userProf = await getProfile();
      setProfile(userProf);
      setIsOnboarded(!!userProf && !!userProf.name);

      const summary = await computeDailySummary(currentDate);
      setTodaySummary(summary);
    } catch (error) {
      console.warn('Error loading app data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentDate]);

  useEffect(() => {
    loadData();
  }, [loadData, refreshKey]);

  const refreshData = async () => {
    setRefreshKey(prev => prev + 1);
  };

  const updateProfileState = (newProf: UserProfile) => {
    setProfile(newProf);
    setIsOnboarded(true);
    refreshData();
  };

  return (
    <AppContext.Provider
      value={{
        profile,
        todaySummary,
        currentDate,
        setCurrentDate,
        isLoading,
        isOnboarded,
        refreshKey,
        refreshData,
        updateProfileState,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
