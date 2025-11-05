import React, { useState, useRef, useCallback } from 'react';
import type { Site } from '../types';
import SiteCard from './SiteCard';
import VirtualizedSiteList from './VirtualizedSiteList';

interface CategorySectionProps {
  categoryName: string;
  sites: Site[];
  icon?: string;
  onEditSite: (site: Site) => void;
  onDeleteSite: (id: string) => void;
  onSiteClick: (id: string) => void;
  onReorder: (categoryName: string, dragIndex: number, hoverIndex: number) => void;
  fallbackColor?: string;
  focusedSiteIndex?: number;
  // 批量选择相关
  isBatchMode?: boolean;
  selectedSites?: Set<string>;
  onToggleSelection?: (siteId: string) => void;
  // 虚拟化相关
  virtualizationThreshold?: number;
}

const CategorySection: React.FC<CategorySectionProps> = ({
  categoryName,
  sites,
  icon,
  onEditSite,
  onDeleteSite,
  onSiteClick,
  onReorder,
  fallbackColor,
  focusedSiteIndex,
  isBatchMode = false,
  selectedSites = new Set(),
  onToggleSelection,
  virtualizationThreshold = 100
}) => {
  const dragItemIndex = useRef<number | null>(null);
  const [currentlyDraggingIndex, setCurrentlyDraggingIndex] = useState<number | null>(null);

  const handleDragStart = useCallback((index: number) => {
    dragItemIndex.current = index;
    setCurrentlyDraggingIndex(index);
  }, []);

  const handleDragEnter = useCallback((index: number) => {
    if (dragItemIndex.current !== null && dragItemIndex.current !== index) {
      onReorder(categoryName, dragItemIndex.current, index);
      dragItemIndex.current = index;
    }
  }, [categoryName, onReorder]);

  const handleDragEnd = useCallback(() => {
    dragItemIndex.current = null;
    setCurrentlyDraggingIndex(null);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);
  
  // 判断是否需要虚拟化
  const shouldVirtualize = sites.length > virtualizationThreshold;

  return (
    <div className="mb-12">
      <h2 className="relative text-2xl font-bold text-indigo-600 mb-6 pb-2">
        <span className="flex items-center">
          {icon && <span className="mr-3 text-2xl">{icon}</span>}
          {categoryName}
          <span className="ml-2 text-sm font-normal text-gray-500">
            ({sites.length})
          </span>
        </span>
        <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full" />
      </h2>

      {shouldVirtualize ? (
        // 虚拟化渲染
        <VirtualizedSiteList
          sites={sites}
          onEditSite={onEditSite}
          onDeleteSite={onDeleteSite}
          onSiteClick={onSiteClick}
          onReorder={onReorder}
          categoryName={categoryName}
          fallbackColor={fallbackColor}
          focusedSiteIndex={focusedSiteIndex}
          isBatchMode={isBatchMode}
          selectedSites={selectedSites}
          onToggleSelection={onToggleSelection}
        />
      ) : (
        // 常规网格渲染
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6" role="list">
          {sites.map((site, index) => (
            <SiteCard
              key={site.id}
              site={site}
              onEdit={onEditSite}
              onDelete={onDeleteSite}
              onSiteClick={onSiteClick}
              isDragging={currentlyDraggingIndex === index}
              onDragStart={() => handleDragStart(index)}
              onDragEnter={() => handleDragEnter(index)}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
              fallbackColor={fallbackColor}
              isFocused={focusedSiteIndex === index}
              index={index}
              isBatchMode={isBatchMode}
              isSelected={selectedSites.has(site.id)}
              onToggleSelection={onToggleSelection}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CategorySection;