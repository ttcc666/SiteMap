import { Site } from '../types';

// 推荐结果接口
export interface Recommendation {
  site: Site;
  score: number;
  reasons: string[];
  type: 'frequent' | 'similar' | 'trending' | 'time_based';
}

// 使用模式分析结果
export interface UsagePattern {
  hourlyDistribution: number[];
  dailyDistribution: number[];
  categoryPreferences: Record<string, number>;
  frequentSites: string[];
}

// 推荐引擎类
export class RecommendationEngine {
  private sites: Site[];
  private clickData: Record<string, any>;

  constructor(sites: Site[], clickData: Record<string, any> = {}) {
    this.sites = sites;
    this.clickData = clickData;
  }

  /**
   * 获取个性化推荐
   */
  getRecommendations(limit: number = 5): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // 1. 基于使用频率的推荐
    const frequentRecommendations = this.getFrequentSiteRecommendations();
    recommendations.push(...frequentRecommendations);

    // 2. 基于相似性的推荐
    const similarRecommendations = this.getSimilarSiteRecommendations();
    recommendations.push(...similarRecommendations);

    // 3. 基于时间模式的推荐
    const timeBasedRecommendations = this.getTimeBasedRecommendations();
    recommendations.push(...timeBasedRecommendations);

    // 4. 趋势推荐
    const trendingRecommendations = this.getTrendingRecommendations();
    recommendations.push(...trendingRecommendations);

    // 去重并按分数排序
    const uniqueRecommendations = this.deduplicateRecommendations(recommendations);
    return uniqueRecommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /**
   * 分析用户使用模式
   */
  analyzeUsagePattern(): UsagePattern {
    const hourlyDistribution = new Array(24).fill(0);
    const dailyDistribution = new Array(7).fill(0);
    const categoryPreferences: Record<string, number> = {};
    const siteClickCounts: Record<string, number> = {};

    // 分析点击数据
    for (const [siteId, data] of Object.entries(this.clickData)) {
      const site = this.sites.find(s => s.id === siteId);
      if (!site) continue;

      const totalClicks = (data.daily || 0) + (data.weekly || 0) + (data.monthly || 0);
      siteClickCounts[siteId] = totalClicks;

      // 分类偏好统计
      const category = site.category || '未分类';
      categoryPreferences[category] = (categoryPreferences[category] || 0) + totalClicks;

      // 模拟时间分布（实际应用中应该有真实的时间戳数据）
      const hour = Math.floor(Math.random() * 24);
      const day = Math.floor(Math.random() * 7);
      hourlyDistribution[hour] += totalClicks;
      dailyDistribution[day] += totalClicks;
    }

    // 获取最常用的网站
    const frequentSites = Object.entries(siteClickCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([siteId]) => siteId);

    return {
      hourlyDistribution,
      dailyDistribution,
      categoryPreferences,
      frequentSites
    };
  }

  /**
   * 获取当前时间段的推荐
   */
  getCurrentTimeRecommendations(): Recommendation[] {
    const currentHour = new Date().getHours();
    const recommendations: Recommendation[] = [];

    // 根据时间段推荐不同类型的网站
    const timeBasedCategories = this.getTimeBasedCategories(currentHour);

    for (const category of timeBasedCategories) {
      const categorySites = this.sites.filter(s => s.category === category);
      for (const site of categorySites.slice(0, 2)) {
        recommendations.push({
          site,
          score: 0.7,
          reasons: [`适合${this.getTimeDescription(currentHour)}使用`],
          type: 'time_based'
        });
      }
    }

    return recommendations;
  }

  /**
   * 获取相似网站推荐
   */
  private getSimilarSiteRecommendations(): Recommendation[] {
    const recommendations: Recommendation[] = [];
    const usagePattern = this.analyzeUsagePattern();

    // 基于最常用的网站找相似网站
    for (const frequentSiteId of usagePattern.frequentSites.slice(0, 3)) {
      const frequentSite = this.sites.find(s => s.id === frequentSiteId);
      if (!frequentSite) continue;

      const similarSites = this.findSimilarSites(frequentSite);
      for (const similarSite of similarSites.slice(0, 2)) {
        recommendations.push({
          site: similarSite,
          score: 0.6,
          reasons: [`与常用网站"${frequentSite.name}"相似`],
          type: 'similar'
        });
      }
    }

    return recommendations;
  }

  /**
   * 获取基于使用频率的推荐
   */
  private getFrequentSiteRecommendations(): Recommendation[] {
    const recommendations: Recommendation[] = [];
    const usagePattern = this.analyzeUsagePattern();

    // 推荐最常用分类中的其他网站
    const topCategories = Object.entries(usagePattern.categoryPreferences)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 2)
      .map(([category]) => category);

