import React, { useState, useMemo } from 'react';
import type { Site, AllSiteClickData } from '../types';
import Favicon from './Favicon';

interface StatsViewProps {
  sites: Site[];
  clickData: AllSiteClickData;
  onBack: () => void;
  fallbackColor?: string;
}

type Period = 'daily' | 'weekly' | 'monthly';

const StatsView: React.FC<StatsViewProps> = ({ sites, clickData, onBack, fallbackColor }) => {
  const [period, setPeriod] = useState<Period>('daily');

  const periodMap: Record<Period, string> = {
    daily: '天',
    weekly: '周',
    monthly: '月',
  };

  const sortedSites = useMemo(() => {
    if (sites.length === 0) return [];
    return [...sites].sort((a, b) => {
      const clicksA = clickData[a.id]?.[period] || 0;
      const clicksB = clickData[b.id]?.[period] || 0;
      return clicksB - clicksA;
    });
  }, [sites, clickData, period]);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">站点点击统计</h2>
        <p className="text-gray-600 mt-2">查看您最常访问的网站。</p>
      </div>

      <div className="flex justify-center mb-8 bg-gray-200 rounded-full p-1 max-w-xs mx-auto">
        {(Object.keys(periodMap) as Period[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`w-full px-4 py-2 text-sm font-semibold rounded-full transition-colors duration-300 ${
              period === p ? 'bg-white text-indigo-600 shadow' : 'bg-transparent text-gray-600 hover:bg-white/50'
            }`}
          >
            按{periodMap[p]}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-16">排名</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">网站</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">分类</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">点击次数 ({periodMap[period]})</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedSites.length > 0 ? sortedSites.map((site, index) => {
                const clicks = clickData[site.id]?.[period] || 0;
                return (
                    <tr key={site.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${index < 3 ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-800'}`}>{index + 1}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                            <Favicon url={site.url} name={site.name} size="small" fallbackColor={fallbackColor} />
                            <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{site.name}</div>
                            </div>
                        </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">{site.category}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-semibold text-gray-900">{clicks}</td>
                    </tr>
                );
              }) : (
                <tr>
                    <td colSpan={4} className="text-center py-12 text-gray-500">
                        暂无数据。开始点击网站以生成统计信息！
                    </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StatsView;