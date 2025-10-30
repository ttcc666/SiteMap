import React, { useState, useEffect } from 'react';
import type { Site } from '../types';

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
  const [error, setError] = useState('');

  useEffect(() => {
    if (siteToEdit) {
      setUrl(siteToEdit.url);
      setName(siteToEdit.name);
      setCategory(siteToEdit.category);
    } else {
      setUrl('');
      setName('');
      setCategory('');
    }
    setError('');
  }, [siteToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !name.trim() || !category.trim()) {
      setError('所有字段均为必填项。');
      return;
    }

    const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;
    let newHostname: string;
    try {
      newHostname = new URL(normalizedUrl).hostname;
    } catch (_) {
      setError('请输入有效的网址。');
      return;
    }

    const isDuplicate = sites.some(site => {
      if (siteToEdit && site.id === siteToEdit.id) {
        return false;
      }
      try {
        const existingHostname = new URL(site.url).hostname;
        const cleanExisting = existingHostname.replace(/^www\./, '');
        const cleanNew = newHostname.replace(/^www\./, '');
        return cleanExisting === cleanNew;
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
    });
    onClose();
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 transition-opacity duration-300">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md m-4 transform transition-all duration-300 scale-100">
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
                className="w-full bg-gray-100 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
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
                className="w-full bg-gray-100 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
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
                className="w-full bg-gray-100 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              />
              <datalist id="category-suggestions">
                {existingCategories.map(cat => <option key={cat} value={cat} />)}
              </datalist>
            </div>
          </div>
          {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
          <div className="mt-8 flex justify-end space-x-4">
            <button type="button" onClick={onClose} className="px-6 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold transition">取消</button>
            <button type="submit" className="px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition">保存</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSiteModal;