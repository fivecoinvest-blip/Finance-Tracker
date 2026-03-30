import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { LightColors, DarkColors, type ColorPalette } from '@/constants/colors';

interface ThemeContextValue {
  isDark: boolean;
  toggleTheme: () => void;
  colors: ColorPalette;
}

const ThemeContext = createContext<ThemeContextValue>({
  isDark: false,
  toggleTheme: () => {},
  colors: LightColors,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('@cashper_dark_mode').then(v => {
      if (v === 'true') setIsDark(true);
    });
  }, []);

  const toggleTheme = useCallback(async () => {
    const next = !isDark;
    setIsDark(next);
    await AsyncStorage.setItem('@cashper_dark_mode', String(next));
  }, [isDark]);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, colors: isDark ? DarkColors : LightColors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

export function useColors(): ColorPalette {
  return useContext(ThemeContext).colors;
}
