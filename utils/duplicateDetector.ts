import { Site } from '../types';

// 重复检测结果
export interface DuplicateResult {
  isDuplicate: boolean;
  similarity: number;
  matchedSite?: Site;
  reasons: string[];
  type: 'exact' | 'domain' | 'similar' | 'content';
}

// 重复检测配置
export interface DetectionConfig {
  exactUrlMatch: boolean;
  domainMatch: boolean;
  similarityThreshold: number;
  contentSimilarity: boolean;
}

// 默认配置
const DEFAULT_CONFIG: DetectionConfig = {
  exactUrlMatch: true,
  domainMatch: true,
  similarityThreshold: 0.8,
  contentSimilarity: true
};

// 增强重复检测器
export class DuplicateDetector {
  private sites: Site[];
  private config: DetectionConfig;

  constructor(sites: Site[], config: Partial<DetectionConfig> = {}) {
    this.sites = sites;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * 检测新网站是否重复
   */
  detectDuplicate(newSite: { url: string; name?: string; description?: string }): DuplicateResult {
    const normalizedUrl = this.normalizeUrl(newSite.url);
    const domain = this.extractDomain(normalizedUrl);

    // 1. 精确URL匹配
    if (this.config.exactUrlMatch) {
      const exactMatch = this.findExactUrlMatch(normalizedUrl);
      if (exactMatch) {
        return {
          isDuplicate: true,
          similarity: 1.0,
          matchedSite: exactMatch,
          reasons: ['URL完全相同'],
          type: 'exact'
        };
      }
    }

    // 2. 域名匹配
    if (this.config.domainMatch) {
      const domainMatch = this.findDomainMatch(domain, normalizedUrl);
      if (domainMatch) {
        return {
          isDuplicate: true,
          similarity: 0.9,
          matchedSite: domainMatch.site,
          reasons: domainMatch.reasons,
          type: 'domain'
        };
      }
    }

    // 3. 相似度检测
    const similarityMatch = this.findSimilarSite(newSite);
    if (similarityMatch && similarityMatch.similarity >= this.config.similarityThreshold) {
      return {
        isDuplicate: true,
        similarity: similarityMatch.similarity,
        matchedSite: similarityMatch.site,
        reasons: similarityMatch.reasons,
        type: 'similar'
      };
    }

    // 4. 内容相似性检测
    if (this.config.contentSimilarity) {
      const contentMatch = this.findContentSimilarity(newSite);
      if (contentMatch && contentMatch.similarity >= this.config.similarityThreshold) {
        return {
          isDuplicate: true,
          similarity: contentMatch.similarity,
          matchedSite: contentMatch.site,
          reasons: contentMatch.reasons,
          type: 'content'
        };
      }
    }

    return {
      isDuplicate: false,
      similarity: 0,
      reasons: [],
      type: 'exact'
    };
  }

  /**
   * 批量检测重复网站
   */
  findAllDuplicates(): Map<string, DuplicateResult[]> {
    const duplicates = new Map<string, DuplicateResult[]>();

    for (let i = 0; i < this.sites.length; i++) {
      const site = this.sites[i];
      const siteDuplicates: DuplicateResult[] = [];

      for (let j = i + 1; j < this.sites.length; j++) {
        const otherSite = this.sites[j];
        const result = this.compareSites(site, otherSite);

        if (result.isDuplicate) {
          siteDuplicates.push(result);
        }
      }

      if (siteDuplicates.length > 0) {
        duplicates.set(site.id, siteDuplicates);
      }
    }

    return duplicates;
  }

  /**
   * 获取重复统计信息
   */
  getDuplicateStats(): {
    totalDuplicates: number;
    duplicateGroups: number;
    duplicateTypes: Record<string, number>;
  } {
    const allDuplicates = this.findAllDuplicates();
    const duplicateTypes: Record<string, number> = {
      exact: 0,
      domain: 0,
      similar: 0,
      content: 0
    };

    let totalDuplicates = 0;

    for (const duplicateList of allDuplicates.values()) {
      totalDuplicates += duplicateList.length;
      duplicateList.forEach(dup => {
        duplicateTypes[dup.type]++;
      });
    }

    return {
      totalDuplicates,
      duplicateGroups: allDuplicates.size,
      duplicateTypes
    };
  }

  /**
   * 精确URL匹配
   */
  private findExactUrlMatch(normalizedUrl: string): Site | null {
    return this.sites.find(site =>
      this.normalizeUrl(site.url) === normalizedUrl
    ) || null;
  }

  /**
   * 域名匹配检测
   */
  private findDomainMatch(domain: string, url: string): { site: Site; reasons: string[] } | null {
    for (const site of this.sites) {
      const siteDomain = this.extractDomain(site.url);
      const siteUrl = this.normalizeUrl(site.url);

      // 相同域名但不同路径
      if (siteDomain === domain && siteUrl !== url) {
        const reasons = ['相同域名的不同页面'];

        // 检查是否为子域名
        if (this.isSubdomain(domain, siteDomain)) {
          reasons.push('子域名匹配');
        }

        return { site, reasons };
      }
    }

    return null;
  }

  /**
   * 相似网站检测
   */
  private findSimilarSite(newSite: { url: string; name?: string; description?: string }): {
    site: Site;
    similarity: number;
    reasons: string[];
  } | null {
    let bestMatch: { site: Site; similarity: number; reasons: string[] } | null = null;

    for (const site of this.sites) {
      const similarity = this.calculateSimilarity(newSite, site);

      if (similarity.score > (bestMatch?.similarity || 0)) {
        bestMatch = {
          site,
          similarity: similarity.score,
          reasons: similarity.reasons
        };
      }
    }

    return bestMatch;
  }

  /**
   * 内容相似性检测
   */
  private findContentSimilarity(newSite: { url: string; name?: string; description?: string }): {
    site: Site;
    similarity: number;
    reasons: string[];
  } | null {
    if (!newSite.name && !newSite.description) return null;

    let bestMatch: { site: Site; similarity: number; reasons: string[] } | null = null;

    for (const site of this.sites) {
      const similarity = this.calculateContentSimilarity(newSite, site);

      if (similarity.score > (bestMatch?.similarity || 0)) {
        bestMatch = {
          site,
          similarity: similarity.score,
          reasons: similarity.reasons
        };
      }
    }

    return bestMatch;
  }

  /**
   * 比较两个网站
   */
  private compareSites(site1: Site, site2: Site): DuplicateResult {
    const url1 = this.normalizeUrl(site1.url);
    const url2 = this.normalizeUrl(site2.url);

    // 精确匹配
    if (url1 === url2) {
      return {
        isDuplicate: true,
        similarity: 1.0,
        matchedSite: site2,
        reasons: ['URL完全相同'],
        type: 'exact'
      };
    }

    // 域名匹配
    const domain1 = this.extractDomain(url1);
    const domain2 = this.extractDomain(url2);

    if (domain1 === domain2) {
      return {
        isDuplicate: true,
        similarity: 0.9,
        matchedSite: site2,
        reasons: ['相同域名'],
        type: 'domain'
      };
    }

    // 相似度检测
    const similarity = this.calculateSimilarity(site1, site2);

    if (similarity.score >= this.config.similarityThreshold) {
      return {
        isDuplicate: true,
        similarity: similarity.score,
        matchedSite: site2,
        reasons: similarity.reasons,
        type: 'similar'
      };
    }

    return {
      isDuplicate: false,
      similarity: similarity.score,
      reasons: [],
      type: 'exact'
    };
  }

  /**
   * 计算网站相似度
   */
  private calculateSimilarity(
    site1: { url: string; name?: string; description?: string },
    site2: Site
  ): { score: number; reasons: string[] } {
    let score = 0;
    const reasons: string[] = [];

    // URL相似度
    const urlSimilarity = this.calculateUrlSimilarity(site1.url, site2.url);
    if (urlSimilarity > 0.5) {
      score += urlSimilarity * 0.4;
      reasons.push(`URL相似度: ${Math.round(urlSimilarity * 100)}%`);
    }

    // 名称相似度
    if (site1.name && site2.name) {
      const nameSimilarity = this.calculateStringSimilarity(site1.name, site2.name);
      if (nameSimilarity > 0.6) {
        score += nameSimilarity * 0.3;
        reasons.push(`名称相似度: ${Math.round(nameSimilarity * 100)}%`);
      }
    }

    // 描述相似度
    if (site1.description && site2.description) {
      const descSimilarity = this.calculateStringSimilarity(site1.description, site2.description);
      if (descSimilarity > 0.7) {
        score += descSimilarity * 0.3;
        reasons.push(`描述相似度: ${Math.round(descSimilarity * 100)}%`);
      }
    }

    return { score: Math.min(score, 1), reasons };
  }

  /**
   * 计算内容相似度
   */
  private calculateContentSimilarity(
    newSite: { name?: string; description?: string },
    existingSite: Site
  ): { score: number; reasons: string[] } {
    let score = 0;
    const reasons: string[] = [];

    if (newSite.name && existingSite.name) {
      const nameSimilarity = this.calculateStringSimilarity(newSite.name, existingSite.name);
      if (nameSimilarity > 0.8) {
        score += nameSimilarity * 0.6;
        reasons.push(`名称高度相似: ${Math.round(nameSimilarity * 100)}%`);
      }
    }

    if (newSite.description && existingSite.description) {
      const descSimilarity = this.calculateStringSimilarity(newSite.description, existingSite.description);
      if (descSimilarity > 0.8) {
        score += descSimilarity * 0.4;
        reasons.push(`描述高度相似: ${Math.round(descSimilarity * 100)}%`);
      }
    }

    return { score: Math.min(score, 1), reasons };
  }

  /**
   * 计算URL相似度
   */
  private calculateUrlSimilarity(url1: string, url2: string): number {
    const normalized1 = this.normalizeUrl(url1);
    const normalized2 = this.normalizeUrl(url2);

    // 域名相同得分较高
    const domain1 = this.extractDomain(normalized1);
    const domain2 = this.extractDomain(normalized2);

    if (domain1 === domain2) {
      return 0.8;
    }

    // 使用编辑距离计算相似度
    return this.calculateStringSimilarity(normalized1, normalized2);
  }

  /**
   * 计算字符串相似度 (Levenshtein距离)
   */
  private calculateStringSimilarity(str1: string, str2: string): number {
    const s1 = str1.toLowerCase().trim();
    const s2 = str2.toLowerCase().trim();

    if (s1 === s2) return 1;
    if (s1.length === 0 || s2.length === 0) return 0;

    const matrix = Array(s2.length + 1).fill(null).map(() => Array(s1.length + 1).fill(null));

    for (let i = 0; i <= s1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= s2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= s2.length; j++) {
      for (let i = 1; i <= s1.length; i++) {
        const indicator = s1[i - 1] === s2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }

    const maxLength = Math.max(s1.length, s2.length);
    return (maxLength - matrix[s2.length][s1.length]) / maxLength;
  }

  /**
   * 规范化URL
   */
  private normalizeUrl(url: string): string {
    try {
      let normalizedUrl = url.trim().toLowerCase();

      if (!normalizedUrl.startsWith('http')) {
        normalizedUrl = `https://${normalizedUrl}`;
      }

      const urlObj = new URL(normalizedUrl);

      // 移除www前缀
      urlObj.hostname = urlObj.hostname.replace(/^www\./, '');

      // 移除尾部斜杠
      urlObj.pathname = urlObj.pathname.replace(/\/$/, '') || '/';

      // 排序查询参数
      urlObj.searchParams.sort();

      return urlObj.href;
    } catch {
      return url.toLowerCase().trim();
    }
  }

  /**
   * 提取域名
   */
  private extractDomain(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace(/^www\./, '');
    } catch {
      return url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0];
    }
  }

  /**
   * 检查是否为子域名
   */
  private isSubdomain(domain1: string, domain2: string): boolean {
    return domain1.includes(domain2) || domain2.includes(domain1);
  }
}

// 工具函数
export function createDuplicateDetector(sites: Site[], config?: Partial<DetectionConfig>): DuplicateDetector {
  return new DuplicateDetector(sites, config);
}

export function formatSimilarity(similarity: number): string {
  return `${Math.round(similarity * 100)}%`;
}

export function getDuplicateTypeLabel(type: DuplicateResult['type']): string {
  const labels = {
    exact: '完全重复',
    domain: '域名重复',
    similar: '相似重复',
    content: '内容重复'
  };
  return labels[type];
}