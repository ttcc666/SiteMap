import React, { useState, useMemo } from 'react';
import type { Site } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import AddSiteModal from './components/AddSiteModal';
import CategorySection from './components/CategorySection';

const App: React.FC = () => {
  const [sites, setSites] = useLocalStorage<Site[]>('sites', []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSite, setEditingSite] = useState<Site | null>(null);

  const handleAddSite = () => {
    setEditingSite(null);
    setIsModalOpen(true);
  };

  const handleEditSite = (site: Site) => {
    setEditingSite(site);
    setIsModalOpen(true);
  };

  const handleDeleteSite = (id: string) => {
    if (window.confirm('您确定要删除此网站吗？')) {
        setSites(sites.filter(site => site.id !== id));
    }
  };

  const handleSaveSite = (siteData: Omit<Site, 'id'> & { id?: string }) => {
    if (siteData.id) {
      setSites(sites.map(s => s.id === siteData.id ? { ...s, ...siteData } as Site : s));
    } else {
      setSites([...sites, { ...siteData, id: crypto.randomUUID() }]);
    }
  };

  const groupedSites = useMemo(() => {
    return sites.reduce((acc, site) => {
      const category = site.category || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(site);
      return acc;
    }, {} as Record<string, Site[]>);
  }, [sites]);
  
  const existingCategories = useMemo(() => [...new Set(sites.map(s => s.category))], [sites]);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <header className="bg-white/80 backdrop-blur-lg sticky top-0 z-40 py-4 px-4 sm:px-8 border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
             <svg className="w-8 h-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
            </svg>
            <h1 className="text-2xl font-bold text-gray-900">导航中心</h1>
          </div>
        </div>
      </header>

      <main className="p-4 sm:p-8">
        <div className="max-w-7xl mx-auto">
          {sites.length === 0 ? (
            <div className="text-center py-20 px-6 rounded-2xl bg-white border-2 border-dashed border-gray-300">
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
            Object.keys(groupedSites).sort().map(category => (
              <CategorySection
                key={category}
                categoryName={category}
                sites={groupedSites[category]}
                onEditSite={handleEditSite}
                onDeleteSite={handleDeleteSite}
              />
            ))
          )}
        </div>
      </main>

      <button
        onClick={handleAddSite}
        className="fixed bottom-8 right-8 bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-lg z-30 transition-transform transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-indigo-500"
        aria-label="添加新网站"
      >
        <svg className="w-8 h-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </button>

      <AddSiteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveSite}
        siteToEdit={editingSite}
        existingCategories={existingCategories}
      />
    </div>
  );
};

export default App;