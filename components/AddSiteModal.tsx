import React, { useState, useEffect, useMemo } from 'react';
import type { Site } from '../types';
import { aiClassifier, ClassificationSuggestion, formatConfidence, shouldAutoApply } from '../utils/aiClassifier';
import { createDuplicateDetector, DuplicateResult } from '../utils/duplicateDetector';

interface AddSiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (site: Omit<Site, 'id'> & { id?: string }) => void;
  siteToEdit?: Site | null;
  existingCategories: string[];
  sites: Site[];
}

const AddSiteModal: React.FC<AddSiteModalProps> = ({ isOpen, onClose, onSave, siteToEdit, existingCategories, sites }) => {
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [error, setError] = useState('');
  const [classificationSuggestions, setClassificationSuggestions] = useState<ClassificationSuggestion[]>([]);
  const [duplicateResult, setDuplicateResult] = useState<DuplicateResult | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // 获取所有现有标签
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    sites.forEach(site => {
      site.tags?.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [sites]);

  useEffect(() => {
    if (siteToEdit) {
      setUrl(siteToEdit.url);
      setName(siteToEdit.name);
      setCategory(siteToEdit.category);
      setDescription(siteToEdit.description || '');
      setTags(siteToEdit.tags || []);
    } else {
      setUrl('');
      setName('');
      setCategory('');
      setDescription('');
      setTags([]);
    }
    setTagInput('');
    setError('');
    setClassificationSuggestions([]);
    setDuplicateResult(null);
    setShowSuggestions(false);
  }, [siteToEdit, isOpen]);

  // 智能分类和重复检测
  useEffect(() => {
    if (!url.trim() || siteToEdit) return;

    const timeoutId = setTimeout(() => {
      // 分类建议
      const suggestions = aiClassifier.classifySite(url, name, description);
      setClassificationSuggestions(suggestions);

      // 自动应用高置信度的分类建议
      if (suggestions.length > 0 && shouldAutoApply(suggestions[0]) && !category) {
        setCategory(suggestions[0].category);
      }

      // 重复检测
      const detector = createDuplicateDetector(sites);
      const duplicate = detector.detectDuplicate({ url, name, description });
      setDuplicateResult(duplicate);

      // 显示建议面板
      if (suggestions.length > 0 || duplicate.isDuplicate) {
        setShowSuggestions(true);
      }
    }, 500); // 防抖

    return () => clearTimeout(timeoutId);
  }, [url, name, description, sites, siteToEdit, category]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !name.trim() || !category.trim()) {
      setError('所有字段均为必填项。');
      return;
    }

    const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(normalizedUrl);
    } catch (_) {
      setError('请输入有效的网址。');
      return;
    }

    const cleanNewHostname = parsedUrl.hostname.replace(/^www\./, '');
    const isDuplicate = sites.some(site => {
      if (siteToEdit && site.id === siteToEdit.id) {
        return false;
      }
      try {
        const existingHostname = new URL(site.url).hostname.replace(/^www\./, '');
        return existingHostname === cleanNewHostname;
      } catch {
        return false;
      }
    });

    if (isDuplicate) {
      setError('该网站已存在，请勿重复添加。');
      return;
    }

    onSave({
      id: siteToEdit?.id,
      url: normalizedUrl,
      name,
      category: category.trim(),
      description: description.trim() || undefined,
      tags: tags.length > 0 ? tags : undefined,
    });
    onClose();
  };

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
    }
    setTagInput('');
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(tagInput);
    }
  };

  const applySuggestion = (suggestion: ClassificationSuggestion) => {
    setCategory(suggestion.category);
    setShowSuggestions(false);
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50 transition-opacity duration-300">
      <div className="bg-white/80 backdrop-blur-lg border border-gray-200/50 rounded-2xl shadow-2xl p-8 w-full max-w-md m-4 transform transition-all duration-300 scale-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{siteToEdit ? '编辑网站' : '添加新网站'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-900 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">网站链接</label>
              <input
                type="text"
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="例如: https://react.dev"
                className="w-full bg-white/50 border border-gray-300/70 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              />
            </div>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">显示名称</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例如: React 文档"
                className="w-full bg-white/50 border border-gray-300/70 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              />
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">分类</label>
              <input
                type="text"
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="例如: 开发"
                list="category-suggestions"
                className="w-full bg-white/50 border border-gray-300/70 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              />
              <datalist id="category-suggestions">
                {existingCategories.map(cat => <option key={cat} value={cat} />)}
              </datalist>
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">描述 (可选)</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="简短描述这个网站..."
                rows={3}
                className="w-full bg-white/50 border border-gray-300/70 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition resize-none"
              />
            </div>
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">标签 (可选)</label>
              <div className="space-y-2">
                <input
                  type="text"
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagInputKeyDown}
                  placeholder="输入标签后按回车或逗号添加"
                  list="tag-suggestions"
                  className="w-full bg-white/50 border border-gray-300/70 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                />
                <datalist id="tag-suggestions">
                  {allTags.map(tag => <option key={tag} value={tag} />)}
                </datalist>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-800 border border-indigo-200"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-2 text-indigo-600 hover:text-indigo-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 智能建议面板 */}
            {showSuggestions && (classificationSuggestions.length > 0 || duplicateResult?.isDuplicate) && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-blue-900 flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    智能建议
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowSuggestions(false)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>

                {/* 重复检测警告 */}
                {duplicateResult?.isDuplicate && (
                  <div className="mb-3 p-3 bg-orange-100 border border-orange-200 rounded-lg">
                    <div className="flex items-center mb-2">
                      <svg className="w-4 h-4 text-orange-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm font-medium text-orange-800">检测到重复网站</span>
                    </div>
                    <p className="text-sm text-orange-700">
                      与 "{duplicateResult.matchedSite?.name}" 重复 ({duplicateResult.reasons.join(', ')})
                    </p>
                  </div>
                )}

                {/* 分类建议 */}
                {classificationSuggestions.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm text-blue-800 mb-2">推荐分类:</p>
                    {classificationSuggestions.slice(0, 3).map((suggestion, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-900">
                              {suggestion.category}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatConfidence(suggestion.confidence)}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">
                            {suggestion.reasons.slice(0, 2).join(', ')}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => applySuggestion(suggestion)}
                          className="ml-2 text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded transition-colors"
                        >
                          应用
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
          <div className="mt-8 flex justify-end space-x-4">
            <button type="button" onClick={onClose} className="px-6 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold transition">取消</button>
            <button type="submit" className="px-6 py-2 rounded-lg text-white font-semibold transition duration-300 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-md hover:shadow-lg transform hover:-translate-y-px">保存</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSiteModal;