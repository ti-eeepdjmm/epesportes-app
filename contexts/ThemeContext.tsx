import React, { createContext, useContext, useEffect, useState } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeType = 'light' | 'dark';

interface ThemeContextProps {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  isSystem: boolean;
  toggleSystem: () => void;
}

const ThemeContext = createContext<ThemeContextProps>({
  theme: 'light',
  setTheme: () => {},
  isSystem: true,
  toggleSystem: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeType>('light');
  const [isSystem, setIsSystem] = useState(true);

  const loadTheme = async () => {
    const savedTheme = await AsyncStorage.getItem('userTheme');
    const savedSystem = await AsyncStorage.getItem('useSystemTheme');
    if (savedSystem === 'true' || savedSystem === null) {
      const systemTheme = Appearance.getColorScheme() || 'light';
      setThemeState(systemTheme);
      setIsSystem(true);
    } else if (savedTheme === 'dark' || savedTheme === 'light') {
      setThemeState(savedTheme);
      setIsSystem(false);
    }
  };

  useEffect(() => {
    loadTheme();
    const listener = Appearance.addChangeListener(({ colorScheme }) => {
      if (isSystem) setThemeState(colorScheme || 'light');
    });
    return () => listener.remove();
  }, [isSystem]);

  const setTheme = async (newTheme: ThemeType) => {
    setThemeState(newTheme);
    setIsSystem(false);
    await AsyncStorage.setItem('userTheme', newTheme);
    await AsyncStorage.setItem('useSystemTheme', 'false');
  };

  const toggleSystem = async () => {
    const newIsSystem = !isSystem;
    setIsSystem(newIsSystem);
    await AsyncStorage.setItem('useSystemTheme', newIsSystem.toString());
    if (newIsSystem) {
      const systemTheme = Appearance.getColorScheme() || 'light';
      setThemeState(systemTheme);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isSystem, toggleSystem }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => useContext(ThemeContext);
