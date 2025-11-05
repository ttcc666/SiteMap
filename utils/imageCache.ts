/**
 * 图标缓存管理工具
 * 使用 LRU (最近最少使用) 策略管理图标缓存
 */

interface CacheItem {
  url: string;
  timestamp: number;
  accessCount: number;
  isSuccess: boolean;
}

class ImageCache {
  private cache = new Map<string, CacheItem>();
  private readonly maxSize: number;
  private readonly storageKey = 'favicon-cache';
  private readonly cacheExpiry = 7 * 24 * 60 * 60 * 1000; // 7天

  constructor(maxSize = 200) {
    this.maxSize = maxSize;
    this.loadFromStorage();
  }

  /**
   * 从localStorage加载缓存
   */
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        const now = Date.now();

        for (const [domain, item] of Object.entries(data)) {
          const cacheItem = item as CacheItem;
          // 检查是否过期
          if (now - cacheItem.timestamp < this.cacheExpiry) {
            this.cache.set(domain, cacheItem);
          }
        }
      }
    } catch (e) {
      // 忽略localStorage错误
    }
  }

  /**
   * 保存缓存到localStorage
   */
  private saveToStorage(): void {
    try {
      const data = Object.fromEntries(this.cache.entries());
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (e) {
      // 忽略localStorage错误
    }
  }

  /**
   * 获取缓存的图标URL
   */
  get(domain: string): string | null {
    const item = this.cache.get(domain);
    if (item && item.isSuccess) {
      // 更新访问时间和次数
      item.timestamp = Date.now();
      item.accessCount++;
      this.saveToStorage();
      return item.url;
    }
    return null;
  }

  /**
   * 检查域名是否已失败缓存
   */
  isFailed(domain: string): boolean {
    const item = this.cache.get(domain);
    return item ? !item.isSuccess : false;
  }

  /**
   * 设置图标缓存
   */
  set(domain: string, url: string, isSuccess: boolean = true): void {
    // 如果缓存已满，删除最少使用的项目
    if (this.cache.size >= this.maxSize && !this.cache.has(domain)) {
      this.evictLRU();
    }

    this.cache.set(domain, {
      url,
      timestamp: Date.now(),
      accessCount: 1,
      isSuccess
    });

    this.saveToStorage();
  }

  /**
   * 设置失败缓存
   */
  setFailed(domain: string): void {
    this.set(domain, '', false);
  }

  /**
   * 删除最少使用的缓存项
   */
  private evictLRU(): void {
    let lruKey = '';
    let lruScore = Infinity;

    for (const [key, item] of this.cache.entries()) {
      // LRU 评分：访问次数越少，时间越久，评分越低
      const score = item.accessCount * Math.log(Date.now() - item.timestamp + 1);
      if (score < lruScore) {
        lruScore = score;
        lruKey = key;
      }
    }

    if (lruKey) {
      this.cache.delete(lruKey);
    }
  }

  /**
   * 清除所有缓存
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * 获取缓存统计信息
   */
  getStats(): { size: number; maxSize: number; hitRate: number } {
    const totalAccess = Array.from(this.cache.values())
      .reduce((sum, item) => sum + item.accessCount, 0);

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: totalAccess > 0 ? this.cache.size / totalAccess : 0
    };
  }

  /**
   * 检查域名是否已缓存
   */
  has(domain: string): boolean {
    return this.cache.has(domain);
  }
}

// 全局图标缓存实例
export const imageCache = new ImageCache();

/**
 * 从URL提取域名
 */
export const extractDomain = (url: string): string => {
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    return urlObj.hostname.replace(/^www\./, '');
  } catch {
    return url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0];
  }
};

/**
 * 生成DuckDuckGo图标URL
 */
export const generateFaviconUrl = (domain: string): string => {
  return `https://icons.duckduckgo.com/ip3/${domain}.ico`;
};