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

      <div className="bg-white/60 backdrop-blur-md rounded-2xl shadow-lg p-4 sm:p-6">
        <div className="hidden sm:grid grid-cols-12 gap-4 px-4 py-2 text-sm font-semibold text-gray-500 uppercase tracking-wider">
          <div className="col-span-1 text-center">#</div>
          <div className="col-span-6">网站</div>
          <div className="col-span-3">分类</div>
          <div className="col-span-2 text-center">点击 ({periodMap[period]})</div>
        </div>
  
        <div className="flow-root">
          <ul role="list" className="divide-y divide-gray-200/50">
            {sortedSites.length > 0 ? sortedSites.map((site, index) => {
              const clicks = clickData[site.id]?.[period] || 0;
              const rankColor = 
                index === 0 ? 'bg-amber-400 text-white' : 
                index === 1 ? 'bg-slate-400 text-white' : 
                index === 2 ? 'bg-amber-600/80 text-white' : 'bg-gray-100 text-gray-800';
              return (
                <li key={site.id} className="py-4 px-2 hover:bg-black/5 rounded-lg transition-colors duration-200">
                  <div className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-2 sm:col-span-1 flex justify-center items-center">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${rankColor} shadow`}>{index + 1}</span>
                    </div>
                    
                    <div className="col-span-10 sm:col-span-6 flex items-center min-w-0">
                      <Favicon url={site.url} name={site.name} size="small" fallbackColor={fallbackColor} />
                      <div className="ml-4 truncate">
                        <div className="text-sm font-medium text-gray-900 truncate">{site.name}</div>
                        <div className="text-xs text-gray-500 truncate">{new URL(site.url).hostname}</div>
                      </div>
                    </div>

                    <div className="hidden sm:block sm:col-span-3">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">{site.category}</span>
                    </div>

                    <div className="hidden sm:block sm:col-span-2 text-center">
                      <span className="text-lg font-semibold text-indigo-600">{clicks}</span>
                    </div>
                  </div>
                </li>
              );
            }) : (
              <div className="text-center py-12 text-gray-500">
                暂无数据。开始点击网站以生成统计信息！
              </div>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default StatsView;