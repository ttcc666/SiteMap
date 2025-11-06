import React, {
  useState,
  useMemo,
  useRef,
  useEffect,
  useCallback,
} from "react";
import type { Site } from "./types";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { useTheme } from "./hooks/useTheme";
import { useKeyboardNavigation } from "./hooks/useKeyboardNavigation";
import { usePWA } from "./hooks/usePWA";
import AddSiteModal from "./components/AddSiteModal";
import CategorySection from "./components/CategorySection";
import ThemeToggle from "./components/ThemeToggle";

import SearchBar from "./components/SearchBar";
import DataManager from "./components/DataManager";
import AccessibilityHelper from "./components/AccessibilityHelper";
import BatchOperationBar from "./components/BatchOperationBar";
import BatchEditModal from "./components/BatchEditModal";
import { SmartSuggestions } from "./components/SmartSuggestions";
import { PWAInstallPrompt } from "./components/PWAInstallPrompt";
import { useSiteClicks } from "./hooks/useSiteClicks";
import StatsView from "./components/StatsView";
import ConfirmModal from "./components/ConfirmModal";
import ManageCategoriesModal from "./components/ManageCategoriesModal";

// 常量定义
const presetColors = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#84cc16",
  "#22c55e",
  "#14b8a6",
  "#06b6d4",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#d946ef",
  "#ec4899",
  "#78716c",
  "#64748b",
];

const DEFAULT_CATEGORY = "未分类";

// 类型定义
enum ModalType {
  NONE = "none",
  ADD_SITE = "add_site",
  CONFIRM_DELETE_SITE = "confirm_delete_site",
  MANAGE_CATEGORIES = "manage_categories",
  CONFIRM_DELETE_CATEGORY = "confirm_delete_category",

  DATA_MANAGER = "data_manager",
  BATCH_EDIT = "batch_edit",
}

interface DeleteState {
  type: "site" | "category" | null;
  id: string | null;
  name?: string;
}