    for (const category of topCategories) {
      const categorySites = this.sites
        .filter(s => s.category === category)
        .filter(s => !usagePattern.frequentSites.includes(s.id));

      for (const site of categorySites.slice(0, 2)) {
        recommendations.push({
          site,
          score: 0.8,
          reasons: [`您经常使用"${category}"类网站`],
          type: 'frequent'
        });
      }
    }

    return recommendations;
  }

  /**
   * 获取基于时间的推荐
   */
  private getTimeBasedRecommendations(): Recommendation[] {
    return this.getCurrentTimeRecommendations();
  }

  /**
   * 获取趋势推荐
   */
  private getTrendingRecommendations(): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // 模拟趋势数据（实际应用中应该基于真实的趋势分析）
    const trendingSites = this.sites
      .filter(s => s.tags && s.tags.some(tag =>
        ['热门', '新增', '推荐', 'trending', 'popular'].includes(tag.toLowerCase())
      ))
      .slice(0, 3);

    for (const site of trendingSites) {
      recommendations.push({
        site,
        score: 0.5,
        reasons: ['当前热门网站'],
        type: 'trending'
      });
    }

    return recommendations;
  }

  /**
   * 查找相似网站
   */
  private findSimilarSites(targetSite: Site): Site[] {
    const similarSites: Site[] = [];

    for (const site of this.sites) {
      if (site.id === targetSite.id) continue;

      let similarity = 0;

      // 分类相同
      if (site.category === targetSite.category) {
        similarity += 0.5;
      }

      // 标签相似
      if (site.tags && targetSite.tags) {
        const commonTags = site.tags.filter(tag =>
          targetSite.tags!.includes(tag)
        ).length;
        similarity += (commonTags / Math.max(site.tags.length, targetSite.tags.length)) * 0.3;
      }

      // 域名相似
      const siteDomain = this.extractDomain(site.url);
      const targetDomain = this.extractDomain(targetSite.url);
      if (siteDomain.includes(targetDomain) || targetDomain.includes(siteDomain)) {
        similarity += 0.2;
      }

      if (similarity > 0.3) {
        similarSites.push(site);
      }
    }

    return similarSites.sort((a, b) => {
      const aScore = this.calculateSimilarity(a, targetSite);
      const bScore = this.calculateSimilarity(b, targetSite);
      return bScore - aScore;
    });
  }

  /**
   * 计算网站相似度
   */
  private calculateSimilarity(site1: Site, site2: Site): number {
    let similarity = 0;

    if (site1.category === site2.category) similarity += 0.5;

    if (site1.tags && site2.tags) {
      const commonTags = site1.tags.filter(tag => site2.tags!.includes(tag)).length;
      similarity += (commonTags / Math.max(site1.tags.length, site2.tags.length)) * 0.3;
    }

    const domain1 = this.extractDomain(site1.url);
    const domain2 = this.extractDomain(site2.url);
    if (domain1.includes(domain2) || domain2.includes(domain1)) {
      similarity += 0.2;
    }

    return similarity;
  }

  /**
   * 去重推荐结果
   */
  private deduplicateRecommendations(recommendations: Recommendation[]): Recommendation[] {
    const seen = new Set<string>();
    const unique: Recommendation[] = [];

    for (const rec of recommendations) {
      if (!seen.has(rec.site.id)) {
        seen.add(rec.site.id);
        unique.push(rec);
      }
    }

    return unique;
  }

  /**
   * 根据时间获取推荐分类
   */
  private getTimeBasedCategories(hour: number): string[] {
    if (hour >= 9 && hour <= 18) {
      return ['工作办公', '开发工具', '学习教育'];
    } else if (hour >= 19 && hour <= 23) {
      return ['视频娱乐', '购物电商', '社交媒体'];
    } else {
      return ['新闻资讯', '生活服务'];
    }
  }

  /**
   * 获取时间描述
   */
  private getTimeDescription(hour: number): string {
    if (hour >= 6 && hour <= 11) return '上午';
    if (hour >= 12 && hour <= 17) return '下午';
    if (hour >= 18 && hour <= 23) return '晚上';
    return '深夜';
  }

  /**
   * 提取域名
   */
  private extractDomain(url: string): string {
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      return urlObj.hostname.replace(/^www\./, '');
    } catch {
      return url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0];
    }
  }
}

// 工具函数
export function createRecommendationEngine(sites: Site[], clickData: Record<string, any> = {}): RecommendationEngine {
  return new RecommendationEngine(sites, clickData);
}

export function formatRecommendationScore(score: number): string {
  return `${Math.round(score * 100)}%`;
}

export function getRecommendationTypeLabel(type: Recommendation['type']): string {
  const labels = {
    frequent: '常用推荐',
    similar: '相似推荐',
    trending: '热门推荐',
    time_based: '时段推荐'
  };
  return labels[type];
}