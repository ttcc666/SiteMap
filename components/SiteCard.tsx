import React, { useRef, useEffect } from 'react';
import type { Site } from '../types';
import Favicon from './Favicon';

interface SiteCardProps {
  site: Site;
  onEdit: (site: Site) => void;
  onDelete: (id: string) => void;
  onSiteClick: (id: string) => void;
  isDragging?: boolean;
  onDragStart?: () => void;
  onDragEnter?: () => void;
  onDragEnd?: () => void;
  onDragOver?: (e: React.DragEvent<HTMLDivElement>) => void;
  fallbackColor?: string;
  isFocused?: boolean;
  index?: number;
  // 批量选择相关
  isBatchMode?: boolean;
  isSelected?: boolean;
  onToggleSelection?: (siteId: string) => void;
}

const SiteCard: React.FC<SiteCardProps> = ({
  site,
  onEdit,
  onDelete,
  onSiteClick,
  isDragging,
  onDragStart,
  onDragEnter,
  onDragEnd,
  onDragOver,
  fallbackColor,
  isFocused,
  index,
  isBatchMode = false,
  isSelected = false,
  onToggleSelection
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const linkRef = useRef<HTMLAnchorElement>(null);

  const draggingStyle = isDragging
    ? 'opacity-50 scale-105 rotate-2 shadow-2xl ring-2 ring-indigo-400 ring-opacity-75'
    : 'opacity-100 hover:scale-102';

  const focusedStyle = isFocused
    ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-slate-50'
    : '';

  const selectedStyle = isSelected
    ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-50 bg-blue-50/50'
    : '';

  // 处理键盘导航焦点
  useEffect(() => {
    if (isFocused && linkRef.current) {
      linkRef.current.focus();
    }
  }, [isFocused]);

  // 键盘事件处理
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        if (isBatchMode && onToggleSelection) {
          onToggleSelection(site.id);
        } else {
          onSiteClick(site.id);
          if (linkRef.current) {
            linkRef.current.click();
          }
        }
        break;
      case ' ':
        e.preventDefault();
        if (isBatchMode && onToggleSelection) {
          onToggleSelection(site.id);
        } else {
          onSiteClick(site.id);
          if (linkRef.current) {
            linkRef.current.click();
          }
        }
        break;
      case 'e':
      case 'E':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          onEdit(site);
        }
        break;
      case 'Delete':
      case 'Backspace':
        if (e.shiftKey) {
          e.preventDefault();
          onDelete(site.id);
        }
        break;
    }
  };

  // 生成描述文本
  const getAriaDescription = () => {
    const parts = [];
    if (site.description) {
      parts.push(`描述: ${site.description}`);
    }
    if (site.tags && site.tags.length > 0) {
      parts.push(`标签: ${site.tags.join(', ')}`);
    }
    parts.push(`分类: ${site.category}`);
    parts.push(`网址: ${site.url}`);
    return parts.join('. ');
  };

  return (
    <div
      ref={cardRef}
      className={`relative group cursor-grab transition-all duration-200 ${draggingStyle} ${focusedStyle} ${selectedStyle}`}
      draggable={!isBatchMode}
      onDragStart={onDragStart}
      onDragEnter={onDragEnter}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      data-site-card
      data-site-id={site.id}
      role="listitem"
      aria-label={`网站卡片: ${site.name}`}
      aria-describedby={`site-description-${site.id}`}
      tabIndex={isFocused ? 0 : -1}
      onKeyDown={handleKeyDown}
    >
      {/* 隐藏的描述文本供屏幕阅读器使用 */}
      <div id={`site-description-${site.id}`} className="sr-only">
        {getAriaDescription()}
      </div>

      {/* 批量选择复选框 */}
      {isBatchMode && (
        <div className="absolute top-2 left-2 z-10">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleSelection?.(site.id);
            }}
            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
              isSelected
                ? 'bg-blue-500 border-blue-500 text-white'
                : 'bg-white border-gray-300 hover:border-blue-400'
            }`}
            aria-label={`${isSelected ? '取消选择' : '选择'} ${site.name}`}
          >
            {isSelected && (
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </div>
      )}

      {isDragging && (
        <div
          className="absolute inset-0 bg-gradient-to-r from-indigo-400/20 to-purple-400/20 rounded-xl pointer-events-none"
          aria-hidden="true"
        />
      )}

      <a
        ref={linkRef}
        href={isBatchMode ? '#' : site.url}
        target={isBatchMode ? '_self' : '_blank'}
        rel="noopener noreferrer"
        onClick={(e) => {
          if (isBatchMode) {
            e.preventDefault();
            onToggleSelection?.(site.id);
          } else {
            onSiteClick(site.id);
          }
        }}
        className={`flex items-center space-x-4 bg-white/60 backdrop-blur-md p-4 rounded-xl shadow-md border border-white/20 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-50 ${
          isDragging ? 'border-indigo-400/70' : 'hover:shadow-lg hover:shadow-indigo-500/20 hover:border-indigo-400/50 transform hover:-translate-y-1'
        } ${isBatchMode ? 'cursor-pointer' : 'cursor-pointer'}`}
        aria-label={isBatchMode ? `${isSelected ? '取消选择' : '选择'} ${site.name}` : `访问 ${site.name} - ${site.url}`}
        aria-describedby={`site-description-${site.id}`}
        tabIndex={-1}
      >
        <div className="relative" role="img" aria-label={`${site.name} 图标`}>
          <Favicon url={site.url} name={site.name} size="large" fallbackColor={fallbackColor} />
          {isDragging && (
            <div
              className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-500 rounded-full animate-pulse"
              aria-hidden="true"
            />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <span className="text-gray-800 font-medium truncate block" title={site.name}>
            {site.name}
          </span>
          {site.description && (
            <span className="text-gray-600 text-sm truncate block" title={site.description}>
              {site.description}
            </span>
          )}
          {site.tags && site.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1" role="list" aria-label="标签">
              {site.tags.slice(0, 2).map((tag, tagIndex) => (
                <span
                  key={tagIndex}
                  className="inline-block px-2 py-0.5 text-xs bg-indigo-100 text-indigo-700 rounded-full"
                  role="listitem"
                >
                  {tag}
                </span>
              ))}
              {site.tags.length > 2 && (
                <span
                  className="inline-block px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full"
                  title={`还有 ${site.tags.length - 2} 个标签: ${site.tags.slice(2).join(', ')}`}
                >
                  +{site.tags.length - 2}
                </span>
              )}
            </div>
          )}
        </div>

        {isDragging && (
          <div className="ml-auto" aria-hidden="true">
            <svg className="w-5 h-5 text-indigo-500 animate-bounce" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </a>

      <div
        className="absolute top-2 right-2 flex space-x-1 transition-opacity duration-200 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"
        role="toolbar"
        aria-label={`${site.name} 操作`}
      >
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onEdit(site);
          }}
          className="p-1.5 bg-white/50 hover:bg-gray-200/80 rounded-full text-gray-600 hover:text-indigo-700 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
          aria-label={`编辑 ${site.name} (快捷键: Ctrl+E)`}
          title="编辑网站 (Ctrl+E)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete(site.id);
          }}
          className="p-1.5 bg-white/50 hover:bg-red-100/80 rounded-full text-gray-600 hover:text-red-700 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
          aria-label={`删除 ${site.name} (快捷键: Shift+Delete)`}
          title="删除网站 (Shift+Delete)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* 屏幕阅读器状态公告 */}
      {isDragging && (
        <div className="sr-only" aria-live="polite">
          正在拖拽 {site.name}
        </div>
      )}
    </div>
  );
};

export default SiteCard;