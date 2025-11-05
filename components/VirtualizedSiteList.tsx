import React, { useState, useRef, useCallback, useMemo } from 'react';
import type { Site } from '../types';
import SiteCard from './SiteCard';
import { useVirtualization, useContainerHeight } from '../hooks/useVirtualization';

interface VirtualizedSiteListProps {
  sites: Site[];
  onEditSite: (site: Site) => void;
  onDeleteSite: (id: string) => void;
  onSiteClick: (id: string) => void;
  onReorder: (categoryName: string, dragIndex: number, hoverIndex: number) => void;
  categoryName: string;
  fallbackColor?: string;
  focusedSiteIndex?: number;
  // 批量选择相关
  isBatchMode?: boolean;
  selectedSites?: Set<string>;
  onToggleSelection?: (siteId: string) => void;
}

const VirtualizedSiteList: React.FC<VirtualizedSiteListProps> = ({
  sites,
  onEditSite,
  onDeleteSite,
  onSiteClick,
  onReorder,
  categoryName,
  fallbackColor,
  focusedSiteIndex,
  isBatchMode = false,
  selectedSites = new Set(),
  onToggleSelection
}) => {
  const dragItemIndex = useRef<number | null>(null);
  const [currentlyDraggingIndex, setCurrentlyDraggingIndex] = useState<number | null>(null);

  // 自动计算容器高度
  const { height: containerHeight } = useContainerHeight(600);

  // 计算每行的列数和项目高度
  const { itemsPerRow, itemHeight } = useMemo(() => {
    // 根据屏幕宽度计算列数
    const getColumnsCount = () => {
      const width = window.innerWidth;
      if (width >= 1280) return 5; // xl
      if (width >= 1024) return 4; // lg
      if (width >= 768) return 3;  // md
      if (width >= 640) return 2;  // sm
      return 1; // default
    };

    const columns = getColumnsCount();
    const cardHeight = 120; // 估算的卡片高度
    const gap = 24; // gap-6 = 24px
    const rowHeight = cardHeight + gap;

    return {
      itemsPerRow: columns,
      itemHeight: rowHeight
    };
  }, []);

  // 将一维数组转换为二维数组（按行分组）
  const rows = useMemo(() => {
    const result: Site[][] = [];
    for (let i = 0; i < sites.length; i += itemsPerRow) {
      result.push(sites.slice(i, i + itemsPerRow));
    }
    return result;
  }, [sites, itemsPerRow]);

  // 虚拟化配置
  const virtualization = useVirtualization(rows, {
    itemHeight,
    containerHeight,
    overscan: 3,
    threshold: 20 // 20行以上启用虚拟化
  });

  // 拖拽处理函数
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

  return (
    <div className="relative">
      {virtualization.isEnabled ? (
        // 虚拟化渲染
        <div {...virtualization.containerProps}>
          <div {...virtualization.contentProps}>
            {virtualization.visibleItems.map(({ index, data: row, ...virtualItem }) => (
              <div
                key={index}
                {...virtualization.getItemProps(virtualItem)}
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 px-1"
              >
                {row.map((site, colIndex) => {
                  const siteIndex = index * itemsPerRow + colIndex;
                  return (
                    <SiteCard
                      key={site.id}
                      site={site}
                      onEdit={onEditSite}
                      onDelete={onDeleteSite}
                      onSiteClick={onSiteClick}
                      isDragging={currentlyDraggingIndex === siteIndex}
                      onDragStart={() => handleDragStart(siteIndex)}
                      onDragEnter={() => handleDragEnter(siteIndex)}
                      onDragEnd={handleDragEnd}
                      onDragOver={handleDragOver}
                      fallbackColor={fallbackColor}
                      isFocused={focusedSiteIndex === siteIndex}
                      index={siteIndex}
                      isBatchMode={isBatchMode}
                      isSelected={selectedSites.has(site.id)}
                      onToggleSelection={onToggleSelection}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      ) : (
        // 非虚拟化渲染（数据量较小时）
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

      {/* 虚拟化状态指示器 */}
      {virtualization.isEnabled && (
        <div className="absolute top-2 right-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
          虚拟化已启用 ({sites.length} 项)
        </div>
      )}
    </div>
  );
};

export default VirtualizedSiteList;