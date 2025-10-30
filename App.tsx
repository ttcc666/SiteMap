import React, { useState, useMemo, useRef, useEffect } from 'react';
import type { Site } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import AddSiteModal from './components/AddSiteModal';
import CategorySection from './components/CategorySection';
import { useSiteClicks } from './hooks/useSiteClicks';
import StatsView from './components/StatsView';
import ConfirmModal from './components/ConfirmModal';
import ManageCategoriesModal from './components/ManageCategoriesModal';

const presetColors = [
  '#ef4444', // red-500
  '#f97316', // orange-500
  '#eab308', // yellow-500
  '#84cc16', // lime-500
  '#22c55e', // green-500
  '#14b8a6', // teal-500
  '#06b6d4', // cyan-500
  '#3b82f6', // blue-500
  '#6366f1', // indigo-500
  '#8b5cf6', // violet-500
  '#d946ef', // fuchsia-500
  '#ec4899', // pink-500
  '#78716c', // stone-500
  '#64748b', // slate-500
];


const App: React.FC = () => {
  const [sites, setSites] = useLocalStorage<Site[]>('sites', []);
  const [categoryIcons, setCategoryIcons] = useLocalStorage<Record<string, string>>('category-icons', {});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSite, setEditingSite] = useState<Site | null>(null);
  const { clickData, trackClick, removeClickData } = useSiteClicks();
  const [view, setView] = useState<'dashboard' | 'stats'>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [fallbackColor, setFallbackColor] = useLocalStorage<string>('favicon-fallback-color', '#6366f1');

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [deletingSiteId, setDeletingSiteId] = useState<string | null>(null);
  
  const [isManageCategoriesModalOpen, setIsManageCategoriesModalOpen] = useState(false);
  const [isConfirmCategoryDeleteModalOpen, setIsConfirmCategoryDeleteModalOpen] = useState(false);
  const [deletingCategoryName, setDeletingCategoryName] = useState<string | null>(null);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleAddSite = () => {
    setEditingSite(null);
    setIsModalOpen(true);
  };

  const handleEditSite = (site: Site) => {
    setEditingSite(site);
    setIsModalOpen(true);
  };

  const handleDeleteSite = (id: string) => {
    setDeletingSiteId(id);
    setIsConfirmModalOpen(true);
  };

  const confirmDelete = () => {
    if (deletingSiteId) {
        setSites(sites.filter(site => site.id !== deletingSiteId));
        removeClickData(deletingSiteId);
    }
    setIsConfirmModalOpen(false);
    setDeletingSiteId(null);
  };

  const handleSaveSite = (siteData: Omit<Site, 'id'> & { id?: string }) => {
    if (siteData.id) {
      setSites(sites.map(s => s.id === siteData.id ? { ...s, ...siteData } as Site : s));
    } else {
      setSites([...sites, { ...siteData, id: crypto.randomUUID() }]);
    }
  };

  const handleReorderSites = (categoryName: string, dragIndexInCategory: number, hoverIndexInCategory: number) => {
    setSites(prevSites => {
        const categorySites = prevSites.filter(s => s.category === categoryName);
        
        const draggedSiteId = categorySites[dragIndexInCategory]?.id;
        const hoverSiteId = categorySites[hoverIndexInCategory]?.id;

        if (!draggedSiteId || !hoverSiteId) return prevSites;

        const newSites = [...prevSites];
        const draggedGlobalIndex = newSites.findIndex(s => s.id === draggedSiteId);
        const hoverGlobalIndex = newSites.findIndex(s => s.id === hoverSiteId);

        if (draggedGlobalIndex === -1 || hoverGlobalIndex === -1) {
            return prevSites;
        }
        
        const [draggedItem] = newSites.splice(draggedGlobalIndex, 1);
        newSites.splice(hoverGlobalIndex, 0, draggedItem);
        
        return newSites;
    });
  };

  const handleRenameCategory = (oldName: string, newName: string) => {
    setSites(prevSites => 
      prevSites.map(site => site.category === oldName ? { ...site, category: newName } : site)
    );
    setCategoryIcons(prevIcons => {
      if (prevIcons[oldName]) {
        const newIcons = { ...prevIcons };
        newIcons[newName] = newIcons[oldName];
        delete newIcons[oldName];
        return newIcons;
      }
      return prevIcons;
    });
  };

  const handleDeleteCategoryRequest = (categoryName: string) => {
    setDeletingCategoryName(categoryName);
    setIsConfirmCategoryDeleteModalOpen(true);
  };

  const confirmDeleteCategory = () => {
    if (deletingCategoryName) {
      setSites(prevSites => 
        prevSites.map(site => site.category === deletingCategoryName ? { ...site, category: '未分类' } : site)
      );
      setCategoryIcons(prevIcons => {
        if (prevIcons[deletingCategoryName]) {
            const newIcons = { ...prevIcons };
            delete newIcons[deletingCategoryName];
            return newIcons;
        }
        return prevIcons;
      });
    }
    setIsConfirmCategoryDeleteModalOpen(false);
    setDeletingCategoryName(null);
  };
  
  const handleSetCategoryIcon = (categoryName: string, icon: string) => {
    setCategoryIcons(prevIcons => ({
      ...prevIcons,
      [categoryName]: icon,
    }));
  };

  const groupedSites = useMemo(() => {
    const filtered = sites.filter(site =>
        site.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        site.url.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return filtered.reduce((acc, site) => {
      const category = site.category || '未分类';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(site);
      return acc;
    }, {} as Record<string, Site[]>);
  }, [sites, searchQuery]);
  
  const existingCategories = useMemo(() => {
    const categories = new Set(sites.map(s => s.category || '未分类'));
    return Array.from(categories);
  }, [sites]);


  return (
    <div className="min-h-screen bg-transparent font-sans">
      <header className="bg-white/70 backdrop-blur-xl sticky top-0 z-40 py-4 px-4 sm:px-8 border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
             <svg className="w-8 h-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
            </svg>
            <h1 className="text-2xl font-bold text-gray-900">导航中心</h1>
          </div>
          <div className="flex items-center space-x-4">
             <div className="relative" ref={settingsRef}>
                <button
                    onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                    className="p-2 rounded-full hover:bg-gray-200 text-gray-600 hover:text-gray-800 transition-colors"
                    aria-label="打开设置"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </button>
                {isSettingsOpen && (
                    <div className="absolute right-0 mt-2 w-64 p-4 bg-white rounded-lg shadow-2xl border border-gray-200 z-50">
                        <label className="block text-sm font-medium text-gray-700">图标后备颜色</label>
                        <div className="grid grid-cols-7 gap-2 mt-2">
                           {presetColors.map(color => (
                               <button
                                   key={color}
                                   onClick={() => setFallbackColor(color)}
                                   className={`w-7 h-7 rounded-full cursor-pointer border-2 transition-transform transform hover:scale-110 ${fallbackColor === color ? 'ring-2 ring-offset-2 ring-indigo-500 border-white' : 'border-transparent'}`}
                                   style={{ backgroundColor: color }}
                                   aria-label={`选择颜色 ${color}`}
                                />
                           ))}
                        </div>
                    </div>
                )}
            </div>
            <button
                onClick={() => setView(view === 'dashboard' ? 'stats' : 'dashboard')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all transform hover:scale-105"
                >
                {view === 'dashboard' ? '查看统计' : '返回主页'}
            </button>
          </div>
        </div>
      </header>

      <main className="p-4 sm:p-8">
        {view === 'dashboard' ? (
          <div className="max-w-7xl mx-auto">
            {sites.length === 0 ? (
              <div className="text-center py-20 px-6 rounded-2xl bg-white/70 backdrop-blur-md border-2 border-dashed border-gray-300">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">欢迎来到您的导航中心！</h2>
                <p className="text-gray-600 max-w-lg mx-auto mb-8">
                  这里看起来有点空。通过添加您最喜欢的网站来开始构建您的个人仪表盘。
                </p>
                <button
                  onClick={handleAddSite}
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-indigo-500 transition-transform transform hover:scale-105"
                >
                  <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  添加您的第一个网站
                </button>
              </div>
            ) : (
              <>
                <div className="mb-8 flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-grow">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <input
                            type="search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="按名称或链接搜索网站..."
                            className="block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-full bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-sm"
                            aria-label="搜索网站"
                        />
                    </div>
                    <button 
                      onClick={() => setIsManageCategoriesModalOpen(true)}
                      className="flex-shrink-0 inline-flex items-center justify-center px-5 py-3 border border-transparent text-sm font-medium rounded-full text-indigo-600 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition"
                    >
                      管理分类
                    </button>
                </div>

                {Object.keys(groupedSites).length > 0 ? (
                    Object.keys(groupedSites).sort().map(category => (
                    <CategorySection
                        key={category}
                        categoryName={category}
                        sites={groupedSites[category]}
                        icon={categoryIcons[category]}
                        onEditSite={handleEditSite}
                        onDeleteSite={handleDeleteSite}
                        onSiteClick={trackClick}
                        onReorder={handleReorderSites}
                        fallbackColor={fallbackColor}
                    />
                    ))
                ) : (
                    <div className="text-center py-20 px-6 rounded-2xl bg-white">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">未找到结果</h2>
                        <p className="text-gray-600 max-w-lg mx-auto">
                        没有找到与您的搜索条件 “<span className="font-semibold text-gray-800">{searchQuery}</span>” 匹配的网站。
                        </p>
                    </div>
                )}
              </>
            )}
          </div>
        ) : (
          <StatsView sites={sites} clickData={clickData} onBack={() => setView('dashboard')} fallbackColor={fallbackColor} />
        )}
      </main>
      
      {view === 'dashboard' && sites.length > 0 && (
         <button
            onClick={handleAddSite}
            className="fixed bottom-8 right-8 bg-gradient-to-br from-indigo-500 to-violet-600 text-white p-4 rounded-full shadow-lg z-30 transition-all duration-300 transform hover:scale-110 hover:rotate-12 focus:outline-none focus:ring-4 focus:ring-indigo-300"
            aria-label="添加新网站"
        >
            <svg className="w-8 h-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
        </button>
      )}


      <AddSiteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveSite}
        siteToEdit={editingSite}
        existingCategories={existingCategories}
        sites={sites}
      />
      
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={confirmDelete}
        title="确认删除"
        message="您确定要删除此网站吗？此操作无法撤销。"
      />

      <ManageCategoriesModal
        isOpen={isManageCategoriesModalOpen}
        onClose={() => setIsManageCategoriesModalOpen(false)}
        categories={existingCategories}
        categoryIcons={categoryIcons}
        onRename={handleRenameCategory}
        onDelete={handleDeleteCategoryRequest}
        onSetIcon={handleSetCategoryIcon}
      />
      
      <ConfirmModal
        isOpen={isConfirmCategoryDeleteModalOpen}
        onClose={() => setIsConfirmCategoryDeleteModalOpen(false)}
        onConfirm={confirmDeleteCategory}
        title="确认删除分类"
        message={`您确定要删除 "${deletingCategoryName}" 分类吗？该分类下的所有网站将被移至“未分类”。`}
      />

    </div>
  );
};

export default App;