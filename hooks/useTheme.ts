import { useLocalStorage } from './useLocalStorage';
import { useEffect, useMemo } from 'react';
import type { CustomTheme, ThemeColors, ThemeType } from '../types';

// 预设主题配置
const presetThemes: CustomTheme[] = [
  {
    id: 'light',
    name: '浅色主题',
    isDark: false,
    isCustom: false,
    colors: {
      primary: '#6366f1',
      secondary: '#8b5cf6',
      background: '#ffffff',
      surface: '#f8fafc',
      text: '#1f2937',
      textSecondary: '#6b7280',
      border: '#e5e7eb',
      accent: '#3b82f6'
    }
  },
  {
    id: 'dark',
    name: '深色主题',
    isDark: true,
    isCustom: false,
    colors: {
      primary: '#818cf8',
      secondary: '#a78bfa',
      background: '#111827',
      surface: '#1f2937',
      text: '#f9fafb',
      textSecondary: '#d1d5db',
      border: '#374151',
      accent: '#60a5fa'
    }
  }
];

export function useTheme() {
  const [activeThemeId, setActiveThemeId] = useLocalStorage<string>('active-theme', 'light');
  const [customThemes, setCustomThemes] = useLocalStorage<CustomTheme[]>('custom-themes', []);

  const allThemes = useMemo(() => [...presetThemes, ...customThemes], [customThemes]);
  const currentTheme = useMemo(() =>
    allThemes.find(t => t.id === activeThemeId) || presetThemes[0],
    [allThemes, activeThemeId]
  );

  useEffect(() => {
    const root = document.documentElement;

    // 应用主题类
    root.classList.toggle('dark', currentTheme.isDark);

    // 应用 CSS 变量
    Object.entries(currentTheme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--theme-${key}`, value);
    });
  }, [currentTheme]);

  const setTheme = (themeId: string) => {
    setActiveThemeId(themeId);
  };

  const toggleTheme = () => {
    const nextTheme = currentTheme.isDark ? 'light' : 'dark';
    setActiveThemeId(nextTheme);
  };

  const saveCustomTheme = (theme: Omit<CustomTheme, 'id' | 'isCustom'>) => {
    const newTheme: CustomTheme = {
      ...theme,
      id: `custom-${Date.now()}`,
      isCustom: true
    };
    setCustomThemes(prev => [...prev, newTheme]);
    return newTheme.id;
  };

  const deleteCustomTheme = (themeId: string) => {
    setCustomThemes(prev => prev.filter(t => t.id !== themeId));
    if (activeThemeId === themeId) {
      setActiveThemeId('light');
    }
  };

  return {
    currentTheme,
    allThemes,
    presetThemes,
    customThemes,
    setTheme,
    toggleTheme,
    saveCustomTheme,
    deleteCustomTheme
  };
}