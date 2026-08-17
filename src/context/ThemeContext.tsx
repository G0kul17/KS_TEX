import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppSettings } from '../types';
import { DEFAULT_SETTINGS, getStoredSettings, saveStoredSettings, subscribeToSettings } from '../lib/storage';

interface ThemeContextType {
  settings: AppSettings;
  updateSettings: (newSettings: AppSettings) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(() => getStoredSettings());

  useEffect(() => {
    // Apply theme attribute on root element
    document.documentElement.setAttribute('data-theme', settings.theme);
  }, [settings.theme]);

  // Subscribe to real-time Cloud Firestore settings updates
  useEffect(() => {
    const unsubscribe = subscribeToSettings((cloudSettings) => {
      setSettings(cloudSettings);
    });
    return () => unsubscribe();
  }, []);

  const updateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    saveStoredSettings(newSettings);
  };

  const toggleTheme = () => {
    const nextTheme = settings.theme === 'atelier-noir' ? 'daylight' : 'atelier-noir';
    const updated = { ...settings, theme: nextTheme as 'atelier-noir' | 'daylight' };
    updateSettings(updated);
  };

  return (
    <ThemeContext.Provider value={{ settings, updateSettings, toggleTheme }}>
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
