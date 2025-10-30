
export interface Site {
  id: string;
  url: string;
  name: string;
  category: string;
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
