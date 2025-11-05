import { Site } from '../types';

// 分类规则配置
interface ClassificationRule {
  category: string;
  domains: string[];
  keywords: string[];
  urlPatterns: RegExp[];
  priority: number;
}

// 预定义分类规则
const CLASSIFICATION_RULES: ClassificationRule[] = [
  {
    category: '开发工具',
    domains: ['github.com', 'gitlab.com', 'stackoverflow.com', 'codepen.io', 'jsfiddle.net', 'codesandbox.io'],
    keywords: ['代码', '开发', 'code', 'dev', 'api', 'sdk', 'framework', '框架', '编程', 'programming'],
    urlPatterns: [/\/docs?\//, /\/api\//, /\/developer/],
    priority: 9
  },
  {
    category: '社交媒体',
    domains: ['weibo.com', 'twitter.com', 'facebook.com', 'instagram.com', 'linkedin.com', 'zhihu.com'],
    keywords: ['社交', '微博', '朋友圈', 'social', '分享', 'share'],
    urlPatterns: [/\/profile\//, /\/user\//, /\/@/],
    priority: 8
  },
  {
    category: '视频娱乐',
    domains: ['youtube.com', 'bilibili.com', 'youku.com', 'iqiyi.com', 'netflix.com', 'douyin.com'],
    keywords: ['视频', 'video', '电影', '电视剧', '动漫', '娱乐', '直播', 'live'],
    urlPatterns: [/\/watch/, /\/video/, /\/play/],
    priority: 7
  },
  {
    category: '购物电商',
    domains: ['taobao.com', 'tmall.com', 'jd.com', 'amazon.com', 'pinduoduo.com', 'shopee.com'],
    keywords: ['购物', 'shop', '商城', '电商', '买', '卖', '商品', 'product'],
    urlPatterns: [/\/item\//, /\/product\//, /\/shop/],
    priority: 8
  },
  {
    category: '新闻资讯',
    domains: ['news.sina.com.cn', 'news.163.com', 'people.com.cn', 'xinhuanet.com', 'bbc.com', 'cnn.com'],
    keywords: ['新闻', 'news', '资讯', '头条', '时事', '报道'],
    urlPatterns: [/\/news\//, /\/article\//, /\/story/],
    priority: 7
  },
  {
    category: '学习教育',
    domains: ['coursera.org', 'edx.org', 'udemy.com', 'khan.academy.org', 'mooc.org', 'xuetangx.com'],
    keywords: ['教育', '学习', '课程', 'course', '教学', 'tutorial', '培训', 'training'],
    urlPatterns: [/\/course\//, /\/learn\//, /\/tutorial/],
    priority: 8
  },
  {
    category: '工作办公',
    domains: ['office.com', 'google.com', 'notion.so', 'slack.com', 'zoom.us', 'teams.microsoft.com'],
    keywords: ['办公', 'office', '工作', 'work', '文档', 'document', '会议', 'meeting'],
    urlPatterns: [/\/workspace\//, /\/office\//, /\/docs/],
    priority: 7
  },
  {
    category: '金融理财',
    domains: ['alipay.com', 'bank.com', 'paypal.com', 'coinbase.com', 'binance.com', 'eastmoney.com'],
    keywords: ['银行', 'bank', '支付', 'pay', '理财', '投资', '股票', '基金', '保险'],
    urlPatterns: [/\/banking\//, /\/finance\//, /\/investment/],
    priority: 6
  },
  {
    category: '生活服务',
    domains: ['meituan.com', 'dianping.com', 'ele.me', 'didi.com', 'uber.com', '12306.cn'],
    keywords: ['外卖', '打车', '订票', '酒店', '旅游', '生活', '服务'],
    urlPatterns: [/\/service\//, /\/booking\//, /\/order/],
    priority: 6
  },
  {
    category: '游戏娱乐',
    domains: ['steam.com', 'epicgames.com', '4399.com', 'taptap.com', 'blizzard.com', 'riot.com'],
    keywords: ['游戏', 'game', '娱乐', '竞技', 'play', '玩'],
    urlPatterns: [/\/game\//, /\/play\//, /\/gaming/],
    priority: 7
  }
];

// 分类建议结果
export interface ClassificationSuggestion {
  category: string;
  confidence: number;
  reasons: string[];
}

// 智能分类器类
export class AIClassifier {
  private rules: ClassificationRule[];

  constructor(customRules: ClassificationRule[] = []) {
    this.rules = [...CLASSIFICATION_RULES, ...customRules].sort((a, b) => b.priority - a.priority);
  }

  /**
   * 对网站进行智能分类
   */
  classifySite(url: string, name?: string, description?: string): ClassificationSuggestion[] {
    const suggestions: ClassificationSuggestion[] = [];
    const normalizedUrl = this.normalizeUrl(url);
    const domain = this.extractDomain(normalizedUrl);
    const text = `${name || ''} ${description || ''} ${url}`.toLowerCase();

    for (const rule of this.rules) {
      const score = this.calculateScore(rule, domain, normalizedUrl, text);

      if (score.confidence > 0.3) {
        suggestions.push({
          category: rule.category,
          confidence: score.confidence,
          reasons: score.reasons
        });
      }
    }

    // 按置信度排序并返回前3个建议
    return suggestions
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3);
  }

  /**
   * 批量分类现有网站
   */
  classifyExistingSites(sites: Site[]): Map<string, ClassificationSuggestion[]> {
    const results = new Map<string, ClassificationSuggestion[]>();

    for (const site of sites) {
      const suggestions = this.classifySite(site.url, site.name, site.description);
      if (suggestions.length > 0) {
        results.set(site.id, suggestions);
      }
    }

    return results;
  }

  /**
   * 获取分类统计信息
   */
  getCategoryStats(sites: Site[]): Record<string, number> {
    const stats: Record<string, number> = {};

    for (const site of sites) {
      const category = site.category || '未分类';
      stats[category] = (stats[category] || 0) + 1;
    }

    return stats;
  }

  /**
   * 建议新的分类名称
   */
  suggestNewCategories(sites: Site[]): string[] {
    const existingCategories = new Set(sites.map(s => s.category).filter(Boolean));
    const suggestedCategories = new Set<string>();

    for (const site of sites) {
      if (!site.category || site.category === '未分类') {
        const suggestions = this.classifySite(site.url, site.name, site.description);
        suggestions.forEach(s => {
          if (!existingCategories.has(s.category)) {
            suggestedCategories.add(s.category);
          }
        });
      }
    }

    return Array.from(suggestedCategories);
  }

  private calculateScore(
    rule: ClassificationRule,
    domain: string,
    url: string,
    text: string
  ): { confidence: number; reasons: string[] } {
    let score = 0;
    const reasons: string[] = [];

    // 域名匹配 (权重最高)
    for (const ruleDomain of rule.domains) {
      if (domain.includes(ruleDomain) || ruleDomain.includes(domain)) {
        score += 0.8;
        reasons.push(`域名匹配: ${ruleDomain}`);
        break;
      }
    }

    // URL模式匹配
    for (const pattern of rule.urlPatterns) {
      if (pattern.test(url)) {
        score += 0.6;
        reasons.push(`URL模式匹配: ${pattern.source}`);
        break;
      }
    }

    // 关键词匹配
    let keywordMatches = 0;
    for (const keyword of rule.keywords) {
      if (text.includes(keyword.toLowerCase())) {
        keywordMatches++;
        reasons.push(`关键词匹配: ${keyword}`);
      }
    }

    if (keywordMatches > 0) {
      score += Math.min(keywordMatches * 0.2, 0.5);
    }

    // 优先级调整
    score *= (rule.priority / 10);

    return {
      confidence: Math.min(score, 1),
      reasons: reasons.slice(0, 3) // 最多显示3个原因
    };
  }

  private normalizeUrl(url: string): string {
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      return urlObj.href.toLowerCase();
    } catch {
      return url.toLowerCase();
    }
  }

  private extractDomain(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace(/^www\./, '');
    } catch {
      return url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0];
    }
  }
}

// 导出默认实例
export const aiClassifier = new AIClassifier();

// 工具函数
export function getTopSuggestion(suggestions: ClassificationSuggestion[]): string | null {
  return suggestions.length > 0 ? suggestions[0].category : null;
}

export function formatConfidence(confidence: number): string {
  return `${Math.round(confidence * 100)}%`;
}

export function shouldAutoApply(suggestion: ClassificationSuggestion): boolean {
  return suggestion.confidence >= 0.8;
}