import { useEffect, useCallback, useState } from 'react';

interface KeyboardNavigationProps {
  onSearch: () => void;
  onAddSite: () => void;
  onToggleTheme: () => void;
  onShowStats: () => void;
  onShowHelp?: () => void;
  onManageCategories?: () => void;
  onDataManager?: () => void;
}

export function useKeyboardNavigation({
  onSearch,
  onAddSite,
  onToggleTheme,
  onShowStats,
  onShowHelp,
  onManageCategories,
  onDataManager
}: KeyboardNavigationProps) {
  const [focusedSiteIndex, setFocusedSiteIndex] = useState<number>(-1);

  const navigateToSite = useCallback((direction: 'next' | 'prev' | 'up' | 'down') => {
    const siteCards = document.querySelectorAll('[data-site-card]');
    if (siteCards.length === 0) return;

    let newIndex = focusedSiteIndex;

    switch (direction) {
      case 'next':
        newIndex = focusedSiteIndex < siteCards.length - 1 ? focusedSiteIndex + 1 : 0;
        break;
      case 'prev':
        newIndex = focusedSiteIndex > 0 ? focusedSiteIndex - 1 : siteCards.length - 1;
        break;
      case 'down':
        // 假设每行4个卡片（响应式布局）
        const cardsPerRow = Math.floor(window.innerWidth / 280) || 1;
        newIndex = Math.min(focusedSiteIndex + cardsPerRow, siteCards.length - 1);
        break;
      case 'up':
        const cardsPerRowUp = Math.floor(window.innerWidth / 280) || 1;
        newIndex = Math.max(focusedSiteIndex - cardsPerRowUp, 0);
        break;
    }

    setFocusedSiteIndex(newIndex);
    const targetCard = siteCards[newIndex] as HTMLElement;
    targetCard.focus();
    targetCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [focusedSiteIndex]);

  const activateFocusedSite = useCallback(() => {
    const siteCards = document.querySelectorAll('[data-site-card]');
    if (focusedSiteIndex >= 0 && focusedSiteIndex < siteCards.length) {
      const targetCard = siteCards[focusedSiteIndex] as HTMLElement;
      const link = targetCard.querySelector('a');
      if (link) {
        link.click();
      }
    }
  }, [focusedSiteIndex]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // 忽略在输入框中的按键
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
      return;
    }

    // 方向键导航
    if (!event.ctrlKey && !event.metaKey) {
      switch (event.key) {
        case 'ArrowRight':
        case 'Tab':
          if (!event.shiftKey) {
            event.preventDefault();
            navigateToSite('next');
          }
          break;
        case 'ArrowLeft':
          event.preventDefault();
          navigateToSite('prev');
          break;
        case 'ArrowDown':
          event.preventDefault();
          navigateToSite('down');
          break;
        case 'ArrowUp':
          event.preventDefault();
          navigateToSite('up');
          break;
        case 'Enter':
        case ' ':
          event.preventDefault();
          activateFocusedSite();
          break;
        case '?':
          event.preventDefault();
          onShowHelp?.();
          break;
        case 'Escape':
          event.preventDefault();
          setFocusedSiteIndex(-1);
          document.body.focus();
          break;
      }

      // Shift + Tab 反向导航
      if (event.key === 'Tab' && event.shiftKey) {
        event.preventDefault();
        navigateToSite('prev');
      }
    }

    // Ctrl/Cmd + 组合键
    if (event.ctrlKey || event.metaKey) {
      switch (event.key.toLowerCase()) {
        case 'k':
          event.preventDefault();
          onSearch();
          break;
        case 'n':
          event.preventDefault();
          onAddSite();
          break;
        case 'd':
          event.preventDefault();
          onToggleTheme();
          break;
        case 's':
          event.preventDefault();
          onShowStats();
          break;
        case 'm':
          event.preventDefault();
          onManageCategories?.();
          break;
        case 'e':
          event.preventDefault();
          onDataManager?.();
          break;
        case '/':
        case '?':
          event.preventDefault();
          onShowHelp?.();
          break;
      }
    }
  }, [onSearch, onAddSite, onToggleTheme, onShowStats, onShowHelp, onManageCategories, onDataManager, navigateToSite, activateFocusedSite]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // 重置焦点当网站列表变化时
  useEffect(() => {
    const siteCards = document.querySelectorAll('[data-site-card]');
    if (focusedSiteIndex >= siteCards.length) {
      setFocusedSiteIndex(-1);
    }
  }, [focusedSiteIndex]);

  return {
    focusedSiteIndex,
    setFocusedSiteIndex,
    shortcuts: {
      search: 'Ctrl+K',
      addSite: 'Ctrl+N',
      toggleTheme: 'Ctrl+D',
      showStats: 'Ctrl+S',
      manageCategories: 'Ctrl+M',
      dataManager: 'Ctrl+E',
      help: 'Ctrl+? 或 ?',
      navigation: '方向键/Tab',
      activate: 'Enter/Space',
      escape: 'Esc'
    }
  };
}