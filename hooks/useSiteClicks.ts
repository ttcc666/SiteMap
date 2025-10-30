import { useLocalStorage } from './useLocalStorage';
import type { AllSiteClickData } from '../types';

// 获取一天的开始时间（午夜）
const getStartOfDay = (date: Date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

// 获取一周的开始时间（周一）
const getStartOfWeek = (date: Date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // 如果是周日，则-6，否则+1
  const startOfWeek = new Date(d.setDate(diff));
  startOfWeek.setHours(0, 0, 0, 0);
  return startOfWeek;
};

// 获取一个月的开始时间
const getStartOfMonth = (date: Date) => {
  const d = new Date(date);
  return new Date(d.getFullYear(), d.getMonth(), 1);
};


export function useSiteClicks() {
  const [clickData, setClickData] = useLocalStorage<AllSiteClickData>('site-clicks', {});

  const trackClick = (siteId: string) => {
    setClickData(prevData => {
      const now = new Date();
      const todayStart = getStartOfDay(now).getTime();
      const thisWeekStart = getStartOfWeek(now).getTime();
      const thisMonthStart = getStartOfMonth(now).getTime();
      
      const currentSiteData = prevData[siteId] || {
        daily: 0,
        weekly: 0,
        monthly: 0,
        lastDailyReset: 0,
        lastWeeklyReset: 0,
        lastMonthlyReset: 0,
      };

      const newData = { ...currentSiteData };

      // 每日重置检查
      if (currentSiteData.lastDailyReset < todayStart) {
        newData.daily = 1;
        newData.lastDailyReset = todayStart;
      } else {
        newData.daily += 1;
      }

      // 每周重置检查
      if (currentSiteData.lastWeeklyReset < thisWeekStart) {
        newData.weekly = 1;
        newData.lastWeeklyReset = thisWeekStart;
      } else {
        newData.weekly += 1;
      }
      
      // 每月重置检查
      if (currentSiteData.lastMonthlyReset < thisMonthStart) {
        newData.monthly = 1;
        newData.lastMonthlyReset = thisMonthStart;
      } else {
        newData.monthly += 1;
      }

      return {
        ...prevData,
        [siteId]: newData
      };
    });
  };

  const removeClickData = (siteId: string) => {
    setClickData(prevData => {
      const newData = { ...prevData };
      if (newData[siteId]) {
        delete newData[siteId];
      }
      return newData;
    });
  };

  return { clickData, trackClick, removeClickData };
}