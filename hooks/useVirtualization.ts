import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

interface VirtualizationOptions {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
  threshold?: number;
}

interface VirtualItem {
  index: number;
  start: number;
  end: number;
}

export function useVirtualization<T>(
  items: T[],
  options: VirtualizationOptions
) {
  const {
    itemHeight,
    containerHeight,
    overscan = 5,
    threshold = 100
  } = options;

  const [scrollTop, setScrollTop] = useState(0);
  const [isEnabled, setIsEnabled] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 判断是否需要启用虚拟化
  useEffect(() => {
    setIsEnabled(items.length > threshold);
  }, [items.length, threshold]);

  // 计算可见范围
  const visibleRange = useMemo(() => {
    if (!isEnabled) {
      return {
        start: 0,
        end: items.length,
        visibleItems: items.map((_, index) => ({
          index,
          start: index * itemHeight,
          end: (index + 1) * itemHeight
        }))
      };
    }

    const start = Math.floor(scrollTop / itemHeight);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const end = Math.min(start + visibleCount + overscan * 2, items.length);
    const actualStart = Math.max(0, start - overscan);

    const visibleItems: VirtualItem[] = [];
    for (let i = actualStart; i < end; i++) {
      visibleItems.push({
        index: i,
        start: i * itemHeight,
        end: (i + 1) * itemHeight
      });
    }

    return {
      start: actualStart,
      end,
      visibleItems
    };
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length, isEnabled]);

  // 滚动处理
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    setScrollTop(target.scrollTop);
  }, []);

  // 总高度
  const totalHeight = useMemo(() => {
    return items.length * itemHeight;
  }, [items.length, itemHeight]);

  // 获取可见项目数据
  const visibleItems = useMemo(() => {
    return visibleRange.visibleItems.map(virtualItem => ({
      ...virtualItem,
      data: items[virtualItem.index]
    }));
  }, [visibleRange.visibleItems, items]);

  // 滚动到指定索引
  const scrollToIndex = useCallback((index: number, align: 'start' | 'center' | 'end' = 'start') => {
    if (!containerRef.current || !isEnabled) return;

    const container = containerRef.current;
    let scrollTop = 0;

    switch (align) {
      case 'start':
        scrollTop = index * itemHeight;
        break;
      case 'center':
        scrollTop = index * itemHeight - containerHeight / 2 + itemHeight / 2;
        break;
      case 'end':
        scrollTop = index * itemHeight - containerHeight + itemHeight;
        break;
    }

    scrollTop = Math.max(0, Math.min(scrollTop, totalHeight - containerHeight));
    container.scrollTop = scrollTop;
  }, [itemHeight, containerHeight, totalHeight, isEnabled]);

  // 获取项目偏移量
  const getItemOffset = useCallback((index: number) => {
    return index * itemHeight;
  }, [itemHeight]);

  return {
    // 状态
    isEnabled,
    scrollTop,
    totalHeight,

    // 可见项目
    visibleItems,
    visibleRange,

    // 引用和事件处理
    containerRef,
    handleScroll,

    // 方法
    scrollToIndex,
    getItemOffset,

    // 容器样式属性
    containerProps: {
      ref: containerRef,
      onScroll: handleScroll,
      style: {
        height: containerHeight,
        overflow: 'auto'
      }
    },

    // 内容包装器样式属性
    contentProps: {
      style: {
        height: totalHeight,
        position: 'relative' as const
      }
    },

    // 项目样式生成器
    getItemProps: (virtualItem: VirtualItem) => ({
      style: {
        position: 'absolute' as const,
        top: virtualItem.start,
        left: 0,
        right: 0,
        height: itemHeight
      }
    })
  };
}

// 辅助 Hook：自动计算容器高度
export function useContainerHeight(maxHeight?: number) {
  const [height, setHeight] = useState(400);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const availableHeight = window.innerHeight - rect.top - 100; // 留出底部空间
        const calculatedHeight = maxHeight
          ? Math.min(availableHeight, maxHeight)
          : availableHeight;
        setHeight(Math.max(200, calculatedHeight)); // 最小高度 200px
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, [maxHeight]);

  return { height, containerRef };
}