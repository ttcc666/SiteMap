import type { Site, AllSiteClickData } from '../types';

export interface ExportData {
  sites: Site[];
  categoryIcons: Record<string, string>;
  clickData: AllSiteClickData;
  exportDate: string;
  version: string;
}

// 导出数据为 JSON 格式
export const exportToJSON = (
  sites: Site[],
  categoryIcons: Record<string, string>,
  clickData: AllSiteClickData
): string => {
  const exportData: ExportData = {
    sites,
    categoryIcons,
    clickData,
    exportDate: new Date().toISOString(),
    version: '1.0'
  };
  return JSON.stringify(exportData, null, 2);
};

// 导出网站列表为 CSV 格式
export const exportToCSV = (sites: Site[]): string => {
  const headers = ['名称', '网址', '分类', '标签', '描述'];
  const rows = sites.map(site => [
    site.name,
    site.url,
    site.category,
    site.tags?.join(';') || '',
    site.description || ''
  ]);

  return [headers, ...rows]
    .map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
    .join('\n');
};

// 验证 URL 格式
const isValidURL = (url: string): boolean => {
  try {
    new URL(url.startsWith('http') ? url : `https://${url}`);
    return true;
  } catch {
    return false;
  }
};

// 从 JSON 导入数据
export const importFromJSON = (jsonString: string): Partial<ExportData> => {
  try {
    const data = JSON.parse(jsonString);

    // 验证数据结构
    if (!Array.isArray(data.sites)) {
      throw new Error('无效的数据格式：缺少网站数据');
    }

    // 验证和清理网站数据
    const validSites = data.sites.filter((site: any) =>
      site.id && site.name && site.url && isValidURL(site.url)
    ).map((site: any) => ({
      id: site.id,
      name: site.name,
      url: site.url,
      category: site.category || '未分类',
      tags: Array.isArray(site.tags) ? site.tags : undefined,
      description: site.description || undefined
    }));

    return {
      sites: validSites,
      categoryIcons: data.categoryIcons || {},
      clickData: data.clickData || {}
    };
  } catch (error) {
    throw new Error(`导入失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
};

// 解析浏览器书签 HTML
export const parseBookmarksHTML = (htmlString: string): Site[] => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, 'text/html');
  const links = doc.querySelectorAll('a[href]');

  const sites: Site[] = [];

  links.forEach(link => {
    const url = link.getAttribute('href');
    const name = link.textContent?.trim();

    if (url && name && isValidURL(url)) {
      // 尝试从文件夹结构推断分类
      let category = '未分类';
      const folder = link.closest('dl')?.previousElementSibling;
      if (folder?.tagName === 'H3') {
        category = folder.textContent?.trim() || '未分类';
      }

      sites.push({
        id: crypto.randomUUID(),
        name,
        url,
        category
      });
    }
  });

  return sites;
};

// 检测重复网站
export const findDuplicates = (newSites: Site[], existingSites: Site[]): Site[] => {
  const existingUrls = new Set(existingSites.map(site => site.url.toLowerCase()));
  return newSites.filter(site => existingUrls.has(site.url.toLowerCase()));
};

// 下载文件
export const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};