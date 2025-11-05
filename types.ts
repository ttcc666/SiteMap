
export interface Site {
  id: string;
  url: string;
  name: string;
  category: string;
  tags?: string[];
  description?: string;
}

export interface SiteClickData {
  daily: number;
  weekly: number;
  monthly: number;
  lastDailyReset: number;
  lastWeeklyReset: number;
  lastMonthlyReset: number;
}

export interface AllSiteClickData {
  [siteId: string]: SiteClickData;
}

// 主题相关类型定义
export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  accent: string;
}

export interface CustomTheme {
  id: string;
  name: string;
  colors: ThemeColors;
  isDark: boolean;
  isCustom: boolean;
}

export type ThemeType = 'light' | 'dark' | 'custom';