const App: React.FC = () => {
  const [sites, setSites] = useLocalStorage<Site[]>("sites", []);
  const [categoryIcons, setCategoryIcons] = useLocalStorage<
    Record<string, string>
  >("category-icons", {});
  const [editingSite, setEditingSite] = useState<Site | null>(null);
  const { clickData, trackClick, removeClickData } = useSiteClicks();
  const [view, setView] = useState<"dashboard" | "stats">("dashboard");
  const { isInstallable, isOnline, hasUpdate } = usePWA();
  const [searchQuery, setSearchQuery] = useState("");
  const [fallbackColor, setFallbackColor] = useLocalStorage<string>(
    "favicon-fallback-color",
    "#6366f1",
  );
  const [filteredSites, setFilteredSites] = useState<Site[]>(sites);
  const { theme, toggleTheme } = useTheme();
  const [isHelpVisible, setIsHelpVisible] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // 批量选择状态管理
  const [selectedSites, setSelectedSites] = useState<Set<string>>(new Set());
  const [isBatchMode, setIsBatchMode] = useState(false);

  // 统一的模态框状态管理
  const [currentModal, setCurrentModal] = useState<ModalType>(ModalType.NONE);

  // 统一的删除状态管理
  const [deleteState, setDeleteState] = useState<DeleteState>({
    type: null,
    id: null,
    name: undefined,
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  const handleAddSite = useCallback(() => {
    setEditingSite(null);
    setCurrentModal(ModalType.ADD_SITE);
  }, []);

  // 键盘导航
  const { focusedSiteIndex, shortcuts } = useKeyboardNavigation({
    onSearch: () => document.getElementById("search-input")?.focus(),
    onAddSite: handleAddSite,
    onToggleTheme: toggleTheme,
    onShowStats: () => setView(view === "dashboard" ? "stats" : "dashboard"),
    onShowHelp: () => setIsHelpVisible(true),
    onManageCategories: () => setCurrentModal(ModalType.MANAGE_CATEGORIES),
    onDataManager: () => setCurrentModal(ModalType.DATA_MANAGER),
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        settingsRef.current &&
        !settingsRef.current.contains(event.target as Node)
      ) {
        setIsSettingsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setFilteredSites(sites);
  }, [sites]);

  const handleEditSite = useCallback((site: Site) => {
    setEditingSite(site);
    setCurrentModal(ModalType.ADD_SITE);
  }, []);

  const handleDeleteSite = useCallback((id: string) => {
    setDeleteState({ type: "site", id });
    setCurrentModal(ModalType.CONFIRM_DELETE_SITE);
  }, []);

  const confirmDelete = useCallback(() => {
    if (deleteState.type === "site" && deleteState.id) {
      setSites(sites.filter((site) => site.id !== deleteState.id));
      removeClickData(deleteState.id);
    } else if (deleteState.type === "category" && deleteState.name) {
      setSites((prevSites) =>
        prevSites.map((site) =>
          site.category === deleteState.name
            ? { ...site, category: DEFAULT_CATEGORY }
            : site,
        ),
      );
      setCategoryIcons((prevIcons) => {
        if (prevIcons[deleteState.name!]) {
          const newIcons = { ...prevIcons };
          delete newIcons[deleteState.name!];
          return newIcons;
        }
        return prevIcons;
      });
    }
    setCurrentModal(ModalType.NONE);
    setDeleteState({ type: null, id: null, name: undefined });
  }, [deleteState, sites, setSites, removeClickData, setCategoryIcons]);

  const handleSaveSite = useCallback(
    (siteData: Omit<Site, "id"> & { id?: string }) => {
      if (siteData.id) {
        setSites(
          sites.map((s) =>
            s.id === siteData.id ? ({ ...s, ...siteData } as Site) : s,
          ),
        );
      } else {
        setSites([...sites, { ...siteData, id: crypto.randomUUID() }]);
      }
    },
    [sites, setSites],
  );

  const handleReorderSites = useCallback(
    (
      categoryName: string,
      dragIndexInCategory: number,
      hoverIndexInCategory: number,
    ) => {
      setSites((prevSites) => {
        const categorySites = prevSites.filter(
          (s) => s.category === categoryName,
        );

        const draggedSiteId = categorySites[dragIndexInCategory]?.id;
        const hoverSiteId = categorySites[hoverIndexInCategory]?.id;

        if (!draggedSiteId || !hoverSiteId) return prevSites;

        const newSites = [...prevSites];
        const draggedGlobalIndex = newSites.findIndex(
          (s) => s.id === draggedSiteId,
        );
        const hoverGlobalIndex = newSites.findIndex(
          (s) => s.id === hoverSiteId,
        );

        if (draggedGlobalIndex === -1 || hoverGlobalIndex === -1) {
          return prevSites;
        }

        const [draggedItem] = newSites.splice(draggedGlobalIndex, 1);
        newSites.splice(hoverGlobalIndex, 0, draggedItem);

        return newSites;
      });
    },
    [setSites],
  );

  const handleRenameCategory = useCallback(
    (oldName: string, newName: string) => {
      setSites((prevSites) =>
        prevSites.map((site) =>
          site.category === oldName ? { ...site, category: newName } : site,
        ),
      );
      setCategoryIcons((prevIcons) => {
        if (prevIcons[oldName]) {
          const newIcons = { ...prevIcons };
          newIcons[newName] = newIcons[oldName];
          delete newIcons[oldName];
          return newIcons;
        }
        return prevIcons;
      });
    },
    [setSites, setCategoryIcons],
  );

  const handleDeleteCategoryRequest = useCallback((categoryName: string) => {
    setDeleteState({ type: "category", id: null, name: categoryName });
    setCurrentModal(ModalType.CONFIRM_DELETE_CATEGORY);
  }, []);

  const handleSetCategoryIcon = useCallback(
    (categoryName: string, icon: string) => {
      setCategoryIcons((prevIcons) => ({
        ...prevIcons,
        [categoryName]: icon,
      }));
    },
    [setCategoryIcons],
  );

  // 数据导入处理
  const handleDataImport = useCallback(
    (importedSites: Site[]) => {
      setSites((prevSites) => {
        const existingUrls = new Set(prevSites.map((site) => site.url));
        const newSites = importedSites.filter(
          (site) => !existingUrls.has(site.url),
        );
        return [...prevSites, ...newSites];
      });
    },
    [setSites],
  );

  // 批量操作相关函数
  const toggleBatchMode = useCallback(() => {
    setIsBatchMode((prev) => !prev);
    if (isBatchMode) {
      setSelectedSites(new Set());
    }
  }, [isBatchMode]);

  const toggleSiteSelection = useCallback((siteId: string) => {
    setSelectedSites((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(siteId)) {
        newSet.delete(siteId);
      } else {
        newSet.add(siteId);
      }
      return newSet;
    });
  }, []);

  const selectAllSites = useCallback(() => {
    const allSiteIds = new Set(filteredSites.map((site) => site.id));
    setSelectedSites(allSiteIds);
  }, [filteredSites]);

  const clearSelection = useCallback(() => {
    setSelectedSites(new Set());
  }, []);

  const handleBatchDelete = useCallback(() => {
    if (selectedSites.size === 0) return;
    setSites((prevSites) =>
      prevSites.filter((site) => !selectedSites.has(site.id)),
    );
    selectedSites.forEach((siteId) => removeClickData(siteId));
    setSelectedSites(new Set());
    setIsBatchMode(false);
  }, [selectedSites, setSites, removeClickData]);

  const handleBatchEdit = useCallback(() => {
    if (selectedSites.size === 0) return;
    setCurrentModal(ModalType.BATCH_EDIT);
  }, [selectedSites]);

  const handleBatchMove = useCallback(
    (targetCategory: string) => {
      if (selectedSites.size === 0) return;
      setSites((prevSites) =>
        prevSites.map((site) =>
          selectedSites.has(site.id)
            ? { ...site, category: targetCategory }
            : site,
        ),
      );
      setSelectedSites(new Set());
    },
    [selectedSites, setSites],
  );

  const groupedSites = useMemo(() => {
    const filtered = filteredSites.filter(
      (site) =>
        site.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        site.url.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    return filtered.reduce(
      (acc, site) => {
        const category = site.category || DEFAULT_CATEGORY;
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(site);
        return acc;
      },
      {} as Record<string, Site[]>,
    );
  }, [filteredSites, searchQuery]);

  const existingCategories = useMemo(() => {
    const categories = new Set(
      sites.map((s) => s.category || DEFAULT_CATEGORY),
    );
    return Array.from(categories);
  }, [sites]);

  return (
    <div className="min-h-screen bg-transparent font-sans">
      <header className="bg-white/70 backdrop-blur-xl sticky top-0 z-40 py-4 px-4 sm:px-8 border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <svg
              className="w-8 h-8 text-indigo-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"
              />
            </svg>
            <h1 className="text-2xl font-bold text-gray-900">导航中心</h1>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <div className="relative" ref={settingsRef}>
              <button
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors"
                aria-label="打开设置"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </button>
              {isSettingsOpen && (
                <div className="absolute right-0 mt-2 w-64 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-600 z-50">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        图标后备颜色
                      </label>
                      <div className="grid grid-cols-7 gap-2">
                        {presetColors.map((color) => (
                          <button
                            key={color}
                            onClick={() => setFallbackColor(color)}
                            className={`w-7 h-7 rounded-full cursor-pointer border-2 transition-transform transform hover:scale-110 ${fallbackColor === color ? "ring-2 ring-offset-2 ring-indigo-500 border-white" : "border-transparent"}`}
                            style={{ backgroundColor: color }}
                            aria-label={`选择颜色 ${color}`}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-600 pt-4 space-y-2">
                      <button
                        onClick={() => {
                          setCurrentModal(ModalType.DATA_MANAGER);
                          setIsSettingsOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                      >
                        📁 数据管理
                      </button>
                      <button
                        onClick={() => {
                          toggleBatchMode();
                          setIsSettingsOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                          isBatchMode
                            ? "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300"
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                      >
                        {isBatchMode ? "✅ 退出批量模式" : "☑️ 批量操作"}
                      </button>
                      <button
                        onClick={() => {
                          setIsHelpVisible(true);
                          setIsSettingsOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                      >
                        ❓ 键盘快捷键
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={() =>
                setView(view === "dashboard" ? "stats" : "dashboard")
              }
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all transform hover:scale-105"
            >
              {view === "dashboard" ? "查看统计" : "返回主页"}
            </button>
          </div>
        </div>
      </header>

      <main className="p-4 sm:p-8" id="main-content">
        {view === "dashboard" ? (
          <div className="max-w-7xl mx-auto">
            {/* 批量模式指示器 */}
            {isBatchMode && (
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <svg
                      className="w-5 h-5 text-blue-600 dark:text-blue-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-blue-800 dark:text-blue-200 font-medium">
                      批量操作模式已激活
                    </span>
                    <span className="text-blue-600 dark:text-blue-400 text-sm">
                      点击网站卡片进行选择
                    </span>
                  </div>
                  <button
                    onClick={toggleBatchMode}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 text-sm underline"
                  >
                    退出批量模式
                  </button>
                </div>
              </div>
            )}
            {sites.length === 0 ? (
              <div className="text-center py-20 px-6 rounded-2xl bg-white/70 backdrop-blur-md border-2 border-dashed border-gray-300">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  欢迎来到您的导航中心！
                </h2>
                <p className="text-gray-600 max-w-lg mx-auto mb-8">
                  这里看起来有点空。通过添加您最喜欢的网站来开始构建您的个人仪表盘。
                </p>
                <button
                  onClick={handleAddSite}
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-indigo-500 transition-transform transform hover:scale-105"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  添加您的第一个网站
                </button>
              </div>
            ) : (
              <>
                <SearchBar
                  sites={sites}
                  onFilteredSites={setFilteredSites}
                  categories={existingCategories}
                />

                {/* 智能建议面板 */}
                <SmartSuggestions
                  sites={sites}
                  clickData={clickData}
                  onApplySuggestion={(siteId, category) => {
                    setSites((prevSites) =>
                      prevSites.map((site) =>
                        site.id === siteId ? { ...site, category } : site,
                      ),
                    );
                  }}
                  onRemoveDuplicate={(siteId) => {
                    setSites((prevSites) =>
                      prevSites.filter((site) => site.id !== siteId),
                    );
                    removeClickData(siteId);
                  }}
                  className="mb-6"
                />
                <div className="mb-8 flex justify-end">
                  <button
                    onClick={() => setCurrentModal(ModalType.MANAGE_CATEGORIES)}
                    className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-sm font-medium rounded-full text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/50 hover:bg-indigo-200 dark:hover:bg-indigo-800/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition"
                  >
                    管理分类
                  </button>
                </div>

                {Object.keys(groupedSites).length > 0 ? (
                  Object.keys(groupedSites)
                    .sort()
                    .map((category) => (
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
                        focusedSiteIndex={focusedSiteIndex}
                        isBatchMode={isBatchMode}
                        selectedSites={selectedSites}
                        onToggleSelection={toggleSiteSelection}
                      />
                    ))
                ) : (
                  <div className="text-center py-20 px-6 rounded-2xl bg-white">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      未找到结果
                    </h2>
                    <p className="text-gray-600 max-w-lg mx-auto">
                      没有找到与您的搜索条件 “
                      <span className="font-semibold text-gray-800">
                        {searchQuery}
                      </span>
                      ” 匹配的网站。
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          <StatsView
            sites={sites}
            clickData={clickData}
            onBack={() => setView("dashboard")}
            fallbackColor={fallbackColor}
          />
        )}
      </main>

      {view === "dashboard" && sites.length > 0 && (
        <button
          onClick={handleAddSite}
          className="fixed bottom-8 right-8 bg-gradient-to-br from-indigo-500 to-violet-600 text-white p-4 rounded-full shadow-lg z-30 transition-all duration-300 transform hover:scale-110 hover:rotate-12 focus:outline-none focus:ring-4 focus:ring-indigo-300"
          aria-label="添加新网站"
        >
          <svg
            className="w-8 h-8"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
        </button>
      )}

      <AddSiteModal
        isOpen={currentModal === ModalType.ADD_SITE}
        onClose={() => setCurrentModal(ModalType.NONE)}
        onSave={handleSaveSite}
        siteToEdit={editingSite}
        existingCategories={existingCategories}
        sites={sites}
      />

      <ConfirmModal
        isOpen={
          currentModal === ModalType.CONFIRM_DELETE_SITE ||
          currentModal === ModalType.CONFIRM_DELETE_CATEGORY
        }
        onClose={() => setCurrentModal(ModalType.NONE)}
        onConfirm={confirmDelete}
        title="确认删除"
        message={
          deleteState.type === "site"
            ? "您确定要删除此网站吗？此操作无法撤销。"
            : `您确定要删除 "${deleteState.name}" 分类吗？该分类下的所有网站将被移至"未分类"。`
        }
      />

      <ManageCategoriesModal
        isOpen={currentModal === ModalType.MANAGE_CATEGORIES}
        onClose={() => setCurrentModal(ModalType.NONE)}
        categories={existingCategories}
        categoryIcons={categoryIcons}
        onRename={handleRenameCategory}
        onDelete={handleDeleteCategoryRequest}
        onSetIcon={handleSetCategoryIcon}
      />

      <DataManager
        isOpen={currentModal === ModalType.DATA_MANAGER}
        onClose={() => setCurrentModal(ModalType.NONE)}
        sites={sites}
        categoryIcons={categoryIcons}
        clickData={clickData}
        onImport={handleDataImport}
      />

      <BatchEditModal
        isOpen={currentModal === ModalType.BATCH_EDIT}
        onClose={() => setCurrentModal(ModalType.NONE)}
        onSave={(updates) => {
          setSites((prevSites) =>
            prevSites.map((site) =>
              selectedSites.has(site.id) ? { ...site, ...updates } : site,
            ),
          );
          setSelectedSites(new Set());
          setCurrentModal(ModalType.NONE);
        }}
        selectedSites={sites.filter((site) => selectedSites.has(site.id))}
        categories={existingCategories}
      />

      {isBatchMode && (
        <BatchOperationBar
          selectedCount={selectedSites.size}
          totalCount={filteredSites.length}
          onSelectAll={selectAllSites}
          onClearSelection={clearSelection}
          onBatchDelete={handleBatchDelete}
          onBatchEdit={handleBatchEdit}
          onBatchMove={handleBatchMove}
          onExitBatchMode={toggleBatchMode}
          categories={existingCategories}
        />
      )}

      <AccessibilityHelper
        shortcuts={shortcuts}
        isHelpVisible={isHelpVisible}
        onCloseHelp={() => setIsHelpVisible(false)}
      />

      {/* PWA 安装提示 */}
      <PWAInstallPrompt />
    </div>
  );
};

export default App;
