import React, { useState, useMemo, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useDebounce } from '../hooks/useDebounce';
import type { Site } from '../types';

interface SearchBarProps {
  sites: Site[];
  onFilteredSites: (sites: Site[]) => void;
  categories: string[];
}

// 模糊搜索算法
const fuzzyMatch = (text: string, query: string): number => {
  const textLower = text.toLowerCase();
  const queryLower = query.toLowerCase();

  if (textLower.includes(queryLower)) return 1;

  let score = 0;
  let queryIndex = 0;

  for (let i = 0; i < textLower.length && queryIndex < queryLower.length; i++) {
    if (textLower[i] === queryLower[queryIndex]) {
      score++;
      queryIndex++;
    }
  }

  return queryIndex === queryLower.length ? score / queryLower.length : 0;
};

const SearchBar: React.FC<SearchBarProps> = ({ sites, onFilteredSites, categories }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchHistory, setSearchHistory] = useLocalStorage<string[]>('search-history', []);

  // 防抖搜索词，延迟300ms执行搜索
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // 获取所有标签
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    sites.forEach(site => {
      site.tags?.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [sites]);

  const filteredSites = useMemo(() => {
    let filtered = sites;

    if (debouncedSearchTerm) {
      // 模糊搜索
      const searchResults = sites.map(site => {
        const nameScore = fuzzyMatch(site.name, debouncedSearchTerm);
        const urlScore = fuzzyMatch(site.url, debouncedSearchTerm);
        const descScore = site.description ? fuzzyMatch(site.description, debouncedSearchTerm) : 0;
        const tagScore = site.tags ? Math.max(...site.tags.map(tag => fuzzyMatch(tag, debouncedSearchTerm)), 0) : 0;

        const maxScore = Math.max(nameScore, urlScore, descScore, tagScore);
        return { site, score: maxScore };
      })
      .filter(result => result.score > 0.3)
      .sort((a, b) => b.score - a.score)
      .map(result => result.site);

      filtered = searchResults;
    }

    if (selectedCategory) {
      filtered = filtered.filter(site => site.category === selectedCategory);
    }

    if (selectedTags.length > 0) {
      filtered = filtered.filter(site =>
        selectedTags.every(tag => site.tags?.includes(tag))
      );
    }

    return filtered;
  }, [sites, debouncedSearchTerm, selectedCategory, selectedTags]);

  useEffect(() => {
    onFilteredSites(filteredSites);
  }, [filteredSites, onFilteredSites]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  // 当防抖搜索词变化时，保存到搜索历史
  useEffect(() => {
    if (debouncedSearchTerm && !searchHistory.includes(debouncedSearchTerm)) {
      setSearchHistory(prev => [debouncedSearchTerm, ...prev.slice(0, 19)]);
    }
  }, [debouncedSearchTerm, searchHistory, setSearchHistory]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedTags([]);
  };

  return (
    <div className="space-y-4 mb-8">
      {/* 搜索输入和分类选择 */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            id="search-input"
            type="text"
            placeholder="搜索网站名称、网址、描述或标签..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full bg-white/60 dark:bg-gray-800/60 border border-white/20 dark:border-gray-700/50 rounded-lg px-4 py-3 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition backdrop-blur-md"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-white/60 dark:bg-gray-800/60 border border-white/20 dark:border-gray-700/50 rounded-lg px-4 py-3 text-gray-900 dark:text-gray-100 focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition backdrop-blur-md"
        >
          <option value="">所有分类</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
        {(searchTerm || selectedCategory || selectedTags.length > 0) && (
          <button
            onClick={clearFilters}
            className="px-4 py-3 bg-gray-200/60 dark:bg-gray-700/60 hover:bg-gray-300/60 dark:hover:bg-gray-600/60 text-gray-700 dark:text-gray-300 rounded-lg transition backdrop-blur-md"
          >
            清除
          </button>
        )}
      </div>

      {/* 标签筛选 */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400 py-1">标签:</span>
          {allTags.slice(0, 10).map(tag => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`px-3 py-1 text-sm rounded-full transition ${
                selectedTags.includes(tag)
                  ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {tag}
            </button>
          ))}
          {allTags.length > 10 && (
            <span className="text-sm text-gray-500 dark:text-gray-400 py-1">
              +{allTags.length - 10} 更多
            </span>
          )}
        </div>
      )}

      {/* 搜索历史 */}
      {searchHistory.length > 0 && !searchTerm && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400 py-1">最近搜索:</span>
          {searchHistory.slice(0, 5).map((term, index) => (
            <button
              key={index}
              onClick={() => handleSearch(term)}
              className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            >
              {term}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;