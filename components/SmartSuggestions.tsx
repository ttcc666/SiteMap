import React, { useState, useEffect, useMemo } from 'react';
import { Site } from '../types';
import { aiClassifier, ClassificationSuggestion, formatConfidence } from '../utils/aiClassifier';
import { createRecommendationEngine, Recommendation, getRecommendationTypeLabel } from '../utils/recommendationEngine';
import { createDuplicateDetector, DuplicateResult, getDuplicateTypeLabel } from '../utils/duplicateDetector';

interface SmartSuggestionsProps {
  sites: Site[];
  clickData: Record<string, any>;
  onApplySuggestion?: (siteId: string, category: string) => void;
  onRemoveDuplicate?: (siteId: string) => void;
  className?: string;
}

type SuggestionTab = 'recommendations' | 'classifications' | 'duplicates';

export function SmartSuggestions({
  sites,
  clickData,
  onApplySuggestion,
  onRemoveDuplicate,
  className = ''
}: SmartSuggestionsProps) {
  const [activeTab, setActiveTab] = useState<SuggestionTab>('recommendations');
  const [isExpanded, setIsExpanded] = useState(false);

  // 生成推荐
  const recommendations = useMemo(() => {
    const engine = createRecommendationEngine(sites, clickData);
    return engine.getRecommendations(5);
  }, [sites, clickData]);

  // 生成分类建议
  const classificationSuggestions = useMemo(() => {
    const suggestions = new Map<string, ClassificationSuggestion[]>();

    sites.forEach(site => {
      if (!site.category || site.category === '未分类') {
        const siteSuggestions = aiClassifier.classifySite(site.url, site.name, site.description);
        if (siteSuggestions.length > 0) {
          suggestions.set(site.id, siteSuggestions);
        }
      }
    });

    return suggestions;
  }, [sites]);

  // 检测重复
  const duplicates = useMemo(() => {
    const detector = createDuplicateDetector(sites);
    return detector.findAllDuplicates();
  }, [sites]);

  const totalSuggestions = recommendations.length + classificationSuggestions.size + duplicates.size;

  if (totalSuggestions === 0) {
    return null;
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* 头部 */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">智能建议</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {totalSuggestions} 条建议可用
            </p>
          </div>
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </div>

      {/* 内容 */}
      {isExpanded && (
        <div className="border-t border-gray-200 dark:border-gray-700">
          {/* 标签页 */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('recommendations')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'recommendations'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              推荐网站 ({recommendations.length})
            </button>
            <button
              onClick={() => setActiveTab('classifications')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'classifications'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              分类建议 ({classificationSuggestions.size})
            </button>
            <button
              onClick={() => setActiveTab('duplicates')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'duplicates'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              重复检测 ({duplicates.size})
            </button>
          </div>

          {/* 标签页内容 */}
          <div className="p-4">
            {activeTab === 'recommendations' && (
              <RecommendationsTab recommendations={recommendations} />
            )}
            {activeTab === 'classifications' && (
              <ClassificationsTab
                suggestions={classificationSuggestions}
                sites={sites}
                onApplySuggestion={onApplySuggestion}
              />
            )}
            {activeTab === 'duplicates' && (
              <DuplicatesTab
                duplicates={duplicates}
                sites={sites}
                onRemoveDuplicate={onRemoveDuplicate}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// 推荐网站标签页
function RecommendationsTab({ recommendations }: { recommendations: Recommendation[] }) {
  if (recommendations.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
        <p>暂无推荐网站</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {recommendations.map((rec, index) => (
        <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-lg">{rec.site.name?.[0] || '🌐'}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-gray-900 dark:text-white truncate">
              {rec.site.name}
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
              {rec.site.url}
            </p>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                {getRecommendationTypeLabel(rec.type)}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {rec.reasons[0]}
              </span>
            </div>
          </div>
          <a
            href={rec.site.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
              <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
            </svg>
          </a>
        </div>
      ))}
    </div>
  );
}

// 分类建议标签页
function ClassificationsTab({
  suggestions,
  sites,
  onApplySuggestion
}: {
  suggestions: Map<string, ClassificationSuggestion[]>;
  sites: Site[];
  onApplySuggestion?: (siteId: string, category: string) => void;
}) {
  if (suggestions.size === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
        </svg>
        <p>所有网站都已正确分类</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {Array.from(suggestions.entries()).map(([siteId, siteSuggestions]) => {
        const site = sites.find(s => s.id === siteId);
        if (!site) return null;

        return (
          <div key={siteId} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <span className="text-sm">{site.name?.[0] || '🌐'}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 dark:text-white truncate">
                  {site.name}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {site.url}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {siteSuggestions.map((suggestion, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {suggestion.category}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {formatConfidence(suggestion.confidence)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {suggestion.reasons.join(', ')}
                    </p>
                  </div>
                  {onApplySuggestion && (
                    <button
                      onClick={() => onApplySuggestion(siteId, suggestion.category)}
                      className="ml-3 text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition-colors"
                    >
                      应用
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// 重复检测标签页
function DuplicatesTab({
  duplicates,
  sites,
  onRemoveDuplicate
}: {
  duplicates: Map<string, DuplicateResult[]>;
  sites: Site[];
  onRemoveDuplicate?: (siteId: string) => void;
}) {
  if (duplicates.size === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        <p>未发现重复网站</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {Array.from(duplicates.entries()).map(([siteId, duplicateList]) => {
        const site = sites.find(s => s.id === siteId);
        if (!site) return null;

        return (
          <div key={siteId} className="border border-orange-200 dark:border-orange-600 rounded-lg p-4 bg-orange-50 dark:bg-orange-900/20">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-orange-600 dark:text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 dark:text-white truncate">
                  {site.name}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {site.url}
                </p>
              </div>
              {onRemoveDuplicate && (
                <button
                  onClick={() => onRemoveDuplicate(siteId)}
                  className="text-sm bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded transition-colors"
                >
                  删除
                </button>
              )}
            </div>

            <div className="space-y-2">
              {duplicateList.map((duplicate, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        与 "{duplicate.matchedSite?.name}" 重复
                      </span>
                      <span className="text-xs bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 px-2 py-1 rounded">
                        {getDuplicateTypeLabel(duplicate.type)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {duplicate.reasons.join(', ')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default SmartSuggestions;